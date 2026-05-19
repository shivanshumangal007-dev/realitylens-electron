import React, { useEffect, useState } from "react";

const OverlayDiv = () => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				window.close();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const [start, setStart] = useState({ x: 0, y: 0 });
	const [end, setEnd] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);

	const handleMouseDown = (e: React.MouseEvent) => {
		setStart({ x: e.clientX, y: e.clientY });
		setEnd({ x: e.clientX, y: e.clientY });
		setDragging(true);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!dragging) return;

		setEnd({
			x: e.clientX,
			y: e.clientY,
		});
	};

	const handleMouseUp = () => {
		setDragging(false);

		console.log("Selected Area:", {
			start,
			end,
		});
	};

	const left = Math.min(start.x, end.x);
	const top = Math.min(start.y, end.y);

	const width = Math.abs(end.x - start.x);
	const height = Math.abs(end.y - start.y);

	return (
		<div
			className='w-screen h-screen bg-transparent cursor-crosshair relative'
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
		>
			<h1 className="text-white bg-black">hello man select the are you want to search for</h1>
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

