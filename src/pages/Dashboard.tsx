import { motion } from "motion/react";
import {
	Eye,
	Plus,
	Clock,
	BookmarkCheck,
	Settings as SettingsIcon,
	User,
	Search,
	ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { HistoryHandler } from "../ApiHandler";

// const mockVerifications = [
// 	{
// 		id: "f56e7df6-6ed5-4e96-bd95-6a5080cede9c",
// 		created_at: "2026-05-22T09:58:03.991134+00:00",
// 		status: "done",
// 		result: {
// 			claim:
// 				"This video authentically depicts a massive mushroom cloud explosion in Israel.",
// 			verdict: "LIKELY REAL",
// 			evidence: [
// 				{
// 					url: "",
// 					title: "Tavily AI Summary",
// 					source: "Tavily",
// 					stance: "supports",
// 				},
// 				{
// 					url: "https://www.youtube.com/watch?v=42V8DnCSKpE",
// 					title:
// 						"Israel’s SECRET Blast at Military Site Sparks Massive Mushroom Cloud",
// 					source: "Oneindia News",
// 					stance: "supports",
// 				},
// 				{
// 					url: "https://www.youtube.com/watch?v=ij5fAKxHgds",
// 					title:
// 						"NUCLEAR TEST OR ATTACK? Giant Fireball Sparks Panic in Israel",
// 					source: "ET Now",
// 					stance: "supports",
// 				},
// 				{
// 					url: "https://timesofindia.indiatimes.com/videos/international/massive-explosion-hits-israels-nuclear-missile-hub-irans-first-strike-move/videoshow/131149924.cms",
// 					title:
// 						"Massive Explosion Hits Israel's 'Nuclear, Missile Hub'; Iran's First Strike Move?",
// 					source: "Times of India",
// 					stance: "supports",
// 				},
// 				{
// 					url: "https://www.instagram.com/reel/DYcKqABJhOw",
// 					title:
// 						"A massive explosion in central Israel triggered panic across social media",
// 					source: "Instagram",
// 					stance: "related",
// 				},
// 			],
// 			confidence: 0.88,
// 			explanation:
// 				"Multiple credible sources, including Tavily AI Summary and news outlets, confirm that a massive explosion occurred in central Israel, producing a mushroom cloud, which Israel attributed to a controlled missile test. The event was reported by various news sources, including YouTube news channels and online news websites, with consistent details. Although some speculation and conspiracy theories are present, the core claim is supported by credible sources.",
// 			reality_score: 0.92,
// 		},
// 		error: null,
// 		user_id: "47a617fc-861d-4f46-8348-9e78374cdb54",
// 		image_url:
// 			"https://res.cloudinary.com/dwe6n6goq/image/upload/v1779443883/realitylens_uploads/fpsd1wfizqpn81faoi6q.png",
// 	},
// ];

const statusColors = {
	true: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
	false: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
	mixed:
		"from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
	uncertain: "from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400",
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
	if (verdict.includes("false") || (typeof score === "number" && score <= 0.3))
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

const Dashboard = () => {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState("new");

	const [UserHistory, setUserHistory] = useState<any[]>([]);
	useEffect(() => {
		HistoryHandler().then((res) => {
			// console.log("User history:", res.data);
			setUserHistory(res.data);
		}).catch((error) => {
			console.error("Error fetching history:", error);
		});
	}, []);
	return (
		<div className='size-full flex bg-background h-screen w-full'>
			{/* Sidebar */}
			<motion.aside
				initial={{ x: -20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.3 }}
				className='w-64 bg-sidebar border-r border-sidebar-border flex flex-col'
			>
				{/* Logo */}
				<div className='p-6 border-b border-sidebar-border'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center'>
							<Eye className='w-5 h-5 text-white' />
						</div>
						<span className='text-lg'>RealityLens</span>
					</div>
				</div>

				{/* Navigation */}
				<nav className='flex-1 p-4 space-y-1'>
					<motion.button
						whileHover={{ x: 4 }}
						onClick={() => setActiveSection("new")}
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
							activeSection === "new"
								? "bg-sidebar-accent text-sidebar-accent-foreground"
								: "text-sidebar-foreground hover:bg-sidebar-accent/50"
						}`}
					>
						<Plus className='w-5 h-5' />
						<span>New Verification</span>
					</motion.button>

					<motion.button
						whileHover={{ x: 4 }}
						onClick={() => setActiveSection("history")}
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
							activeSection === "history"
								? "bg-sidebar-accent text-sidebar-accent-foreground"
								: "text-sidebar-foreground hover:bg-sidebar-accent/50"
						}`}
					>
						<Clock className='w-5 h-5' />
						<span>History</span>
					</motion.button>

					<motion.button
						whileHover={{ x: 4 }}
						onClick={() => setActiveSection("saved")}
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
							activeSection === "saved"
								? "bg-sidebar-accent text-sidebar-accent-foreground"
								: "text-sidebar-foreground hover:bg-sidebar-accent/50"
						}`}
					>
						<BookmarkCheck className='w-5 h-5' />
						<span>Saved</span>
					</motion.button>

					<motion.button
						whileHover={{ x: 4 }}
						onClick={() => navigate("/settings")}
						className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors'
					>
						<SettingsIcon className='w-5 h-5' />
						<span>Settings</span>
					</motion.button>
				</nav>

				{/* User profile */}
				<div className='p-4 border-t border-sidebar-border'>
					<motion.div
						whileHover={{ scale: 1.02 }}
						className='flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent/50 transition-colors cursor-pointer'
					>
						<div className='w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center'>
							<User className='w-5 h-5 text-white' />
						</div>
						<div className='flex-1 min-w-0'>
							<p className='text-sm truncate'>John Doe</p>
							<p className='text-xs text-muted-foreground truncate'>
								john@example.com
							</p>
						</div>
					</motion.div>
				</div>
			</motion.aside>

			{/* Main content */}
			<main className='flex-1 overflow-auto'>
				<div className='max-w-6xl mx-auto p-8'>
					{/* Search bar */}
					<motion.div
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className='mb-12'
					>
						<div className='relative group'>
							<Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
							<input
								type='text'
								placeholder='Ask RealityLens to verify anything…'
								className='w-full bg-card/50 backdrop-blur border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-card transition-all'
							/>
							<div className='absolute inset-0 rounded-2xl bg-linear-to-r from-cyan-500/0 via-blue-500/0 to-purple-600/0 group-focus-within:from-cyan-500/10 group-focus-within:via-blue-500/10 group-focus-within:to-purple-600/10 transition-all pointer-events-none' />
						</div>
					</motion.div>

					{/* Recent Verifications */}
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
									onClick={() => navigate(`/verification/${verification.id}`)}
									className='bg-card/50 backdrop-blur border border-border rounded-2xl p-6 cursor-pointer hover:bg-card hover:border-black/20 transition-all group dark:hover:bg-card dark:hover:border-white/20'
								>
									<div className='flex items-start justify-between gap-4'>
										{verification.image_url && (
											<img
												src={verification.image_url}
												alt='thumbnail'
												className='w-16 h-16 rounded-lg object-cover flex-shrink-0'
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
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
