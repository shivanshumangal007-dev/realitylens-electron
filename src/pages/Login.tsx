import { motion } from "motion/react";
import { Eye, Mail, Lock, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import { loginHandler, OTP_checker } from "../ApiHandler";
import LoadingScreen from "../components/LoadingScreen";
import icon from "../App_icons/icon.png";
import googleIcon from "../assets/google.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [showOTP, setShowOTP] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [otpClickCount, setOtpClickCount] = useState(0);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSentMessage, setOtpSentMessage] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0 && showOTP) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer, showOTP]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }

    // Listen for Google deep link success
    if ((window as any).electronAPI?.onGoogleLoginSuccess) {
      (window as any).electronAPI.onGoogleLoginSuccess(
        (data: { token: string; userId: string }) => {
          localStorage.setItem("token", data.token);
          navigate("/dashboard");
        },
      );
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.openExternal(
        "https://realitylens-9qu1.onrender.com/login/google",
      );
    } else {
      window.location.href =
        "https://realitylens-9qu1.onrender.com/login/google";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await loginHandler(email, password);
      // Backend returns access_token on login, use it for OTP check
      setTempToken(res.data.access_token);
      setShowOTP(true);
      setOtpTimer(60);
      setOtpClickCount(1);
      setOtpSentMessage("");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setOtpSentMessage("");

    try {
      const res = await loginHandler(email, password);
      setTempToken(res.data.access_token);
      setOtpSentMessage("OTP resent successfully!");

      if (otpClickCount === 0) {
        setOtpTimer(60);
      } else {
        setOtpTimer(300);
      }
      setOtpClickCount((prev) => prev + 1);
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to resend OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOTP = otp.join("");
    if (enteredOTP.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await OTP_checker(tempToken, enteredOTP);
      // Once OTP is verified, save the real token and redirect
      localStorage.setItem("token", res.access_token);
      navigate("/dashboard");
    } catch (error) {
      console.error("OTP error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "OTP verification failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden w-full h-screen">
      {isSubmitting && (
        <LoadingScreen status={showOTP ? "Verifying..." : "Signing you in..."} fullScreen progress={100} />
      )}
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-background to-purple-950 opacity-50" />
      <motion.div
        className="absolute inset-0 opacity-30"
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
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-card/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <img src={icon} alt="RealityLens" className="w-15 h-15 mx-auto" />
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-2"
            >
              Reality Lens
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              AI-powered fact verification for the modern internet
            </motion.p>
          </div>

          {/* Conditional Form Rendering */}
          {!showOTP ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {errorMessage}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="johndoe@mail.com"
                      className="w-full bg-input/50 backdrop-blur border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-input/50 backdrop-blur border border-white/10 rounded-xl pl-11 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-r from-cyan-500 via-blue-500 to-blue-900 text-white rounded-xl py-3 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Signing in..." : "Continue"}
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card/40 text-muted-foreground">
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
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 bg-white/5 backdrop-blur border border-white/10 text-foreground rounded-xl py-3 font-medium hover:bg-white/10 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <img src={googleIcon} alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </motion.button>
              </form>
              <div className="text-center mt-6 text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {errorMessage}
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Check your email</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  We've sent a 6-digit verification code to your email address.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center gap-3"
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9]*$/.test(value)) {
                        const newOtp = [...otp];
                        newOtp[index] = value;
                        setOtp(newOtp);
                        // Auto-focus next input
                        if (value && index < 5) {
                          const nextInput = document.getElementById(
                            `otp-${index + 1}`,
                          );
                          nextInput?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        const prevInput = document.getElementById(
                          `otp-${index - 1}`,
                        );
                        prevInput?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-bold bg-input/50 backdrop-blur border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    required
                    disabled={isSubmitting}
                  />
                ))}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || otp.some((d) => d === "")}
                className="w-full bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 hover:opacity-90 text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify OTP
              </motion.button>

              {otpSentMessage && (
                <p className="text-green-400 text-sm text-center">{otpSentMessage}</p>
              )}

              <div className="flex justify-between items-center mt-4 px-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0 || isSubmitting}
                  className="text-sm text-cyan-400 hover:text-cyan-300 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default Login;
