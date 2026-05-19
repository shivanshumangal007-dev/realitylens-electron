export {};

declare global {
	interface Window {
		electronAPI: {
			captureScreen: (area: any) => Promise<string>;
		};
	}
}
