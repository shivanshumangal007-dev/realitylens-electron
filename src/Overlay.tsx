import React, { useEffect, useRef, useState } from "react";
import {
	getJobResultHandler,
	getJobStatusHandler,
	submitImageHandler,
} from "./ApiHandler";
import ResultLoading from "./ResultLoading";
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
	const [status, setStatus] = useState("Ready to select an area");
	const [result, setResult] = useState<any>(null);

	useEffect(() => {
		console.log("Overlay mounted");
		setStatus("Overlay ready");

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				window.close();
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

			console.log("Sending to capture (raw points):", {
				start: startRef.current,
				end: endRef.current,
			});

			if (!window.electronAPI) {
				console.error(
					"electronAPI bridge is missing. Preload did not load in this window.",
				);
				setStatus("Electron bridge unavailable. Restart the app.");
				return;
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
			const result = await submitImageHandler(file);
			console.log(result);

			console.log("Captured Image Path:", filePath);
			setStatus(`generating results... (Job ID: ${result.data.job_id})`);
			getStatusOfJob(result.data.job_id);
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousemove", handleGlobalMouseMove);
		document.addEventListener("mouseup", handleGlobalMouseUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousemove", handleGlobalMouseMove);
			document.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, []);
	const getStatusOfJob = async (jobId: string) => {
		const inte = setInterval(async () => {
			const response = await getJobStatusHandler(jobId);
			console.log("Job status response:", response.data.status);
			if (
				response.data.status === "done" ||
				response.data.status === "failed"
			) {
				GetfinalResult(jobId);
				clearInterval(inte);
			}
		}, 2000);
	};
	const GetfinalResult = async (jobId: string) => {
		const response = await getJobResultHandler(jobId);
		console.log("Job result response:", response.data);
		setResult(response.data);
		setStatus("Result ready");
		setIsResultLoading(false);
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

	if (selectionComplete || isResultLoading) {
		return (
			<ResultLoading
				result={result}
				status={status}
				isResultLoading={isResultLoading}
			/>
		);
	}

	return (
		<div
			ref={overlayRef}
			className='relative h-screen w-screen cursor-crosshair overflow-hidden bg-black/20'
			onMouseDown={handleMouseDown}
		>
			<div className='absolute inset-0' />
			<div className='absolute left-4 top-4 rounded-lg bg-black/70 px-3 py-2 text-sm text-white backdrop-blur'>
				{status}
			</div>
			{dragging && (
				<div
					className='absolute border-2 border-cyan-400 bg-cyan-400/20'
					style={{
						left,
						top,
						width,
						height,
					}}
				/>
			)}
		</div>
	);
};

export default OverlayDiv;
