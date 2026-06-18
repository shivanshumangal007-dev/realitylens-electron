import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { X, User, Mail, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { OTPcheckerUpdateHandler, updateProfileHandler } from "../ApiHandler";
import { data } from 'react-router-dom';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string; email: string } | null;
  onProfileUpdated: (msg?: string) => void;
}

type EditMode = 'username' | 'email' | 'password';

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser, onProfileUpdated }) => {
  const [mode, setMode] = useState<EditMode>('username');
  const [username, setUsername] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [otpClickCount, setOtpClickCount] = useState(0);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSentMessage, setOtpSentMessage] = useState("");

  // Update local state if currentUser changes
  React.useEffect(() => {
    if (currentUser && isOpen) {
      setUsername(currentUser.username);
      setEmail(currentUser.email);
      setPassword("");
      setOtp("");
      setError(null);
      setOtpClickCount(0);
      setOtpTimer(0);
      setOtpSentMessage("");
    }
  }, [currentUser, isOpen]);

  // Handle OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'username'){
        await handleSubmitUsername();
        return;
      }
      if (mode === 'email' || mode === 'password') {
        const data = {
          otp : otp,
          token : otpToken
        }
        await OTPcheckerUpdateHandler(data)
      }

      onProfileUpdated(`${mode === 'email' ? 'Email' : 'Password'} updated successfully!`);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUsername = async () => {
    try {
      const dataToUpdate: any = {};
      if (mode === 'username') dataToUpdate.username = username;
      const response = await updateProfileHandler(dataToUpdate);
      onProfileUpdated("Username updated successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOPTsend = async () => {
    setIsLoading(true);
    setError(null);
    setOtpSentMessage("");

    const dataToUpdate :any = {};
    if(mode === 'email'){
      dataToUpdate.email = email;
    }
    if(mode === 'password'){
      dataToUpdate.password = password;
    }
    try{
      const response = await updateProfileHandler(dataToUpdate);
      setOtpToken(response.data.access_token);
      setOtpSentMessage("OTP sent successfully!");
      
      if (otpClickCount === 0) {
        setOtpTimer(60); // 1 minute
      } else {
        setOtpTimer(300); // 5 minutes
      }
      setOtpClickCount(prev => prev + 1);
    }catch(err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-sidebar rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-white hover:cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pb-0">
              <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 ">
                {(['username', 'email', 'password'] as EditMode[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setMode(tab);
                      setError(null);
                      setOtpSentMessage("");
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                      mode === tab
                        ? 'bg-sidebar-accent text-white shadow-sm'
                        : 'text-sidebar-foreground/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {mode === 'username' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-sidebar-foreground/80">New Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      placeholder="Enter new username"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'email' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-sidebar-foreground/80">New Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        placeholder="Enter new email"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-sidebar-foreground/80">OTP Verification</label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          placeholder="Enter OTP"
                          required
                        />
                      </div>
                      <button 
                        type="button" 
                        disabled={otpTimer > 0 || isLoading}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-[110px]" 
                        onClick={() => handleOPTsend()}
                      >
                        {otpTimer > 0 ? `Wait ${otpTimer}s` : "Send OTP"}
                      </button>
                    </div>
                    {otpSentMessage && (
                      <p className="text-green-400 text-xs ml-1">{otpSentMessage}</p>
                    )}
                  </div>
                </div>
              )}

              {mode === 'password' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-sidebar-foreground/80">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-sidebar-foreground/80">OTP Verification</label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                          placeholder="Enter OTP"
                          required
                        />
                      </div>
                      <button 
                        type="button" 
                        disabled={otpTimer > 0 || isLoading}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-[110px]" 
                        onClick={() => handleOPTsend()}
                      >
                        {otpTimer > 0 ? `Wait ${otpTimer}s` : "Send OTP"}
                      </button>
                    </div>
                    {otpSentMessage && (
                      <p className="text-green-400 text-xs ml-1">{otpSentMessage}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
