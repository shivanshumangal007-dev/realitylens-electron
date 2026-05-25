type LoadingScreenProps = {
	status: string;
	fullScreen?: boolean;
	tone?: "default" | "error";
};

const LoadingScreen = ({
	status,
	fullScreen = false,
	tone = "default",
}: LoadingScreenProps) => {
	let progress = 30; // default
	if (status) {
		const s = status.toLowerCase();
		if (s.includes("extracting") || s.includes("capturing")) progress = 60;
		else if (s.includes("searching")) progress = 90;
		else if (s.includes("generating") || s.includes("result")) progress = 95;
		else if (s.includes("done") || s.includes("ready")) progress = 100;
		else if (s.includes("error") || s.includes("failed")) progress = 100;
	}

	const isError = tone === "error" || /error|failed/i.test(status);
	const shellClass = fullScreen
		? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-xl"
		: "absolute right-4 bottom-4 z-50 w-[min(26rem,calc(100vw-2rem))]";

	return (
		<div className={shellClass}>
			<div
				className={`overflow-hidden rounded-2xl border ${isError ? "border-red-500/20" : "border-white/10"} bg-slate-950/85 shadow-2xl ${isError ? "shadow-red-500/10" : "shadow-cyan-500/10"} backdrop-blur-xl ${fullScreen ? "w-full max-w-md" : ""}`}
			>
				<div
					className={`bg-linear-to-r ${isError ? "from-red-500/10 via-rose-500/10 to-orange-500/10" : "from-cyan-500/10 via-blue-500/10 to-purple-500/10"} px-4 py-3`}
				>
					<div className='flex items-center gap-3'>
						<div className='relative flex h-10 w-10 items-center justify-center'>
							<div
								className={`absolute h-10 w-10 rounded-full border ${isError ? "border-red-400/25" : "border-cyan-400/25"}`}
							/>
							<div
								className={`absolute h-7 w-7 rounded-full border ${isError ? "border-red-300/50" : "border-cyan-300/50"} border-t-transparent animate-spin`}
							/>
							<div
								className={`h-3 w-3 rounded-full ${isError ? "bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.75)]" : "bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.75)]"} animate-pulse`}
							/>
						</div>

						<div className='min-w-0 flex-1'>
							<p
								className={`text-xs uppercase tracking-[0.22em] ${isError ? "text-red-200/80" : "text-cyan-200/80"}`}
							>
								{isError ? "Attention" : "Loading"}
							</p>
							<h2 className='truncate text-sm font-medium text-white'>
								{status}
							</h2>
						</div>
					</div>
				</div>

				<div className='space-y-3 px-4 py-3'>
					<div className='h-1.5 overflow-hidden rounded-full bg-white/8'>
						<div
							className={`h-full animate-pulse rounded-full bg-linear-to-r ${isError ? "from-red-400 via-rose-400 to-orange-400" : "from-cyan-400 via-blue-400 to-purple-400"} transition-all duration-500`}
							style={{ width: `${progress}%` }}
						/>
					</div>

					<div className='flex items-center justify-between text-xs text-slate-400'>
						<span>
							{isError
								? "Please retry or go back"
								: "Processing your selection"}
						</span>
						<span className='inline-flex items-center gap-1.5'>
							<span
								className={`h-1.5 w-1.5 animate-pulse rounded-full ${isError ? "bg-red-400" : "bg-cyan-400"}`}
							/>
							<span
								className={`h-1.5 w-1.5 animate-pulse rounded-full ${isError ? "bg-red-400" : "bg-cyan-400"} [animation-delay:150ms]`}
							/>
							<span
								className={`h-1.5 w-1.5 animate-pulse rounded-full ${isError ? "bg-red-400" : "bg-cyan-400"} [animation-delay:300ms]`}
							/>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoadingScreen;
