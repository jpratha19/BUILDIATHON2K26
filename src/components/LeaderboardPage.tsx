import React, { useState, useEffect } from "react";
import {
  Award,
  Search,
  Trophy,
  Sparkles,
  User,
  Github,
  Linkedin,
  Calendar,
  Zap,
  ChevronRight,
  Flame,
  ArrowLeft,
  X,
  ShieldCheck,
  Building,
  GraduationCap,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Clock
} from "lucide-react";
import { db, auth } from "../lib/firebase";
import { collection, query, onSnapshot, doc, setDoc, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

interface FirestoreUser {
  uid: string;
  name: string;
  username?: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  college?: string;
  year?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  profileImage?: string;
  xp?: number;
  xpWeekly?: number;
  xpMonthly?: number;
  xpYearly?: number;
  xpEarnedToday?: number;
  level?: number;
  wins?: number;
  participated?: number;
  streak?: number;
  hackathonsParticipated?: number;
  badges?: string[];
  lastActive?: string;
  latestActivityType?: string;
  bio?: string;
}

interface LeaderboardPageProps {
  onGoHome: () => void;
  onOpenLogin: () => void;
}

export default function LeaderboardPage({ onGoHome, onOpenLogin }: LeaderboardPageProps) {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<FirestoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile completion sub-modal state
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [completeCollege, setCompleteCollege] = useState("");
  const [completeGithub, setCompleteGithub] = useState("");
  const [completeLinkedin, setCompleteLinkedin] = useState("");
  const [completeUsername, setCompleteUsername] = useState("");

  const currentUserId = auth.currentUser?.uid;

  // 1. Listen to real-time database updates for ALL users
  useEffect(() => {
    setIsLoading(true);
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedUsers: FirestoreUser[] = [];
        snapshot.forEach((doc) => {
          fetchedUsers.push({ uid: doc.id, ...doc.data() } as FirestoreUser);
        });

        // Sort users dynamically according to total XP (descending)
        fetchedUsers.sort((a, b) => {
          const xpA = a.xp || 0;
          const xpB = b.xp || 0;
          return xpB - xpA;
        });

        setUsers(fetchedUsers);
        setError(null);
        setIsLoading(false);

        // Keep local profile synced
        if (currentUserId) {
          const matchedProfile = fetchedUsers.find((u) => u.uid === currentUserId);
          if (matchedProfile) {
            setCurrentUserProfile(matchedProfile);
          }
        }
      },
      (err) => {
        console.error("Error fetching users from Firestore snapshot:", err);
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);



  // Helper: Secure Experience Points (XP) awarding via Express backend
  const awardXpBackend = async (userId: string, action: string) => {
    try {
      const response = await fetch("/api/leaderboard/award-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      });
      const data = await response.json();
      if (data.success) {
        console.log(`Earned ${data.xpAwarded} XP! Action: ${action}`);
        
        // Trigger celebratory canvas-confetti on Level Up!
        if (data.levelUp) {
          confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.55 },
            colors: ["#7c3aed", "#06b6d4", "#a855f7", "#e11d48", "#fbbf24"]
          });
        } else {
          // Standard sparkles confetti for actions
          confetti({
            particleCount: 50,
            spread: 40,
            origin: { y: 0.7 },
            colors: ["#06b6d4", "#7c3aed"]
          });
        }

        // Sync drawer selections if open
        if (selectedUser && selectedUser.uid === userId) {
          const userDocSnap = await fetch(`/api/user-status-mock-bypass/${userId}`).catch(() => null);
          // Snapshot updates onSnapshot hook will update anyway, but we force immediate update
          setSelectedUser((prev) => {
            if (!prev) return null;
            const updatedXp = (prev.xp || 0) + data.xpAwarded;
            const newLevel = data.newLevel;
            return {
              ...prev,
              xp: updatedXp,
              level: newLevel,
              badges: data.updateData.badges,
              streak: data.updateData.streak,
              wins: data.updateData.wins,
              participated: data.updateData.participated,
              xpEarnedToday: data.updateData.xpEarnedToday,
              lastActive: data.updateData.lastActive,
              latestActivityType: action
            };
          });
        }
      }
    } catch (err) {
      console.error("Failed to award XP server-side:", err);
    }
  };

  // Profile completion handler
  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !currentUserProfile) return;

    try {
      const userRef = doc(db, "users", currentUserId);
      await setDoc(userRef, {
        college: completeCollege,
        github: completeGithub,
        linkedin: completeLinkedin,
        username: completeUsername || currentUserProfile.name.toLowerCase().replace(/\s+/g, "_"),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsCompletingProfile(false);
      // Award profile completion bonus XP
      await awardXpBackend(currentUserId, "profile_completion");
    } catch (err) {
      console.error("Failed to complete profile:", err);
    }
  };

  // Filter list by search query
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = u.name.toLowerCase().includes(q);
    const usernameMatch = u.username?.toLowerCase().includes(q) || false;
    const collegeMatch = u.college?.toLowerCase().includes(q) || false;
    return nameMatch || usernameMatch || collegeMatch;
  });

  // Limit table and podium displays strictly to the Top 10 users as requested
  const displayedUsers = filteredUsers.slice(0, 10);

  // Get podium rankings (top 3 of the Top 10)
  const podiumUsers = displayedUsers.slice(0, 3);
  const restUsers = displayedUsers.slice(3);

  // Find active user's rank
  const currentUserRank = users.findIndex((u) => u.uid === currentUserId) + 1;
  const isCurrentUserInTopRows = displayedUsers.some((u) => u.uid === currentUserId);

  // Calculate dynamic stats from all users
  const totalUsers = users.length;
  const totalXp = users.reduce((sum, u) => sum + (u.xp || 0), 0);
  const averageLevel = totalUsers > 0 ? (users.reduce((sum, u) => sum + (u.level || 1), 0) / totalUsers).toFixed(1) : "1.0";
  
  const mostActiveUser = users.reduce<FirestoreUser | null>((lead, curr) => {
    if (!lead) return curr;
    const leadActive = lead.lastActive ? new Date(lead.lastActive).getTime() : 0;
    const currActive = curr.lastActive ? new Date(curr.lastActive).getTime() : 0;
    return currActive > leadActive ? curr : lead;
  }, null);

  // Next level threshold calculator
  const getLevelXpRange = (level: number) => {
    switch (level) {
      case 1: return { min: 0, max: 500, label: "500 XP Needed" };
      case 2: return { min: 500, max: 1000, label: "1000 XP Needed" };
      case 3: return { min: 1000, max: 2000, label: "2000 XP Needed" };
      case 4: return { min: 2000, max: 3500, label: "3500 XP Needed" };
      case 5: return { min: 3500, max: 5000, label: "5000 XP Needed" };
      default: return { min: 5000, max: 5000, label: "MAX Level Reached!" };
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "champion": return "from-amber-400 to-yellow-500 text-slate-950";
      case "master": return "from-purple-500 to-indigo-500 text-white";
      case "elite": return "from-rose-500 to-pink-500 text-white";
      case "pro": return "from-cyan-500 to-blue-500 text-white";
      case "winner": return "from-amber-500 to-orange-500 text-white";
      case "streak hacker": return "from-orange-500 to-red-500 text-white";
      case "innovator": return "from-teal-400 to-emerald-500 text-slate-950";
      default: return "bg-white/10 text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative ambient radial gradients */}
      <div className="absolute top-0 left-1/4 w-[60vw] h-[60vw] rounded-full bg-brand-purple/10 glow-blur -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vw] rounded-full bg-brand-blue/5 glow-blur translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={onGoHome}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5 animate-pulse" />
                <span>Season 1 Live Leaderboard</span>
              </div>
              <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
                Top 10
                <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent ml-2">Hackers</span>
              </h1>
            </div>
          </div>

          {/* User quick status/login */}
          <div className="flex items-center gap-4">
            {auth.currentUser ? (
              <div className="p-1 px-4 rounded-2xl glass-panel border border-brand-purple/20 bg-brand-purple/5 flex items-center gap-3">
                {currentUserProfile?.profileImage ? (
                  <img
                    src={currentUserProfile.profileImage}
                    alt={currentUserProfile.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-brand-purple shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-bold text-white text-xs shadow-md shadow-brand-purple/20">
                    {currentUserProfile?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">{currentUserProfile?.name || "Hacker"}</p>
                  <p className="text-[10px] text-slate-400">Level {currentUserProfile?.level || 1} • {currentUserProfile?.xp || 0} XP</p>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-xs font-bold hover:opacity-90 shadow-lg cursor-pointer"
              >
                Sign In to Join Leaderboard
              </button>
            )}
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          
          <div className="rounded-2xl glass-panel border border-white/5 p-5 bg-[#09052a]/40 shadow-xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Total Competitors</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {isLoading ? "..." : totalUsers}
              </h3>
            </div>
          </div>

          <div className="rounded-2xl glass-panel border border-white/5 p-5 bg-[#09052a]/40 shadow-xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Total XP Claimed</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {isLoading ? "..." : totalXp.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="rounded-2xl glass-panel border border-white/5 p-5 bg-[#09052a]/40 shadow-xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Average Level</p>
              <h3 className="text-2xl font-black text-white mt-1">
                Lv {isLoading ? "..." : averageLevel}
              </h3>
            </div>
          </div>

          <div className="rounded-2xl glass-panel border border-white/5 p-5 bg-[#09052a]/40 shadow-xl flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Most Active Now</p>
              <h3 className="text-sm font-bold text-white truncate max-w-[130px] mt-2">
                {isLoading ? "..." : mostActiveUser ? mostActiveUser.name : "None"}
              </h3>
            </div>
          </div>

        </div>

        {/* Incentive complete profile booster */}
        {auth.currentUser && currentUserProfile && !currentUserProfile.github && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-brand-purple/20 via-brand-blue/15 to-transparent border border-brand-purple/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-brand-cyan shrink-0 animate-pulse" />
              <div>
                <h4 className="font-bold text-white text-sm">Boost Your Standings! Complete Your Hacker Profile</h4>
                <p className="text-xs text-slate-300 mt-0.5">Provide your GitHub handle, college, and social links to earn an immediate <span className="text-brand-cyan font-bold">+50 Experience Points (XP)</span> booster!</p>
              </div>
            </div>
            <button
              onClick={() => {
                setCompleteCollege(currentUserProfile.college || "");
                setCompleteGithub(currentUserProfile.github || "");
                setCompleteLinkedin(currentUserProfile.linkedin || "");
                setCompleteUsername(currentUserProfile.username || currentUserProfile.name.toLowerCase().replace(/\s+/g, "_"));
                setIsCompletingProfile(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-xs font-extrabold hover:scale-105 transition-all text-white shrink-0 cursor-pointer shadow-lg shadow-brand-purple/20"
            >
              Complete Profile (+50 XP)
            </button>
          </motion.div>
        )}

        {/* Podiums / Top Three Hacker Showcase */}
        {displayedUsers.length > 0 && searchQuery === "" && (
          <div className="mb-12">
            <h3 className="font-display font-black text-white text-lg tracking-wider uppercase mb-6 text-center flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Current Podium Standing</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
              
              {/* Second Place Podium */}
              {podiumUsers[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => {
                    setSelectedUser(podiumUsers[1]);
                    setIsDrawerOpen(true);
                  }}
                  className="rounded-3xl glass-panel border border-slate-300/20 p-6 bg-[#0a0723]/60 hover:border-slate-300/40 hover:scale-[1.03] transition-all flex flex-col items-center text-center cursor-pointer order-2 md:order-1 relative group md:h-76"
                >
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-slate-400/20 border-4 border-[#030014]">
                    2
                  </div>
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-slate-400 to-slate-200 mb-4 shadow-xl overflow-hidden">
                    {podiumUsers[1].profileImage ? (
                      <img
                        src={podiumUsers[1].profileImage}
                        alt={podiumUsers[1].name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-white text-xl">
                        {podiumUsers[1].name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="font-black text-white text-base group-hover:text-brand-cyan transition-colors">{podiumUsers[1].name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">@{podiumUsers[1].username || "hacker"}</p>
                  <div className="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">
                    {podiumUsers[1].college || "Academic Developer"}
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-1.5">
                    <span className="text-slate-200 text-lg font-black font-mono">{podiumUsers[1].xp || 0}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">XP</span>
                  </div>
                </motion.div>
              )}

              {/* First Place Podium */}
              {podiumUsers[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setSelectedUser(podiumUsers[0]);
                    setIsDrawerOpen(true);
                  }}
                  className="rounded-3xl glass-panel border border-amber-400/40 p-8 bg-[#120d30]/85 hover:border-amber-400/70 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] transition-all flex flex-col items-center text-center cursor-pointer order-1 md:order-2 relative group md:h-88 border-t-4"
                >
                  <div className="absolute -top-7 w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-xl shadow-amber-400/30 border-4 border-[#030014] animate-bounce">
                    1
                  </div>
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-300 to-amber-500 mb-4 shadow-2xl relative overflow-hidden">
                    {podiumUsers[0].profileImage ? (
                      <img
                        src={podiumUsers[0].profileImage}
                        alt={podiumUsers[0].name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-white text-2xl">
                        {podiumUsers[0].name.charAt(0)}
                      </div>
                    )}
                    <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <h4 className="font-black text-white text-lg group-hover:text-brand-cyan transition-colors">{podiumUsers[0].name}</h4>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">@{podiumUsers[0].username || "champion"}</p>
                  <div className="mt-4 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-extrabold text-amber-300 uppercase">
                    {podiumUsers[0].college || "Independent Architect"}
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-1.5">
                    <span className="text-amber-400 text-2xl font-black font-mono">{podiumUsers[0].xp || 0}</span>
                    <span className="text-xs text-amber-400 uppercase font-mono font-bold">XP</span>
                  </div>
                </motion.div>
              )}

              {/* Third Place Podium */}
              {podiumUsers[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    setSelectedUser(podiumUsers[2]);
                    setIsDrawerOpen(true);
                  }}
                  className="rounded-3xl glass-panel border border-orange-500/20 p-6 bg-[#0a0723]/60 hover:border-orange-500/40 hover:scale-[1.03] transition-all flex flex-col items-center text-center cursor-pointer order-3 relative group md:h-72"
                >
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20 border-4 border-[#030014]">
                    3
                  </div>
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-orange-400 to-amber-700 mb-4 shadow-xl overflow-hidden">
                    {podiumUsers[2].profileImage ? (
                      <img
                        src={podiumUsers[2].profileImage}
                        alt={podiumUsers[2].name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-white text-xl">
                        {podiumUsers[2].name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="font-black text-white text-base group-hover:text-brand-cyan transition-colors">{podiumUsers[2].name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">@{podiumUsers[2].username || "hacker"}</p>
                  <div className="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">
                    {podiumUsers[2].college || "Lead Contributor"}
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-1.5">
                    <span className="text-slate-200 text-lg font-black font-mono">{podiumUsers[2].xp || 0}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">XP</span>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        )}

        {/* Filter Toolbar controls panel */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-[#09052b]/30 p-4 rounded-2xl border border-white/5">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hacker name, username, or college..."
              className="w-full glass-input py-3 pl-11 pr-4 rounded-xl text-sm text-slate-200 border border-white/10 bg-white/5 focus:border-brand-blue/50 transition-colors"
            />
          </div>

        </div>

        {/* Leaderboard Table Grid */}
        <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0c092a]/85 border-b border-white/5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">Hacker Name & Organization</th>
                  <th className="py-4 px-6 text-center">Level</th>
                  <th className="py-4 px-6 text-right">Badges</th>
                  <th className="py-4 px-6 text-center hidden md:table-cell">Hackathons</th>
                  <th className="py-4 px-6 text-center hidden sm:table-cell">Streak</th>
                  <th className="py-4 px-6 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {error ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="max-w-xl mx-auto flex flex-col items-center gap-4 text-rose-400 px-6">
                        <HelpCircle className="w-12 h-12 text-rose-400 animate-pulse" />
                        <div>
                          <h4 className="font-bold text-white text-base">Database Sync Error</h4>
                          <p className="text-xs mt-2 text-rose-300 font-mono text-left bg-black/40 p-4 rounded-xl border border-rose-900/40 whitespace-pre-wrap">{error}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin"></div>
                        <p className="text-xs text-slate-400 font-mono">Synchronizing real-time developer statistics...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center gap-4">
                        <HelpCircle className="w-12 h-12 text-slate-500 animate-pulse" />
                        <div>
                          <h4 className="font-bold text-white text-base">No competitors detected</h4>
                          <p className="text-xs text-slate-400 mt-1">There are no records in the users database collection yet.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((u, idx) => {
                    const rank = idx + 1;
                    const isTopThree = rank <= 3;
                    const isActiveUser = u.uid === currentUserId;
                    const badgesList = u.badges || ["Hacker"];

                    return (
                      <tr
                        key={u.uid}
                        onClick={() => {
                          setSelectedUser(u);
                          setIsDrawerOpen(true);
                        }}
                        className={`hover:bg-white/[0.02] transition-all duration-150 cursor-pointer group ${
                          isActiveUser ? "bg-brand-purple/5 border-l-4 border-l-brand-purple" : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            {isTopThree ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md ${
                                rank === 1
                                  ? "bg-gradient-to-tr from-yellow-300 to-amber-500 text-slate-950 shadow-amber-400/20"
                                  : rank === 2
                                  ? "bg-gradient-to-tr from-slate-300 to-slate-400 text-slate-950"
                                  : "bg-gradient-to-tr from-orange-400 to-orange-600 text-slate-950 shadow-orange-500/10"
                              }`}>
                                {rank}
                              </div>
                            ) : (
                              <span className="font-mono font-bold text-slate-500">{rank}</span>
                            )}
                          </div>
                        </td>

                        {/* Name & College */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {u.profileImage ? (
                              <img
                                src={u.profileImage}
                                alt={u.name}
                                referrerPolicy="no-referrer"
                                className={`w-10 h-10 rounded-full object-cover border shrink-0 ${
                                  isActiveUser ? "border-brand-purple shadow-sm shadow-brand-purple/30" : "border-white/5"
                                }`}
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white relative uppercase border shrink-0 ${
                                isActiveUser ? "bg-brand-purple border-brand-purple shadow-sm shadow-brand-purple/30" : "bg-slate-800 border-white/5"
                              }`}>
                                {u.name ? u.name.charAt(0) : "H"}
                              </div>
                            )}
                            {isActiveUser && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#030014] flex items-center justify-center">
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <h4 className="font-bold text-white text-sm truncate flex items-center gap-2 group-hover:text-brand-cyan transition-colors">
                                {u.name}
                                {isActiveUser && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-purple/15 text-brand-cyan uppercase font-mono font-extrabold border border-brand-purple/20">
                                    You
                                  </span>
                                )}
                              </h4>
                              <span className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                {u.college || "Academic Explorer"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="py-4 px-6 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-extrabold text-slate-200">
                            Lv {u.level || 1}
                          </span>
                        </td>

                        {/* Badges */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap max-w-xs ml-auto">
                            {badgesList.slice(0, 2).map((badge, bIdx) => (
                              <span
                                key={bIdx}
                                className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase bg-gradient-to-r tracking-wider shrink-0 ${getBadgeColor(badge)}`}
                              >
                                {badge}
                              </span>
                            ))}
                            {badgesList.length > 2 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-bold shrink-0">
                                +{badgesList.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Hackathons */}
                        <td className="py-4 px-6 text-center hidden md:table-cell">
                          <span className="text-xs text-slate-300 font-mono">
                            {u.hackathonsParticipated || 0}
                          </span>
                        </td>

                        {/* Streak */}
                        <td className="py-4 px-6 text-center hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-1 text-xs font-mono font-black text-orange-400">
                            <Flame className="w-3.5 h-3.5 fill-orange-400/20 shrink-0" />
                            <span>{u.streak || 0}</span>
                          </div>
                        </td>

                        {/* Total XP */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-mono">
                            <span className="text-sm font-black text-brand-cyan">
                              {(u.xp || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">XP</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky Anchor Footer panel for Current User */}
        {auth.currentUser && currentUserProfile && !isCurrentUserInTopRows && (
          <div className="sticky bottom-4 left-0 right-0 z-40 bg-gradient-to-r from-[#12093a] to-[#040118] border-2 border-brand-purple/40 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-6 backdrop-blur-md animate-slide-up max-w-5xl mx-auto">
            <div className="flex items-center gap-4 min-w-0">
              {currentUserProfile.profileImage ? (
                <img
                  src={currentUserProfile.profileImage}
                  alt={currentUserProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-brand-purple shadow shadow-brand-purple/30 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center font-black text-white shrink-0 relative shadow shadow-brand-purple/30">
                  {currentUserProfile.name.charAt(0)}
                </div>
              )}
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-[9px] font-black z-10">
                {currentUserRank || "?"}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs text-brand-cyan font-semibold tracking-wider font-mono uppercase">Your Rank standing</p>
                <h4 className="font-bold text-white text-sm truncate leading-tight mt-0.5">{currentUserProfile.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-xs">{currentUserProfile.college || "Stanford Student"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0 font-mono">
              <div className="hidden md:flex flex-col items-center">
                <span className="text-[10px] text-slate-400">Streak</span>
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1 mt-0.5">
                  <Flame className="w-3.5 h-3.5" />
                  {currentUserProfile.streak || 1}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400">Total All-Time</span>
                <span className="text-sm font-black text-brand-cyan mt-0.5">{currentUserProfile.xp || 0} XP</span>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(currentUserProfile);
                  setIsDrawerOpen(true);
                }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* User Details Slide-out Panel (Drawer) */}
      <AnimatePresence>
        {isDrawerOpen && selectedUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm cursor-pointer"
            ></motion.div>

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed top-0 right-0 h-screen w-full sm:max-w-md bg-[#040118] border-l border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-[#0c092a]/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-brand-cyan">
                  <ShieldCheck className="w-5 h-5 text-brand-purple" />
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">Hacker Terminal Profile</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Identity Card */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-purple to-brand-cyan p-0.5 shadow-2xl shadow-brand-purple/10 mb-4 overflow-hidden">
                    {selectedUser.profileImage ? (
                      <img
                        src={selectedUser.profileImage}
                        alt={selectedUser.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-white text-2xl uppercase">
                        {selectedUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-white text-xl">{selectedUser.name}</h3>
                  <p className="text-xs text-brand-cyan font-mono mt-0.5">@{selectedUser.username || "dev_hacker"}</p>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-300 font-medium">{selectedUser.college || "Academic Engineer"}</span>
                  </div>

                  {selectedUser.bio && (
                    <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed italic max-w-[280px] border-t border-white/5 pt-3">
                      "{selectedUser.bio}"
                    </p>
                  )}
                </div>

                {/* Level Progress Indicator */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-300">Level {selectedUser.level || 1} Progression</span>
                    <span className="text-[10px] text-brand-cyan font-mono font-bold">
                      {selectedUser.xp || 0} XP
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  {(() => {
                    const range = getLevelXpRange(selectedUser.level || 1);
                    const currentLvlXp = (selectedUser.xp || 0) - range.min;
                    const maxLvlXp = range.max - range.min;
                    const percentage = maxLvlXp > 0 ? Math.min(100, Math.max(0, (currentLvlXp / maxLvlXp) * 100)) : 100;

                    return (
                      <div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden relative border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan rounded-full"
                          ></motion.div>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-[9px] text-slate-500 font-mono">Min: {range.min} XP</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono text-brand-cyan">
                            {range.label}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Performance Metrics Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <Calendar className="w-4 h-4 text-brand-purple mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Participated</span>
                    <span className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {selectedUser.participated || 0} Hackathons
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Victories</span>
                    <span className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {selectedUser.wins || 0} Champion Wins
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Daily Streak</span>
                    <span className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {selectedUser.streak || 1} Days
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Earned Today</span>
                    <span className="text-sm font-bold text-slate-100 font-mono mt-1">
                      +{selectedUser.xpEarnedToday || 0} XP
                    </span>
                  </div>

                </div>

                {/* Badges Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand-cyan" />
                    <span>Unlocked Badges</span>
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {(selectedUser.badges || ["Hacker"]).map((badge, index) => (
                      <div
                        key={index}
                        className="group/badge relative px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-200 uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-1 bg-gradient-to-tr from-brand-purple/10 to-transparent"
                      >
                        <Sparkles className="w-3 h-3 text-brand-cyan shrink-0 animate-pulse" />
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Hacker Identities</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://github.com/${selectedUser.github || "hackops"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white hover:bg-white/5 hover:border-brand-blue/30 transition-all flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                    <a
                      href={`https://linkedin.com/in/${selectedUser.linkedin || "hackops"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white hover:bg-white/5 hover:border-brand-purple/30 transition-all flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>

                {/* XP Live Sandbox Protocol simulator */}
                <div className="border border-brand-purple/30 bg-brand-purple/5 rounded-2xl p-4 mt-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-brand-cyan">
                    <ShieldCheck className="w-4 h-4 text-brand-purple" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider">Developer Sandbox Controller</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">Simulate live actions securely from the backend to instantly test Experience Points, level progression, badges, and celebrating particle confetti!</p>
                  
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => awardXpBackend(selectedUser.uid, "daily_login")}
                      className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-xs font-bold flex items-center justify-between px-3 cursor-pointer"
                    >
                      <span>Daily Check-in</span>
                      <span className="text-brand-cyan font-mono font-bold">+5 XP</span>
                    </button>
                    
                    <button
                      onClick={() => awardXpBackend(selectedUser.uid, "community_discussion")}
                      className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-xs font-bold flex items-center justify-between px-3 cursor-pointer"
                    >
                      <span>Help in Community</span>
                      <span className="text-brand-cyan font-mono font-bold">+20 XP</span>
                    </button>

                    <button
                      onClick={() => awardXpBackend(selectedUser.uid, "submission")}
                      className="w-full py-2 rounded-lg bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/20 text-slate-200 text-xs font-bold flex items-center justify-between px-3 cursor-pointer"
                    >
                      <span>Submit Code Project</span>
                      <span className="text-brand-cyan font-mono font-bold">+200 XP</span>
                    </button>

                    <button
                      onClick={() => awardXpBackend(selectedUser.uid, "winner_1")}
                      className="w-full py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-slate-200 text-xs font-extrabold flex items-center justify-between px-3 cursor-pointer"
                    >
                      <span>Claim Hackathon Champion</span>
                      <span className="text-amber-400 font-mono font-bold">+500 XP</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile completion modal dialog */}
      <AnimatePresence>
        {isCompletingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 md:p-8 bg-[#040118]/95 shadow-2xl relative"
            >
              <button
                onClick={() => setIsCompletingProfile(false)}
                className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-cyan flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-brand-purple animate-pulse" />
                </div>
                <h3 className="font-display font-black text-white text-xl">Hacker Identity Configuration</h3>
                <p className="text-xs text-slate-400 mt-1">Configure your social links to claim the +50 XP booster.</p>
              </div>

              <form onSubmit={handleCompleteProfileSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                  <input
                    type="text"
                    required
                    value={completeUsername}
                    onChange={(e) => setCompleteUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder="e.g. aadit_parti"
                    className="w-full glass-input py-2.5 px-3 rounded-xl text-sm text-slate-200 border border-white/10 bg-white/5 focus:border-brand-purple/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">College / Organization</label>
                  <input
                    type="text"
                    required
                    value={completeCollege}
                    onChange={(e) => setCompleteCollege(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full glass-input py-2.5 px-3 rounded-xl text-sm text-slate-200 border border-white/10 bg-white/5 focus:border-brand-purple/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">GitHub Username</label>
                  <input
                    type="text"
                    required
                    value={completeGithub}
                    onChange={(e) => setCompleteGithub(e.target.value)}
                    placeholder="e.g. github_handle"
                    className="w-full glass-input py-2.5 px-3 rounded-xl text-sm text-slate-200 border border-white/10 bg-white/5 focus:border-brand-purple/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">LinkedIn Handle</label>
                  <input
                    type="text"
                    required
                    value={completeLinkedin}
                    onChange={(e) => setCompleteLinkedin(e.target.value)}
                    placeholder="e.g. linkedin_profile_id"
                    className="w-full glass-input py-2.5 px-3 rounded-xl text-sm text-slate-200 border border-white/10 bg-white/5 focus:border-brand-purple/50 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-xs font-extrabold tracking-wider uppercase text-white shadow-lg cursor-pointer"
                >
                  Verify Profile & Claim +50 XP
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
