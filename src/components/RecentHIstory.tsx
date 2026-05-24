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
	const statusColors = {
		true: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
		false: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
		mixed:
			"from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
		uncertain:
			"from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400",
	};

	const statusLabels = {
		true: "Verified",
		false: "False",
		mixed: "Mixed",
		uncertain: "Uncertain",
	};

	const getStatusKey = (verification: any) => {
		const verdict = String(verification?.result?.verdict || "").toLowerCase();
		const score = verification?.result?.reality_score;
		if (verdict.includes("real") || (typeof score === "number" && score >= 0.7))
			return "true";
		if (
			verdict.includes("false") ||
			(typeof score === "number" && score <= 0.3)
		)
			return "false";
		if (verdict.includes("mixed")) return "mixed";
		return "uncertain";
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
										className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border bg-linear-to-r ${
											statusColors[getStatusKey(verification)]
										}`}
									>
										{statusLabels[getStatusKey(verification)]}
										{verification.result?.verdict
											? ` • ${verification.result.verdict}`
											: ""}
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
