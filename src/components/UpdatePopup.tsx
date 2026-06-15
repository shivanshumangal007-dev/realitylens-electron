import React, { useEffect, useState } from 'react';
import api from '../Api';
import packageJson from '../../package.json';

const UpdatePopup = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);

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

    if (!updateAvailable) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-10 md:right-10 md:left-auto md:translate-x-0 bg-[#2b2b2b] rounded-[20px] p-4 flex gap-5 items-center shadow-2xl z-[9999] max-w-[500px] border border-white/5">
            {/* The circular icon */}
            <div className="relative flex-shrink-0 w-28 h-28 bg-[#151515] rounded-[18px] overflow-hidden flex items-center justify-center shadow-inner">
                {/* Glowing ring effects */}
                <div className="absolute w-[80%] h-[80%] rounded-full border-[3px] border-[#00e1ff] shadow-[0_0_25px_rgba(0,225,255,0.7),inset_0_0_15px_rgba(0,225,255,0.4)] opacity-90" />
                <div className="absolute w-[65%] h-[65%] rounded-full border-[2px] border-[#0088ff] shadow-[0_0_20px_rgba(0,136,255,0.8),inset_0_0_10px_rgba(0,136,255,0.5)] opacity-80" />
                <div className="absolute w-[50%] h-[50%] rounded-full border border-blue-400 opacity-30" />
                
                {/* Little star/flare at the top right */}
                <div className="absolute top-[18%] right-[18%]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[2px] bg-white opacity-80 rotate-45 blur-[1px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-[2px] bg-white opacity-80 rotate-45 blur-[1px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff,0_0_20px_#00e1ff]"></div>
                </div>
            </div>
            
            <div className="flex flex-col">
                <h3 className="text-white text-[24px] font-medium mb-1 tracking-tight">New Update Available!</h3>
                <p className="text-[#9a9a9a] text-[14px] mb-4 leading-[1.4]">
                    A new version of Reality Lens is available, featuring performance improvements, enhanced accuracy, and important bug fixes.
                </p>
                <button 
                    onClick={() => {
                        window.open("https://realitylens.com/download", "_blank");
                    }}
                    className="self-start bg-gradient-to-b from-[#2eb2dd] to-[#043374] text-white text-[15px] px-5 py-2 rounded-[8px] flex items-center gap-2 hover:opacity-90 transition-opacity font-medium shadow-[0_4px_10px_rgba(0,0,0,0.3)] border border-white/10"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Update Now
                </button>
            </div>
        </div>
    );
};

export default UpdatePopup;
