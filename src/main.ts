import {
	app,
	BrowserWindow,
	globalShortcut,
	ipcMain,
	nativeImage,
	dialog,
	screen,
	desktopCapturer,
} from "electron";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import started from "electron-squirrel-startup";
import fs from "fs";
import screenshot from "screenshot-desktop";

const execFileAsync = promisify(execFile);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}
app.disableHardwareAcceleration();

let overlayWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.resolve(__dirname, "preload.js"),
			sandbox: false,
		},
	});

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

	// When main window closes, quit the app
	mainWindow.on("closed", () => {
		if (overlayWindow) {
			overlayWindow.destroy();
			overlayWindow = null;
		}
		app.quit();
	});

	return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Quit when the main window is closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
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

app.whenReady().then(() => {
	createWindow();

	const ret = globalShortcut.register("CommandOrControl+Shift+L", () => {
		console.log("Shortcut Pressed");
		createOverlayWindow();
	});

	console.log("Shortcut Registered:", ret);
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
			overlayWindow.showInactive();
		}
	}
});

ipcMain.handle("finish-verification", async () => {
	if (overlayWindow && !overlayWindow.isDestroyed()) {
		overlayWindow.close();
	}

	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.show();
		mainWindow.focus();
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
