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
import { fetchUser, HistoryHandler } from "../ApiHandler";
import LogoutBtn from "../components/LogoutBtn";
import Cookies from "js-cookie";
import CurrentSelectedHistory from "../components/CurrentSelectedHistory";
import RecentHIstory from "../components/RecentHIstory";

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


interface userProps {
	email: string;
	username: string;
}
const Dashboard = () => {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState("new");
	const [UserHistory, setUserHistory] = useState<any[]>([]);
	const [user, setuser] = useState<userProps | null>(null);
	const [selectedcurrentHistory, setSelectedCurrentHistory] = useState<
		any | null
	>(null);
	useEffect(() => {
		Cookies.get("token") || navigate("/login");
	}, [navigate]);
	useEffect(() => {
		HistoryHandler()
			.then((res) => {
				// console.log("User history:", res.data);
				setUserHistory(res.data);
			})
			.catch((error) => {
				console.error("Error fetching history:", error);
			});
	}, []);
	useEffect(() => {
		fetchUser()
			.then((res) => {
				// console.log("User data:", res.data);
				setuser(res.data);
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
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
							<p className='text-sm truncate'>{user?.username}</p>
							<p className='text-xs text-muted-foreground truncate'>
								{user?.email}
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
						className='mb-12 flex justify-between items-center'
					>
						<div className='relative group w-full'>
							<Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
							<input
								type='text'
								placeholder='Ask RealityLens to verify anything…'
								className='w-full bg-card/50 backdrop-blur border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-card transition-all'
							/>
							<div className='absolute inset-0 rounded-2xl bg-linear-to-r from-cyan-500/0 via-blue-500/0 to-purple-600/0 group-focus-within:from-cyan-500/10 group-focus-within:via-blue-500/10 group-focus-within:to-purple-600/10 transition-all pointer-events-none' />
						</div>
						<LogoutBtn
							logouthandler={() => {
								navigate("/login");
							}}
						/>
					</motion.div>
					{selectedcurrentHistory ? (
						<CurrentSelectedHistory
							setSelectedCurrentHistory={setSelectedCurrentHistory}
							selectedcurrentHistory={selectedcurrentHistory}
						/>
					) : (
						<RecentHIstory
							UserHistory={UserHistory}
							setSelectedCurrentHistory={setSelectedCurrentHistory}
						/>
					)}
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
