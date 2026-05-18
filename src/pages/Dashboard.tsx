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
import { useState } from "react";

const mockVerifications = [
	{
		id: "1",
		title: "COVID-19 vaccine efficacy claim",
		preview:
			"Verified: The claim about 95% efficacy matches published clinical trial data from Pfizer-BioNTech...",
		timestamp: "2 hours ago",
		status: "true" as const,
	},
	{
		id: "2",
		title: "Climate change statistics tweet",
		preview:
			"Mixed: While the overall trend is accurate, some specific numbers need context and clarification...",
		timestamp: "5 hours ago",
		status: "mixed" as const,
	},
	{
		id: "3",
		title: "Political quote verification",
		preview:
			"False: The quote attributed to this politician was actually said by someone else in a different context...",
		timestamp: "1 day ago",
		status: "false" as const,
	},
	{
		id: "4",
		title: "Scientific breakthrough announcement",
		preview:
			"Uncertain: The research is preliminary and has not yet been peer-reviewed or independently verified...",
		timestamp: "2 days ago",
		status: "uncertain" as const,
	},
	{
		id: "5",
		title: "Historical fact check",
		preview:
			"Verified: Historical records confirm this event occurred on the stated date with matching details...",
		timestamp: "3 days ago",
		status: "true" as const,
	},
];

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

const Dashboard = () => {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState("new");

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
							{mockVerifications.map((verification, index) => (
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
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-3 mb-2'>
												<h3 className='text-base truncate'>
													{verification.title}
												</h3>
												<span
													className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border bg-linear-to-r ${
														statusColors[verification.status]
													}`}
												>
													{statusLabels[verification.status]}
												</span>
											</div>
											<p className='text-sm text-muted-foreground line-clamp-2 mb-2'>
												{verification.preview}
											</p>
											<p className='text-xs text-muted-foreground'>
												{verification.timestamp}
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
}

export default Dashboard;