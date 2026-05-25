import {
	app,
	BrowserWindow,
	globalShortcut,
	ipcMain,
	nativeImage,
	dialog,
	screen,
	desktopCapturer,
	Tray,
	Menu,
	shell,
} from "electron";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import started from "electron-squirrel-startup";
import fs from "fs";
import screenshot from "screenshot-desktop";
import log from "electron-log/main";

// ── Logging setup ────────────────────────────────────────────────────────────
// Logs are written to: %AppData%\RealityLens\logs\main.log
log.initialize();
log.transports.file.level = "debug";
log.transports.console.level = "debug";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

// Forward all console.* to electron-log so nothing is lost
Object.assign(console, log.functions);

// Catch any crash before Electron even fires — this is what fills the log
// when the Squirrel installer silently fails
process.on("uncaughtException", (error) => {
	log.error("[uncaughtException]", error);
});
process.on("unhandledRejection", (reason) => {
	log.error("[unhandledRejection]", reason);
});

log.info("=== RealityLens starting ===");
log.info("Platform:", process.platform, "| Arch:", process.arch);
log.info("Electron:", process.versions.electron, "| Node:", process.versions.node);
log.info("Args:", process.argv.join(" "));
log.info("Log file:", log.transports.file.getFile().path);
// ─────────────────────────────────────────────────────────────────────────────

const execFileAsync = promisify(execFile);
const configPath = path.join(app.getPath("userData"), "config.json");

function getConfig() {
	try {
		return JSON.parse(fs.readFileSync(configPath, "utf8"));
	} catch (e) {
		return { shortcut: "CommandOrControl+Shift+L" };
	}
}

function saveConfig(config: any) {
	fs.writeFileSync(configPath, JSON.stringify(config));
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let tray: Tray | null = null;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}
// Disable CalculateNativeWinOcclusion so the transparent overlay window
// does not interfere with hardware-accelerated video planes (MPO) in other apps
// like Chrome/Edge showing X/Twitter or YouTube videos underneath.
// Also disable direct composition to stop per-pixel alpha layered windows from
// disrupting Windows DWM compositing of video below the overlay.
if (process.platform === "win32") {
	app.commandLine.appendSwitch(
		"disable-features",
		"CalculateNativeWinOcclusion,HardwareMediaKeyHandling,MediaFoundationVideoCapture",
	); 
}

let overlayWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

const createWindow = () => {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 1000,
		height: 800,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.resolve(__dirname, "preload.js"),
			sandbox: false,
		},
		icon: path.join(__dirname, "App_icons/icon.png"),
	});

	mainWindow = win;

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	// Open DevTools only in development
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		win.webContents.openDevTools();
	}

	// When main window is closed, hide it to tray instead of quitting
	win.on("close", (event) => {
		if (!isQuitting) {
			event.preventDefault();
			win.hide();
			if (overlayWindow && !overlayWindow.isDestroyed()) {
				overlayWindow.destroy();
				overlayWindow = null;
			}
		}
	});

	(win as any).on("minimize", (event: any) => {
		// Prevent default minimize behavior and hide to tray instead
		if (event && typeof event.preventDefault === "function") {
			event.preventDefault();
		}
		win.hide();
	});

	return win;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Quit when the main window is closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// Do NOT quit when all windows are closed — the app lives in the tray.
