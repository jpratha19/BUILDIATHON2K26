import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  FileCode, 
  Github, 
  Video, 
  Code, 
  Users, 
  FileCheck, 
  Download, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle, 
  Lock, 
  CheckSquare, 
  Activity, 
  Layers, 
  ShieldAlert, 
  Cpu, 
  FileText,
  Clock,
  RotateCcw,
  UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from "recharts";
import { auth, db } from "../lib/firebase";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface EvaluationPageProps {
  onGoHome: () => void;
  onOpenLogin: () => void;
}

interface EvaluationResult {
  overallScore: number;
  grade: string;
  probability: number;
  scores: {
    innovation: number;
    technical: number;
    uiux: number;
    codeQuality: number;
    business: number;
    scalability: number;
    security: number;
    presentation: number;
    originality: number;
    feasibility: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  feedback: string;
  recruiterInsight: string;
  createdAt?: string;
  projectTitle?: string;
  projectId?: string;
}

interface SavedEvaluation {
  id: string;
  projectId: string;
  projectTitle: string;
  techStack: string;
  createdAt: string;
  evaluation: EvaluationResult;
}

export default function EvaluationPage({ onGoHome, onOpenLogin }: EvaluationPageProps) {
  const [user, setUser] = useState(auth.currentUser);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [zipFileName, setZipFileName] = useState("");
  const [techStack, setTechStack] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Result State
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track loading steps to keep user engaged
  const loadingMessages = [
    "Uploading submission specs...",
    "Scanning project architecture and repository structural trees...",
    "Analyzing technological synergy & library version matrices...",
    "Simulating product scalability and caching protocols...",
    "Auditing security vulnerabilities and dependency routes...",
    "Measuring UI/UX alignment and responsive viewport ratios...",
    "Formulating scoring metrics and weighting parameters...",
    "Assembling recruiter synthesis & judge feedback scorecard..."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Auth synchronization & fetch history
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser.uid);
      } else {
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (userId: string) => {
    try {
      const q = query(collection(db, "evaluations"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const items: SavedEvaluation[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          projectId: data.projectId,
          projectTitle: data.projectTitle || "Untitled Project",
          techStack: data.techStack || "",
          createdAt: data.createdAt,
          evaluation: data.evaluation
        });
      });
      // Sort by latest
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistory(items);
    } catch (e) {
      console.error("Error loading history from Firestore:", e);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".zip")) {
        setZipFileName(file.name);
      } else {
        setError("Please upload a .zip file format.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".zip")) {
        setZipFileName(file.name);
      } else {
        setError("Please upload a .zip file format.");
      }
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !techStack.trim()) {
      setError("Please fill out all mandatory fields: Title, Description, and Tech Stack.");
      return;
    }

    setLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const response = await fetch("/api/mentor/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          githubUrl,
          demoVideoUrl,
          zipFileName: zipFileName || "project_source_code.zip",
          techStack,
          teamMembers
        })
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate project. Gemini service may be occupied.");
      }

      const evalData: EvaluationResult = await response.json();
      setEvaluation(evalData);

      // Save to Firebase Firestore if logged in
      if (user) {
        const projectId = "proj_" + Date.now();
        const evalId = "eval_" + Date.now();
        const nowStr = new Date().toISOString();

        // 1. Save to projects collection
        await setDoc(doc(db, "projects", projectId), {
          id: projectId,
          userId: user.uid,
          title,
          description,
          githubUrl,
          zipFileName: zipFileName || "project_source_code.zip",
          demoVideoUrl,
          techStack,
          teamMembers,
          createdAt: nowStr
        });

        // 2. Save to evaluations collection
        await setDoc(doc(db, "evaluations", evalId), {
          id: evalId,
          userId: user.uid,
          projectId,
          projectTitle: title,
          techStack,
          createdAt: nowStr,
          evaluation: evalData
        });

        // Refresh History
        await fetchHistory(user.uid);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during evaluation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#030014"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${(evaluation?.projectTitle || title || "Hackops_Evaluation").replace(/\s+/g, "_")}_Report.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not download the report. Try again or check the console logs.");
    }
  };

  const selectHistoryItem = (item: SavedEvaluation) => {
    setEvaluation(item.evaluation);
    setSelectedHistoryId(item.id);
    // Populate form so they see details
    setTitle(item.projectTitle);
    setTechStack(item.techStack);
    // Scroll to report smoothly
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleNewEvaluation = () => {
    setEvaluation(null);
    setSelectedHistoryId(null);
    setTitle("");
    setDescription("");
    setGithubUrl("");
    setDemoVideoUrl("");
    setZipFileName("");
    setTechStack("");
    setTeamMembers("");
  };

  // Format Recharts Radar Data
  const getRadarData = (evalObj: EvaluationResult | null) => {
    if (!evalObj || !evalObj.scores) return [];
    return [
      { subject: "Innovation", score: evalObj.scores.innovation || 80 },
      { subject: "Technical", score: evalObj.scores.technical || 80 },
      { subject: "UI/UX Design", score: evalObj.scores.uiux || 80 },
      { subject: "Code Quality", score: evalObj.scores.codeQuality || 80 },
      { subject: "Business Value", score: evalObj.scores.business || 80 },
      { subject: "Scalability", score: evalObj.scores.scalability || 80 },
      { subject: "Security", score: evalObj.scores.security || 80 },
      { subject: "Presentation", score: evalObj.scores.presentation || 80 },
      { subject: "Originality", score: evalObj.scores.originality || 80 },
      { subject: "Feasibility", score: evalObj.scores.feasibility || 80 }
    ];
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white pt-24 pb-20 px-4 md:px-8 selection:bg-brand-purple/30 selection:text-brand-cyan relative overflow-hidden font-sans">
      
      {/* Visual background grids & lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <button 
            onClick={onGoHome}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all cursor-pointer group text-sm w-fit bg-white/3 border border-white/5 py-2 px-4 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 border border-pink-500/35 rounded-xl text-pink-400">
              <FileCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-white via-slate-200 to-pink-400 bg-clip-text text-transparent">
                Project Evaluation Protocol
              </h1>
              <p className="text-xs text-slate-400 font-mono">SECURE SANDBOXED GRADING PROTOCOL</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form & History Sidebars */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Authenticated history checklist */}
            {user ? (
              <div className="glass-panel border border-brand-purple/20 p-5 rounded-2xl bg-[#090520]/80">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <h3 className="font-display font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-purple" />
                    Evaluation Log ({history.length})
                  </h3>
                  {evaluation && (
                    <button 
                      onClick={handleNewEvaluation}
                      className="text-[10px] font-semibold text-brand-cyan hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> New
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No logged evaluations. Submit details on the right to trigger the analysis engine.</p>
                ) : (
                  <div className="max-h-[220px] overflow-y-auto flex flex-col gap-2 scrollbar-thin pr-1">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectHistoryItem(item)}
                        className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-1 w-full cursor-pointer ${
                          selectedHistoryId === item.id 
                            ? "border-pink-500/40 bg-pink-500/10 text-white" 
                            : "border-white/5 bg-white/2 hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <span className="font-semibold truncate block">{item.projectTitle}</span>
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="truncate max-w-[120px] font-mono text-brand-cyan">{item.techStack}</span>
                          <span>Score: {item.evaluation.overallScore}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel border border-brand-purple/15 p-5 rounded-2xl bg-brand-purple/5 text-left">
                <h3 className="font-semibold text-xs text-brand-cyan flex items-center gap-2 mb-2">
                  <Lock className="w-3.5 h-3.5" /> Save Evaluation Logs
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Sign in to securely store your project evaluation history on Firestore database. Keep a permanent checklist of improvements!
                </p>
                <button 
                  onClick={onOpenLogin}
                  className="w-full py-1.5 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-[11px] text-white hover:bg-brand-purple/35 transition-all cursor-pointer font-bold"
                >
                  Authenticate Account
                </button>
              </div>
            )}

            {/* Quick Helper guidelines */}
            <div className="glass-panel border border-white/5 p-5 rounded-2xl bg-[#060318]/90 text-left text-xs text-slate-400 space-y-3.5">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-xs font-display uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Evaluation Matrix
              </h3>
              <p className="leading-relaxed text-[11px]">
                The HackOps AI judging engine performs multi-dimensional checks matching criteria used in elite international hackathons.
              </p>
              <ul className="space-y-2 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span><strong>Deep Tech Alignment:</strong> Grade scalability, database modeling, and framework selection.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span><strong>UX Flow Checklist:</strong> Verifies responsive layout integrity & design aesthetic balance.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-pink-400 font-bold">✓</span>
                  <span><strong>Pitch Strategy:</strong> Scores demo delivery and commercial feasibility value.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Submission Form Container */}
          <div className="lg:col-span-2">
            <div className="glass-panel border border-pink-500/20 rounded-3xl bg-[#09051d]/90 p-6 md:p-8 text-left shadow-[0_15px_40px_rgba(236,72,153,0.1)]">
              
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-pink-400" />
                    Project Submissions Core
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Prepare specifications for the Gemini evaluator matrix.</p>
                </div>
                {evaluation && (
                  <button
                    onClick={handleNewEvaluation}
                    className="py-1.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-all cursor-pointer font-semibold"
                  >
                    Reset Form
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Project Title <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., decentralized carbon-credit swap-ledger"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full glass-input py-2.5 px-3.5 rounded-xl text-xs text-white bg-white/2 border border-white/5 focus:border-pink-500/40 outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Project Description <span className="text-pink-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Explain the problem statement, code structure flow, MVP feature set, and what you successfully built during the hackathon."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full glass-input py-2.5 px-3.5 rounded-xl text-xs text-white bg-white/2 border border-white/5 focus:border-pink-500/40 outline-none transition-all resize-none"
                  />
                </div>

                {/* Repository URL & Demo Video URL Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/hacker/my-awesome-repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full glass-input py-2.5 px-3.5 rounded-xl text-xs text-white bg-white/2 border border-white/5 focus:border-pink-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-slate-400" />
                      Demo Video URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=demo"
                      value={demoVideoUrl}
                      onChange={(e) => setDemoVideoUrl(e.target.value)}
                      className="w-full glass-input py-2.5 px-3.5 rounded-xl text-xs text-white bg-white/2 border border-white/5 focus:border-pink-500/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* ZIP drag-and-drop & manual file upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Project Archive Source (.ZIP)
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? "border-pink-400 bg-pink-500/10" 
                        : zipFileName 
                        ? "border-emerald-400 bg-emerald-500/5" 
                        : "border-white/10 hover:border-white/20 bg-white/2"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${zipFileName ? "text-emerald-400" : "text-slate-400"}`} />
                    {zipFileName ? (
                      <div>
                        <p className="text-xs text-emerald-400 font-semibold truncate max-w-sm mx-auto">
                          ✓ File selected: {zipFileName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Click or drag another file to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-300 font-medium">
                          Drag and drop your project ZIP file here, or <span className="text-pink-400">browse file directory</span>
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">SUPPORTED FORMATS: .ZIP ONLY (MAX 50MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tech Stack & Team Members Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-slate-400" />
                      Tech Stack <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., React, Node, Express, Firebase"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      className="w-full glass-input py-2.5 px-3.5 rounded-xl text-xs text-white bg-white/2 border border-white/5 focus:border-pink-500/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Team Members
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Solo Developer or Alice (React), Bob (Backend)"
                      value={teamMembers}
                      onChange={(e) => setTeamMembers(e.target.value)}
                      className="w-full glass-input py-2.5 px-3.5 rounded-xl text-xs text-white bg-white/2 border border-white/5 focus:border-pink-500/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-brand-purple to-brand-blue hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] text-white font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Processing Evaluation Protocol...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                        <span>Evaluate My Project</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Engaging Dynamic Loader */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-xl border border-brand-purple/20 bg-brand-purple/5 flex items-start gap-3 text-left mt-4"
                    >
                      <div className="p-2 bg-pink-500/15 border border-pink-500/30 rounded-lg text-pink-400 shrink-0 mt-0.5">
                        <Cpu className="w-4 h-4 animate-spin text-pink-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                          Evaluation Server Status
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-1 font-mono transition-all duration-300">
                          {loadingMessages[loadingStep]}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>

        {/* Evaluation Report Display Area */}
        <AnimatePresence>
          {evaluation && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 100 }}
              className="mt-12"
              ref={reportRef}
            >
              <div className="glass-panel border-2 border-pink-500/30 rounded-3xl bg-[#040116] overflow-hidden p-6 md:p-10 shadow-[0_20px_60px_rgba(236,72,153,0.15)] relative">
                
                {/* PDF overlay title (not visible in web but clean in canvas) */}
                <div className="absolute top-4 right-4 z-20 flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-pink-500 text-white font-semibold text-xs hover:bg-pink-600 hover:shadow-[0_4px_15px_rgba(236,72,153,0.3)] transition-all cursor-pointer shadow-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF Report
                  </button>
                </div>

                {/* Report Content block */}
                <div className="text-left mt-6">
                  
                  {/* Title & Grading header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase bg-pink-500/15 text-pink-400 px-3 py-1 rounded-full border border-pink-500/20">
                        AI Evaluated Report
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight mt-3">
                        {evaluation.projectTitle || title}
                      </h2>
                      <div className="flex flex-wrap gap-2.5 mt-2.5">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-white/2 px-2.5 py-1 rounded-lg border border-white/5">
                          <Code className="w-3.5 h-3.5 text-brand-cyan" /> {techStack}
                        </span>
                        {teamMembers && (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-white/2 px-2.5 py-1 rounded-lg border border-white/5">
                            <Users className="w-3.5 h-3.5 text-brand-purple" /> {teamMembers}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Overall grade & winning prob widget */}
                    <div className="flex items-center gap-6">
                      
                      {/* Overall score indicator */}
                      <div className="text-center relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-brand-purple p-0.5 shadow-[0_0_20px_rgba(236,72,153,0.25)] flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-[#040116] flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-white font-display tracking-tight">
                              {evaluation.overallScore}
                            </span>
                            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">SCORE</span>
                          </div>
                        </div>
                      </div>

                      {/* Grade Badge */}
                      <div className="text-center">
                        <div className="text-4xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-brand-purple bg-clip-text font-display leading-none">
                          {evaluation.grade}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mt-1.5">FINAL GRADE</span>
                      </div>

                      {/* Winning probability gauge */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400 font-mono">
                          {evaluation.probability}%
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mt-1.5">WIN PROBABILITY</span>
                      </div>

                    </div>
                  </div>

                  {/* Core layout: Radar Chart & Score Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-10 border-b border-white/5">
                    
                    {/* Score Progress Indicators */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
                        Criteria Scorecard
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                        
                        {[
                          { label: "Innovation", val: evaluation.scores.innovation, desc: "Novelty & originality depth" },
                          { label: "Technical Complexity", val: evaluation.scores.technical, desc: "Algorithmic & design scale" },
                          { label: "UI / UX Design", val: evaluation.scores.uiux, desc: "Visual rhythm & typography" },
                          { label: "Code Quality", val: evaluation.scores.codeQuality, desc: "Linting, layout & structuring" },
                          { label: "Business Potential", val: evaluation.scores.business, desc: "Monetization & market fit" },
                          { label: "Scalability", val: evaluation.scores.scalability, desc: "Database & routing design" },
                          { label: "Security", val: evaluation.scores.security, desc: "Vulnerability defenses" },
                          { label: "Presentation", val: evaluation.scores.presentation, desc: "Demo & documentation pitch" },
                          { label: "Originality Score", val: evaluation.scores.originality, desc: "Uniqueness in sector" },
                          { label: "Feasibility / Impact", val: evaluation.scores.feasibility, desc: "Deployment & delivery state" }
                        ].map((scr, idx) => (
                          <div key={idx} className="bg-white/1 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5 hover:border-pink-500/20 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">{scr.label}</span>
                              <span className="font-mono font-bold text-brand-cyan">{scr.val}/100</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-pink-500 to-brand-cyan h-full rounded-full transition-all duration-1000"
                                style={{ width: `${scr.val}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium italic">{scr.desc}</span>
                          </div>
                        ))}

                      </div>
                    </div>

                    {/* Radar Chart Visualizer */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 bg-[#070420]/80 relative min-h-[320px]">
                      <div className="absolute top-4 left-4">
                        <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-brand-cyan" />
                          Evaluation Spectrum
                        </h3>
                      </div>
                      
                      <div className="w-full h-[280px] mt-6 select-none">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData(evaluation)}>
                            <PolarGrid stroke="#ffffff10" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 9 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 8 }} />
                            <Radar
                              name="Project Scores"
                              dataKey="score"
                              stroke="#ec4899"
                              fill="#ec4899"
                              fillOpacity={0.35}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Judge's detailed feedback section */}
                  <div className="py-8 border-b border-white/5">
                    <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pink-400" />
                      Judge Feedback Synthesis
                    </h3>
                    <div className="p-5 rounded-2xl border border-brand-purple/20 bg-brand-purple/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 text-pink-500/10 pointer-events-none">
                        <Sparkles className="w-16 h-16" />
                      </div>
                      <p className="text-xs md:text-sm text-slate-200 leading-relaxed italic font-medium">
                        "{evaluation.feedback}"
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-white/5">
                    
                    {/* Strengths */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                        Project Strengths
                      </h4>
                      <div className="space-y-2 text-xs">
                        {evaluation.strengths.map((str, i) => (
                          <div key={i} className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-slate-300 flex items-start gap-2.5 leading-relaxed">
                            <span className="text-emerald-400 font-bold font-mono">✓</span>
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400 inline-block animate-pulse"></span>
                        Identified Vulnerabilities / Limitations
                      </h4>
                      <div className="space-y-2 text-xs">
                        {evaluation.weaknesses.map((wk, i) => (
                          <div key={i} className="p-3.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-slate-300 flex items-start gap-2.5 leading-relaxed">
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{wk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Step-by-Step improvements Checklist */}
                  <div className="py-8 border-b border-white/5 text-left">
                    <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-brand-cyan" />
                      Step-by-step Technical Improvement Backlog
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {evaluation.improvements.map((imp, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-white/5 bg-white/2 hover:border-pink-500/10 transition-all flex items-start gap-3">
                          <div className="p-1.5 bg-pink-500/15 border border-pink-500/30 rounded-lg text-pink-400 shrink-0">
                            <CheckCircle className="w-3.5 h-3.5 text-pink-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block mb-0.5">Recommendation #{idx + 1}</span>
                            <p className="text-slate-300 leading-relaxed">{imp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recruiter Summary box */}
                  <div className="pt-8">
                    <div className="p-5 rounded-2xl bg-[#08051a] border border-pink-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          RECRUITER SYNTHESIS & INSIGHTS
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed mt-2.5 font-mono max-w-2xl">
                          "{evaluation.recruiterInsight}"
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/25 shrink-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[8px] font-mono text-slate-400">READY FOR EXPORT</span>
                        <span className="text-[10px] font-bold text-white mt-1">LinkedIn CV Synced</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
