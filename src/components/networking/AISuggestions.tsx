import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, ShieldAlert, Cpu, Heart, CheckCircle2, Send } from "lucide-react";
import { FirestoreUser } from "../../types/networking";
import { motion, AnimatePresence } from "motion/react";

interface AISuggestionsProps {
  currentUser: FirestoreUser | null;
  allUsers: FirestoreUser[];
  onConnect: (targetUserId: string) => void;
  onInviteToTeam: (targetUserId: string, message: string) => void;
  onOpenLogin: () => void;
}

interface AIRecommendation {
  uid: string;
  compatibilityScore: number;
  reason: string;
}

export default function AISuggestions({
  currentUser,
  allUsers,
  onConnect,
  onInviteToTeam,
  onOpenLogin
}: AISuggestionsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAISuggestions = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMsg(null);

    // Filter candidates (all users excluding current user, having some profile details)
    const candidateProfiles = allUsers
      .filter((u) => u.uid !== currentUser.uid && u.name)
      .slice(0, 10); // Limit to top 10 candidates to keep prompt size optimized

    if (candidateProfiles.length === 0) {
      setRecommendations([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/networking/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: currentUser,
          candidateProfiles
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve AI suggestions from matchmaker.");
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      console.error("AI matchmaking recommendation error:", err);
      setErrorMsg("Unable to compile AI matching vectors at this time. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAISuggestions();
    }
  }, [currentUser, allUsers]);

  if (!currentUser) {
    return (
      <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center space-y-4">
        <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
        <h4 className="text-lg font-bold text-white">AI Suggestion Matrix Offline</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please complete your developer profile and sign in to trigger high-dimensional matchmaking vectors.
        </p>
        <button
          onClick={onOpenLogin}
          className="px-5 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/85 transition-all cursor-pointer"
        >
          Authenticate & Create Profile
        </button>
      </div>
    );
  }

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 80) return "text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10";
    return "text-brand-purple border-brand-purple/30 bg-brand-purple/10";
  };

  return (
    <div className="space-y-6 text-left">
      {/* Premium Header Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c082c] via-[#040118] to-[#0a192f] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">AI Synaptic Matchmaking</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Our specialized Gemini AI matchmaker inspects preferred roles, tech stack synergies, shared interests, and experience weights to synthesize top peer recommendations.
          </p>
        </div>
        <button
          onClick={fetchAISuggestions}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/40 border border-brand-purple/40 text-brand-cyan text-xs font-semibold hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          Re-calculate Matches
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
            <Cpu className="absolute inset-3.5 w-9 h-9 text-brand-cyan animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-mono text-brand-cyan animate-pulse">Running synergy vector comparison...</p>
            <p className="text-[11px] text-slate-500">Querying Gemini AI modeling layer for optimal hackathon teams.</p>
          </div>
        </div>
      ) : errorMsg ? (
        <div className="p-10 text-center glass-panel border border-red-500/10 rounded-2xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm font-mono text-red-400">{errorMsg}</p>
          <button
            onClick={fetchAISuggestions}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white hover:bg-white/10"
          >
            Retry Connection
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 text-slate-500">
          <BrainCircuit className="w-10 h-10 mx-auto text-slate-700 mb-2" />
          <p className="text-sm font-mono">No other candidate hacker profiles found to calculate matching recommendations.</p>
          <p className="text-xs text-slate-600 mt-1">Please invite other users to join or seed mock competitors to verify alignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const matchedUser = allUsers.find((u) => u.uid === rec.uid);
            if (!matchedUser) return null;

            return (
              <motion.div
                key={rec.uid}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl glass-panel p-5 border border-white/10 hover:border-brand-purple/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Matching score badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={matchedUser.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                        alt={matchedUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{matchedUser.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{matchedUser.college}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 ${getMatchColor(rec.compatibilityScore)}`}>
                      <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                      <span>{rec.compatibilityScore}% Match</span>
                    </div>
                  </div>

                  {/* Recommendation Brief */}
                  <div className="bg-[#0b0824] border border-brand-purple/15 rounded-xl p-4 mb-4 text-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-purple/5 rounded-full blur-xl"></div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block mb-1">
                      Gemini Synaptic Analysis
                    </span>
                    <p className="text-slate-200 leading-relaxed font-sans">{rec.reason}</p>
                  </div>

                  {/* Skills tags summary */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(matchedUser.skills || []).slice(0, 4).map((s) => (
                      <span key={s} className="text-[9px] font-mono bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                    <span className="text-[9px] font-mono text-brand-cyan bg-brand-cyan/5 px-2 py-0.5 rounded border border-brand-cyan/10">
                      {matchedUser.preferredRole}
                    </span>
                  </div>
                </div>

                {/* Instant Actions Drawer */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4 mt-2">
                  <button
                    onClick={() => onConnect(rec.uid)}
                    className="py-2 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/35 border border-brand-purple/40 text-brand-cyan text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => {
                      const msg = `Hey ${matchedUser.name}! Gemini recommended we pair up based on matching role synergies. Let's form a hackathon team!`;
                      onInviteToTeam(rec.uid, msg);
                    }}
                    className="py-2 rounded-xl bg-brand-cyan text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Send className="w-3 h-3" />
                    Team Invite
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
