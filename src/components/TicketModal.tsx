import React, { useState, useEffect } from "react";
import { X, Sparkles, Github, Ticket, Check, Copy, Download, Award, Shield, LogIn, AlertCircle, Users, UserPlus, Trash2, Loader2 } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  initialTrack?: string;
}

export default function TicketModal({ isOpen, onClose, onOpenLogin, initialTrack = "GenAI" }: TicketModalProps) {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [github, setGithub] = useState("");
  const [track, setTrack] = useState(initialTrack);
  const [glowColor, setGlowColor] = useState<"purple" | "blue" | "cyan">("purple");
  const [ticketNumber, setTicketNumber] = useState("");
  const [isClaimed, setIsClaimed] = useState(false);
  const [isCheckingReg, setIsCheckingReg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<any>(null);

  // Team states
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teammateEmail, setTeammateEmail] = useState("");
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const fetchTeamAndStatus = async (currentUserUid: string) => {
    setLoadingTeam(true);
    setTeamError(null);
    try {
      // 1. Fetch team members from Firestore
      const teamQuery = query(
        collection(db, "team_members"),
        where("registrationId", "==", currentUserUid)
      );
      const teamSnap = await getDocs(teamQuery);
      const members: any[] = [];
      teamSnap.forEach((docSnap) => {
        members.push({ id: docSnap.id, ...docSnap.data() });
      });

      // 2. Fetch all registrations to check if any matches the member emails
      const regsSnap = await getDocs(collection(db, "registrations"));
      const registeredEmails = new Set<string>();
      regsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.email) {
          registeredEmails.add(data.email.trim().toLowerCase());
        }
      });

      // 3. Map status to Joined or Pending
      const mappedMembers = members.map((m) => {
        const emailLower = m.email.trim().toLowerCase();
        const hasJoined = registeredEmails.has(emailLower);
        return {
          ...m,
          status: hasJoined ? "Joined" : "Pending",
        };
      });

      setTeamMembers(mappedMembers);
    } catch (err: any) {
      console.error("Error fetching team details:", err);
      setTeamError("Failed to fetch team member registries.");
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!teammateEmail || !teammateEmail.trim()) return;

    const emailLower = teammateEmail.trim().toLowerCase();
    
    // Simple basic validation
    if (emailLower === user.email?.toLowerCase()) {
      setTeamError("You cannot add yourself as a teammate.");
      return;
    }

    // Check if teammate is already in team list
    if (teamMembers.some((m) => m.email.trim().toLowerCase() === emailLower)) {
      setTeamError("This email has already been added to your team.");
      return;
    }

    setIsAddingTeamMember(true);
    setTeamError(null);
    setTeamSuccess(null);

    try {
      const docId = `${user.uid}_${emailLower.replace(/[^a-zA-Z0-9]/g, "_")}`;
      await setDoc(doc(db, "team_members", docId), {
        registrationId: user.uid,
        email: emailLower,
        createdAt: serverTimestamp(),
      });

      setTeammateEmail("");
      setTeamSuccess(`Successfully added ${emailLower} to your team roster!`);
      setTimeout(() => setTeamSuccess(null), 4000);
      await fetchTeamAndStatus(user.uid);
    } catch (err: any) {
      console.error("Error adding team member:", err);
      setTeamError("Failed to save team member registry. Please try again.");
    } finally {
      setIsAddingTeamMember(false);
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "team_members", id));
      setTeamSuccess("Removed team member successfully.");
      setTimeout(() => setTeamSuccess(null), 3000);
      await fetchTeamAndStatus(user.uid);
    } catch (err: any) {
      console.error("Error removing team member:", err);
      setTeamError("Could not remove team member.");
    }
  };

  // Monitor auth state to fetch saved registration dynamically
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsCheckingReg(true);
        setErrorMsg(null);
        try {
          // Fetch existing registration for this user if it exists
          const regDocRef = doc(db, "registrations", currentUser.uid);
          const regDoc = await getDoc(regDocRef);

          if (regDoc.exists()) {
            const data = regDoc.data();
            setName(data.name || "");
            setGithub(data.github || "");
            setTrack(data.track || "GenAI");
            setGlowColor(data.glowColor || "purple");
            setTicketNumber(data.ticketNumber || "");
            setCreatedAt(data.createdAt || null);
            setIsClaimed(true);
          } else {
            // Not registered yet - prefill name from display name
            setName(currentUser.displayName || "");
            setGithub("");
            setTrack(initialTrack);
            setGlowColor("purple");
            setTicketNumber("HV-2026-0" + Math.floor(1000 + Math.random() * 9000));
            setCreatedAt(null);
            setIsClaimed(false);
          }
        } catch (err) {
          console.error("Error loading registration:", err);
          setErrorMsg("Could not check registration history from Firestore.");
        } finally {
          setIsCheckingReg(false);
        }
      } else {
        // Logged out
        setName("");
        setGithub("");
        setIsClaimed(false);
        setTicketNumber("");
        setCreatedAt(null);
      }
    });

    return () => unsubscribe();
  }, [isOpen, initialTrack]);

  if (!isOpen) return null;

  const glowStyles = {
    purple: {
      shadow: "shadow-[0_0_50px_rgba(124,58,237,0.4)]",
      border: "border-brand-purple/40",
      accent: "text-brand-purple",
      bgGradient: "from-brand-purple/20 via-slate-900 to-black/60",
      pill: "bg-brand-purple/10 border-brand-purple/30 text-brand-cyan",
      tagGlow: "bg-brand-purple"
    },
    blue: {
      shadow: "shadow-[0_0_50px_rgba(59,130,246,0.4)]",
      border: "border-brand-blue/40",
      accent: "text-brand-blue",
      bgGradient: "from-brand-blue/20 via-slate-900 to-black/60",
      pill: "bg-brand-blue/10 border-brand-blue/30 text-brand-cyan",
      tagGlow: "bg-brand-blue"
    },
    cyan: {
      shadow: "shadow-[0_0_50px_rgba(6,182,212,0.4)]",
      border: "border-brand-cyan/40",
      accent: "text-brand-cyan",
      bgGradient: "from-brand-cyan/20 via-slate-900 to-black/60",
      pill: "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan",
      tagGlow: "bg-brand-cyan"
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !github.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const finalTicketNum = ticketNumber || "HV-2026-0" + Math.floor(1000 + Math.random() * 9000);
    const regPath = `registrations/${user.uid}`;

    try {
      const docData: any = {
        userId: user.uid,
        email: user.email?.toLowerCase() || "",
        name: name.trim(),
        github: github.trim(),
        track: track,
        glowColor: glowColor,
        ticketNumber: finalTicketNum,
        createdAt: createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save/Overwrite registration details in Firestore under the user's UID
      await setDoc(doc(db, "registrations", user.uid), docData);

      if (!createdAt) {
        setCreatedAt(new Date());
      }

      setTicketNumber(finalTicketNum);
      setIsClaimed(true);
    } catch (fsErr: any) {
      console.error("Error saving registration pass:", fsErr);
      setErrorMsg("Firestore save rejected. Check security rules or connection.");
      handleFirestoreError(fsErr, OperationType.WRITE, regPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToken = () => {
    setCopied(true);
    navigator.clipboard.writeText(`TOKEN-${ticketNumber}-${track.toUpperCase()}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row bg-[#040118]/95 animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Customizer Form or Auth prompt */}
        <div className="flex-1 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/5 text-left flex flex-col justify-center min-h-[400px]">
          {!user ? (
            /* Auth Required screen */
            <div className="flex flex-col items-center justify-center text-center p-4 h-full animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-brand-purple/15 border border-brand-purple/25 flex items-center justify-center text-brand-cyan mb-5 animate-pulse">
                <Shield className="w-8 h-8 text-brand-cyan" />
              </div>
              <h3 className="text-xl font-display font-extrabold text-white mb-2">Developer Account Required</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-sm leading-relaxed">
                You must sign in or create a developer profile first to claim your on-chain registration pass and lock down your evaluation sandbox.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-bold text-xs shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Sign Up
              </button>
            </div>
          ) : isCheckingReg ? (
            /* Checking database screen */
            <div className="flex flex-col items-center justify-center text-center p-4 h-full">
              <div className="w-10 h-10 border-3 border-brand-purple border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-xs text-slate-400 font-mono">Verifying registration database...</span>
            </div>
          ) : (
            /* Customization flow */
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-5 h-5 text-brand-cyan animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-widest text-brand-cyan uppercase">Digital Pass Minting</span>
              </div>
              <h3 className="text-2xl font-display font-extrabold text-white mb-2">Claim Your Hack Pass</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Customize your digital credentials. Your registration is backed up to your developer profile in real-time.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 font-sans leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {!isClaimed ? (
                <form onSubmit={handleClaim} className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Builder Name:</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={25}
                      className="glass-input p-3 rounded-xl text-slate-200 text-sm font-sans"
                      placeholder="Satoshi Nakamoto"
                      required
                    />
                  </div>

                  {/* Github Handle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">GitHub Username:</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="glass-input p-3 pl-10 rounded-xl text-slate-200 text-sm font-mono w-full"
                        placeholder="satoshi"
                        required
                      />
                    </div>
                  </div>

                  {/* Track Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Track:</label>
                    <select
                      value={track}
                      onChange={(e) => setTrack(e.target.value)}
                      className="glass-input p-3 rounded-xl text-slate-200 text-xs font-semibold bg-[#0a0628] w-full"
                    >
                      <option value="GenAI">Generative AI Core</option>
                      <option value="Agents">Autonomous Agents</option>
                      <option value="Web3">Web3 & Blockchain</option>
                      <option value="HealthTech">Health & Biotech</option>
                    </select>
                  </div>

                  {/* Theme Glow Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Custom Neon Glow Energy:</label>
                    <div className="flex items-center gap-3 mt-1">
                      {(["purple", "blue", "cyan"] as const).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setGlowColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                            glowColor === color ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                          style={{
                            backgroundColor: color === "purple" ? "#7C3AED" : color === "blue" ? "#3B82F6" : "#06B6D4"
                          }}
                        >
                          {glowColor === color && <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3.5 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-bold text-sm shadow-lg hover:scale-[1.01] transition-all mt-4 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Claim & Sync Registration Pass"
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col gap-5 py-4 text-left animate-fade-in">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                    <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Pass Successfully Minted!</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Your developer registration is validated and saved to Firestore under <span className="font-mono text-brand-cyan font-bold">{user.email}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Copy Access Token */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-300">Your Entrance Token:</span>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#030014] border border-white/5 font-mono text-xs text-brand-cyan">
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        TOKEN-{ticketNumber}-{track.toUpperCase()}
                      </span>
                      <button
                        onClick={copyToken}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => alert("Downloading digital passport certificate artwork...")}
                      className="flex-1 py-3 bg-white text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Pass File
                    </button>
                    <button
                      onClick={() => setIsClaimed(false)}
                      className="py-3 px-4 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* Cyberpunk Team Management Suite */}
                  <div className="border-t border-white/5 pt-5 mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-cyan animate-pulse" />
                      <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                        Form or Manage Your Team
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Build your hacker synergy. Input your teammate's email to associate them with this registration. Teammates who claimed their tickets show as <span className="text-brand-cyan font-bold">Joined</span>, others remain <span className="text-amber-400 font-bold">Pending</span>.
                    </p>

                    {/* Team error and success feedback */}
                    {teamError && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-semibold">
                        {teamError}
                      </div>
                    )}
                    {teamSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold">
                        {teamSuccess}
                      </div>
                    )}

                    {/* Interactive Add New Members Form */}
                    <form onSubmit={handleAddTeamMember} className="flex gap-2">
                      <input
                        type="email"
                        value={teammateEmail}
                        onChange={(e) => setTeammateEmail(e.target.value)}
                        placeholder="teammate@hackops.io"
                        className="flex-1 glass-input p-2.5 rounded-xl text-xs bg-[#030014]/60 text-slate-200 border border-white/10 focus:border-brand-purple/50 focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isAddingTeamMember}
                        className="px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-lg shadow-brand-purple/20"
                      >
                        {isAddingTeamMember ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            + Add Member
                          </>
                        )}
                      </button>
                    </form>

                    {/* Dynamic Team List */}
                    <div className="bg-[#030014]/60 p-3.5 rounded-2xl border border-white/5 space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin">
                      <div className="flex items-center justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wider pb-1 border-b border-white/5">
                        <span>Teammates</span>
                        <span>Roster Status</span>
                      </div>

                      {loadingTeam ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-purple" />
                          <span className="font-mono">Loading teammates...</span>
                        </div>
                      ) : teamMembers.length === 0 ? (
                        <div className="text-center py-5 text-xs text-slate-500 font-mono">
                          No teammates added yet.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {teamMembers.map((m) => (
                            <div key={m.id} className="flex items-center justify-between bg-white/2 p-2 rounded-lg border border-white/5 text-xs font-mono">
                              <span className="text-slate-300 truncate max-w-[160px]" title={m.email}>{m.email}</span>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  m.status === "Joined" 
                                    ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20" 
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                                }`}>
                                  {m.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeamMember(m.id)}
                                  className="p-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/25 text-red-400 transition-all cursor-pointer"
                                  title="Remove teammate"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Visual Live Interactive Ticket */}
        <div className="w-full lg:w-[420px] p-6 md:p-8 flex items-center justify-center bg-[#070420]/60 relative overflow-hidden">
          {/* Neon energy wave elements behind ticket */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-brand-purple/20 glow-blur pointer-events-none"></div>

          {/* Ticket Body */}
          <div
            className={`w-full max-w-[320px] aspect-[1.8/3] rounded-3xl p-5 border relative overflow-hidden bg-gradient-to-br flex flex-col justify-between transition-all duration-500 hover:scale-[1.03] ${
              glowStyles[glowColor].shadow
            } ${glowStyles[glowColor].border} ${glowStyles[glowColor].bgGradient}`}
          >
            {/* Holographic scanning overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px] opacity-40 pointer-events-none"></div>

            {/* Glowing neon side track tags */}
            <div className="absolute top-0 right-0 bottom-0 w-[4px] bg-gradient-to-b from-brand-purple via-brand-blue to-brand-cyan"></div>

            {/* Top Row: Event name & Ticket Logo */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">ACCESS PASS</span>
                <div className="text-xs font-display font-black text-white mt-0.5">HACKOPS AI</div>
              </div>
              <div className="relative">
                <div className={`absolute -inset-1 rounded bg-gradient-to-r from-brand-purple to-brand-cyan opacity-80 blur-xs`}></div>
                <div className="relative bg-[#0d092c] p-1.5 rounded border border-white/10">
                  <Ticket className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
                </div>
              </div>
            </div>

            {/* Middle Row: Hacker Details */}
            <div className="text-left py-4 relative z-10 flex-1 flex flex-col justify-center">
              <span className="text-[8px] font-mono font-medium text-slate-500 uppercase tracking-widest">BUILDER PROFILE</span>
              <div className="text-lg font-display font-black text-white mt-1 truncate max-w-full drop-shadow">
                {name || (user ? user.displayName || "Satoshi" : "Anonymous")}
              </div>
              
              <div className="flex items-center gap-1.5 mt-2 text-brand-cyan font-mono text-[10px]">
                <Github className="w-3 h-3 text-slate-400" />
                <span>github.com/{github || "satoshi"}</span>
              </div>

              {/* Custom Track Pill */}
              <div className="mt-4 flex items-center gap-1.5">
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${glowStyles[glowColor].pill}`}>
                  Track: {track === "GenAI" ? "Gen AI" : track === "Agents" ? "Agents" : track === "Web3" ? "Web3" : "Health"}
                </span>
              </div>
            </div>

            {/* Bottom Row: Ticket Serial & QR Mock */}
            <div className="border-t border-white/10 pt-4 relative z-10 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">SERIAL ID</span>
                <div className="text-xs font-mono font-bold text-white mt-0.5">{ticketNumber || "HV-2026-PENDING"}</div>
              </div>

              {/* Abstract barcode representation */}
              <div className="flex gap-[2px] items-stretch h-6 bg-white/5 p-1 rounded">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-300"
                    style={{ width: i % 3 === 0 ? "3px" : "1px" }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Tiny aesthetic particle glows */}
            <div className={`absolute top-1/4 right-8 w-1.5 h-1.5 rounded-full ${glowStyles[glowColor].tagGlow} animate-ping`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
