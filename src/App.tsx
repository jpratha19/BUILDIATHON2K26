import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Sponsors from "./components/Sponsors";
import Leaderboard from "./components/Leaderboard";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import TicketModal from "./components/TicketModal";
import LoginModal from "./components/LoginModal";
import AIMentorWidget from "./components/AIMentorWidget";
import AdminPortal from "./components/AdminPortal";
import AcceptInvitePage from "./components/AcceptInvitePage";
import MatchmakingPage from "./components/MatchmakingPage";
import EvaluationPage from "./components/EvaluationPage";
import LeaderboardPage from "./components/LeaderboardPage";
import NetworkingPage from "./components/NetworkingPage";
import CredentialsPage from "./components/CredentialsPage";
import { Sparkles } from "lucide-react";
import { auth } from "./lib/firebase";
import { signOut } from "firebase/auth";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Monitor path changes for SPA routing
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Sync with real Firebase Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "Developer";
        setLoggedInUser(name);
        setIsAdmin(user.email === "aaditparti@gmail.com");
        // Trigger verification toast when user signs in/up
        setShowLoginToast(true);
      } else {
        setLoggedInUser(null);
        setIsAdmin(false);
        setShowLoginToast(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (username: string) => {
    setLoggedInUser(username);
    setShowLoginToast(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  useEffect(() => {
    if (showLoginToast) {
      const timer = setTimeout(() => {
        setShowLoginToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showLoginToast]);

  const handleExploreProjects = () => {
    const element = document.getElementById("leaderboard");
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (currentPath === "/accept-invite") {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    return (
      <AcceptInvitePage
        token={token}
        onGoHome={() => {
          window.history.pushState({}, "", "/");
          setCurrentPath("/");
        }}
      />
    );
  }

  return (
    <div className="bg-[#030014] text-[#f3f4f6] relative min-h-screen selection:bg-brand-purple/30 selection:text-brand-cyan">
      
      {/* Premium Notification Toast when logged in */}
      {showLoginToast && loggedInUser && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl glass-panel border border-brand-purple/40 bg-[#0c082c]/90 text-left flex items-start gap-3 shadow-[0_10px_35px_rgba(124,58,237,0.25)] animate-slide-in max-w-sm">
          <div className="p-2 bg-brand-purple/25 border border-brand-purple/45 rounded-xl text-brand-cyan shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Access Verified</h4>
            <p className="text-xs text-slate-300 mt-1">
              Welcome back, <span className="text-brand-cyan font-mono font-bold">@{loggedInUser}</span>. Live session synchronized on your portal.
            </p>
          </div>
        </div>
      )}

      {/* Persistent Sticky Navbar */}
      <Navbar
        onRegisterClick={() => setIsTicketOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
        loggedInUser={loggedInUser}
        onSignOut={handleSignOut}
        onAdminClick={() => setIsAdminPortalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Main Content Sections */}
      <main className="relative">
        {currentPath === "/credentials" ? (
          <CredentialsPage
            onOpenLogin={() => setIsLoginOpen(true)}
            onGoHome={() => {
              window.history.pushState({}, "", "/");
              setCurrentPath("/");
            }}
          />
        ) : currentPath === "/networking" ? (
          <NetworkingPage
            onOpenLogin={() => setIsLoginOpen(true)}
            onGoHome={() => {
              window.history.pushState({}, "", "/");
              setCurrentPath("/");
            }}
          />
        ) : currentPath === "/matchmaking" ? (
          <MatchmakingPage onOpenLogin={() => setIsLoginOpen(true)} />
        ) : currentPath === "/evaluation" ? (
          <EvaluationPage
            onGoHome={() => {
              window.history.pushState({}, "", "/");
              setCurrentPath("/");
            }}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        ) : currentPath === "/leaderboard" ? (
          <LeaderboardPage
            onGoHome={() => {
              window.history.pushState({}, "", "/");
              setCurrentPath("/");
            }}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        ) : (
          <>
            {/* Hero Area */}
            <Hero
              onRegisterClick={() => setIsTicketOpen(true)}
              onExploreProjectsClick={handleExploreProjects}
            />

            {/* Global Statistics Bar */}
            <Stats />

            {/* Modular Advanced Features Section */}
            <Features />

            {/* Interactive Step-by-Step Build Pipeline */}
            <HowItWorks />

            {/* Real-time Rankings & Project Directory */}
            <Leaderboard />

            {/* Ecosystem Support Alliance */}
            <Sponsors />

            {/* Customer Success Stories */}
            <Testimonials />

            {/* Frequently Asked Questions desk */}
            <FAQ />

            {/* High energy CTA */}
            <CTA onRegisterClick={() => setIsTicketOpen(true)} />
          </>
        )}
      </main>

      {/* Professional Footer */}
      <Footer />

      {/* Interactive Pass Generator & Minting modal */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Access Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Floating 24/7 AI Mentor Chat Assistant */}
      <AIMentorWidget />

      {/* Admin Operations Console Portal */}
      <AdminPortal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />
      
    </div>
  );
}
