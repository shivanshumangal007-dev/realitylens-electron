import { motion, AnimatePresence } from "motion/react";
import {
	ArrowLeft,
	Moon,
	Bell,
	Keyboard,
	User,
	LogOut,
	Info,
	Command,
	AlertTriangle,
	KeyRound,
	X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import * as Switch from "@radix-ui/react-switch";
import Cookies from "js-cookie";
import { deleteAccount, verifyOTPDelete } from "../ApiHandler";
const NewSettings = () => {
	const navigate = useNavigate();
	const [shortcut, setShortcut] = useState<string>("CommandOrControl+Shift+L");
	const [isListening, setIsListening] = useState(false);
	const [appVersion, setAppVersion] = useState<string>("1.0.0");

	// Delete Account States
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deleteOtp, setDeleteOtp] = useState("");
	const [deleteOtpToken, setDeleteOtpToken] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const [otpClickCount, setOtpClickCount] = useState(0);
	const [otpTimer, setOtpTimer] = useState(0);
	const [otpSentMessage, setOtpSentMessage] = useState("");

	// Logout State
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const handleDeleteClick = async () => {
		setIsDeleting(true);
		setDeleteError(null);
		setOtpSentMessage("");
		try {
			const response = await deleteAccount();
			// Assume the backend sends an access token or token for the OTP validation
			const token = response?.data?.access_token || response?.data?.token || "";
			setDeleteOtpToken(token);
			setIsDeleteModalOpen(true);
			setOtpTimer(60);
			setOtpClickCount(1);
		} catch (err: any) {
			setDeleteError(err.message || "Failed to initiate deletion");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleResendOTP = async () => {
		setIsDeleting(true);
		setDeleteError(null);
		setOtpSentMessage("");

		try {
			const response = await deleteAccount();
			const token = response?.data?.access_token || response?.data?.token || "";
			setDeleteOtpToken(token);
			setOtpSentMessage("OTP resent successfully!");

			if (otpClickCount === 0) {
				setOtpTimer(60);
			} else {
				setOtpTimer(300);
			}
			setOtpClickCount((prev) => prev + 1);
		} catch (err: any) {
			setDeleteError(err.message || "Failed to resend OTP");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleVerifyDelete = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsDeleting(true);
		setDeleteError(null);
		try {
			await verifyOTPDelete(deleteOtp, deleteOtpToken);
			// Successful deletion
			localStorage.removeItem("token");
			navigate("/login");
		} catch (err: any) {
			setDeleteError(err.message || "Failed to verify OTP");
			setIsDeleting(false);
		}
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (otpTimer > 0 && isDeleteModalOpen) {
			interval = setInterval(() => {
				setOtpTimer((prev) => prev - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [otpTimer, isDeleteModalOpen]);

	useEffect(() => {
		if (window.electronAPI && window.electronAPI.getShortcut) {
			window.electronAPI.getShortcut().then((sc) => {
				if (sc) setShortcut(sc);
			});
		}
		if (window.electronAPI && window.electronAPI.getAppVersion) {
			window.electronAPI.getAppVersion().then((version) => {
				if (version) setAppVersion(version);
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
						onClick={() => setIsLogoutModalOpen(true)}
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

				{/* Delete Account */}
				<motion.section
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.55 }}
					className='mb-6'
				>
					<div className='bg-red-500/5 border border-red-500/20 rounded-2xl p-6'>
						<div className='flex items-start gap-3'>
							<div className='w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0'>
								<AlertTriangle className='w-5 h-5 text-red-400' />
							</div>
							<div className='flex-1'>
								<p className='text-sm text-red-400 mb-1'>Delete Account</p>
								<p className='text-xs text-red-400/70 mb-4'>
									After deleting account you have to create a new account with this email and all history will be deleted.
								</p>
								{deleteError && !isDeleteModalOpen && (
									<p className="text-xs text-red-500 mb-3">{deleteError}</p>
								)}
								<button
									onClick={handleDeleteClick}
									disabled={isDeleting}
									className='text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-colors disabled:opacity-50'
								>
									{isDeleting && !isDeleteModalOpen ? "Initiating..." : "Delete My Account"}
								</button>
							</div>
						</div>
					</div>
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
									Version {appVersion}
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

			{/* Logout Modal */}
			<AnimatePresence>
				{isLogoutModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="w-full max-w-md bg-sidebar rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative"
						>
							<div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
								<h2 className="text-xl font-semibold text-white">Confirm Logout</h2>
								<button
									onClick={() => setIsLogoutModalOpen(false)}
									className="text-muted-foreground hover:text-white transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<p className="text-sm text-sidebar-foreground/80">
									Are you sure you want to logout?
								</p>

								<div className="pt-4 flex gap-3">
									<button
										type="button"
										onClick={() => setIsLogoutModalOpen(false)}
										className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={() => {
											localStorage.removeItem("token");
											navigate("/login");
										}}
										className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/80 text-white hover:bg-red-500 transition-colors text-sm font-medium"
									>
										Logout
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Delete Account OTP Modal */}
			<AnimatePresence>
				{isDeleteModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="w-full max-w-md bg-sidebar rounded-2xl shadow-2xl border border-red-500/30 overflow-hidden relative"
						>
							<div className="p-6 border-b border-white/10 flex justify-between items-center bg-red-500/5">
								<h2 className="text-xl font-semibold text-red-400">Verify Deletion</h2>
								<button
									onClick={() => {
										setIsDeleteModalOpen(false);
										setDeleteOtp("");
										setDeleteError(null);
										setOtpTimer(0);
										setOtpClickCount(0);
										setOtpSentMessage("");
									}}
									className="text-muted-foreground hover:text-white transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<form onSubmit={handleVerifyDelete} className="p-6 space-y-4">
								<p className="text-sm text-sidebar-foreground/80">
									We sent an OTP to your email. Please enter it below to confirm account deletion. This action cannot be undone.
								</p>

								{deleteError && (
									<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
										{deleteError}
									</div>
								)}

								<div className="space-y-2">
									<label className="text-sm font-medium text-red-400">OTP Verification</label>
									<div className="relative">
										<KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/50" />
										<input
											type="text"
											value={deleteOtp}
											onChange={(e) => setDeleteOtp(e.target.value)}
											className="w-full bg-black/20 border border-red-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
											placeholder="Enter OTP"
											required
										/>
									</div>
								</div>

								<div className="pt-4 flex gap-3">
									<button
										type="button"
										onClick={() => {
											setIsDeleteModalOpen(false);
											setDeleteOtp("");
											setDeleteError(null);
											setOtpTimer(0);
											setOtpClickCount(0);
											setOtpSentMessage("");
										}}
										className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isDeleting || deleteOtp.length < 4}
										className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/80 text-white hover:bg-red-500 transition-colors text-sm font-medium disabled:opacity-50"
									>
										{isDeleting ? "Deleting..." : "Confirm Delete"}
									</button>
								</div>

								{otpSentMessage && (
									<p className="text-green-400 text-sm text-center">{otpSentMessage}</p>
								)}

								<div className="flex justify-between items-center mt-2 px-1">
									<button
										type="button"
										onClick={handleResendOTP}
										disabled={otpTimer > 0 || isDeleting}
										className="text-sm text-red-400 hover:text-red-300 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
									>
										{otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default NewSettings;