type LoadingScreenProps = {
	status: string;
};

const LoadingScreen = ({ status }: LoadingScreenProps) => {
	let progress = 30; // default
	if (status) {
		const s = status.toLowerCase();
		if (s.includes("extracting") || s.includes("capturing")) progress = 60;
		else if (s.includes("searching")) progress = 90;
		else if (s.includes("generating") || s.includes("result")) progress = 95;
		else if (s.includes("done") || s.includes("ready")) progress = 100;
	}

	return (
		<div className='absolute right-4 bottom-4 z-50 w-[min(26rem,calc(100vw-2rem))]'>
			<div className='overflow-hidden rounded-2xl border border-white/10 bg-slate-950/85 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl'>
				<div className='bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 px-4 py-3'>
					<div className='flex items-center gap-3'>
						<div className='relative flex h-10 w-10 items-center justify-center'>
							<div className='absolute h-10 w-10 rounded-full border border-cyan-400/25' />
							<div className='absolute h-7 w-7 rounded-full border border-cyan-300/50 border-t-transparent animate-spin' />
							<div className='h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.75)] animate-pulse' />
						</div>

						<div className='min-w-0 flex-1'>
							<p className='text-xs uppercase tracking-[0.22em] text-cyan-200/80'>
								Loading
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
							className='h-full animate-pulse rounded-full bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 transition-all duration-500' 
							style={{ width: `${progress}%` }} 
						/>
					</div>

					<div className='flex items-center justify-between text-xs text-slate-400'>
						<span>Processing your selection</span>
						<span className='inline-flex items-center gap-1.5'>
							<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400' />
							<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 [animation-delay:150ms]' />
							<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 [animation-delay:300ms]' />
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoadingScreen;
