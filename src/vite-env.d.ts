export {};

declare global {
	interface Window {
		electronAPI: {
			captureScreen: (area: any) => Promise<string>;
			finishVerification: () => Promise<void>;
			readFile: (filePath: string) => Promise<number[]>;
		};
	}
}
