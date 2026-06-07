import { motion } from "motion/react";
import { Clock, X } from "lucide-react";
import React, { useEffect } from "react";

type RateLimitScreenProps = {
	onClose: () => void;
};

const RateLimitScreen = ({ onClose }: RateLimitScreenProps) => {
	useEffect(() => {
		window.electronAPI?.setOverlayClickThrough(false);
	}, []);

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 pointer-events-auto'>
			<div className='absolute inset-0 bg-linear-to-br from-red-950/30 via-slate-950 to-orange-950/30' />
			
			<motion.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: -20 }}
				className='relative w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-950/90 shadow-2xl shadow-red-500/10 overflow-hidden'
			>
				{/* Top glowing edge */}
				<div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-500 via-orange-500 to-red-500 opacity-50' />

				{/* Close button */}
				<button
					type="button"
					onClick={onClose}
					className='absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors z-10'
				>
					<X className='w-5 h-5' />
				</button>

				<div className='p-8 text-center'>
					{/* Animated Icon */}
					<motion.div 
						className='relative inline-flex items-center justify-center mb-6'
						initial={{ rotate: -10 }}
						animate={{ rotate: [ -10, 10, -10 ] }}
						transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
					>
						<div className='absolute inset-0 bg-red-500/20 blur-xl rounded-full' />
						<div className='relative bg-red-500/10 p-4 rounded-2xl border border-red-500/20'>
							<Clock className='w-12 h-12 text-red-400' />
						</div>
					</motion.div>

					<h2 className='text-2xl font-semibold text-white mb-3'>
						Rate Limit Reached
					</h2>
					<p className='text-slate-300 mb-8 leading-relaxed'>
						You've been making a lot of requests lately. Please wait a moment before trying to verify another image.
					</p>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={onClose}
						className='w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2'
					>
						Dismiss
					</motion.button>
				</div>
			</motion.div>
		</div>
	);
};

export default RateLimitScreen;
