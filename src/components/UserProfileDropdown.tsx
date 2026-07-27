import React, { useState, useEffect, useRef } from "react";
import { 
  User, Users, Rocket, Bot, Trophy, Bell, Settings, Moon, Sun, LogOut, 
  ChevronDown, Check, Sparkles, Shield, Mail, Calendar, Key, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../lib/firebase";

interface UserProfileDropdownProps {
  loggedInUser: string;
  onSignOut: () => void;
  isAdmin: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export default function UserProfileDropdown({ loggedInUser, onSignOut, isAdmin }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default dark
  const [activeTab, setActiveTab] = useState<"menu" | "notifications" | "profile" | "settings">("menu");
  const [rippleEffect, setRippleEffect] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = auth.currentUser;
  const userEmail = currentUser?.email || "";
  const joinedDate = currentUser?.metadata.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : "July 2026";

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Project Evaluated",
      body: "Your project score was calculated by our automated AI model. Score: 94/100!",
      time: "20 mins ago",
      read: false
    },
    {
      id: "2",
      title: "Team Invite",
      body: "Nexus Devs has invited you to join their squad. Coordinate in Matchmaking panel.",
      time: "1 hour ago",
      read: false
    },
    {
      id: "3",
      title: "Credential Ready",
      body: "You are qualified for the Global Cyber Hacker certificate. Go claim your badge!",
      time: "2 hours ago",
      read: true
    }
  ]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAvatarClick = () => {
    setRippleEffect(true);
    setTimeout(() => setRippleEffect(false), 600);
    setIsOpen(!isOpen);
    setActiveTab("menu"); // Reset to menu when opening
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Dispatches standard CustomEvent or changes document class
    if (isDarkMode) {
      document.documentElement.classList.add("light-mode-simulated");
    } else {
      document.documentElement.classList.remove("light-mode-simulated");
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setHasUnread(false);
  };

  const handleRouteNavigate = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  const triggerAIMentor = () => {
    window.dispatchEvent(new CustomEvent("open-ai-mentor"));
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "D";
    return name.charAt(0).toUpperCase();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  useEffect(() => {
    setHasUnread(unreadCount > 0);
  }, [unreadCount]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Target User Info & Avatar Button Container */}
      <button
        onClick={handleAvatarClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-3 group focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-full p-1 transition-all cursor-pointer select-none"
      >
        <div className="relative">
          {/* Animated gradient ring wrapper */}
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-cyan opacity-80 blur-[2px] group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
          
          {/* Real or Generated Avatar */}
          <div className="relative w-10 h-10 rounded-full bg-[#0d092c] border border-white/25 overflow-hidden flex items-center justify-center font-bold text-white transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={loggedInUser} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-sm font-sans tracking-tight font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-100">
                {getInitials(loggedInUser)}
              </span>
            )}

            {/* Ripple effect overlay */}
            {rippleEffect && (
              <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
            )}
          </div>

          {/* Active online status green indicator */}
          <span 
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#030014] shadow-[0_0_10px_#10b981]" 
            title="Online and connected" 
          />

          {/* Glowing unread notification badge */}
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 border border-[#030014] shadow-[0_0_10px_#f43f5e] animate-pulse" />
          )}
        </div>

        {/* User Details next to Avatar - Desktop only */}
        <div className="hidden md:flex flex-col text-left select-none">
          <span className="text-xs font-black text-slate-100 tracking-tight leading-tight group-hover:text-white transition-colors">
            {loggedInUser}
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5 uppercase flex items-center gap-1 leading-none">
            {isAdmin ? (
              <>
                <Shield className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                Organizer
              </>
            ) : (
              "Participant"
            )}
          </span>
        </div>

        <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
      </button>

      {/* Modern SaaS Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 md:w-76 rounded-2xl border border-white/10 bg-[#070420]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6),_0_0_30px_rgba(124,58,237,0.15)] z-50 overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan" />

            {/* Dynamic Tabs view: Menu, Notifications, Profile, Settings */}
            <div className="p-4">
              {activeTab === "menu" && (
                <div className="space-y-1.5">
                  {/* Compact Header */}
                  <div className="px-2 py-1.5 mb-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Account terminal</span>
                    <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase font-extrabold">Active</span>
                  </div>

                  {/* 👤 My Profile */}
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                    <User className="w-4 h-4 text-brand-purple group-hover:scale-110 transition-transform" />
                    <span className="flex-1">My Profile</span>
                    <span className="text-[10px] text-slate-500 font-mono">Profile</span>
                  </button>

                  {/* 👥 My Team */}
                  <button
                    onClick={() => handleRouteNavigate("/matchmaking")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Users className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform" />
                    <span className="flex-1">My Team</span>
                    <span className="text-[10px] text-slate-500 font-mono">Matchmaking</span>
                  </button>

                  {/* 🚀 My Projects */}
                  <button
                    onClick={() => handleRouteNavigate("/evaluation")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Rocket className="w-4 h-4 text-brand-cyan group-hover:scale-110 transition-transform" />
                    <span className="flex-1">My Projects</span>
                    <span className="text-[10px] text-slate-500 font-mono">Submit</span>
                  </button>

                  {/* 🤖 AI Mentor */}
                  <button
                    onClick={triggerAIMentor}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Bot className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">AI Mentor</span>
                    <span className="text-[9px] font-mono px-1 bg-indigo-500/20 text-indigo-300 rounded animate-pulse">24/7</span>
                  </button>

                  {/* 🏆 Leaderboard */}
                  <button
                    onClick={() => handleRouteNavigate("/leaderboard")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Trophy className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">Leaderboard</span>
                    <span className="text-[10px] text-slate-500 font-mono">Rankings</span>
                  </button>

                  {/* 🔔 Notifications */}
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Bell className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span className="flex-1">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* ⚙ Settings */}
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform" />
                    <span className="flex-1">Settings</span>
                    <span className="text-[10px] text-slate-500 font-mono">Manage</span>
                  </button>

                  {/* 🌙 Dark Mode (Toggle) */}
                  <div className="pt-2 border-t border-white/5">
                    <button
                      onClick={handleToggleDarkMode}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer relative overflow-hidden"
                    >
                      {isDarkMode ? (
                        <>
                          <Moon className="w-4 h-4 text-violet-400" />
                          <span className="flex-1">Dark Mode</span>
                          <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded font-extrabold uppercase">ON</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span className="flex-1">Light Mode</span>
                          <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-extrabold uppercase">ON</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 🚪 Logout */}
                  <div className="pt-2 border-t border-white/5 mt-1">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/15 group text-left text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                      <span>Logout Connection</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <button 
                      onClick={() => setActiveTab("menu")}
                      className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase font-mono cursor-pointer"
                    >
                      ← Back
                    </button>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">System Logs</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] text-brand-cyan hover:underline font-bold cursor-pointer"
                      >
                        Read All
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 rounded-xl border transition-all ${
                          n.read 
                            ? "bg-white/[0.01] border-white/5 opacity-60" 
                            : "bg-indigo-500/5 border-indigo-500/15"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-[11px] font-bold ${n.read ? "text-slate-300" : "text-white"}`}>{n.title}</span>
                          <span className="text-[8px] font-mono text-slate-500 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">{n.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Profile */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <button 
                      onClick={() => setActiveTab("menu")}
                      className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase font-mono cursor-pointer"
                    >
                      ← Back
                    </button>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Identity Matrix</span>
                  </div>

                  <div className="space-y-3 font-mono text-[11px] text-left">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-cyan flex items-center justify-center font-black text-white shrink-0">
                        {getInitials(loggedInUser)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">{loggedInUser}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">Contributor Profile verified</p>
                      </div>
                    </div>

                    <div className="space-y-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 text-[10px]">EMAIL ADDRESS</span>
                        <span className="text-slate-300 text-right text-[10px] break-all max-w-[150px]">{userEmail}</span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/5">
                        <span className="text-slate-500 text-[10px]">ACCESS KEY</span>
                        <span className="text-emerald-400 text-[10px] font-bold">ACTIVE_NODE_PASS</span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-white/5">
                        <span className="text-slate-500 text-[10px]">SYNC DATE</span>
                        <span className="text-slate-300 text-[10px]">{joinedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Settings */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <button 
                      onClick={() => setActiveTab("menu")}
                      className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase font-mono cursor-pointer"
                    >
                      ← Back
                    </button>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Portal Config</span>
                  </div>

                  <div className="space-y-3 text-xs text-left">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                        <span className="text-[11px] text-slate-300 font-semibold">Enable AI Autopilot Co-pilot</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                        <span className="text-[11px] text-slate-300 font-semibold">Live Webhook Synced Logs</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                        <span className="text-[11px] text-slate-300 font-semibold">Decentralized Web3 Sandbox</span>
                      </label>
                    </div>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        window.dispatchEvent(new CustomEvent("open-ai-mentor"));
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider text-center transition-all cursor-pointer"
                    >
                      Save Configurations
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
