import React, { useState, useEffect } from "react";
import { 
  X, Search, Trash2, Edit2, Plus, Filter, Users, Cpu, Shield, 
  RefreshCw, Layers, Sparkles, Check, AlertCircle, Award, Ticket, LogIn
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegistrationRecord {
  id: string; // usually userId
  userId: string;
  name: string;
  github: string;
  track: string;
  glowColor: "purple" | "blue" | "cyan";
  ticketNumber: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function AdminPortal({ isOpen, onClose }: AdminPortalProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("aaditparti@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentMsg, setResetSentMsg] = useState<string | null>(null);

  // Registration states
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Invitation states
  const [invitationsList, setInvitationsList] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);

  // Form modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegistrationRecord | null>(null);
  const [formName, setFormName] = useState("");
  const [formGithub, setFormGithub] = useState("");
  const [formTrack, setFormTrack] = useState("GenAI");
  const [formGlowColor, setFormGlowColor] = useState<"purple" | "blue" | "cyan">("purple");
  const [formTicketNumber, setFormTicketNumber] = useState("");
  const [formUserId, setFormUserId] = useState(""); // For new creation, or readonly for editing
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Monitor auth status specifically for the admin email
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === "aaditparti@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch registrations and invitations if admin is authenticated
  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchRegistrations();
      fetchInvitations();
    }
  }, [isOpen, isAdmin]);

  const fetchInvitations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "invitations"));
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setInvitationsList(list);
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.trim()) return;

    setIsInviteSubmitting(true);
    setInviteSuccessMsg(null);
    setInviteErrorMsg(null);

    try {
      const emailLower = inviteEmail.trim().toLowerCase();
      // Generate unique token
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let generatedToken = "";
      for (let i = 0; i < 32; i++) {
        generatedToken += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // 1. Write invitation doc with token as doc ID
      await setDoc(doc(db, "invitations", generatedToken), {
        email: emailLower,
        token: generatedToken,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // 2. Write to notifications collection
      await setDoc(doc(db, "notifications", `notif_${generatedToken}`), {
        recipient: emailLower,
        title: "HackOps Team Invitation",
        message: `You have been invited to join the HackOps team. Accept invitation here: /accept-invite?token=${generatedToken}`,
        link: `/accept-invite?token=${generatedToken}`,
        status: "queued",
        createdAt: serverTimestamp(),
      });

      // 3. Write to mail collection
      await setDoc(doc(db, "mail", `mail_${generatedToken}`), {
        to: emailLower,
        message: {
          subject: "HackOps Team Invitation",
          html: `<p>You have been invited to join the HackOps team. Accept your invitation <a href="/accept-invite?token=${generatedToken}">here</a>.</p>`,
        },
        createdAt: serverTimestamp(),
      });

      setInviteSuccessMsg(`Successfully invited ${emailLower}! Outgoing notification and secure invitation token generated.`);
      setInviteEmail("");
      await fetchInvitations();
    } catch (err: any) {
      console.error("Error creating invitation:", err);
      setInviteErrorMsg(err.message || "Failed to create invitation.");
    } finally {
      setIsInviteSubmitting(false);
    }
  };

  const handleCopyInviteLink = (token: string) => {
    const link = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setSuccessMsg("Copied secure invitation link to clipboard!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const querySnapshot = await getDocs(collection(db, "registrations"));
      const records: RegistrationRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          userId: data.userId || docSnap.id,
          name: data.name || "",
          github: data.github || "",
          track: data.track || "GenAI",
          glowColor: data.glowColor || "purple",
          ticketNumber: data.ticketNumber || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort by creation time (latest first)
      records.sort((a, b) => {
        const t1 = a.createdAt?.seconds || 0;
        const t2 = b.createdAt?.seconds || 0;
        return t2 - t1;
      });
      setRegistrations(records);
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      setErrorMsg("Failed to read registrations from Firestore. Insufficient permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    const targetEmail = loginEmail.trim();
    const targetPassword = loginPassword || "Aadit@222";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
      const user = userCredential.user;
      setIsAdmin(true);

      // Ensure admin has role 'admin' and isAdmin: true in Firestore users collection
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            name: user.displayName || "Admin",
            email: user.email,
            role: "admin",
            isAdmin: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(userDocRef, {
            role: "admin",
            isAdmin: true,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
        console.log("Admin role and status successfully synchronized with Firestore.");
      } catch (dbErr) {
        console.error("Failed to verify/update admin role in Firestore:", dbErr);
      }
    } catch (err: any) {
      console.error("Admin sign in failed:", err);
      
      // Auto-register admin account if using specified email and password but not registered yet
      if (targetEmail === "aaditparti@gmail.com" && targetPassword === "Aadit@222") {
        try {
          console.log("Attempting automatic developer-end admin account registration...");
          const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
          const userCredential = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword);
          const user = userCredential.user;
          await updateProfile(user, { displayName: "Admin" });
          setIsAdmin(true);

          // Write admin role and isAdmin: true in Firestore users collection during auto-registration
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
              await setDoc(userDocRef, {
                uid: user.uid,
                name: "Admin",
                email: targetEmail,
                role: "admin",
                isAdmin: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } else {
              await setDoc(userDocRef, {
                role: "admin",
                isAdmin: true,
                updatedAt: serverTimestamp(),
              }, { merge: true });
            }
            console.log("Admin role and status successfully created during auto-registration.");
          } catch (dbErr) {
            console.error("Failed to write admin role to Firestore on auto-registration:", dbErr);
          }

          setIsLoggingIn(false);
          return;
        } catch (createErr: any) {
          console.error("Auto-registration of admin account failed:", createErr);
        }
      }
      
      let errorDetail = err.message || "Invalid credentials for Admin login.";
      if (err.code === "auth/invalid-credential" && targetEmail === "aaditparti@gmail.com") {
        errorDetail = "Incorrect secure console password. If the email aaditparti@gmail.com is already registered with a different password, please use the Password Reset helper below to set it to Aadit@222.";
      }
      setAuthError(errorDetail);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsSendingReset(true);
    setResetSentMsg(null);
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, "aaditparti@gmail.com");
      setResetSentMsg("Password reset email sent successfully to aaditparti@gmail.com! Please check your inbox (and spam folder) to reset your password, then try logging in again.");
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setAuthError(err.message || "Failed to send password reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSaveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formGithub.trim()) {
      setErrorMsg("Name and GitHub handles are required.");
      return;
    }

    setIsSubmittingForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // If editing, preserve the userId. If creating, generate a mock UUID or custom path ID.
    const targetUserId = editingRecord ? editingRecord.userId : (formUserId.trim() || "admin-gen-" + Math.floor(100000 + Math.random() * 900000));
    const regPath = `registrations/${targetUserId}`;

    const recordData = {
      userId: targetUserId,
      name: formName.trim(),
      github: formGithub.trim(),
      track: formTrack,
      glowColor: formGlowColor,
      ticketNumber: formTicketNumber.trim() || "HV-2026-0" + Math.floor(1000 + Math.random() * 9000),
      createdAt: editingRecord?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "registrations", targetUserId), recordData);
      setSuccessMsg(editingRecord ? "Registration updated successfully." : "New registration added successfully.");
      setIsFormOpen(false);
      fetchRegistrations();
    } catch (fsErr: any) {
      console.error("Error writing registration:", fsErr);
      setErrorMsg("Firestore write rejected. Check security rules or database connection.");
      handleFirestoreError(fsErr, OperationType.WRITE, regPath);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteRegistration = async (targetUserId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this registration pass?")) {
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    const regPath = `registrations/${targetUserId}`;

    try {
      await deleteDoc(doc(db, "registrations", targetUserId));
      setSuccessMsg("Registration deleted successfully.");
      fetchRegistrations();
    } catch (fsErr: any) {
      console.error("Error deleting registration:", fsErr);
      setErrorMsg("Firestore deletion rejected.");
      handleFirestoreError(fsErr, OperationType.DELETE, regPath);
    }
  };

  const openAddForm = () => {
    setEditingRecord(null);
    setFormName("");
    setFormGithub("");
    setFormTrack("GenAI");
    setFormGlowColor("purple");
    setFormTicketNumber("HV-2026-0" + Math.floor(1000 + Math.random() * 9000));
    setFormUserId("");
    setIsFormOpen(true);
  };

  const openEditForm = (record: RegistrationRecord) => {
    setEditingRecord(record);
    setFormName(record.name);
    setFormGithub(record.github);
    setFormTrack(record.track);
    setFormGlowColor(record.glowColor);
    setFormTicketNumber(record.ticketNumber);
    setFormUserId(record.userId);
    setIsFormOpen(true);
  };

  // Helper stats aggregates
  const totalCount = registrations.length;
  const trackStats = registrations.reduce((acc, curr) => {
    acc[curr.track] = (acc[curr.track] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      reg.github.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = selectedTrackFilter === "all" || reg.track === selectedTrackFilter;
    return matchesSearch && matchesTrack;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[90vh] rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl bg-[#040118]/95 flex flex-col animate-scale-in">
        
        {/* Header bar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#070423]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-purple/20 p-2.5 rounded-xl border border-brand-purple/30">
              <Shield className="w-5 h-5 text-brand-cyan animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
                HackOps Admin <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">Console</span>
              </h2>
              <p className="text-xs text-slate-400">Secure ecosystem control center & applicant validator.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {!isAdmin ? (
            /* Secure Admin login overlay */
            <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-white/10 bg-[#060320] text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/15 border border-brand-purple/25 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-brand-cyan" />
              </div>

              <h3 className="text-xl font-display font-extrabold text-white mb-2">Elevated Access Required</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Authorized HackOps administrator portal. Please authorize with credential set keys.
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-relaxed">{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSignIn} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Admin ID (Email):</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-slate-200 text-sm font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secure Console Code (Password):</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full glass-input p-3 mt-1 rounded-xl text-slate-200 text-sm"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold text-sm shadow-lg hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Authorize Console Access
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Developer Testing Fast-Fill Shortcut */}
              <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/5 text-left">
                <span className="text-[10px] font-mono font-bold text-brand-cyan uppercase tracking-wider block mb-1">Developer Credentials Helper:</span>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed mb-2">
                  You can log in directly using the requested admin email. Use the pre-filled field and enter password: <span className="font-mono text-white font-semibold">Aadit@222</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail("aaditparti@gmail.com");
                    setLoginPassword("Aadit@222");
                  }}
                  className="w-full py-1.5 bg-brand-purple/20 hover:bg-brand-purple/35 text-brand-cyan border border-brand-purple/30 rounded-lg text-[10px] font-mono tracking-wide cursor-pointer transition-all mb-2"
                >
                  Quick Fill Admin Password
                </button>

                {resetSentMsg ? (
                  <div className="mt-2 p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] rounded-lg leading-relaxed">
                    {resetSentMsg}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isSendingReset}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 rounded-lg text-[10px] font-mono tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    {isSendingReset ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Reset aaditparti@gmail.com Password"
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Main Admin Dashboard View */
            <div className="space-y-6">
              
              {/* Top Banner Alert Toast inline */}
              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-semibold">{successMsg}</span>
                  </div>
                  <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-semibold">{errorMsg}</span>
                  </div>
                  <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
                </div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Applicants</span>
                    <Users className="w-4 h-4 text-brand-cyan" />
                  </div>
                  <div className="text-3xl font-display font-black text-white">{totalCount}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">Live active counts</div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">GenAI Core</span>
                    <Cpu className="w-4 h-4 text-brand-purple" />
                  </div>
                  <div className="text-3xl font-display font-black text-white">{trackStats["GenAI"] || 0}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">Generative AI focus</div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Agents Focus</span>
                    <Layers className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="text-3xl font-display font-black text-white">{trackStats["Agents"] || 0}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">Autonomous systems</div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Web3 Track</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-display font-black text-white">{trackStats["Web3"] || 0}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">Blockchain & Identity</div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 col-span-2 lg:col-span-1 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">HealthTech</span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-display font-black text-white">{trackStats["HealthTech"] || 0}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">Biotech applicants</div>
                </div>
              </div>

              {/* Team Invitation Suite */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Sparkles className="w-4 h-4 text-brand-purple animate-pulse" />
                  <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                    Invite Team Member
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left part: Submission Form */}
                  <form onSubmit={handleSendInvitation} className="lg:col-span-1 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teammate Email Address:</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="developer@hackops.io"
                        className="w-full mt-1.5 glass-input p-2.5 rounded-xl text-xs text-slate-200 bg-[#060320]/60"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isInviteSubmitting}
                      className="w-full py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
                    >
                      {isInviteSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Send Invite Link"
                      )}
                    </button>

                    {inviteSuccessMsg && (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">{inviteSuccessMsg}</p>
                    )}
                    {inviteErrorMsg && (
                      <p className="text-[10px] text-red-400 font-semibold mt-1">{inviteErrorMsg}</p>
                    )}
                  </form>

                  {/* Right part: Outgoing Invitation logs */}
                  <div className="lg:col-span-2 bg-[#060320]/60 p-4 rounded-xl border border-white/5 flex flex-col h-[160px]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ecosystem Invitation Registry</h4>
                      <span className="text-[9px] font-mono text-slate-500 font-semibold">Real-time status tracking</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                      {invitationsList.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                          No team invitations logged.
                        </div>
                      ) : (
                        invitationsList.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between bg-white/2 p-2 rounded-lg border border-white/5 text-xs font-mono">
                            <div className="flex flex-col text-left">
                              <span className="text-slate-300 font-bold truncate max-w-[150px] sm:max-w-[200px]">{inv.email}</span>
                              <span className="text-[9px] text-slate-500">Token: {inv.id.substring(0, 8)}...</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                inv.status === "accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                              }`}>
                                {inv.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyInviteLink(inv.id)}
                                className="px-2.5 py-1 text-[10px] bg-brand-cyan/10 hover:bg-brand-cyan hover:text-slate-950 border border-brand-cyan/20 rounded transition-all font-semibold"
                              >
                                Copy Link
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls & Table Filter Suite */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  
                  {/* Search Field */}
                  <div className="relative flex-1 md:flex-none md:w-72">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, github, serial..."
                      className="w-full glass-input p-2.5 pl-9 rounded-xl text-xs text-slate-200"
                    />
                  </div>

                  {/* Track Filter */}
                  <div className="relative">
                    <select
                      value={selectedTrackFilter}
                      onChange={(e) => setSelectedTrackFilter(e.target.value)}
                      className="glass-input p-2.5 pr-8 rounded-xl text-xs text-slate-200 font-semibold bg-[#0d092c]"
                    >
                      <option value="all">All Tracks</option>
                      <option value="GenAI">Gen AI Core</option>
                      <option value="Agents">Autonomous Agents</option>
                      <option value="Web3">Web3 & Blockchain</option>
                      <option value="HealthTech">HealthTech</option>
                    </select>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchRegistrations}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                    title="Reload Database"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-cyan" : ""}`} />
                  </button>
                </div>

                {/* Create/Add New Button */}
                <button
                  onClick={openAddForm}
                  className="w-full md:w-auto px-5 py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4" />
                  Add New Pass
                </button>
              </div>

              {/* registrations List Table */}
              <div className="rounded-2xl border border-white/5 overflow-hidden bg-black/40">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead>
                      <tr className="bg-[#090623] border-b border-white/5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        <th className="p-4 font-mono">Serial / Ticket No</th>
                        <th className="p-4">Builder Info</th>
                        <th className="p-4">GitHub Profile</th>
                        <th className="p-4">Hack Track</th>
                        <th className="p-4">Aesthetic Energy</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center">
                            <div className="w-8 h-8 border-3 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <span className="text-xs text-slate-400 font-mono">Syncing secure developer registry...</span>
                          </td>
                        </tr>
                      ) : filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-xs text-slate-400 font-mono">
                            No matching developer registrations found in this registry.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-white/2 transition-colors">
                            {/* Serial */}
                            <td className="p-4 font-mono text-xs text-slate-300 font-bold">
                              {reg.ticketNumber}
                            </td>

                            {/* Name / User Info */}
                            <td className="p-4">
                              <div className="font-display font-bold text-sm text-white">{reg.name}</div>
                              <div className="text-[10px] font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                                {reg.userId}
                              </div>
                            </td>

                            {/* GitHub Handle */}
                            <td className="p-4">
                              <span className="font-mono text-xs text-brand-cyan hover:underline cursor-pointer">
                                @{reg.github}
                              </span>
                            </td>

                            {/* Track */}
                            <td className="p-4">
                              <span className={`inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                reg.track === "GenAI" ? "bg-brand-purple/10 border border-brand-purple/20 text-brand-cyan" :
                                reg.track === "Agents" ? "bg-brand-blue/10 border border-brand-blue/20 text-brand-cyan" :
                                reg.track === "Web3" ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                                "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              }`}>
                                {reg.track}
                              </span>
                            </td>

                            {/* Aesthetic energy theme */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2.5 h-2.5 rounded-full" 
                                  style={{
                                    backgroundColor: reg.glowColor === "purple" ? "#7C3AED" : reg.glowColor === "blue" ? "#3B82F6" : "#06B6D4"
                                  }}
                                />
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                                  {reg.glowColor} Glow
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditForm(reg)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                  title="Modify Fields"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRegistration(reg.id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                  title="Delete Pass"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Form Drawer (Add/Edit) */}
        {isFormOpen && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-[#030014]/95 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#060320] p-6 shadow-2xl relative animate-scale-in">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3 text-left">
                <Ticket className="w-5 h-5 text-brand-cyan animate-pulse" />
                <h3 className="text-lg font-display font-extrabold text-white">
                  {editingRecord ? "Edit Developer Pass" : "Add New Developer Pass"}
                </h3>
              </div>

              <form onSubmit={handleSaveRegistration} className="space-y-4 text-left">
                
                {/* Custom User ID (Creation only) */}
                {!editingRecord && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Custom/Target Account UID (Optional):</label>
                    <input
                      type="text"
                      value={formUserId}
                      onChange={(e) => setFormUserId(e.target.value)}
                      placeholder="Leave blank for auto-generation..."
                      className="w-full glass-input p-2.5 mt-1 rounded-xl text-xs font-mono text-slate-300"
                    />
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Builder Name:</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    maxLength={25}
                    placeholder="Satoshi Nakamoto"
                    className="w-full glass-input p-2.5 mt-1 rounded-xl text-xs text-slate-200"
                    required
                  />
                </div>

                {/* GitHub handle */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GitHub Handle:</label>
                  <input
                    type="text"
                    value={formGithub}
                    onChange={(e) => setFormGithub(e.target.value)}
                    maxLength={50}
                    placeholder="satoshi"
                    className="w-full glass-input p-2.5 mt-1 rounded-xl text-xs font-mono text-slate-200"
                    required
                  />
                </div>

                {/* Track */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ecosystem Track:</label>
                  <select
                    value={formTrack}
                    onChange={(e) => setFormTrack(e.target.value)}
                    className="w-full glass-input p-2.5 mt-1 rounded-xl text-xs font-semibold bg-[#0c082e] text-slate-200"
                  >
                    <option value="GenAI">Generative AI Core</option>
                    <option value="Agents">Autonomous Agents</option>
                    <option value="Web3">Web3 & Blockchain</option>
                    <option value="HealthTech">Health & Biotech</option>
                  </select>
                </div>

                {/* Glow Color selection */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Neon glow preset:</label>
                  <div className="flex gap-4 mt-2">
                    {(["purple", "blue", "cyan"] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormGlowColor(color)}
                        className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center ${
                          formGlowColor === color ? "border-white scale-110" : "border-transparent opacity-60"
                        }`}
                        style={{
                          backgroundColor: color === "purple" ? "#7C3AED" : color === "blue" ? "#3B82F6" : "#06B6D4"
                        }}
                      >
                        {formGlowColor === color && <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticket Number */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pass Ticket ID / Serial:</label>
                  <input
                    type="text"
                    value={formTicketNumber}
                    onChange={(e) => setFormTicketNumber(e.target.value)}
                    placeholder="e.g. HV-2026-0394"
                    className="w-full glass-input p-2.5 mt-1 rounded-xl text-xs font-mono text-slate-200"
                    required
                  />
                </div>

                {/* Form CTA Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-slate-400 hover:text-white text-center transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="flex-1 py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-bold rounded-xl text-xs text-center transition-all cursor-pointer shadow-lg"
                  >
                    {isSubmittingForm ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      "Apply Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
