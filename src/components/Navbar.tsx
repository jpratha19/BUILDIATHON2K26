import React, { useState, useEffect } from "react";
import { Menu, X, Cpu, ArrowRight, LogOut, UserCheck, Shield } from "lucide-react";
import UserProfileDropdown from "./UserProfileDropdown";

interface NavbarProps {
  onRegisterClick: () => void;
  onLoginClick: () => void;
  loggedInUser: string | null;
  onSignOut: () => void;
  onAdminClick: () => void;
  isAdmin: boolean;
}

export default function Navbar({ onRegisterClick, onLoginClick, loggedInUser, onSignOut, onAdminClick, isAdmin }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, isRoute?: boolean) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (isRoute) {
      window.history.pushState({}, "", "/matchmaking");
      window.dispatchEvent(new Event("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new Event("popstate"));
      
      // Let home page render first before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  };

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#030014]/75 backdrop-blur-md border-b border-white/10 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent py-6 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-[#0d092c] p-2 rounded-lg border border-white/10">
              <Cpu className="w-5 h-5 text-brand-cyan animate-pulse" />
            </div>
          </div>
          <span className="font-display font-bold text-xl md:text-2xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            HackOps <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent font-extrabold">AI</span>
          </span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Home", id: "hero" },
            { label: "Features", id: "features" },
            { label: "How It Works", id: "how-it-works" },
            { label: "Sponsors", id: "sponsors" },
            { label: "Leaderboard", id: "leaderboard" },
            { label: "FAQ", id: "faq" },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className="font-sans text-sm font-medium text-slate-300 hover:text-white hover:shadow-[0_2px_10px_rgba(124,58,237,0.3)] transition-all duration-200 relative group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {loggedInUser ? (
            <UserProfileDropdown 
              loggedInUser={loggedInUser}
              onSignOut={onSignOut}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={onLoginClick}
                className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 border border-transparent hover:border-white/10 cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={onRegisterClick}
                className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan rounded-full transition-all duration-300 group-hover:opacity-100"></span>
                <span className="relative block px-5 py-2 rounded-full bg-[#030014] text-sm font-medium text-white transition-all duration-300 group-hover:bg-transparent flex items-center gap-1">
                  Register Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-0 top-[73px] z-40 bg-[#030014]/98 backdrop-blur-xl border-t border-white/5 transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-6 gap-6">
          {[
            { label: "Home", id: "hero" },
            { label: "Features", id: "features" },
            { label: "How It Works", id: "how-it-works" },
            { label: "Sponsors", id: "sponsors" },
            { label: "Leaderboard", id: "leaderboard" },
            { label: "FAQ", id: "faq" },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className="text-lg font-medium text-slate-300 hover:text-white border-b border-white/5 pb-2 hover:border-brand-purple/55 transition-all"
            >
              {link.label}
            </a>
          ))}

          <div className="flex flex-col gap-4 mt-4">
            {loggedInUser ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple via-brand-blue to-brand-cyan flex items-center justify-center font-black text-white shadow-[0_0_10px_rgba(124,58,237,0.3)] text-sm">
                    {loggedInUser.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{loggedInUser}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{isAdmin ? "Organizer" : "Participant"}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.history.pushState({}, "", "/matchmaking");
                      window.dispatchEvent(new Event("popstate"));
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all text-center"
                  >
                    Matchmaking
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 hover:text-white transition-all text-center"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="w-full py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium text-center cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onRegisterClick();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-medium text-center shadow-[0_4px_20px_rgba(124,58,237,0.35)] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Register Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
