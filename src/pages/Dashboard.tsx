import { motion } from "motion/react";
import {
	Eye,
	Plus,
	Clock,
	Settings as SettingsIcon,
	User,
	Search,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { fetchUser, HistoryHandler } from "../ApiHandler";
import LogoutBtn from "../components/LogoutBtn";
import CurrentSelectedHistory from "../components/CurrentSelectedHistory";
import RecentHIstory from "../components/RecentHIstory";
import LoadingScreen from "../components/LoadingScreen";
import NewVarification from "../components/NewVarification";

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
	const [isBootLoading, setIsBootLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		localStorage.getItem("token") || navigate("/login");
	}, [navigate]);

	useEffect(() => {
		let mounted = true;

		const loadDashboardData = async () => {
			setIsBootLoading(true);
			setLoadError(null);

			try {
				const [historyResponse, userResponse] = await Promise.all([
					HistoryHandler(),
					fetchUser(),
				]);

				if (!mounted) return;
				setUserHistory(
					Array.isArray(historyResponse.data) ? historyResponse.data : [],
				);
				setuser(userResponse.data);
			} catch (error) {
				if (!mounted) return;
				const message =
					error instanceof Error
						? error.message
						: "Unable to load dashboard right now.";
				console.error("Dashboard load error:", error);
				setLoadError(message);

				if (
					message.toLowerCase().includes("session expired") ||
					message.toLowerCase().includes("sign in again")
				) {
					localStorage.removeItem("token");
					navigate("/login");
				}
			} finally {
				if (mounted) setIsBootLoading(false);
			}
		};

		void loadDashboardData();

		return () => {
			mounted = false;
		};
	}, [navigate]);

	if (isBootLoading) {
		return (
			<LoadingScreen
				status='Loading your dashboard...'
				fullScreen
			/>
		);
	}

	if (loadError) {
		return (
			<div className='flex size-full items-center justify-center bg-background px-4 text-foreground'>
				<div className='w-full max-w-lg rounded-3xl border border-white/10 bg-card/70 p-8 text-center shadow-2xl backdrop-blur-xl'>
					<p className='text-xs uppercase tracking-[0.22em] text-red-300'>
						Dashboard unavailable
					</p>
					<h1 className='mt-3 text-3xl'>We could not load your data</h1>
					<p className='mt-3 text-sm text-muted-foreground'>{loadError}</p>
					<div className='mt-6 flex flex-wrap justify-center gap-3'>
						<button
							type='button'
							onClick={() => window.location.reload()}
							className='rounded-xl bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white'
						>
							Retry
						</button>
						<button
							type='button'
							onClick={() => {
								localStorage.removeItem("token");
								navigate("/login");
							}}
							className='rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/10'
						>
							Go to login
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='size-full flex bg-background h-screen w-full'>
			<motion.aside
				initial={{ x: -20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.3 }}
				className='w-64 bg-sidebar border-r border-sidebar-border flex flex-col'
			>
				<div className='p-6 border-b border-sidebar-border'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center'>
							<Eye className='w-5 h-5 text-white' />
						</div>
						<span className='text-lg'>RealityLens</span>
					</div>
				</div>

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

				<div className='p-4 border-t border-sidebar-border'>
					<motion.div
						whileHover={{ scale: 1.02 }}
						className='flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent/50 transition-colors cursor-pointer'
					>
						<div className='w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center'>
							<User className='w-5 h-5 text-white' />
						</div>
						<div className='flex-1 min-w-0'>
							<p className='text-sm truncate'>
								{user?.username || "Loading user..."}
							</p>
							<p className='text-xs text-muted-foreground truncate'>
								{user?.email || ""}
							</p>
						</div>
					</motion.div>
				</div>
			</motion.aside>

			<main className='flex-1 overflow-auto'>
				<div className='max-w-6xl mx-auto p-8'>
					{activeSection == "new" ? (
						<section className='flex min-h-[calc(100vh-8rem)] items-start'>
							<NewVarification />
						</section>
					) : selectedcurrentHistory ? (
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
					{/* <motion.div
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
								localStorage.removeItem("token");
								navigate("/login");
							}}
						/>
					</motion.div> */}
					{}
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
