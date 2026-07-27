import React, { useState } from "react";
import {
  UserCheck,
  Users,
  Code2,
  Send,
  FileSpreadsheet,
  Trophy,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Play
} from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  mockUI: React.ReactNode;
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: Step[] = [
    {
      number: "01",
      title: "Register & Claim Ticket",
      description: "Secure your slot in seconds. Set up your builder profile, link GitHub, and select target tech stacks and innovation tracks.",
      icon: UserCheck,
      color: "from-brand-purple to-pink-500",
      mockUI: (
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-brand-purple uppercase font-bold">Registration Portal</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">Open</span>
          </div>
          <div className="flex-1 py-4 flex flex-col justify-center">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-cyan">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Alice Vance</div>
                <div className="text-xs text-slate-400">Full-Stack AI Architect</div>
                <div className="text-[10px] text-brand-cyan font-semibold mt-1">Status: Registered Successfully</div>
              </div>
            </div>
            <div className="mt-4 text-[10px] text-slate-400 leading-relaxed text-left pl-1">
              🎉 Digital pass generated! ID: <span className="font-mono text-white">HV-AI-2026-0941</span>
            </div>
          </div>
          <div className="bg-brand-purple/10 border border-brand-purple/20 p-3 rounded-lg text-center text-[11px] font-semibold text-slate-200">
            Pass claimed & synchronized with Github!
          </div>
        </div>
      )
    },
    {
      number: "02",
      title: "Form or Join a Team",
      description: "Let our AI algorithm analyze your profile to matching developers, or invite colleagues to build together in secure private lounges.",
      icon: Users,
      color: "from-brand-blue to-brand-cyan",
      mockUI: (
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-brand-blue uppercase font-bold">Team Matching Dashboard</span>
            <span className="text-[10px] text-brand-cyan font-mono animate-pulse">Scanning pool...</span>
          </div>
          <div className="flex-1 py-4 flex flex-col gap-3 justify-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">MC</div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Marcus Chen</div>
                  <div className="text-[9px] text-slate-400">Smart Contract dev</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 font-mono">98% Synergy</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0825] border border-brand-blue/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-cyan">AI</div>
                <div className="text-left">
                  <div className="text-xs font-bold text-brand-cyan">AI Synergy Suggestions</div>
                  <div className="text-[9px] text-slate-400">Match found: +1 NLP Expert</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-purple/20 text-white font-mono">Add Member</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 text-center italic font-mono">
            Optimized team matching completed under 12s
          </div>
        </div>
      )
    },
    {
      number: "03",
      title: "Build the Future",
      description: "Gain access to $1,000+ API credits. Harness the built-in AI Mentor widget inside your platform console to build cutting-edge systems.",
      icon: Code2,
      color: "from-emerald-400 to-teal-500",
      mockUI: (
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold">HackOps IDE Sandbox</span>
            <span className="text-[10px] text-slate-500 font-mono">Vite + React Core</span>
          </div>
          <div className="flex-1 py-4 flex flex-col justify-center text-left">
            <div className="bg-[#030014] p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
              <p className="text-slate-500">// 24/7 AI Mentor Active</p>
              <p className="text-brand-purple">import <span className="text-slate-300">{"{ GoogleGenAI }"}</span> from <span className="text-emerald-400">"@google/genai"</span>;</p>
              <p className="mt-1 text-brand-blue">const <span className="text-slate-300">ai = new GoogleGenAI({"{"} apiKey: process.env.KEY {"}"});</span></p>
              <p className="text-slate-300">const response = await ai.models.generateContent({"{"}</p>
              <p className="text-slate-300">  model: "gemini-2.5-flash",</p>
              <p className="text-slate-300">  contents: "Review hackathon codebase..."</p>
              <p className="text-slate-300">{"});"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 bg-white/5 p-2 rounded border border-white/5">
            <span>✨ Code health status: Good</span>
            <span className="text-emerald-400 font-bold">99.8% Test Coverage</span>
          </div>
        </div>
      )
    },
    {
      number: "04",
      title: "Submit Code & Pitch",
      description: "Upload code repos, project summaries, and a 2-minute video pitch directly inside your dashboard. No complex external site forms.",
      icon: Send,
      color: "from-brand-blue to-indigo-500",
      mockUI: (
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-brand-blue uppercase font-bold">Submission Checklist</span>
            <span className="text-[10px] text-indigo-400 font-mono">Draft Saved</span>
          </div>
          <div className="flex-1 py-4 flex flex-col gap-2 justify-center text-left">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Link Github Repository connected</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>2-min Pitch Loom Video Uploaded</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Tech Stack Metadata declared</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Final Judging lock (12 hrs remaining)</span>
            </div>
          </div>
          <button className="w-full py-2 bg-gradient-to-r from-brand-blue to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md">
            Finalize Submission
          </button>
        </div>
      )
    },
    {
      number: "05",
      title: "AI Project Evaluation",
      description: "Our unbiased AI Evaluator scans your commits, compiles your code, and audits UI/UX fidelity to generate granular feedback.",
      icon: FileSpreadsheet,
      color: "from-pink-500 to-brand-purple",
      mockUI: (
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-pink-500 uppercase font-bold">AI Evaluator Dashboard</span>
            <span className="text-[10px] text-emerald-400 font-mono">Scored</span>
          </div>
          <div className="flex-1 py-4 flex flex-col justify-center text-left">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <div className="text-[8px] text-slate-400 uppercase font-mono">Code Quality</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">9.5/10</div>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/5">
                <div className="text-[8px] text-slate-400 uppercase font-mono">UI/UX Polish</div>
                <div className="text-sm font-bold text-brand-cyan mt-0.5">9.1/10</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-300 italic bg-[#0d092c] p-2.5 rounded border border-brand-purple/20">
              🤖 "The frontend shows exceptional layout attention. Excellent API proxies are constructed to protect keys."
            </p>
          </div>
          <div className="text-[10px] text-slate-500 text-center font-mono">
            Unbiased algorithms safeguard equal grading.
          </div>
        </div>
      )
    },
    {
      number: "06",
      title: "Win Capital & Glory",
      description: "Present top AI products to venture capitalists, secure investment grants, claim verified certificates, and win major cash prizes.",
      icon: Trophy,
      color: "from-amber-400 to-orange-500",
      mockUI: (
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-amber-500 uppercase font-bold">Victory Board</span>
            <span className="text-[10px] text-amber-400 font-mono">🏆 Gold Medal</span>
          </div>
          <div className="flex-1 py-4 flex flex-col items-center justify-center text-center">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce mb-2" />
            <div className="text-sm font-bold text-white">Team Synthetix AI</div>
            <div className="text-xs text-brand-cyan mt-0.5">Grand Prize Champion • $50K Winner</div>
          </div>
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 p-2.5 rounded-lg text-center text-[10px] font-bold">
            GRANT CHECKS DISPATCHED VIA CRYPTO WALLET
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-[#030014] overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-[30%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-brand-purple/10 glow-blur"></div>
      <div className="absolute bottom-[20%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/10 glow-blur"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
            <span>Hackathon Protocol Execution</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight mb-4">
            Simple, Streamlined, High-Velocity
            <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent font-extrabold mt-1">
              Build Protocol
            </span>
          </h2>
          <p className="font-sans text-slate-300 md:text-lg">
            Follow our 6-step unified roadmap. Our platform is completely product-led, providing developers with zero friction.
          </p>
        </div>

        {/* Timeline Pipeline layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Hand: Steps Timeline */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              return (
                <div
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                    isActive
                      ? "glass-panel border-brand-blue bg-[#0d092c]/55 shadow-xl scale-[1.01]"
                      : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Circle number */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${
                      isActive
                        ? "bg-gradient-to-tr from-brand-blue to-brand-cyan border-transparent text-slate-950 shadow-md"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Step texts */}
                  <div className="flex-1">
                    <h3 className={`text-base font-bold font-display flex items-center gap-2 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-cyan animate-pulse" : "text-slate-500"}`} />
                      {step.title}
                    </h3>
                    {isActive && (
                      <p className="text-slate-300 text-sm mt-1.5 leading-relaxed animate-fade-in">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Right hand arrow on active indicator */}
                  {isActive && (
                    <div className="hidden md:block self-center p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20">
                      <ArrowRight className="w-4 h-4 text-brand-cyan animate-bounce-subtle" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Hand: Interactive Simulated Live Preview Screen */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative w-full aspect-[4/3] rounded-3xl glass-panel border border-white/10 shadow-2xl p-0.5 overflow-hidden group/screen bg-[#020010]">
              {/* Outer light glow matching step */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-brand-purple/20 via-brand-blue/15 to-brand-cyan/20 glow-blur opacity-80"></div>
              
              {/* Window panel frame */}
              <div className="relative w-full h-full bg-[#040118]/90 rounded-[22px] overflow-hidden flex flex-col">
                {/* Platform Header */}
                <div className="px-5 py-3.5 bg-[#090623] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                      HackOps Console V2
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></div>
                    <span className="text-[8px] font-mono text-brand-cyan uppercase font-bold">Node online</span>
                  </div>
                </div>

                {/* Simulated Content */}
                <div className="flex-1 overflow-hidden relative">
                  {steps[activeStep].mockUI}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
