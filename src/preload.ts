// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
	captureScreen: async (area : any) => {
		console.log("IPC SENT");

		return ipcRenderer.invoke("capture-screen", area);
	},
});