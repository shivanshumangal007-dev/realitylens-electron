/// <reference types="vite/client" />

export {};
declare global {
	interface Window {
		electronAPI: {
			captureScreen: (area: any) => Promise<string>;
			finishVerification: () => Promise<void>;
			setOverlayClickThrough: (shouldClickThrough: boolean) => Promise<void>;
			readFile: (filePath: string) => Promise<number[]>;
			minimiseApp: () => void;
			openExternal: (url: string) => Promise<void>;
			getShortcut: () => Promise<string>;
			updateShortcut: (shortcut: string) => Promise<boolean>;
			getAppVersion: () => Promise<string>;
			onNavigateToLogin: (callback: () => void) => void;
			onGoogleLoginSuccess: (callback: (data: { token: string; userId: string }) => void) => void;
			// Auto-updater
			checkForUpdates: () => Promise<any>;
			installUpdate: () => Promise<void>;
			onUpdateAvailable: (callback: (info: any) => void) => void;
			onUpdateDownloadProgress: (callback: (progress: any) => void) => void;
			onUpdateDownloaded: (callback: (info: any) => void) => void;
			// Startup settings
			getStartupSettings: () => Promise<any>;
			setStartupEnabled: (enabled: boolean) => Promise<any>;
		};
	}
}
