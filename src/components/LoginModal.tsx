import React, { useState } from "react";
import { X, Cpu, Sparkles, Shield, Mail, Lock, User, AlertCircle, LogIn, UserPlus } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        // 1. Create firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Set profile display name
        await updateProfile(user, { displayName: name });

        // 3. Save profile to Firestore users collection
        const userDocPath = `users/${user.uid}`;
        try {
          const isDevAdmin = email.toLowerCase().trim() === "aaditparti@gmail.com";
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: isDevAdmin ? "admin" : "user",
            isAdmin: isDevAdmin ? true : false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.WRITE, userDocPath);
        }

        onLoginSuccess(name);
      } else {
        // Firebase Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Ensure admin has role 'admin' and isAdmin: true in Firestore if logging in
        if (user.email?.toLowerCase().trim() === "aaditparti@gmail.com") {
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
            console.log("Logged-in admin synced with Firestore roles.");
          } catch (dbErr) {
            console.error("Failed to sync logged-in admin role to Firestore:", dbErr);
          }
        }
        
        onLoginSuccess(user.displayName || user.email?.split("@")[0] || "Developer");
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
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
      setErrorMsg(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMsg(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 md:p-8 bg-[#040118]/95 shadow-2xl animate-scale-in">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand identity */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-cyan text-[10px] font-semibold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5 text-brand-purple" />
            <span>Secure Console Authentication</span>
          </div>

          <div className="flex justify-center gap-2 items-center mb-2">
            <Cpu className="w-6 h-6 text-brand-cyan animate-pulse" />
            <span className="font-display font-extrabold text-2xl text-white">
              HackOps <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isSignUp 
              ? "Create your developer identity to collaborate, register, and sync your repositories."
              : "Access your developer dashboard, code submission links, and active team spaces."}
          </p>
        </div>

        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { if (isSignUp) toggleMode(); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isSignUp ? "bg-brand-purple/20 text-brand-cyan border border-brand-purple/35" : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { if (!isSignUp) toggleMode(); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isSignUp ? "bg-brand-purple/20 text-brand-cyan border border-brand-purple/35" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign Up
          </button>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-left animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-300 font-sans leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-slate-300">Builder Name:</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input p-3 pl-10 rounded-xl text-slate-200 text-sm"
                  placeholder="Satoshi Nakamoto"
                  maxLength={50}
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Developer Email:</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input p-3 pl-10 rounded-xl text-slate-200 text-sm"
                placeholder="developer@hackops.ai"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password:</label>
              {!isSignUp && <a href="#" className="text-[10px] text-brand-cyan hover:underline">Forgot?</a>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input p-3 pl-10 rounded-xl text-slate-200 text-sm"
                placeholder={isSignUp ? "At least 6 characters" : "••••••••••••"}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="py-3.5 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-bold text-sm shadow-lg hover:scale-[1.01] transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isSignUp ? "Create Developer Account" : "Access Platform Dashboard"
            )}
          </button>
        </form>

        {/* Info line */}
        <div className="mt-6 text-center text-[10px] text-slate-500 font-mono">
          Secured by industry-standard secure cryptography.
        </div>
      </div>
    </div>
  );
}