// User must click Quit in the tray context menu to exit.
app.on("window-all-closed", () => {
	// intentionally empty — tray keeps the app alive
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

function createOverlayWindow() {
	if (overlayWindow) return;

	const primaryDisplay = screen.getPrimaryDisplay();

	const { width, height } = primaryDisplay.bounds;

	overlayWindow = new BrowserWindow({
		width,
		height,
		x: 0,
		y: 0,

		transparent: true,
		backgroundColor: "#00000000",
		frame: false,
		hasShadow: false,
		alwaysOnTop: true,
		fullscreenable: false,
		skipTaskbar: true,
		movable: false,
		resizable: false,
		focusable: true,
		visualEffectState: "active",

		webPreferences: {
			preload: path.resolve(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: false,
		},
	});

	overlayWindow.setAlwaysOnTop(true, "screen-saver");
	overlayWindow.setIgnoreMouseEvents(false);

	overlayWindow.setVisibleOnAllWorkspaces(true, {
		visibleOnFullScreen: true,
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		overlayWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/overlay`);
	} else {
		const overlayPath = path.join(
			__dirname,
			`../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
		);
		overlayWindow.loadURL(`file://${overlayPath}#/overlay`);
	}

	overlayWindow.on("closed", () => {
		overlayWindow = null;
	});

	overlayWindow.webContents.on(
		"did-fail-load",
		(event, errorCode, errorDescription) => {
			console.error("Overlay failed to load:", errorCode, errorDescription);
		},
	);

	overlayWindow.webContents.on("did-finish-load", () => {
		console.log("Overlay window loaded");
	});

	overlayWindow.webContents.on("console-message", (event, level, message) => {
		console.log(`[Overlay] ${message}`);
	});

	console.log(
		"Overlay window created, loading URL:",
		MAIN_WINDOW_VITE_DEV_SERVER_URL
			? `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/overlay`
			: "file URL",
	);
}

const icon = nativeImage
	.createFromPath(path.join(__dirname, "App_icons/icon.png"))
	.resize({ width: 16, height: 16 });

app.whenReady().then(() => {
	createWindow();

	const config = getConfig();
	const ret = globalShortcut.register(config.shortcut, () => {
		console.log("Shortcut Pressed");
		createOverlayWindow();
	});
	tray = new Tray(icon);
	console.log(path.join(__dirname, "App_icons/icon.png"));
	var contextMenu = Menu.buildFromTemplate([
		{
			label: "Show App",
			click: function () {
				mainWindow?.show();
			},
		},
		{
			label: "Quit",
			click: function () {
				isQuitting = true;
				app.quit();
			},
		},
	]);
	tray.setToolTip("RealityLens");
	tray.setContextMenu(contextMenu);
	tray.setIgnoreDoubleClickEvents(true);
	console.log("Shortcut Registered:", ret);
});

ipcMain.handle("minimise-app", () => {
	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.hide();
	}
});
ipcMain.handle("capture-screen", async (_, area) => {
	try {
		if (mainWindow && !mainWindow.isDestroyed()) {
			mainWindow.hide();
		}

		if (overlayWindow && !overlayWindow.isDestroyed()) {
			overlayWindow.hide();
		}

		await delay(150);

		const primaryDisplay = screen.getPrimaryDisplay();
		const scaleFactor = primaryDisplay.scaleFactor || 1;

		const sources = await desktopCapturer.getSources({
			types: ["screen"],
			thumbnailSize: {
				width: primaryDisplay.bounds.width * scaleFactor,
				height: primaryDisplay.bounds.height * scaleFactor,
			},
		});

		const primaryScreenSource = sources.find(
			(source) => source.display_id === String(primaryDisplay.id),
		);

		if (!primaryScreenSource) {
			throw new Error("Primary screen source not found.");
		}

		const image = primaryScreenSource.thumbnail;

		const x = Math.min(area.start.x, area.end.x);
		const y = Math.min(area.start.y, area.end.y);
		const width = Math.abs(area.end.x - area.start.x);
		const height = Math.abs(area.end.y - area.start.y);

		const selection = {
			x: Math.round(x * scaleFactor),
			y: Math.round(y * scaleFactor),
			width: Math.round(width * scaleFactor),
			height: Math.round(height * scaleFactor),
		};

		const croppedImage = image.crop(selection);

		const uploadsPath = path.join(app.getPath("temp"), "realitylens-uploads");
		fs.rmSync(uploadsPath, { recursive: true, force: true });
		fs.mkdirSync(uploadsPath, { recursive: true });

		const filePath = path.join(uploadsPath, `capture-${Date.now()}.png`);
		fs.writeFileSync(filePath, croppedImage.toPNG());

		console.log("Saved at:", filePath);

		return filePath;
	} catch (err) {
		console.error(err);
		// Clean up overlay and restore main window so the shortcut works again
		if (overlayWindow && !overlayWindow.isDestroyed()) {
			overlayWindow.destroy();
			overlayWindow = null;
		}
		if (mainWindow && !mainWindow.isDestroyed()) {
			mainWindow.show();
			mainWindow.focus();
		}
		dialog.showErrorBox(
			"Capture failed",
			err instanceof Error
				? err.message
				: "Unknown error while capturing screen",
		);
		throw err;
	} finally {
		if (overlayWindow && !overlayWindow.isDestroyed()) {
			overlayWindow.setIgnoreMouseEvents(true, { forward: true });
			overlayWindow.setFocusable(false);
			overlayWindow.showInactive();
		}
	}
});

ipcMain.handle("finish-verification", async () => {
	if (overlayWindow && !overlayWindow.isDestroyed()) {
		overlayWindow.close();
	}
});

ipcMain.handle(
	"set-overlay-click-through",
	async (_, shouldClickThrough: boolean) => {
		if (!overlayWindow || overlayWindow.isDestroyed()) {
			return;
		}

		overlayWindow.setIgnoreMouseEvents(shouldClickThrough, { forward: true });
	},
);

// Unregister all shortcuts when the app is quitting.
app.on("will-quit", () => {
	globalShortcut.unregisterAll();
});

ipcMain.handle("open-external", (_, url) => {
	shell.openExternal(url);
});

ipcMain.handle("get-shortcut", () => {
	return getConfig().shortcut;
});

ipcMain.handle("update-shortcut", (_, newShortcut) => {
	const config = getConfig();
	config.shortcut = newShortcut;
	saveConfig(config);

	globalShortcut.unregisterAll();
	const ret = globalShortcut.register(newShortcut, () => {
		console.log("Shortcut Pressed");
		createOverlayWindow();
	});
	return ret;
});
