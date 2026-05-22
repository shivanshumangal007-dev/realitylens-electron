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
	readFile: async (filePath: string) => {
		const data = fs.readFileSync(filePath);
		return Array.from(data);
	},
};

console.log("preload loaded");
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
