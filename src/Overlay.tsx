import React, { useEffect, useRef, useState } from "react";

const OverlayDiv = () => {
	const startRef = useRef({ x: 0, y: 0 });
	const endRef = useRef({ x: 0, y: 0 });
	const draggingRef = useRef(false);
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const [start, setStart] = useState({ x: 0, y: 0 });
	const [end, setEnd] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const [status, setStatus] = useState("Ready to select an area");

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
			setStatus("Capturing selection...");
		
			console.log("Sending to capture (raw points):", {
				start: startRef.current,
				end: endRef.current,
			});

			const filePath = await window.electronAPI.captureScreen({
				start: startRef.current,
				end: endRef.current,
			});

			console.log("Captured Image Path:", filePath);
			setStatus(`Saved to ${filePath}`);

			// Close the overlay window after showing success message
			setTimeout(() => {
				window.close();
			}, 2000);
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

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		const point = { x: e.clientX, y: e.clientY };
		startRef.current = point;
		endRef.current = point;
		setStart(point);
		setEnd(point);
		draggingRef.current = true;
		setDragging(true);
		setStatus("Dragging selection...");
		console.log("Overlay mouse down, selection start:", point);
	};

	const left = Math.min(start.x, end.x);
	const top = Math.min(start.y, end.y);

	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);

	return (
		<div
			ref={overlayRef}
			className='w-screen h-screen bg-transparent cursor-crosshair relative'
			onMouseDown={handleMouseDown}
		>
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
