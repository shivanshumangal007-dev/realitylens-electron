import { useState, useRef, useEffect } from "react";

type VerificationEvidence = {
	title?: string;
	source?: string;
	stance?: string;
	url?: string;
};

type VerificationResult = {
	claim?: string;
	verdict?: string;
	evidence?: VerificationEvidence[];
	confidence?: number;
	explanation?: string;
	reality_score?: number;
	image_url?: string;
};

type VerificationResultCardProps = {
	result: VerificationResult;
	onClose: () => void;
};

const VerificationResultCard = ({
	result,
	onClose,
}: VerificationResultCardProps) => {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const dragStart = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;
			setPosition({
				x: e.clientX - dragStart.current.x,
				y: e.clientY - dragStart.current.y,
			});
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging]);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		// Prevent dragging if clicking a button
		if ((e.target as HTMLElement).tagName === "BUTTON") return;
		setIsDragging(true);
		dragStart.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		};
	};

	return (
		<div 
			className='absolute inset-x-4 bottom-4 md:inset-auto md:right-6 md:top-6 md:w-[400px] flex flex-col max-h-[90vh]'
			style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
		>
			<div className='rounded-3xl border border-white/10 bg-slate-950 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col min-h-0'>
				<div 
					className='shrink-0 border-b border-white/10 px-5 py-4 bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 cursor-grab active:cursor-grabbing'
					onMouseDown={handleMouseDown}
				>
					<div className='flex items-start justify-between gap-3'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-cyan-200/80'>
								Verification Result
							</p>
							<h3 className='mt-2 text-xl font-medium text-white'>
								{result.claim || "Unable to extract a claim."}
							</h3>
						</div>
						<button
							type='button'
							onClick={onClose}
							className='rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-white/10'
						>
							Close
						</button>
					</div>
				</div>

				<div className='overflow-y-auto space-y-4 px-5 py-5 text-sm text-slate-200 hide-scrollbar'>
					<div className='flex flex-wrap items-center gap-2'>
						<span className='inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100'>
							{result.verdict || "UNREADABLE"}
						</span>
						<span className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300'>
							Confidence{" "}
							{typeof result.confidence === "number"
								? `${Math.round(result.confidence * 100)}%`
								: "N/A"}
						</span>
						<span className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300'>
							Reality score{" "}
							{typeof result.reality_score === "number"
								? result.reality_score.toFixed(2)
								: "N/A"}
						</span>
					</div>

					{result.image_url && (
						<img
							src={result.image_url}
							alt='Verified capture'
							className='h-40 w-full rounded-2xl object-cover ring-1 ring-white/10'
						/>
					)}

					<p className='leading-relaxed text-slate-300'>
						{result.explanation ||
							"The screenshot was too blurry, cropped, or unclear to extract a verifiable claim."}
					</p>

					<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
						<p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
							Evidence
						</p>
						<div className='mt-3 space-y-2'>
							{Array.isArray(result.evidence) && result.evidence.length > 0 ? (
								result.evidence.slice(0, 3).map((item, index) => (
									<div
										key={`${item.title || "evidence"}-${index}`}
										className='rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2'
									>
										<p className='text-sm text-white'>
											{item.title || item.source || "Evidence item"}
										</p>
										<p className='text-xs text-slate-400'>
											{item.stance || "related"}
										</p>
									</div>
								))
							) : (
								<p className='text-sm text-slate-400'>
									No evidence was returned for this result.
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VerificationResultCard;
