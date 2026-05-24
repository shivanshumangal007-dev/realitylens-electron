import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
	Settings as SettingsIcon,
	ChevronRight,
} from "lucide-react";

type recentHistoryProps = {
    UserHistory: any[];
    setSelectedCurrentHistory: (verification: any) => void;
};
const RecentHIstory = ({ UserHistory, setSelectedCurrentHistory }: recentHistoryProps) => {
	const getVerdictColors = (verdict?: string) => {
		const normalized = (verdict || "").trim().toLowerCase();
		if (normalized === "likely fake") return { badge: "border-red-400/30 bg-red-400/10 text-red-500 dark:text-red-100", text: "text-red-500 dark:text-red-400" };
		if (normalized === "suspicious") return { badge: "border-yellow-400/30 bg-yellow-400/10 text-yellow-600 dark:text-yellow-100", text: "text-yellow-600 dark:text-yellow-400" };
		if (normalized === "likely real") return { badge: "border-green-400/30 bg-green-400/10 text-green-600 dark:text-green-100", text: "text-green-600 dark:text-green-400" };
		if (normalized === "satire") return { badge: "border-pink-400/30 bg-pink-400/10 text-pink-600 dark:text-pink-100", text: "text-pink-600 dark:text-pink-400" };
		if (normalized === "unreadable") return { badge: "border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-100", text: "text-slate-600 dark:text-slate-400" };
		// default / anything else
		return { badge: "border-blue-400/30 bg-blue-400/10 text-blue-600 dark:text-blue-100", text: "text-blue-600 dark:text-cyan-400" };
	};

	const formatTimestamp = (iso?: string) => {
		if (!iso) return "";
		try {
			return new Date(iso).toLocaleString();
		} catch (e) {
			return iso;
		}
	};
	const navigate = useNavigate();

	return (
		<motion.div
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.4, delay: 0.2 }}
		>
			<h2 className='mb-6'>Recent Verifications</h2>

			<div className='space-y-4'>
				{UserHistory.map((verification, index) => (
					<motion.div
						key={verification.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
						whileHover={{ x: 4, scale: 1.01 }}
						onClick={() => setSelectedCurrentHistory(verification)}
						className='bg-card/50 backdrop-blur border border-border rounded-2xl p-6 cursor-pointer hover:bg-card hover:border-black/20 transition-all group dark:hover:bg-card dark:hover:border-white/20'
					>
						<div className='flex items-start justify-between gap-4'>
							{verification.image_url && (
								<img
									src={verification.image_url}
									alt='thumbnail'
									className='w-16 h-16 rounded-lg object-cover shrink-0'
								/>
							)}
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-3 mb-2'>
									<h3 className='text-base truncate'>
										{verification.result?.claim || "Verification"}
									</h3>
									<span
										className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${
											getVerdictColors(verification.result?.verdict).badge
										}`}
									>
										{verification.result?.verdict
											? verification.result.verdict
											: "UNREADABLE"}
									</span>
								</div>
								<p className='text-sm text-muted-foreground line-clamp-2 mb-2'>
									{verification.result?.explanation}
								</p>
								<p className='text-xs text-muted-foreground'>
									{formatTimestamp(verification.created_at)}
								</p>
							</div>
							<ChevronRight className='w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};

export default RecentHIstory;
