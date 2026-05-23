export {};

declare global {
	interface Window {
		electronAPI: {
			captureScreen: (area: any) => Promise<string>;
			finishVerification: () => Promise<void>;
			setOverlayClickThrough: (shouldClickThrough: boolean) => Promise<void>;
			readFile: (filePath: string) => Promise<number[]>;
		};
	}
}
