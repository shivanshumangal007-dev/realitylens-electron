import { motion } from "motion/react";

import React from "react";
import {
	ArrowLeft,
	ExternalLink,
	ChevronDown,
	ChevronUp,
	Send,
	TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router";
type CurrentSelectedHistoryProps = {
	setSelectedCurrentHistory: (verification: any) => void;
	selectedcurrentHistory: any;
};
const CurrentSelectedHistory = ({
	setSelectedCurrentHistory,
	selectedcurrentHistory,
}: CurrentSelectedHistoryProps) => {
	const navigate = useNavigate();
	return (
		<div>
			<motion.div
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.3 }}
				className='mb-8'
			>
				<button
					onClick={() => setSelectedCurrentHistory(null)}
					className='flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer'
				>
					<ArrowLeft className='w-4 h-4' />
					Back to Dashboard
				</button>
			</motion.div>
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className='mb-6'
			>
				<div className='bg-card/50 backdrop-blur border border-border rounded-2xl p-6'>
					<p className='text-xs text-muted-foreground mb-2'>Your Question</p>
					<img
						src={selectedcurrentHistory.image_url}
						alt='Verification'
					/>
				</div>
			</motion.div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.2 }}
				className='mb-6'
			>
				<div className='bg-linear-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-4'>
					<div className='flex items-center justify-between mb-2'>
						<div className='flex items-center gap-2'>
							<TrendingUp className='w-5 h-5 text-green-400' />
							<span className='text-sm'>Confidence Score</span>
						</div>
						<span className='text-2xl text-green-400'>
							{selectedcurrentHistory.result.confidence}%
						</span>
					</div>
					<div className='w-full bg-black/20 rounded-full h-2 overflow-hidden'>
						<motion.div
							initial={{ width: 0 }}
							animate={{
								width: `${selectedcurrentHistory.result.confidence}%`,
							}}
							transition={{ duration: 1, delay: 0.5 }}
							className='h-full bg-linear-to-r from-green-500 to-green-400 rounded-full'
						/>
					</div>
				</div>
			</motion.div>
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.2 }}
				className='mb-6'
			>
				<div className='bg-linear-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-2xl p-4'>
					<div className='flex items-center justify-between mb-2'>
						<div className='flex items-center gap-2'>
							<TrendingUp className='w-5 h-5 text-amber-400' />
							<span className='text-sm'>Reality Score</span>
						</div>
						<span className='text-2xl text-amber-400'>
							{selectedcurrentHistory.result.reality_score}%
						</span>
					</div>
					<div className='w-full bg-black/20 rounded-full h-2 overflow-hidden'>
						<motion.div
							initial={{ width: 0 }}
							animate={{
								width: `${selectedcurrentHistory.result.reality_score}%`,
							}}
							transition={{ duration: 1, delay: 0.5 }}
							className='h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full'
						/>
					</div>
				</div>
			</motion.div>
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.3 }}
				className='mb-6'
			>
				<div className='bg-card/50 backdrop-blur border border-border rounded-2xl p-6'>
					<p className='text-xs text-muted-foreground mb-4'>AI Verification</p>
					<div className='prose prose-invert max-w-none'>
						{selectedcurrentHistory.result.explanation
							.split("\n\n")
							.map((paragraph: string, index: string) => (
								<p
									key={index}
									className='mb-4 last:mb-0 text-sm leading-relaxed'
								>
									{paragraph}
								</p>
							))}
					</div>
				</div>
			</motion.div>
			<motion.div
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.3 }}
				className='mb-8'
			>
				<h1 className='flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer'>
					Evidences
				</h1>
			</motion.div>
			{selectedcurrentHistory.result.evidence.map(
				(evidence: any, index: number) => (
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className='my-6'
					>
						<h1
							className='bg-card/50 backdrop-blur border border-border rounded-2xl p-6 text-lg cursor-pointer'
							onClick={() => window.open(evidence.url, "_blank")}
							rel='noopener noreferrer'
						>
							{evidence.title}
						</h1>
					</motion.div>
				),
			)}
		</div>
	);
};

export default CurrentSelectedHistory;
