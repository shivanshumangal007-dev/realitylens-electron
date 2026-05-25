
import { motion } from "motion/react";
import {
	CheckCircle2,
	Minimize2,
	LayoutDashboard,
	Command,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import LogoutBtn from "../components/LogoutBtn";
import Cookies from "js-cookie";

const Home = () => {
	const navigate = useNavigate();
	// const [LoggedIn, setLoggedIn] = useState(false);
	useEffect(() => {
		localStorage.getItem("token") || navigate("/login");
	}, [navigate]);

	const minimiseApphandler = () => {
		window.electronAPI.minimiseApp();
	}

	return (
		<div className='size-full flex items-center justify-center relative overflow-hidden h-screen w-full'>
			{/* Animated gradient background */}
			<div className='absolute inset-0 bg-linear-to-br from-blue-950 via-background to-purple-950 opacity-50' />
			<LogoutBtn
				logouthandler={() => {
					// setLoggedIn(false);
					navigate("/login");
				}}
				classname='absolute top-4 right-4'
			/>

			{/* Floating gradient orbs */}
			<motion.div
				className='absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl'
				animate={{
					x: [0, 100, 0],
					y: [0, -100, 0],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "linear",
				}}
				style={{ top: "10%", left: "10%" }}
			/>
			<motion.div
				className='absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl'
				animate={{
					x: [0, -100, 0],
					y: [0, 100, 0],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "linear",
				}}
				style={{ bottom: "10%", right: "10%" }}
			/>

			{/* Main content */}
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className='relative z-10 w-full max-w-2xl mx-4 text-center'
			>
				{/* Success icon with glow */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
					className='inline-flex items-center justify-center mb-8'
				>
					<div className='relative'>
						<motion.div
							className='absolute inset-0 bg-linear
							-to-r from-cyan-500 to-green-500 rounded-full blur-2xl opacity-50'
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.5, 0.8, 0.5],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
							}}
						/>
						<CheckCircle2
							className='w-24 h-24 text-green-500 relative z-10'
							strokeWidth={1.5}
						/>
					</div>
				</motion.div>

				{/* Success message */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className='mb-12'
				>
					<h1 className='mb-4 text-4xl'>You are logged in successfully</h1>
					<p className='text-muted-foreground text-lg'>
						RealityLens is now running in the background.
					</p>
				</motion.div>

				{/* Keyboard shortcut showcase */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
					className='bg-card/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 mb-8'
				>
					<p className='text-muted-foreground mb-6'>Global keyboard shortcut</p>

					<div className='flex items-center justify-center gap-3 mb-6'>
						<motion.div
							whileHover={{ scale: 1.05, y: -2 }}
							className='bg-linear-to-b from-white/10 to-white/5 border border-white/20 rounded-xl px-6 py-4 shadow-lg'
						>
							<Command className='w-6 h-6' />
						</motion.div>
						<span className='text-2xl text-muted-foreground'>+</span>
						<motion.div
							whileHover={{ scale: 1.05, y: -2 }}
							className='bg-linear-to-b from-white/10 to-white/5 border border-white/20 rounded-xl px-6 py-4 shadow-lg'
						>
							<span className='text-xl'>⇧</span>
						</motion.div>
						<span className='text-2xl text-muted-foreground'>+</span>
						<motion.div
							whileHover={{ scale: 1.05, y: -2 }}
							className='bg-linear-to-b from-white/10 to-white/5 border border-white/20 rounded-xl px-6 py-4 shadow-lg'
						>
							<span className='text-xl'>L</span>
						</motion.div>
					</div>

					<p className='text-muted-foreground text-sm'>
						Use this shortcut anywhere on your device to instantly verify
						information.
					</p>
				</motion.div>

				{/* Action buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className='flex gap-4 justify-center'
				>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 text-foreground rounded-xl px-6 py-3 font-medium hover:bg-white/10 transition-all'
						onClick={minimiseApphandler}
					>
						<Minimize2 className='w-5 h-5' />
						Minimize to Tray
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => navigate("/dashboard")}
						className='flex items-center gap-2 bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-xl px-6 py-3 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all'
					>
						<LayoutDashboard className='w-5 h-5' />
						Open Dashboard
					</motion.button>
				</motion.div>

				{/* Subtle illustration hint */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1 }}
					className='mt-12 text-xs text-muted-foreground'
				>
					Press the shortcut anytime to verify claims, tweets, or information
				</motion.div>
			</motion.div>
		</div>
	);
}

export default Home;