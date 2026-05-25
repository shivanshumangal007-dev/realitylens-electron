import { motion } from "motion/react";
import {
	ArrowLeft,
	Moon,
	Bell,
	Keyboard,
	User,
	LogOut,
	Info,
	Command,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import * as Switch from "@radix-ui/react-switch";
import Cookies from "js-cookie";
type NewSettingsProps = {
	theme: string;
	setTheme: (value: string) => void;
};
const NewSettings = ({ theme, setTheme }: NewSettingsProps) => {
	const navigate = useNavigate();
	const [darkMode, setDarkMode] = useState(theme === "dark");
	const [notifications, setNotifications] = useState(true);
	const [soundEffects, setSoundEffects] = useState(false);
	const [autoStart, setAutoStart] = useState(true);

	const [shortcut, setShortcut] = useState<string>("CommandOrControl+Shift+L");
	const [isListening, setIsListening] = useState(false);

	useEffect(() => {
		if (window.electronAPI && window.electronAPI.getShortcut) {
			window.electronAPI.getShortcut().then((sc) => {
				if (sc) setShortcut(sc);
			});
		}
	}, []);

	useEffect(() => {
		if (!isListening) return;

		const handleKeyDown = async (e: KeyboardEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.key === "Escape") {
				setIsListening(false);
				return;
			}

			const keys = [];
			if (e.ctrlKey || e.metaKey) keys.push("CommandOrControl");
			if (e.shiftKey) keys.push("Shift");
			if (e.altKey) keys.push("Alt");

			const isModifier = ["Control", "Shift", "Alt", "Meta", "Escape"].includes(e.key);
			if (!isModifier) {
				const keyName = e.code.replace("Key", "").replace("Digit", "");
				keys.push(keyName.toUpperCase());
				
				const newShortcut = keys.join("+");
				setShortcut(newShortcut);
				setIsListening(false);
				
				if (window.electronAPI && window.electronAPI.updateShortcut) {
					await window.electronAPI.updateShortcut(newShortcut);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isListening]);

	const formatShortcutKey = (key: string) => {
		if (key === "CommandOrControl") return <Command className='w-4 h-4 inline' />;
		if (key === "Shift") return "⇧";
		if (key === "Alt") return "Alt";
		return key;
	};

	return (
		<div className='size-full bg-background overflow-auto'>
			<div className='max-w-3xl mx-auto p-8'>
				{/* Header */}
				<motion.div
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.3 }}
					className='mb-8'
				>
					<button
						onClick={() => navigate("/dashboard")}
						className='flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4'
					>
						<ArrowLeft className='w-4 h-4' />
						Back to Dashboard
					</button>
					<h1>Settings</h1>
					<p className='text-muted-foreground mt-2'>
						Manage your RealityLens preferences
					</p>
				</motion.div>

				{/* Appearance */}
				<motion.section
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className='mb-6'
				>
					<h3 className='mb-4'>Appearance</h3>
					<div className='bg-card/50 backdrop-blur border border-border rounded-2xl divide-y divide-border'>
						<div className='p-6 flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-xl bg-muted flex items-center justify-center'>
									<Moon className='w-5 h-5' />
								</div>
								<div>
									<p className='text-sm'>Dark Mode</p>
									<p className='text-xs text-muted-foreground'>
										Use dark theme throughout the app
									</p>
								</div>
							</div>
							<Switch.Root
								checked={darkMode}
								onCheckedChange={(checked) => {
									setDarkMode(checked);
									setTheme(checked ? "dark" : "light");
								}}
								className='w-11 h-6 bg-muted rounded-full relative data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-600 transition-all'
							>
								<Switch.Thumb className='block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]' />
							</Switch.Root>
						</div>
					</div>
				</motion.section>

				{/* Keyboard Shortcut */}
				<motion.section
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className='mb-6'
				>
					<h3 className='mb-4'>Keyboard Shortcut</h3>
					<div className='bg-card/50 backdrop-blur border border-border rounded-2xl p-6'>
						<div className='flex items-start gap-3'>
							<div className='w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0'>
								<Keyboard className='w-5 h-5' />
							</div>
							<div className='flex-1'>
								<p className='text-sm mb-3'>
									Global shortcut to open RealityLens
								</p>
								<div className='flex items-center gap-2 mb-3'>
									{isListening ? (
										<div className='bg-cyan-500/10 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-cyan-400 animate-pulse'>
											Press your new shortcut (Esc to cancel)...
										</div>
									) : (
										shortcut.split("+").map((key, index, arr) => (
											<div key={index} className='flex items-center gap-2'>
												<div className='bg-muted border border-border rounded-lg px-3 py-2 text-sm min-w-[32px] text-center'>
													{formatShortcutKey(key)}
												</div>
												{index < arr.length - 1 && (
													<span className='text-muted-foreground'>+</span>
												)}
											</div>
										))
									)}
								</div>
								<button 
									onClick={() => setIsListening(true)}
									className='text-sm text-cyan-500 hover:text-cyan-400 transition-colors'
								>
									{isListening ? "Listening..." : "Change shortcut"}
								</button>
							</div>
						</div>
					</div>
				</motion.section>


				{/* Logout */}
				<motion.section
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.5 }}
					className='mb-6'
				>
					<motion.button
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.99 }}
						onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}
						className='w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-3 hover:bg-red-500/20 transition-colors'
					>
						<div className='w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center'>
							<LogOut className='w-5 h-5 text-red-400' />
						</div>
						<div className='text-left'>
							<p className='text-sm text-red-400'>Logout</p>
							<p className='text-xs text-red-400/70'>
								Sign out of your account
							</p>
						</div>
					</motion.button>
				</motion.section>

				{/* About */}
				<motion.section
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.6 }}
				>
					<div className='bg-card/50 backdrop-blur border border-border rounded-2xl p-6'>
						<div className='flex items-start gap-3'>
							<div className='w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0'>
								<Info className='w-5 h-5' />
							</div>
							<div>
								<p className='text-sm mb-1'>About RealityLens</p>
								<p className='text-xs text-muted-foreground mb-2'>
									Version 1.0.0
								</p>
								<p className='text-xs text-muted-foreground'>
									AI-powered fact verification for the modern internet. Built
									with cutting-edge technology to help you navigate truth in a
									complex information landscape.
								</p>
							</div>
						</div>
					</div>
				</motion.section>
			</div>
		</div>
	);
}

export default NewSettings;