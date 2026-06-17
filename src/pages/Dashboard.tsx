import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  Plus,
  Clock,
  Settings as SettingsIcon,
  User,
  Search,
  CheckCircle2,
  History,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { fetchUser, HistoryHandler } from "../ApiHandler";
import LogoutBtn from "../components/LogoutBtn";
import CurrentSelectedHistory from "../components/CurrentSelectedHistory";
import RecentHIstory from "../components/RecentHIstory";
import LoadingScreen from "../components/LoadingScreen";
import NewVarification from "../components/NewVarification";
import ErrorBoundary from "../components/ErrorBoundary";
import icon from "../App_icons/icon.png";
import EditProfileNoEmailModal from "../components/EditProfileNoEmailModal";
interface userProps {
  email: string;
  username: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("new");
  const [UserHistory, setUserHistory] = useState<any[]>([]);
  const [user, setuser] = useState<userProps | null>(null);
  const [selectedcurrentHistory, setSelectedCurrentHistory] = useState<
    any | null
  >(null);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const historyResponse = await HistoryHandler();
      setUserHistory(
        Array.isArray(historyResponse.data) ? historyResponse.data : [],
      );
    } catch (error) {
      console.error("Dashboard history refresh error:", error);
    }
  };

  const handleProfileUpdated = async (message?: string) => {
    try {
      const userResponse = await fetchUser();
      setuser(userResponse.data);
      if (message) {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to refresh user after update", err);
    }
  };

  useEffect(() => {
    localStorage.getItem("token") || navigate("/login");
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      setIsBootLoading(true);
      setLoadError(null);

      try {
        const [historyResponse, userResponse] = await Promise.all([
          HistoryHandler(),
          fetchUser(),
        ]);

        if (!mounted) return;
        setUserHistory(
          Array.isArray(historyResponse.data) ? historyResponse.data : [],
        );
        setuser(userResponse.data);
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load dashboard right now.";
        console.error("Dashboard load error:", error);
        setLoadError(message);
      } finally {
        if (mounted) setIsBootLoading(false);
      }
    };

    void loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (isBootLoading) {
    return <LoadingScreen status="Loading your dashboard..." fullScreen />;
  }

  if (loadError) {
    return (
      <div className="flex size-full items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-card/70 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-red-300">
            Dashboard unavailable
          </p>
          <h1 className="mt-3 text-3xl">We could not load your data</h1>
          <p className="mt-3 text-sm text-muted-foreground">{loadError}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/10"
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex bg-background h-screen w-full">
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
      >
        <div className="p-6 border-b border-sidebar-border">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full text-left cursor-pointer"
          >
            <img src={icon} alt="RealityLens" className="w-8 h-8" />
            <span className="text-lg">RealityLens</span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => setActiveSection("new")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeSection === "new"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>New Verification</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex flex-col"
          >
            <h2 
              onClick={() => {
                setActiveSection("history");
                setSelectedCurrentHistory(null);
              }}
              className="px-4 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 cursor-pointer hover:text-sidebar-foreground transition-colors flex items-center gap-2 group"
            >
              <History />
              Recent History
            </h2>
            <div className="space-y-1 overflow-y-auto max-h-[80vh] px-2 pb-2">
              {UserHistory.map((item, index) => {
                // console.log(item)
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCurrentHistory(item);
                      setActiveSection("history");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                      selectedcurrentHistory?.id === item.id &&
                      activeSection === "history"
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-6 h-6 shrink-0 opacity-60 border border-white/40 rounded-md"
                    />
                    <span className="text-sm truncate w-full opacity-80">
                      {item.result?.claim || "Untitled verification"}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* <motion.button
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
					</motion.button> */}

          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors self-end"
          >
            <SettingsIcon className="w-5 h-5 " />
            <span>Settings</span>
          </motion.button>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-blue-900 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {user?.username || "Loading user..."}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-8 h-full flex flex-col">
          {activeSection == "new" ? (
            <section className="flex flex-1 min-h-0 items-center justify-center">
              <ErrorBoundary fallbackMessage="Failed to load verification screen">
                <NewVarification
                  username={user?.username || ""}
                  onNewVerification={fetchHistory}
                />
              </ErrorBoundary>
            </section>
          ) : selectedcurrentHistory ? (
            <ErrorBoundary fallbackMessage="Failed to load history details">
              <CurrentSelectedHistory
                setSelectedCurrentHistory={setSelectedCurrentHistory}
                selectedcurrentHistory={selectedcurrentHistory}
              />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary fallbackMessage="Failed to load recent history">
              <RecentHIstory
                UserHistory={UserHistory}
                setSelectedCurrentHistory={setSelectedCurrentHistory}
              />
            </ErrorBoundary>
          )}
          {/* <motion.div
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className='mb-12 flex justify-between items-center'
					>
						<div className='relative group w-full'>
							<Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
							<input
								type='text'
								placeholder='Ask RealityLens to verify anything…'
								className='w-full bg-card/50 backdrop-blur border border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-card transition-all'
							/>
							<div className='absolute inset-0 rounded-2xl bg-linear-to-r from-cyan-500/0 via-blue-500/0 to-purple-600/0 group-focus-within:from-cyan-500/10 group-focus-within:via-blue-500/10 group-focus-within:to-purple-600/10 transition-all pointer-events-none' />
						</div>
						<LogoutBtn
							logouthandler={() => {
								localStorage.removeItem("token");
								navigate("/login");
							}}
						/>
					</motion.div> */}
          {}
        </div>
      </main>

      <EditProfileNoEmailModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={user}
        onProfileUpdated={(msg) => handleProfileUpdated(msg)}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-[9999] bg-[#141414]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3 ring-1 ring-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm font-medium text-white">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
