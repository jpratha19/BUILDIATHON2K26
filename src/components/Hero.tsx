import { Sparkles, Terminal, Award, Users, Bot, ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  onRegisterClick: () => void;
  onExploreProjectsClick: () => void;
}

export default function Hero({ onRegisterClick, onExploreProjectsClick }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen pt-32 pb-20 md:pt-40 md:pb-28 flex items-center justify-center overflow-hidden bg-[#030014]"
    >
      {/* Background Blobs and Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-brand-purple/20 glow-blur animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-brand-blue/15 glow-blur animate-pulse-slow-reverse"></div>
        <div className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-brand-cyan/10 glow-blur animate-pulse-slow"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
        {/* Left: Text and CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-brand-purple/30 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in animate-bounce-subtle">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
            <span>First AI-Native Hackathon Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-white mb-6">
            Where AI Meets
            <span className="block mt-1 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent drop-shadow-sm font-extrabold pb-2">
              Human Innovation
            </span>
          </h1>

          {/* Subheading */}
          <p className="font-sans text-lg md:text-xl text-slate-300 max-w-xl mb-8 leading-relaxed">
            Unleash your potential on a next-generation hackathon platform powered by intelligent matching, 24/7 AI mentoring, and automated unbiased AI evaluations.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onRegisterClick}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-semibold text-base shadow-[0_4px_30px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_40px_rgba(124,58,237,0.6)] active:scale-[0.98] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Join Next Hackathon
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Metrics under buttons */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10 text-xs text-slate-400 border-t border-white/5 pt-6 w-full max-w-md">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-purple" />
              <span>15,000+ Hackers</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-white/20"></div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-cyan" />
              <span>₹5,00,000 In Prizes</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-white/20"></div>
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-brand-blue" />
              <span>AI Evaluation V2</span>
            </div>
          </div>
        </div>

        {/* Right: Visual Artwork with interactive glow cards */}
        <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[450px] md:max-w-[500px]">
            {/* Core glowing portal SVG */}
            <div className="absolute inset-0 flex items-center justify-center animate-pulse-slow">
              <div className="w-[85%] h-[85%] rounded-full bg-gradient-to-tr from-brand-purple/25 via-brand-blue/20 to-brand-cyan/25 glow-blur-sm"></div>
            </div>

            {/* Futuristic Tech Circle Artwork */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full text-slate-800/40 select-none pointer-events-none"
            >
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="url(#circleGradient)" strokeWidth="1" />
              <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 100 15 A 85 85 0 0 1 185 100" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
              <path d="M 100 185 A 85 85 0 0 1 15 100" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
              
              <defs>
                <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Core Logo/Sphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full glass-panel border border-brand-cyan/30 flex items-center justify-center p-4 shadow-[0_0_50px_rgba(6,182,212,0.35)] hover:shadow-[0_0_70px_rgba(124,58,237,0.5)] transition-all duration-500 hover:scale-105 group/sphere">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand-purple/30 via-brand-blue/30 to-brand-cyan/30 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-purple via-transparent to-brand-cyan rounded-full animate-spin [animation-duration:8s]"></div>
                <div className="relative bg-[#0d092c] w-[94%] h-[94%] rounded-full flex flex-col items-center justify-center border border-white/5">
                  <Bot className="w-10 h-10 text-brand-cyan animate-bounce" />
                  <span className="text-[10px] uppercase tracking-widest text-brand-cyan/80 font-semibold font-mono mt-1">Hack Engine</span>
                </div>
              </div>
            </div>

            {/* Floating Card 1: Team Matcher */}
            <div className="absolute top-[8%] left-[-4%] glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl flex items-center gap-3 w-64 animate-fade-in hover:scale-105 transition-all cursor-default">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-purple to-[#4c1d95] text-white">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">AI Team Matchmaker</div>
                <div className="text-xs font-semibold text-white mt-0.5">Found 2 new teammates!</div>
                <div className="text-[10px] text-brand-cyan font-semibold mt-1">98% Synergy Match</div>
              </div>
            </div>

            {/* Floating Card 2: AI Evaluation */}
            <div className="absolute bottom-[10%] left-[-12%] glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl flex items-center gap-3 w-64 animate-fade-in hover:scale-105 transition-all cursor-default">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-cyan to-[#0e7490] text-white">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">AI Evaluation Engine</div>
                <div className="text-xs font-semibold text-white mt-0.5">Project Idea Analyzed</div>
                <div className="text-[10px] text-brand-purple font-semibold mt-1">Score: 9.8/10 • Highly Feasible</div>
              </div>
            </div>

            {/* Floating Card 3: AI Code Assistant */}
            <div className="absolute top-[25%] right-[-15%] glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl flex items-center gap-3 w-64 animate-fade-in hover:scale-105 transition-all cursor-default">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-blue to-[#1e3a8a] text-white">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">Smart Mentorship</div>
                <div className="text-xs font-semibold text-white mt-0.5">Vite + React Setup Ready</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">Successfully Initialized</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
