import React, { useEffect, useRef, useState } from "react";
import {
	getJobResultHandler,
	getJobStatusHandler,
	submitImageHandler,
} from "./ApiHandler";
import ResultLoading from "./ResultLoading";
import RateLimitScreen from "./components/RateLimitScreen";
type OverlayDivProps = {
	isResultLoading: boolean;
	setIsResultLoading: (value: boolean) => void;
};
const OverlayDiv = ({
	isResultLoading,
	setIsResultLoading,
}: OverlayDivProps) => {
	const startRef = useRef({ x: 0, y: 0 });
	const endRef = useRef({ x: 0, y: 0 });
	const draggingRef = useRef(false);
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const [start, setStart] = useState({ x: 0, y: 0 });
	const [end, setEnd] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const [selectionComplete, setSelectionComplete] = useState(false);
	const [status, setStatus] = useState<string | null>(
		"Ready to select an area",
	);
	const [result, setResult] = useState<any>(null);
	const [jobStatus, setJobStatus] = useState<string | null>(null);
	const pollingIntervalRef = useRef<number | null>(null);

	useEffect(() => {
		console.log("Overlay mounted");
		setStatus("Overlay ready");

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				window.electronAPI?.finishVerification();
			}
		};

		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!draggingRef.current) return;

			const point = {
				x: e.clientX,
				y: e.clientY,
			};

			endRef.current = point;
			setEnd(point);
		};

		const handleGlobalMouseUp = async () => {
			if (!draggingRef.current) return;

			draggingRef.current = false;
			setDragging(false);
			setSelectionComplete(true);
			setStatus("Capturing selection...");
			setJobStatus(null);
			setResult(null);

			console.log("Sending to capture (raw points):", {
				start: startRef.current,
				end: endRef.current,
			});

			try {
				if (!window.electronAPI) {
					throw new Error("Electron bridge unavailable. Restart the app.");
				}

				const filePath = await window.electronAPI.captureScreen({
					start: startRef.current,
					end: endRef.current,
				});

				const fileData = await window.electronAPI.readFile(filePath);
				const uint8Array = new Uint8Array(fileData);

				const blob = new Blob([uint8Array], {
					type: "image/png",
				});

				const file = new File([blob], "screenshot.png", {
					type: "image/png",
				});

				setIsResultLoading(true);
				setStatus("Submitting image for verification...");
				const result = await submitImageHandler(file);

				console.log("Captured Image Path:", filePath);
				setStatus(`generating results... (Job ID: ${result.data.job_id})`);
				void getStatusOfJob(result.data.job_id);
			} catch (error) {
				console.error("Overlay capture/submission error:", error);
				const message =
					error instanceof Error
						? error.message
						: "Failed to submit the screenshot.";
				setStatus(message);
				setIsResultLoading(false);
				setSelectionComplete(false);
				setJobStatus("failed");
				if (pollingIntervalRef.current) {
					window.clearInterval(pollingIntervalRef.current);
					pollingIntervalRef.current = null;
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousemove", handleGlobalMouseMove);
		document.addEventListener("mouseup", handleGlobalMouseUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousemove", handleGlobalMouseMove);
			document.removeEventListener("mouseup", handleGlobalMouseUp);
			if (pollingIntervalRef.current) {
				window.clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
		};
	}, []);
	const getStatusOfJob = async (jobId: string) => {
		try {
			const response = await getJobStatusHandler(jobId);
			console.log("Job status response:", response.data.status);
			setJobStatus(response.data.status);
			pollingIntervalRef.current = window.setInterval(async () => {
				try {
					const nextResponse = await getJobStatusHandler(jobId);
					console.log("Job status response:", nextResponse.data.status);
					setJobStatus(nextResponse.data.status);
					if (
						nextResponse.data.status === "done" ||
						nextResponse.data.status === "failed"
					) {
						if (pollingIntervalRef.current) {
							window.clearInterval(pollingIntervalRef.current);
							pollingIntervalRef.current = null;
						}
						await GetfinalResult(jobId);
					}
				} catch (error) {
					console.error("Job status polling error:", error);
					if (pollingIntervalRef.current) {
						window.clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
					setStatus(
						error instanceof Error
							? error.message
							: "Unable to track verification progress.",
					);
					setIsResultLoading(false);
					setSelectionComplete(false);
				}
			}, 1000);
		} catch (error) {
			console.error("Job status error:", error);
			setStatus(
				error instanceof Error
					? error.message
					: "Unable to check verification status.",
			);
			setIsResultLoading(false);
			setSelectionComplete(false);
		}
	};
	const GetfinalResult = async (jobId: string) => {
		try {
			const response = await getJobResultHandler(jobId);
			console.log("Job result response:", response.data);
			setResult(response.data);
			setStatus("Result ready");
		} catch (error) {
			console.error("Job result error:", error);
			setStatus(
				error instanceof Error
					? error.message
					: "Unable to load verification result.",
			);
			setResult(null);
		} finally {
			setIsResultLoading(false);
		}
	};
	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		const point = { x: e.clientX, y: e.clientY };
		startRef.current = point;
		endRef.current = point;
		setStart(point);
		setEnd(point);
		draggingRef.current = true;
		setDragging(true);
		setSelectionComplete(false);
		setResult(null);
		setStatus("Dragging selection...");
		console.log("Overlay mouse down, selection start:", point);
	};

	const left = Math.min(start.x, end.x);
	const top = Math.min(start.y, end.y);

	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);

	const isRateLimited =
		status?.includes("Too many requests") ||
		status?.toLowerCase().includes("rate limit");

	if (isRateLimited) {
		return (
			<RateLimitScreen
				onClose={() => window.electronAPI?.finishVerification()}
			/>
		);
	}

	if (selectionComplete || isResultLoading) {
		return (
			<ResultLoading
				result={result}
				status={jobStatus}
				isResultLoading={isResultLoading}
			/>
		);
	}

	return (
		<div
			ref={overlayRef}
			className='relative h-screen w-screen cursor-crosshair overflow-hidden'
			onMouseDown={handleMouseDown}
		>
			{!dragging && (
				<div className='absolute inset-0 bg-black/50 pointer-events-none' />
			)}

			<div className='absolute left-4 top-4 rounded-lg bg-cyan-900 border-2 border-cyan-400 px-3 py-2 text-sm text-white backdrop-blur z-50'>
				{status}
			</div>
			{dragging && (
				<div
					className='absolute border-2 border-cyan-400'
					style={{
						left,
						top,
						width,
						height,
						boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
					}}
				/>
			)}
		</div>
	);
};

export default OverlayDiv;
