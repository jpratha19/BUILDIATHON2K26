import React, { useState, useEffect } from "react";
import { Sparkles, Shield, Mail, Lock, User, Check, AlertCircle, LogIn, UserPlus } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AcceptInvitePageProps {
  token: string | null;
  onGoHome: () => void;
}

export default function AcceptInvitePage({ token, onGoHome }: AcceptInvitePageProps) {
  const [invitation, setInvitation] = useState<any>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  // Authentication states
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && user.email) {
        setEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch and verify invitation details on load
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setInvitationError("No secure verification token was provided in the link.");
        setLoadingInvitation(false);
        return;
      }

      try {
        const docRef = doc(db, "invitations", token);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setInvitationError("The invitation token is invalid or has expired.");
        } else {
          const data = docSnap.data();
          if (data.status !== "pending") {
            setInvitationError(`This invitation has already been ${data.status}.`);
          } else {
            setInvitation(data);
          }
        }
      } catch (err: any) {
        console.error("Error verifying invitation token:", err);
        setInvitationError("Failed to communicate with security registry. Please try again.");
      } finally {
        setLoadingInvitation(false);
      }
    }

    verifyToken();
  }, [token]);

  // Logic to update status to accepted
  const performAcceptance = async (user: any) => {
    if (!token) return;
    setIsAccepting(true);
    try {
      const docRef = doc(db, "invitations", token);
      await setDoc(docRef, {
        status: "accepted",
        acceptedBy: user.email,
        acceptedByUid: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setAcceptSuccess(true);
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      setAuthError("Auth succeeded, but invitation status sync failed. Check console rules.");
    } finally {
      setIsAccepting(false);
    }
  };

  // Auth handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !name.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      let loggedInUser = null;
      if (isSignUp) {
        // Create account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });

        // Save profile to Firestore
        try {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: "user",
            isAdmin: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (fsErr) {
          console.error("Firestore user creation failed:", fsErr);
        }
        loggedInUser = user;
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        loggedInUser = userCredential.user;
      }

      // Automatically accept invitation once authenticated
      if (loggedInUser) {
        await performAcceptance(loggedInUser);
      }
    } catch (err: any) {
      console.error("Auth error during acceptance:", err);
      let friendlyMessage = err.message;
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use. Please sign in instead.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        friendlyMessage = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      }
      setAuthError(friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handler if already logged in and just clicks CTA
  const handleDirectAccept = async () => {
    if (currentUser) {
      await performAcceptance(currentUser);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError(null);
    setName("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-[#030014] text-[#f3f4f6] flex flex-col items-center justify-center p-4 relative selection:bg-brand-purple/30 selection:text-brand-cyan">
      {/* Decorative cybernetic overlay lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/10 via-[#030014]/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />

      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/10 p-6 md:p-8 bg-[#040118]/95 shadow-[0_0_50px_rgba(6,182,212,0.05)] z-10 text-center space-y-6">
        
        {/* Top Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[10px] font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-brand-cyan" />
            <span>HackOps Secure Handshake</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">
            Team Invitation Portal
          </h2>
        </div>

        {loadingInvitation ? (
          <div className="py-12 space-y-3">
            <div className="w-10 h-10 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">Verifying secure token credentials...</p>
          </div>
        ) : invitationError ? (
          <div className="py-8 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verification Refused</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">{invitationError}</p>
            </div>
            <button
              onClick={onGoHome}
              className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Return to Core Terminal
            </button>
          </div>
        ) : acceptSuccess ? (
          <div className="py-8 space-y-4 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Credentials Granted</h3>
              <p className="text-xs text-emerald-400 font-mono">Invitation Accepted Successfully!</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
                Your profile is now registered and linked to the active hackathon team. Live session logs are fully synced.
              </p>
            </div>
            <button
              onClick={onGoHome}
              className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Access Terminal Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Invitation Details Card */}
            <div className="p-4 rounded-2xl bg-brand-purple/5 border border-brand-purple/15 text-left space-y-1">
              <span className="text-[9px] uppercase font-bold text-brand-purple tracking-wider">Verified Invite Record</span>
              <p className="text-sm text-slate-200 font-mono">
                Recipient: <span className="text-brand-cyan font-bold">{invitation.email}</span>
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Status: <span className="text-amber-400 font-semibold uppercase">{invitation.status}</span>
              </p>
            </div>

            {/* Decision flow based on Auth status */}
            {currentUser ? (
              <div className="space-y-4 text-left p-4 rounded-2xl border border-white/5 bg-white/2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan text-xs font-mono font-bold">
                    @
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Authenticated Builder</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{currentUser.email}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  You are currently logged in. Press the button below to link your account to this team invitation.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onGoHome}
                    className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-slate-400 hover:text-white transition-all text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDirectAccept}
                    disabled={isAccepting}
                    className="flex-1 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-brand-purple/20"
                  >
                    {isAccepting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Accept Invitation"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {isSignUp ? "Create Developer Account" : "Access Portal & Accept"}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Sign in or sign up below to verify your team membership.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-slate-300 font-semibold">{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {isSignUp && (
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Builder Full Name"
                        className="w-full glass-input p-2.5 pl-9 rounded-xl text-xs text-slate-200"
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Security Email Address"
                      className="w-full glass-input p-2.5 pl-9 rounded-xl text-xs text-slate-200"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Access Token Password"
                      className="w-full glass-input p-2.5 pl-9 rounded-xl text-xs text-slate-200"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-brand-cyan/10"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : isSignUp ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Create Account & Join
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Verify Credentials & Join
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-[10px] text-slate-400 hover:text-brand-cyan font-mono transition-colors"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
