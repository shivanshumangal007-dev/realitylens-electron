import { motion } from "motion/react";
import { Eye, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { registerHandler } from "../ApiHandler";
const Register = () => {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleRegister = (e: React.FormEvent) => {
		e.preventDefault();
		registerHandler( email, password)
			.then(() => {
				navigate("/login");
			})
			.catch((error) => {
				console.error("Registration error:", error);
			});
	};

	return (
		<div className='size-full flex items-center justify-center relative overflow-hidden w-full h-screen'>
			{/* Animated gradient background */}
			<div className='absolute inset-0 bg-linear-to-br from-blue-950 via-background to-purple-950 opacity-50' />
			<motion.div
				className='absolute inset-0 opacity-30'
				animate={{
					background: [
						"radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
						"radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
						"radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)",
						"radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
					],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: "linear",
				}}
			/>

			{/* Glassmorphism login card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='relative z-10 w-full max-w-md mx-4'
			>
				<div className='bg-card/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8'>
					{/* Logo and branding */}
					<div className='text-center mb-8'>
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.5 }}
							className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-500 via-blue-500 to-purple-600 mb-4'
						>
							<Eye className='w-8 h-8 text-white' />
						</motion.div>
						<motion.h1
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							className='mb-2'
						>
							RealityLens
						</motion.h1>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className='text-muted-foreground'
						>
							AI-powered fact verification for the modern internet
						</motion.p>
					</div>

					{/* Register form */}
					<form
						onSubmit={handleRegister}
						className='space-y-4'
					>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 }}
						>
							<label className='block text-sm mb-2'>Name</label>
							<div className='relative'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
								<input
									type='name'
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder='John Doe'
									className='w-full bg-input/50 backdrop-blur border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all'
									required
								/>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 }}
						>
							<label className='block text-sm mb-2'>Email</label>
							<div className='relative'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
								<input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='you@example.com'
									className='w-full bg-input/50 backdrop-blur border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all'
									required
								/>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6 }}
						>
							<label className='block text-sm mb-2'>New Password</label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
								<input
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder='••••••••'
									className='w-full bg-input/50 backdrop-blur border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all'
									required
								/>
							</div>
						</motion.div>

						<motion.button
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							className='w-full bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-xl py-3 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all'
						>
							Continue
						</motion.button>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8 }}
							className='relative my-6'
						>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-white/10' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-4 bg-card/40 text-muted-foreground'>
									or
								</span>
							</div>
						</motion.div>

						<motion.button
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.9 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='button'
							className='w-full bg-white/5 backdrop-blur border border-white/10 text-foreground rounded-xl py-3 font-medium hover:bg-white/10 transition-all'
						>
							SignUp with Google
						</motion.button>
					</form>

					{/* Footer */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className='mt-8 text-center text-sm text-muted-foreground'
					>
						already have an account? <a href="/login" className="text-cyan-500 hover:underline">Login here</a>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
};
export default Register;
