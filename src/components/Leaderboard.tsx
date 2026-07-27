import { useState, useEffect } from "react";
import { Award, Trophy, Sparkles, Flame, GraduationCap, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

interface FirestoreUser {
  uid: string;
  name: string;
  fullName?: string;
  username?: string;
  email: string;
  role?: string;
  college?: string;
  xp?: number;
  level?: number;
  wins?: number;
  participated?: number;
  hackathonsParticipated?: number;
  streak?: number;
  badges?: string[];
  profileImage?: string;
  lastActive?: string;
  bio?: string;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

        // Sort users dynamically according to criteria:
        // 1. Total XP (Highest first)
        // 2. Number of Hackathon Wins (Highest first)
        // 3. Number of Completed Hackathons (Highest first)
        // 4. Latest Activity (Tie-breaker)
        fetchedUsers.sort((a, b) => {
          const xpA = a.xp || 0;
          const xpB = b.xp || 0;
          if (xpB !== xpA) {
            return xpB - xpA;
          }

          const winsA = a.wins || 0;
          const winsB = b.wins || 0;
          if (winsB !== winsA) {
            return winsB - winsA;
          }

          const partA = a.participated || 0;
          const partB = b.participated || 0;
          if (partB !== partA) {
            return partB - partA;
          }

          const activeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const activeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          return activeB - activeA;
        });

        setUsers(fetchedUsers);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching users from Firestore for home leaderboard:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

  const top10Users = users.slice(0, 10);
  const currentUserRank = users.findIndex((u) => u.uid === currentUserId) + 1;
  const isCurrentUserInTop10 = currentUserRank > 0 && currentUserRank <= 10;
  const currentUserProfile = currentUserId ? users.find((u) => u.uid === currentUserId) : null;

  return (
    <section id="leaderboard" className="relative py-24 bg-[#030014] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[40%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-brand-blue/10 glow-blur pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span>Season Rankings</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight mb-4">
            Top 10
            <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent font-extrabold mt-1">
              Hackers
            </span>
          </h2>
          <p className="font-sans text-slate-300 max-w-lg mx-auto text-sm">
            Meet the top registered developers ranking across the global arena, competing with live experience points, streak counts, and badged achievements.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                window.history.pushState({}, "", "/leaderboard");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#09052a]/80 border border-brand-purple/40 hover:border-brand-purple/70 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 text-xs font-black text-white hover:scale-105 transition-all shadow-lg shadow-brand-purple/10 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Full Standings & Profiles</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Leaderboard Table Container */}
        <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl bg-[#070422]/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0c092a]/85 border-b border-white/5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">Hacker</th>
                  <th className="py-4 px-6">College / Organization</th>
                  <th className="py-4 px-6 text-center">Level</th>
                  <th className="py-4 px-6 text-right">Badge</th>
                  <th className="py-4 px-6 text-center hidden sm:table-cell">Streak</th>
                  <th className="py-4 px-6 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-purple border-t-transparent animate-spin"></div>
                        <p className="text-xs text-slate-400 font-mono">Synchronizing live standings...</p>
                      </div>
                    </td>
                  </tr>
                ) : top10Users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-500 font-mono text-xs">
                      <HelpCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      No registered hackers found in the system.
                    </td>
                  </tr>
                ) : (
                  <>
                    {top10Users.map((u, idx) => {
                      const rank = idx + 1;
                      const isTopThree = rank <= 3;
                      const isActiveUser = u.uid === currentUserId;
                      const badgesList = u.badges || ["Hacker"];
                      const primaryBadge = badgesList[0] || "Hacker";

                      return (
                        <tr
                          key={u.uid}
                          className={`hover:bg-white/[0.02] transition-colors duration-150 group ${
                            isActiveUser ? "bg-brand-purple/5" : ""
                          }`}
                        >
                          {/* Rank Column */}
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

                          {/* Profile & Name Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {u.profileImage ? (
                                <img
                                  src={u.profileImage}
                                  alt={u.name}
                                  referrerPolicy="no-referrer"
                                  className={`w-9 h-9 rounded-full object-cover border shrink-0 ${
                                    isActiveUser ? "border-brand-purple shadow shadow-brand-purple/30" : "border-white/10"
                                  }`}
                                />
                              ) : (
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white relative uppercase border shrink-0 ${
                                  isActiveUser ? "bg-brand-purple border-brand-purple" : "bg-slate-800 border-white/5"
                                }`}>
                                  {u.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <h4 className="font-bold text-white text-sm truncate flex items-center gap-1.5 group-hover:text-brand-cyan transition-colors">
                                  {u.name}
                                  {isActiveUser && (
                                    <span className="text-[8px] px-1 py-0.2 rounded bg-brand-purple/20 text-brand-cyan font-mono font-black border border-brand-purple/30">
                                      YOU
                                    </span>
                                  )}
                                </h4>
                                {u.username && (
                                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">@{u.username}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* College Column */}
                          <td className="py-4 px-6">
                            <span className="text-xs text-slate-300 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate max-w-[180px]">{u.college || "Academic Explorer"}</span>
                            </span>
                          </td>

                          {/* Level Column */}
                          <td className="py-4 px-6 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-extrabold text-slate-200">
                              Lv {u.level || 1}
                            </span>
                          </td>

                          {/* Badge Column */}
                          <td className="py-4 px-6 text-right">
                            <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase bg-gradient-to-r tracking-wider inline-block ${getBadgeColor(primaryBadge)}`}>
                              {primaryBadge}
                            </span>
                          </td>

                          {/* Streak Column */}
                          <td className="py-4 px-6 text-center hidden sm:table-cell">
                            <div className="flex items-center justify-center gap-1 text-xs font-mono font-black text-orange-400">
                              <Flame className="w-3.5 h-3.5 fill-orange-400/20 shrink-0" />
                              <span>{u.streak || 1}</span>
                            </div>
                          </td>

                          {/* XP Column */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1 font-mono">
                              <span className="text-sm font-black text-brand-cyan">
                                {(u.xp || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">XP</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Show logged in user if they are outside the Top 10 */}
                    {auth.currentUser && currentUserProfile && !isCurrentUserInTop10 && (
                      <>
                        {/* Visual Row Divider */}
                        <tr className="bg-slate-950/40">
                          <td colSpan={7} className="py-2 text-center text-slate-600 font-mono text-[10px] tracking-widest bg-black/40">
                            •••••• OUTSIDE TOP 10 ••••••
                          </td>
                        </tr>
                        {/* User Standings Row */}
                        <tr className="bg-brand-purple/10 border-t border-brand-purple/20 hover:bg-brand-purple/15 transition-colors">
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <div className="font-mono font-black text-brand-cyan text-sm">
                                #{currentUserRank}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {currentUserProfile.profileImage ? (
                                <img
                                  src={currentUserProfile.profileImage}
                                  alt={currentUserProfile.name}
                                  referrerPolicy="no-referrer"
                                  className="w-9 h-9 rounded-full object-cover border border-brand-purple shadow shadow-brand-purple/30 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white relative uppercase border border-brand-purple bg-brand-purple shrink-0">
                                  {currentUserProfile.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <h4 className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                                  {currentUserProfile.name}
                                  <span className="text-[8px] px-1 py-0.2 rounded bg-brand-purple/30 text-brand-cyan font-mono font-black border border-brand-purple/40">
                                    YOU
                                  </span>
                                </h4>
                                {currentUserProfile.username && (
                                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">@{currentUserProfile.username}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs text-slate-300 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate max-w-[180px]">{currentUserProfile.college || "Academic Explorer"}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-brand-purple/20 border border-brand-purple/30 text-[10px] font-extrabold text-white">
                              Lv {currentUserProfile.level || 1}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase bg-gradient-to-r tracking-wider inline-block ${getBadgeColor(currentUserProfile.badges?.[0] || "Hacker")}`}>
                              {currentUserProfile.badges?.[0] || "Hacker"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1 text-xs font-mono font-black text-orange-400">
                              <Flame className="w-3.5 h-3.5 fill-orange-400/20 shrink-0" />
                              <span>{currentUserProfile.streak || 1}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1 font-mono">
                              <span className="text-sm font-black text-brand-cyan">
                                {(currentUserProfile.xp || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">XP</span>
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
