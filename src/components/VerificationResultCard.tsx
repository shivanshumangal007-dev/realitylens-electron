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

const getVerdictColors = (verdict?: string) => {
	const normalized = (verdict || "").trim().toLowerCase();
	if (normalized === "likely fake") return { shadow: "shadow-red-500/20", gradient: "from-red-500/10 via-red-600/10 to-orange-500/10", badge: "border-red-400/30 bg-red-400/10 text-red-100", bar: "bg-red-500", text: "text-red-400" };
	if (normalized === "suspicious") return { shadow: "shadow-yellow-500/20", gradient: "from-yellow-500/10 via-yellow-600/10 to-amber-500/10", badge: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100", bar: "bg-yellow-500", text: "text-yellow-400" };
	if (normalized === "likely real") return { shadow: "shadow-green-500/20", gradient: "from-green-500/10 via-green-600/10 to-emerald-500/10", badge: "border-green-400/30 bg-green-400/10 text-green-100", bar: "bg-green-500", text: "text-green-400" };
	if (normalized === "satire") return { shadow: "shadow-pink-500/20", gradient: "from-pink-500/10 via-pink-600/10 to-rose-500/10", badge: "border-pink-400/30 bg-pink-400/10 text-pink-100", bar: "bg-pink-500", text: "text-pink-400" };
	if (normalized === "unreadable") return { shadow: "shadow-slate-500/20", gradient: "from-slate-500/10 via-slate-600/10 to-gray-500/10", badge: "border-slate-400/30 bg-slate-400/10 text-slate-100", bar: "bg-slate-500", text: "text-slate-400" };
	// default / anything else
	return { shadow: "shadow-blue-500/20", gradient: "from-cyan-500/10 via-blue-500/10 to-purple-500/10", badge: "border-blue-400/30 bg-blue-400/10 text-blue-100", bar: "bg-blue-500", text: "text-cyan-400" };
};

const getRealityScorePercentage = (score?: number) => {
	if (typeof score !== "number") return 0;
	if (score <= 1.0) return score * 100;
	if (score <= 10) return score * 10;
	return Math.min(100, score);
};

const VerificationResultCard = ({
	result,
	onClose,
}: VerificationResultCardProps) => {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const dragStart = useRef({ x: 0, y: 0 });
	const isHovered = useRef(false);

	const colors = getVerdictColors(result.verdict);

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
			if (!isHovered.current) {
				window.electronAPI?.setOverlayClickThrough(true);
			}
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
			className='absolute inset-x-4 bottom-4 md:inset-auto md:right-6 md:bottom-6 flex flex-col pointer-events-auto'
			style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
			onMouseEnter={() => {
				isHovered.current = true;
				window.electronAPI?.setOverlayClickThrough(false);
			}}
			onMouseLeave={() => {
				isHovered.current = false;
				if (!isDragging) {
					window.electronAPI?.setOverlayClickThrough(true);
				}
			}}
		>
			<div className={`rounded-3xl border border-white/10 bg-slate-950 backdrop-blur-xl shadow-2xl ${colors.shadow} overflow-hidden flex flex-col resize min-w-[350px] min-h-[300px] w-[550px] h-[500px] max-w-[90vw] max-h-[90vh]`}>
				<div 
					className={`shrink-0 border-b border-white/10 px-5 py-4 bg-linear-to-r ${colors.gradient} cursor-grab active:cursor-grabbing`}
					onMouseDown={handleMouseDown}
				>
					<div className='flex items-start justify-between gap-3'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-slate-300'>
								RealityLens Verdict
							</p>
							<h3 className={`mt-1 text-2xl font-bold uppercase tracking-wide ${colors.text}`}>
								{result.verdict || "UNREADABLE"}
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

				<div className='overflow-y-auto space-y-5 px-5 py-5 text-sm text-slate-200 hide-scrollbar'>
					
					{/* Scores Section */}
					<div className="space-y-4">
						{/* Reality Score Bar */}
						<div>
							<div className="flex justify-between text-xs mb-1.5 text-slate-300">
								<span className="font-medium uppercase tracking-wide text-[10px]">Reality Score</span>
								<span className="font-bold">{typeof result.reality_score === "number" ? result.reality_score.toFixed(2) : "N/A"}</span>
							</div>
							<div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
								<div 
									className={`h-full ${colors.bar} rounded-full transition-all duration-700 ease-out`}
									style={{ width: `${getRealityScorePercentage(result.reality_score)}%` }}
								/>
							</div>
						</div>

						{/* Confidence Bar */}
						<div>
							<div className="flex justify-between text-xs mb-1.5 text-slate-300">
								<span className="font-medium uppercase tracking-wide text-[10px]">Confidence</span>
								<span className="font-bold">{typeof result.confidence === "number" ? `${Math.round(result.confidence * 100)}%` : "N/A"}</span>
							</div>
							<div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
								<div 
									className={`h-full ${colors.bar} rounded-full transition-all duration-700 ease-out`}
									style={{ width: typeof result.confidence === "number" ? `${Math.round(result.confidence * 100)}%` : '0%' }}
								/>
							</div>
						</div>
					</div>

					<div className="h-px w-full bg-white/10" />

					{/* Claim Extracted */}
					<div>
						<p className='text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1.5'>
							Claim Extracted
						</p>
						<p className='text-base font-medium text-white leading-snug'>
							{result.claim || "Unable to extract a claim from the image."}
						</p>
					</div>

					{result.image_url && (
						<img
							src={result.image_url}
							alt='Verified capture'
							className='h-40 w-full rounded-2xl object-cover ring-1 ring-white/10'
						/>
					)}

					{/* Explanation */}
					<div>
						<p className='text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1.5'>
							Explanation
						</p>
						<p className='leading-relaxed text-slate-300'>
							{result.explanation ||
								"The screenshot was too blurry, cropped, or unclear to extract a verifiable claim."}
						</p>
					</div>

					{/* Evidence */}
					<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
						<p className='text-[10px] uppercase tracking-[0.2em] text-slate-400'>
							Evidence
						</p>
						<div className='mt-3 space-y-2'>
							{Array.isArray(result.evidence) && result.evidence.length > 0 ? (
								result.evidence.map((item, index) => (
									<div
										key={`${item.title || "evidence"}-${index}`}
										className={`rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 ${item.url ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
										onClick={() => {
											if (item.url) {
												window.electronAPI?.openExternal(item.url);
											}
										}}
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
