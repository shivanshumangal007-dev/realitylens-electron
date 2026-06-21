// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import fs from "fs";
import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
	captureScreen: async (area: any) => {
		console.log("IPC SENT");

		return ipcRenderer.invoke("capture-screen", area);
	},
	finishVerification: async () => {
		return ipcRenderer.invoke("finish-verification");
	},
	setOverlayClickThrough: async (shouldClickThrough: boolean) => {
		return ipcRenderer.invoke("set-overlay-click-through", shouldClickThrough);
	},
	readFile: async (filePath: string) => {
		const data = fs.readFileSync(filePath);
		return Array.from(data);
	},
	minimiseApp: () => {
		ipcRenderer.invoke("minimise-app");
	},
	openExternal: async (url: string) => {
		return ipcRenderer.invoke("open-external", url);
	},
	getShortcut: async () => {
		return ipcRenderer.invoke("get-shortcut");
	},
	updateShortcut: async (shortcut: string) => {
		return ipcRenderer.invoke("update-shortcut", shortcut);
	},
	getAppVersion: async () => {
		return ipcRenderer.invoke("get-app-version");
	},
	onNavigateToLogin: (callback: () => void) => {
		ipcRenderer.on("navigate-to-login", () => callback());
	},
	onGoogleLoginSuccess: (callback: (data: { token: string; userId: string }) => void) => {
		ipcRenderer.on("google-login-success", (event, data) => callback(data));
	},
	// ── Auto-updater ────────────────────────────────────────────────────
	checkForUpdates: async () => {
		return ipcRenderer.invoke("check-for-updates");
	},
	installUpdate: async () => {
		return ipcRenderer.invoke("install-update");
	},
	onUpdateAvailable: (callback: (info: any) => void) => {
		ipcRenderer.on("update-available", (_, info) => callback(info));
	},
	onUpdateDownloadProgress: (callback: (progress: any) => void) => {
		ipcRenderer.on("update-download-progress", (_, progress) => callback(progress));
	},
	onUpdateDownloaded: (callback: (info: any) => void) => {
		ipcRenderer.on("update-downloaded", (_, info) => callback(info));
	},
	// ── Startup settings ────────────────────────────────────────────────
	getStartupSettings: async () => {
		return ipcRenderer.invoke("get-startup-settings");
	},
	setStartupEnabled: async (enabled: boolean) => {
		return ipcRenderer.invoke("set-startup-enabled", enabled);
	},
};

console.log("preload loaded");
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
