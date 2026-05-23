import React, {useState , useEffect} from 'react'
import { motion } from "motion/react";
import {
	Eye,
	Plus,
	Clock,
	Settings as SettingsIcon,
	User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { fetchUser } from '../ApiHandler';

interface userProps {
	email: string;
	username: string;
}
const Setting = () => {
    const [activeSection, setActiveSection] = useState("settings");
    const navigate = useNavigate();
    const [user, setuser] = useState<userProps | null>(null);
    useEffect(() => {
        fetchUser().then((res) => {
            // console.log("User data:", res.data);
            setuser(res.data);
        }).catch((error) => {
            console.error("Error fetching user data:", error);
        })
    }, [])
  return (
		<div>
			<motion.aside
				initial={{ x: -20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.3 }}
				className='w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen'
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
						onClick={() => navigate("/")}
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
						onClick={() => navigate("/")}
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
						className='w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground transition-colors'
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
		</div>
	);
}

export default Setting
