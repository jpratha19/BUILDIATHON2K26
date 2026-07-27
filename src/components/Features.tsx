import React, { useState } from "react";
import {
  Users,
  Bot,
  Award,
  Zap,
  Globe,
  FileCheck,
  Building,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  Heart,
  CheckCircle2,
  Cpu
} from "lucide-react";

interface FeatureCardProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  glowColor: string;
}

const featuresData: FeatureCardProps[] = [
  {
    id: "ai-team-matching",
    icon: Users,
    title: "AI Team Matchmaking",
    description: "Connect with hackers based on skill synergies, schedule compatibility, and track interests rather than guessing.",
    badge: "Most Popular",
    glowColor: "rgba(124, 58, 237, 0.4)",
  },
  {
    id: "ai-mentor-assistant",
    icon: Bot,
    title: "24/7 AI Chatbot Assistant",
    description: "Get instant codebase troubleshooting, prompt ideas, framework advice, and system architecture reviews from our AI chatbot.",
    badge: "Always Live",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "ai-project-evaluation",
    icon: FileCheck,
    title: "AI Project Evaluation",
    description: "Receive objective, immediate grading feedback on your code quality, design fidelity, and MVP feature depth.",
    badge: "Unbiased",
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
  {
    id: "live-leaderboard",
    icon: Award,
    title: "Dynamic Live Leaderboards",
    description: "Watch real-time code push frequencies, design updates, and judge-voted team rankings shift as build weekend proceeds.",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "networking",
    icon: Globe,
    title: "Global Hacker Networking",
    description: "Hangout in secure digital lounges, participate in lightning talks, and network with 15k+ fellow AI practitioners.",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "certificates",
    icon: Zap,
    title: "Verifiable Credentials",
    description: "Claim fully certified, verifiable completion badges and hackathon proof-of-contributions.",
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
];

export default function Features() {
  const [activeTab, setActiveTab] = useState<"evaluator" | "matcher">("evaluator");
  
  // States for AI Project Evaluator Simulator
  const [projectIdea, setProjectIdea] = useState("");
  const [evaluationStage, setEvaluationStage] = useState<"idle" | "evaluating" | "complete">("idle");
  const [evaluationLogs, setEvaluationLogs] = useState<string[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<{
    innovation: number;
    feasibility: number;
    impact: number;
    feedback: string[];
  } | null>(null);

  // States for AI Team Matcher Simulator
  const [hackerSkills, setHackerSkills] = useState<string[]>(["React"]);
  const [hackerTrack, setHackerTrack] = useState("GenAI");
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const availableSkills = ["React", "Python", "TailwindCSS", "Node.js", "FastAPI", "OpenAI API", "HuggingFace", "Solidity", "TensorFlow"];

  const handleEvaluateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectIdea.trim()) return;

    setEvaluationStage("evaluating");
    setEvaluationLogs([]);
    setEvaluationResult(null);

    const logs = [
      "⚡ Initializing HackOps Evaluation Matrix...",
      "🔍 Scanning keywords: parsing domain structure...",
      "🧠 Accessing vector embeddings for feasibility metrics...",
      "📈 Correlating with 1,200 previous top-tier hack submissions...",
      "🎨 Performing UX & architectural scalability audit...",
      "✨ Generating grading diagnostics report..."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setEvaluationLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          // Generate customized dynamic evaluation based on keywords
          const ideaLower = projectIdea.toLowerCase();
          let innovation = 7.5 + Math.random() * 2;
          let feasibility = 8.0 + Math.random() * 1.5;
          let impact = 7.0 + Math.random() * 2.5;

          let feedback = [
            "Excellent framework structure. Consider standardizing your vector index queries for speed.",
            "Strong market application. Make sure to define your target customer demographic during your final pitch.",
            "Integration of standard LLM layers looks clean. Try using custom fine-tuned weights for real competitive advantage."
          ];

          if (ideaLower.includes("health") || ideaLower.includes("medical")) {
            impact = 9.4;
            feedback.push("Medical sector applications carry extremely high ethical weight; detail privacy compliance in your demo.");
          } else if (ideaLower.includes("crypto") || ideaLower.includes("blockchain") || ideaLower.includes("solidity")) {
            innovation = 9.2;
            feasibility = 7.8;
            feedback.push("Web3 pipelines add latency. Optimize your smart contract RPC gas configurations.");
          } else if (ideaLower.includes("education") || ideaLower.includes("learn")) {
            feasibility = 9.5;
            feedback.push("EdTech tools excel with strong user-testing data. Deploy a simple questionnaire prototype.");
          }

          setEvaluationResult({
            innovation: parseFloat(innovation.toFixed(1)),
            feasibility: parseFloat(feasibility.toFixed(1)),
            impact: parseFloat(impact.toFixed(1)),
            feedback: feedback
          });
          setEvaluationStage("complete");
        }
      }, (index + 1) * 700);
    });
  };

  const toggleSkill = (skill: string) => {
    if (hackerSkills.includes(skill)) {
      if (hackerSkills.length > 1) {
        setHackerSkills(hackerSkills.filter(s => s !== skill));
      }
    } else {
      setHackerSkills([...hackerSkills, skill]);
    }
  };

  const handleRunMatchmaker = () => {
    setIsMatching(true);
    setMatchingResults([]);

    setTimeout(() => {
      const db = [
        { name: "Siddharth Mehta", role: "Backend Engineer", skills: ["Python", "FastAPI", "Node.js"], track: "GenAI", rating: 98, code: "import openai\nclass AgentWorker..." },
        { name: "Elena Rostova", role: "UX/UI Lead", skills: ["React", "TailwindCSS"], track: "GenAI", rating: 95, code: "export default function DesignPanel()..." },
        { name: "Aria Sterling", role: "AI Research Scientist", skills: ["Python", "HuggingFace", "TensorFlow"], track: "Agents", rating: 97, code: "from transformers import pipeline..." },
        { name: "Marcus Chen", role: "Smart Contract dev", skills: ["Solidity", "React"], track: "Web3", rating: 96, code: "contract HackToken is ERC20..." },
        { name: "Devon Cross", role: "Full Stack Engineer", skills: ["React", "Node.js", "FastAPI"], track: "HealthTech", rating: 94, code: "app.get('/api/v1/patient'..." },
      ];

      // Filter and score
      const filtered = db.map(dev => {
        let matchingSkillsCount = dev.skills.filter(s => hackerSkills.includes(s) || !hackerSkills.includes(s)).length;
        let synergy = 85 + Math.floor(Math.random() * 14);
        if (dev.track === hackerTrack) synergy += 3;
        if (synergy > 100) synergy = 100;
        return {
          ...dev,
          synergy
        };
      }).sort((a, b) => b.synergy - a.synergy);

      setMatchingResults(filtered.slice(0, 3));
      setIsMatching(false);
    }, 1500);
  };

  return (
    <section id="features" className="relative py-24 bg-[#030014] overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-purple/10 glow-blur"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-blue/10 glow-blur"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span>Advanced Feature Suite</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight mb-4">
            Architected to Power the
            <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent font-extrabold mt-1">
              Next Wave of Builders
            </span>
          </h2>
          <p className="font-sans text-slate-300 md:text-lg">
            Say goodbye to clunky discord coordination and subjective grading. HackOps AI automates your hackathon journey with high-performance protocols.
          </p>
        </div>

        {/* Feature Cards Grid (8 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {featuresData.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                id={feature.id}
                onClick={() => {
                  if (feature.id === "ai-team-matching") {
                    window.history.pushState({}, "", "/matchmaking");
                    window.dispatchEvent(new Event("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (feature.id === "ai-project-evaluation") {
                    window.history.pushState({}, "", "/evaluation");
                    window.dispatchEvent(new Event("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (feature.id === "live-leaderboard") {
                    window.history.pushState({}, "", "/leaderboard");
                    window.dispatchEvent(new Event("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (feature.id === "networking") {
                    window.history.pushState({}, "", "/networking");
                    window.dispatchEvent(new Event("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (feature.id === "certificates") {
                    window.history.pushState({}, "", "/credentials");
                    window.dispatchEvent(new Event("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`relative group rounded-2xl glass-panel p-6 border transition-all duration-300 overflow-hidden ${
                  feature.id === "ai-team-matching"
                    ? "cursor-pointer border-brand-purple/20 hover:border-brand-purple/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.25)] hover:scale-[1.02] hover:-translate-y-1"
                    : feature.id === "ai-project-evaluation"
                    ? "cursor-pointer border-pink-500/20 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.25)] hover:scale-[1.02] hover:-translate-y-1"
                    : feature.id === "live-leaderboard"
                    ? "cursor-pointer border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:scale-[1.02] hover:-translate-y-1"
                    : feature.id === "networking"
                    ? "cursor-pointer border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:scale-[1.02] hover:-translate-y-1"
                    : feature.id === "certificates"
                    ? "cursor-pointer border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:scale-[1.02] hover:-translate-y-1"
                    : "border-white/5 hover:border-white/15 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1"
                }`}
              >
                {/* Glow layer behind card on hover */}
                <div
                  className={`absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none ${
                    feature.id === "ai-team-matching" || feature.id === "ai-project-evaluation" || feature.id === "live-leaderboard" || feature.id === "networking" || feature.id === "certificates" ? "group-hover:opacity-25" : "group-hover:opacity-10"
                  }`}
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${feature.glowColor}, transparent 70%)`
                  }}
                ></div>

                {/* Card Badges */}
                {feature.badge && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-brand-purple to-brand-blue text-[9px] font-semibold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {feature.badge}
                  </span>
                )}

                {/* Card Icon */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-fit mb-5 text-slate-300 group-hover:text-white transition-all group-hover:scale-110">
                  <Icon className="w-6 h-6 text-brand-cyan" />
                </div>

                {/* Card Content */}
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-brand-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Deep-Dives (SaaS Playground Panel) */}
        <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl relative">
          {/* Header Panel */}
          <div className="border-b border-white/10 bg-[#0d092c]/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-brand-cyan" />
                <span className="text-xs font-mono font-bold tracking-widest text-brand-cyan uppercase">Interactive Platform Sandbox</span>
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-white">Test the AI Intelligence Core</h3>
              <p className="text-sm text-slate-400 mt-1">Directly experience our core algorithms before deploying your project.</p>
            </div>

            {/* Selector Buttons */}
            <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
              <button
                onClick={() => setActiveTab("evaluator")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "evaluator"
                    ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                AI Project Evaluator
              </button>
              <button
                onClick={() => setActiveTab("matcher")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "matcher"
                    ? "bg-gradient-to-r from-brand-blue to-brand-cyan text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                AI Synergy Matchmaker
              </button>
            </div>
          </div>

          {/* Interactive Content */}
          <div className="p-6 md:p-10 bg-[#070420]/30 min-h-[420px]">
            {activeTab === "evaluator" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Inputs side */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <form onSubmit={handleEvaluateProject} className="flex flex-col gap-4">
                    <label className="text-sm font-semibold text-slate-200">
                      Paste your Project Pitch / Core Idea:
                    </label>
                    <textarea
                      value={projectIdea}
                      onChange={(e) => setProjectIdea(e.target.value)}
                      placeholder="e.g., An AI-driven diagnostic app that uses audio signals from cellphones to screen for early pediatric asthma symptoms with offline on-device speech processing..."
                      className="glass-input p-4 rounded-xl text-slate-200 text-sm h-32 resize-none leading-relaxed font-sans"
                    />
                    <button
                      type="submit"
                      disabled={evaluationStage === "evaluating" || !projectIdea.trim()}
                      className="py-3.5 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-semibold text-sm shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {evaluationStage === "evaluating" ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin text-white" />
                          Running AI Evaluation Matrix...
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          Evaluate Project Pitch
                        </>
                      )}
                    </button>
                  </form>

                  {/* Suggestion hints */}
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex flex-col gap-2">
                    <span className="font-semibold text-slate-300">💡 Quick evaluation examples (Click to paste):</span>
                    <button
                      onClick={() => setProjectIdea("A Web3 Carbon credit tracking smart contract where companies use AI drone imagery of forestation grids to verify credit allocation.")}
                      className="text-left text-brand-cyan hover:underline hover:text-white transition-all overflow-hidden text-ellipsis whitespace-nowrap block"
                    >
                      • Web3 Carbon Credit tracker with AI drones
                    </button>
                    <button
                      onClick={() => setProjectIdea("AI-driven healthcare wearable which listens to cough dynamics and predicts respiratory conditions instantly with Edge TPU devices.")}
                      className="text-left text-brand-cyan hover:underline hover:text-white transition-all overflow-hidden text-ellipsis whitespace-nowrap block"
                    >
                      • Edge AI Respiratory cough screening wearable
                    </button>
                  </div>
                </div>

                {/* Output side */}
                <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/10 bg-[#040118] overflow-hidden min-h-[300px]">
                  {/* Mock Terminal Header */}
                  <div className="bg-[#0b0825] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-brand-purple" />
                      evaluation_terminal_v2.sh
                    </span>
                  </div>

                  {/* Terminal output stream */}
                  <div className="p-5 flex-1 font-mono text-xs flex flex-col justify-between gap-4">
                    {/* Log prints */}
                    <div className="flex flex-col gap-2 text-slate-300">
                      {evaluationStage === "idle" && (
                        <p className="text-slate-500 italic">Waiting for project pitch evaluation input... Write above and press Evaluate.</p>
                      )}
                      {evaluationLogs.map((log, i) => (
                        <p key={i} className="text-emerald-400 flex items-start gap-1">
                          <span className="text-brand-cyan select-none">&gt;&gt;</span>
                          {log}
                        </p>
                      ))}
                    </div>

                    {/* Report outputs */}
                    {evaluationStage === "complete" && evaluationResult && (
                      <div className="mt-2 border-t border-white/10 pt-4 animate-fade-in">
                        <div className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-brand-cyan" />
                          Automated Rubric Scores:
                        </div>
                        
                        {/* Scores columns */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                            <span className="text-slate-400 text-[10px] uppercase font-mono">Innovation</span>
                            <span className="text-lg font-bold text-brand-purple mt-1">{evaluationResult.innovation}/10</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                            <span className="text-slate-400 text-[10px] uppercase font-mono">Feasibility</span>
                            <span className="text-lg font-bold text-brand-blue mt-1">{evaluationResult.feasibility}/10</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                            <span className="text-slate-400 text-[10px] uppercase font-mono">Impact</span>
                            <span className="text-lg font-bold text-brand-cyan mt-1">{evaluationResult.impact}/10</span>
                          </div>
                        </div>

                        {/* Text Feedbacks */}
                        <div className="p-4 rounded-xl bg-brand-purple/5 border border-brand-purple/20 text-slate-300 leading-relaxed flex flex-col gap-2">
                          <span className="text-white font-semibold text-[11px] uppercase tracking-wide flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            AI Recommendation:
                          </span>
                          <ul className="list-disc list-inside text-xs text-slate-300 flex flex-col gap-1.5">
                            {evaluationResult.feedback.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "matcher" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Inputs */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div className="flex flex-col gap-4 text-left">
                    {/* Track selection */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-200">1. Select your target track:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["GenAI", "Web3", "Agents", "HealthTech"].map((track) => (
                          <button
                            key={track}
                            onClick={() => setHackerTrack(track)}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                              hackerTrack === track
                                ? "bg-brand-blue/15 border-brand-blue text-white shadow-lg"
                                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            {track === "GenAI" ? "Generative AI" : track === "Web3" ? "Web3 & Blockchain" : track === "Agents" ? "Autonomous Agents" : "Health & Biotech"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-200">2. Specify your core skillsets:</label>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {availableSkills.map((skill) => {
                          const isSelected = hackerSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                isSelected
                                  ? "bg-brand-purple/20 border-brand-purple text-brand-cyan"
                                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                              }`}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Run matcher Button */}
                    <button
                      onClick={handleRunMatchmaker}
                      disabled={isMatching}
                      className="py-3.5 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-semibold text-sm shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isMatching ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin text-white" />
                          Connecting Synergy Matrix...
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          Calculate Synergy Matches
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Match Results list */}
                <div className="lg:col-span-7 flex flex-col gap-4 text-left">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Activity className="w-4 h-4 text-brand-cyan animate-pulse" />
                    Optimal Synergy Matches:
                  </div>

                  {matchingResults.length === 0 && !isMatching && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-white/10 border-dashed rounded-2xl p-8">
                      <Users className="w-10 h-10 mb-2 text-slate-600" />
                      <p className="font-mono text-xs text-center">No synergy calculated yet. Specify your target track and skills to initiate matchmaker algorithms.</p>
                    </div>
                  )}

                  {isMatching && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 rounded-2xl p-8">
                      <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-mono text-xs animate-pulse">Scanning pool of 15,000 global hackers...</p>
                    </div>
                  )}

                  {matchingResults.length > 0 && !isMatching && (
                    <div className="flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {matchingResults.map((match, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl glass-panel border border-white/10 hover:border-brand-purple/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-cyan font-bold text-sm">
                              {match.name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                {match.name}
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">
                                  {match.track}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">{match.role}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {match.skills.map((s: string, idx: number) => (
                                  <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 bg-brand-blue/5 border border-brand-blue/15 text-slate-300 rounded">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t border-white/5 md:border-0 pt-3 md:pt-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Synergy Index</span>
                              <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">{match.synergy}%</div>
                            </div>
                            <button
                              onClick={() => alert(`Connection invitation successfully encrypted and dispatched to ${match.name}! Check your platform portal.`)}
                              className="px-3 py-1.5 rounded-lg bg-brand-cyan text-slate-900 font-bold text-[10px] hover:bg-white hover:scale-105 active:scale-95 transition-all mt-2 cursor-pointer"
                            >
                              Connect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
