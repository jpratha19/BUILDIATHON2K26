import React, { useState } from "react";
import { Cpu, Github, Twitter, Youtube, ArrowRight, Check, Sparkles } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => {
      setIsSubscribed(false);
    }, 4000);
  };

  const footerLinks = [
    {
      title: "Platform",
      items: [
        { label: "Active Challenges", href: "#hero" },
        { label: "AI Team Matchmaker", href: "#features" },
        { label: "AI Evaluation Core", href: "#features" },
        { label: "Live Leaderboards", href: "#how-it-works" },
        { label: "Recruiter Radar", href: "#features" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Developer Docs", href: "#" },
        { label: "Gemini API Starter", href: "#" },
        { label: "Platform Rules", href: "#" },
        { label: "Sponsorship Deck", href: "#sponsors" },
        { label: "Discord Server", href: "#" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About HackOps", href: "#" },
        { label: "Success Stories", href: "#testimonials" },
        { label: "Engineering Blog", href: "#" },
        { label: "Partner Program", href: "#sponsors" },
        { label: "Contact Desk", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative bg-[#020010] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Subtle bottom glowing lines */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan opacity-40"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
        {/* Left column: Brand logo & short info */}
        <div className="lg:col-span-4 flex flex-col items-start text-left">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group mb-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan opacity-75 blur-sm group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-[#0d092c] p-2 rounded-lg border border-white/10">
                <Cpu className="w-5 h-5 text-brand-cyan animate-pulse" />
              </div>
            </div>
            <span className="font-display font-bold text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HackOps <span className="bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent font-extrabold">AI</span>
            </span>
          </a>

          <p className="text-sm text-slate-400 font-sans leading-relaxed mb-6 max-w-sm">
            Empowering the global developer community with next-generation automated team synergy matrices, 24/7 technical copilots, and cryptographic completed credentials.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-4">
            {[
              { icon: Github, label: "Github", href: "#" },
              { icon: Twitter, label: "Twitter", href: "#" },
              { icon: Youtube, label: "Youtube", href: "#" },
            ].map((soc, idx) => {
              const Icon = soc.icon;
              return (
                <a
                  key={idx}
                  href={soc.href}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-brand-purple/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all duration-300"
                  aria-label={soc.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Middle columns: Navigation groups */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-6 text-left">
          {footerLinks.map((group, i) => (
            <div key={i} className="flex flex-col gap-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                {group.title}
              </h4>
              <nav className="flex flex-col gap-2.5">
                {group.items.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white hover:underline transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Right column: Newsletter Subscription */}
        <div className="lg:col-span-3 flex flex-col items-start text-left">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-4">
            Ecosystem Dispatch
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Subscribe to receive alerts regarding upcoming prize pools, new developer tracks, and major platform enhancements.
          </p>

          <form onSubmit={handleSubscribe} className="relative w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter developer email..."
              className="w-full glass-input py-3 pl-4 pr-12 rounded-xl text-xs text-slate-200"
              required
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isSubscribed ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {isSubscribed && (
            <span className="text-[10px] text-brand-cyan font-mono mt-2 flex items-center gap-1 animate-fade-in">
              <Sparkles className="w-3 h-3 text-brand-cyan" />
              Developer subscription synchronized successfully!
            </span>
          )}
        </div>
      </div>

      {/* Copyright line */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} HackOps AI Platform Inc. All rights reserved.
        </span>
        <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
          <a href="#" className="hover:text-white transition-all">Privacy Code</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-white transition-all">Developer Terms</a>
          <span>&bull;</span>
          <a href="#" className="hover:text-white transition-all">Audit Security</a>
        </div>
      </div>
    </footer>
  );
}
