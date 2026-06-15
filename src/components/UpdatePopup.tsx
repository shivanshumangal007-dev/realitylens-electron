import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import api from '../Api';
import packageJson from '../../package.json';
import Icon from '../App_icons/icon.png';

const UpdatePopup = () => {
    const [updateAvailable, setUpdateAvailable] = useState(true);

    useEffect(() => {
        const checkUpdate = async () => {
            try {
                const version = packageJson.version; 
                const response = await api.post('/check-updates', { version });
                if (response.data && response.data.update_available) {
                    setUpdateAvailable(true);
                }
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };
        checkUpdate();
    }, []);

    return (
        <AnimatePresence>
            {updateAvailable && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 z-[9999]">
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="w-[calc(100vw-2rem)] sm:w-[340px] md:w-[360px] bg-[#141414]/90 backdrop-blur-xl rounded-[20px] p-4 flex gap-4 items-start shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] border border-white/[0.08] ring-1 ring-white/[0.02]"
                    >
                        {/* The circular icon */}
                        <img className="w-12 h-12 rounded-full object-cover shadow-lg border border-white/10" src={Icon} alt="Update Icon" />

                        <div className="flex flex-col flex-1 min-w-0 pr-4">
                            <h3 className="text-white text-[15px] font-semibold mb-1 tracking-tight">Update Available</h3>
                            <p className="text-white/60 text-[13px] mb-3 leading-snug">
                                Experience enhanced performance and bug fixes in the latest version.
                            </p>
                            <button 
                                onClick={() => {
                                    window.open("https://realitylens.com/download", "_blank");
                                }}
                                className="self-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-[13px] px-4 py-1.5 rounded-[10px] flex items-center gap-1.5 transition-all duration-200 font-medium shadow-[0_4px_12px_rgba(59,130,246,0.25)] border border-blue-400/20 active:scale-95"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Update Now
                            </button>
                        </div>
                        
                        {/* Close Button */}
                        <button 
                            onClick={() => setUpdateAvailable(false)}
                            className="absolute top-3 right-3 p-1.5 text-white/30 hover:text-white/70 hover:bg-white/10 rounded-full transition-all"
                            aria-label="Close update notification"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UpdatePopup;
