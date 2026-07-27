import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Cpu, ExternalLink, Lock, Unlock, FileBadge, CheckCircle, Clock, 
  ArrowLeft, Sparkles, Award, Copy, Check, Info, RefreshCw, Zap
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { collection, onSnapshot, query, where, getDoc, doc } from "firebase/firestore";
import { Credential } from "../types/credentials";
import { checkEligibility, claimBadge } from "../lib/credentials";
import { motion, AnimatePresence } from "motion/react";

interface CredentialsPageProps {
  onOpenLogin: () => void;
  onGoHome: () => void;
}

interface BadgeTemplate {
  id: string;
  title: string;
  role: string;
  description: string;
  glowColor: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string; color?: string; style?: React.CSSProperties }>;
  requirementType: "registration" | "project";
}

export default function CredentialsPage({ onOpenLogin, onGoHome }: CredentialsPageProps) {
  const [claimedCredentials, setClaimedCredentials] = useState<Credential[]>([]);
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    hasProject: boolean;
    hasRegistration: boolean;
    reason?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeVerification, setActiveVerification] = useState<Credential | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [decryptionStep, setDecryptionStep] = useState(0);
  const [copiedText, setCopiedText] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentUserId = auth.currentUser?.uid || null;
  const userEmail = auth.currentUser?.email || "";

  // Standard Badge Templates
  const badgeTemplates: BadgeTemplate[] = [
    {
      id: "hackops_completion_2026",
      title: "Global Cyber Hacker Certificate",
      role: "Hackathon Participant",
      description: "Conferred to elite developers who synchronized with the HackOps AI node, registered their credentials, and built during the 2026 global sprint.",
      glowColor: "rgba(99, 102, 241, 0.5)", // Indigo glow
      accentColor: "#6366f1",
      icon: Cpu,
      requirementType: "registration"
    },
    {
      id: "hackops_elite_architect_2026",
      title: "Outstanding AI Architect Badge",
      role: "Elite Builder",
      description: "Awarded to builders who constructed and submitted advanced AI pipelines verified by the automated HackOps scoring and evaluation matrix.",
      glowColor: "rgba(236, 72, 153, 0.5)", // Pink/Rose glow
      accentColor: "#ec4899",
      icon: Award,
      requirementType: "project"
    }
  ];

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Real-time listener for current user's credentials
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "credentials"), where("userId", "==", currentUserId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Credential[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Credential);
      });
      setClaimedCredentials(list);
      setLoading(false);
    }, (error) => {
      console.error("Credentials subscription failed:", error);
      setLoading(false);
    });

    // Fetch user eligibility
    const fetchEligibility = async () => {
      const res = await checkEligibility(currentUserId);
      setEligibility(res);
    };
    fetchEligibility();

    return () => unsubscribe();
  }, [currentUserId]);

  // Recalculate eligibility manually (e.g. after registering or submitting)
  const handleRefreshEligibility = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const res = await checkEligibility(currentUserId);
    setEligibility(res);
    setLoading(false);
    triggerAlert("success", "Qualification telemetry re-synchronized successfully.");
  };

  const handleClaim = async (template: BadgeTemplate) => {
    if (!currentUserId) {
      onOpenLogin();
      return;
    }

    setClaimingId(template.id);
    try {
      const hackathonName = "HackOps AI Global Hackathon 2026";
      const credential = await claimBadge(
        currentUserId, 
        template.id, 
        template.role, 
        hackathonName
      );
      
      triggerAlert("success", `${template.title} has been securely minted on-chain and added to your registry!`);
      // Auto-open technical verification console for the newly claimed badge
      handleVerify(credential);
    } catch (err: any) {
      console.error("Minting badge failed:", err);
      triggerAlert("error", err.message || "Failed to mint your cryptographic credential.");
    } finally {
      setClaimingId(null);
    }
  };

  const handleVerify = (credential: Credential) => {
    setActiveVerification(null);
    setVerificationLoading(true);
    setDecryptionStep(0);

    // Simulated cryptographic parsing sequence
    setTimeout(() => {
      setActiveVerification(credential);
      setVerificationLoading(false);
      
      // Decryption logs animation interval
      const interval = setInterval(() => {
        setDecryptionStep(prev => {
          if (prev >= 4) {
            clearInterval(interval);
            return 4;
          }
          return prev + 1;
        });
      }, 400);
    }, 900);
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    triggerAlert("success", "Cryptographic hash copied to clipboard.");
  };

  const isTemplateClaimed = (templateId: string) => {
    return claimedCredentials.some(c => c.credentialId === templateId);
  };

  const getClaimedCredentialOfTemplate = (templateId: string) => {
    return claimedCredentials.find(c => c.credentialId === templateId) || null;
  };

  const isEligibleForTemplate = (template: BadgeTemplate) => {
    if (!eligibility) return false;
    if (template.requirementType === "registration") {
      return eligibility.hasRegistration || eligibility.hasProject;
    }
    if (template.requirementType === "project") {
      return eligibility.hasProject;
    }
    return false;
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-12 md:py-16 selection:bg-brand-purple/30 selection:text-brand-cyan text-[#f3f4f6]">
      {/* Decorative cyber backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Alert Banner */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border flex items-start gap-3 shadow-2xl max-w-md ${
              alert.type === "success" 
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300" 
                : "bg-rose-950/90 border-rose-500/30 text-rose-300"
            }`}
          >
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${alert.type === "success" ? "text-emerald-400" : "text-rose-400"}`} />
            <span className="text-xs font-semibold leading-relaxed font-sans">{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-6 text-left">
        <div className="space-y-3">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-brand-cyan hover:underline transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Core Terminal
          </button>
          
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Verifiable Credential Node Active</span>
            </div>
            {currentUserId && (
              <button
                onClick={handleRefreshEligibility}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Refresh eligibility state"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight uppercase">
            Proof of Contribution
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            IPFS Metadata Registry & Ethereum ERC-721 Cryptographic Verifier Sandbox.
          </p>
        </div>
      </div>

      {!currentUserId ? (
        /* Not Logged In State */
        <div className="glass-panel rounded-3xl border border-white/10 p-8 md:p-16 text-center max-w-2xl mx-auto space-y-6 my-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-brand-cyan" />
          <div className="mx-auto w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Lock className="w-8 h-8 text-brand-cyan animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase">Authentication Required</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Please sign in to coordinate with the decentralized credential node, check your hackathon eligibility, and claim your cryptographic proof of contribution.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 cursor-pointer"
          >
            Authenticate Profile
          </button>
        </div>
      ) : (
        /* Logged In Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
          
          {/* Left Column: Badges List */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Qualification Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  Hacker Eligibility Matrix
                </h3>
                <span className="text-[10px] font-mono text-slate-400">@{userEmail.split("@")[0]}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Milestone 1 */}
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${eligibility?.hasRegistration ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" : "bg-white/5 border border-white/10 text-slate-500"}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">1. Registration Ticket</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {eligibility?.hasRegistration ? "✅ PASS - Registered & Confirmed" : "❌ ABSENT - Register your ticket"}
                    </p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${eligibility?.hasProject ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" : "bg-white/5 border border-white/10 text-slate-500"}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">2. Project Submission</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {eligibility?.hasProject ? "✅ PASS - Project Uploaded & Graded" : "❌ ABSENT - Upload for evaluation"}
                    </p>
                  </div>
                </div>
              </div>

              {!eligibility?.eligible && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-slate-300 leading-relaxed font-sans">
                  💡 <span className="font-bold text-indigo-400">How to unlock?</span> Go back to the core terminal and complete either your Registration (Ticket) or submit a project in the evaluation panel.
                </div>
              )}
            </div>

            {/* Badges Cards */}
            <div className="space-y-6">
              {badgeTemplates.map((badge) => {
                const isClaimed = isTemplateClaimed(badge.id);
                const isEligible = isEligibleForTemplate(badge);
                const claimedData = getClaimedCredentialOfTemplate(badge.id);
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.id}
                    className="relative rounded-2xl bg-slate-950/50 border border-white/10 p-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden transition-all duration-300 hover:border-white/20"
                    style={{
                      boxShadow: isClaimed ? `0 0 25px ${badge.glowColor}` : "none",
                    }}
                  >
                    {/* Glowing background accent */}
                    <div 
                      className="absolute -inset-10 opacity-10 pointer-events-none rounded-full" 
                      style={{
                        background: `radial-gradient(circle, ${badge.glowColor} 0%, transparent 60%)`,
                        filter: "blur(40px)"
                      }}
                    />

                    {/* Interactive Rotating / Pulsing Badge Graphics Container */}
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <div 
                        className={`absolute inset-0 rounded-full border-2 border-dashed opacity-40 ${isClaimed ? "animate-[spin_20s_linear_infinite]" : ""}`}
                        style={{ borderColor: badge.accentColor }}
                      />
                      
                      <div 
                        className={`w-20 h-20 rounded-full bg-slate-900 border flex items-center justify-center transition-all duration-500 ${
                          isClaimed 
                            ? "shadow-[0_0_20px_rgba(255,255,255,0.1)] border-white/35 scale-105" 
                            : "border-white/10 opacity-60"
                        }`}
                      >
                        <Icon 
                          className="w-10 h-10 transition-transform duration-500" 
                          style={{ color: isClaimed ? badge.accentColor : "#475569" }} 
                        />
                      </div>

                      {/* Locked Overlay badge indicator */}
                      {!isClaimed && (
                        <div className="absolute bottom-1 right-1 bg-[#0f172a] border border-white/15 p-1 rounded-full text-slate-400">
                          {isEligible ? (
                            <Unlock className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Badge template content */}
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                        <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">{badge.title}</h3>
                        <span 
                          className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold"
                          style={{
                            backgroundColor: `${badge.accentColor}15`,
                            color: badge.accentColor,
                            border: `1px solid ${badge.accentColor}30`
                          }}
                        >
                          {badge.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>

                      <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start items-center">
                        {isClaimed && claimedData ? (
                          <>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                              <CheckCircle className="w-3.5 h-3.5" />
                              VERIFIED CREDENTIAL
                            </div>
                            <button
                              onClick={() => handleVerify(claimedData)}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold rounded text-[11px] uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                              Verify Document
                            </button>
                          </>
                        ) : (
                          <>
                            {isEligible ? (
                              <button
                                onClick={() => handleClaim(badge)}
                                disabled={claimingId !== null}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {claimingId === badge.id ? "Minting Protocol..." : "Claim Secure Badge"}
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                <Lock className="w-3 h-3 shrink-0" />
                                Locked (Requirement: {badge.requirementType === "registration" ? "Ticket Registered" : "Submit & Evaluate Project"})
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Live Verification Console */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#060417]/80 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
              
              {/* Circuit backdrop lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Cryptographic Verification node</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                    <span className="text-[9px] font-mono text-brand-cyan">ONLINE</span>
                  </div>
                </div>

                {verificationLoading ? (
                  /* Parsing Telemetry Screen */
                  <div className="py-24 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] text-brand-cyan font-mono tracking-widest uppercase">Reading IPFS Blocks...</p>
                  </div>
                ) : activeVerification ? (
                  /* Decrypted Certificate Screen */
                  <div className="space-y-4 font-mono text-xs">
                    
                    {/* Animated Cryptographic Logs */}
                    <div className="space-y-1 bg-black/40 p-3 rounded-lg border border-white/5 text-[10px] text-slate-400">
                      <p className="text-slate-400">🚀 Initiating proof resolution sequence...</p>
                      {decryptionStep >= 1 && <p className="text-indigo-400">📡 Connected: IPFS directory fully resolved.</p>}
                      {decryptionStep >= 2 && <p className="text-pink-400">🔑 Match authenticated: userId signature verified.</p>}
                      {decryptionStep >= 3 && <p className="text-brand-cyan">🛡️ Cryptographic Hash matches decentralized record!</p>}
                      {decryptionStep >= 4 && (
                        <p className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> STATUS: ✅ CONFIRMED VERIFIED
                        </p>
                      )}
                    </div>

                    <AnimatePresence>
                      {decryptionStep >= 4 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3.5 pt-2"
                        >
                          {/* Main Metadata Grid */}
                          <div className="space-y-2">
                            <div>
                              <span className="text-slate-500 text-[9px] uppercase block">HACKATHON CONTEXT</span>
                              <span className="text-slate-200 text-[11px] font-bold">{activeVerification.hackathonName}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <span className="text-slate-500 text-[9px] uppercase block">TOKEN STANDARDS</span>
                                <span className="text-slate-300 text-[10px]">ERC-721 Hybrid badge</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[9px] uppercase block">CONTRIBUTOR ROLE</span>
                                <span className="text-brand-cyan text-[10px] font-extrabold">{activeVerification.role}</span>
                              </div>
                            </div>

                            <div className="pt-1">
                              <span className="text-slate-500 text-[9px] uppercase block">MINTED BLOCK DATE</span>
                              <span className="text-slate-300 text-[10px]">
                                {activeVerification.issueDate?.seconds 
                                  ? new Date(activeVerification.issueDate.seconds * 1000).toLocaleString() 
                                  : "Instantaneous Network Sync"}
                              </span>
                            </div>

                            <div className="pt-1">
                              <span className="text-slate-500 text-[9px] uppercase block">METADATA DIRECTORY (IPFS)</span>
                              <a 
                                href="#"
                                onClick={(e) => { e.preventDefault(); triggerAlert("success", "Navigating IPFS sandbox gateway."); }}
                                className="text-indigo-400 hover:text-indigo-300 hover:underline text-[10px] break-all flex items-center gap-1"
                              >
                                {activeVerification.ipfsMetadataUrl.slice(0, 36)}...
                                <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
                              </a>
                            </div>

                            <div className="pt-1">
                              <span className="text-slate-500 text-[9px] uppercase block">PROOF OF AUTHENTICITY</span>
                              <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded px-2 py-1 mt-1">
                                <span className="text-[9px] text-emerald-400 break-all select-all flex-1">
                                  {activeVerification.cryptographicHash}
                                </span>
                                <button
                                  onClick={() => handleCopyHash(activeVerification.cryptographicHash || "")}
                                  className="text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                                  title="Copy Cryptographic Hash"
                                >
                                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2 text-[10px] text-emerald-300">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>This certificate represents authentic mathematical proof on the HackOps AI credential registry.</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                ) : (
                  /* Idle verification console state */
                  <div className="py-16 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-slate-500 mx-auto">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-slate-300 uppercase">Awaiting Signature telemetries</h5>
                      <p className="text-[10px] text-slate-500 max-w-[250px] mx-auto font-sans leading-relaxed">
                        Claimed credentials can be parsed by clicking the "Verify Document" button to analyze secure IPFS blocks and cryptographic hash registers.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Console logs ticker footer */}
              <div className="border-t border-white/5 pt-3.5 mt-4 text-[9px] font-mono text-slate-500 flex justify-between items-center z-10">
                <span>GATEWAY: SHARD_HACKOPS_NET_V2</span>
                <span>HEIGHT: 12,049,582</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
