import { app, BrowserWindow, globalShortcut, screen } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";

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
			preload: path.join(__dirname, "preload.ts"),
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
	// mainWindow.webContents.openDevTools();

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
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	overlayWindow.setAlwaysOnTop(true, "screen-saver");

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
}

app.whenReady().then(() => {
	createWindow();

	const ret = globalShortcut.register("CommandOrControl+Shift+L", () => {
		console.log("Shortcut Pressed");
		createOverlayWindow();
	});

	console.log("Shortcut Registered:", ret);
});

// Unregister all shortcuts when the app is quitting.
app.on("will-quit", () => {
	globalShortcut.unregisterAll();
});
