import React, { useState } from "react";
import { Award, GraduationCap, Clock, MessageSquare, BookOpen, CheckCircle, HelpCircle, X } from "lucide-react";
import { Mentor, FirestoreUser } from "../../types/networking";
import { motion, AnimatePresence } from "motion/react";

interface MentorCornerProps {
  currentUser: FirestoreUser | null;
  mentors: Mentor[];
  onAskQuestion: (mentorId: string, question: string) => void;
  onBookSession: (mentorId: string, topic: string, timeSlot: string) => void;
  onOpenLogin: () => void;
}

export default function MentorCorner({
  currentUser,
  mentors,
  onAskQuestion,
  onBookSession,
  onOpenLogin
}: MentorCornerProps) {
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (activeMentor && question.trim()) {
      onAskQuestion(activeMentor.id, question);
      setQuestion("");
      setIsQuestionModalOpen(false);
      setSuccessMessage(`Your question has been securely transmitted to ${activeMentor.name}. Expect a notification response shortly!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (activeMentor && topic.trim() && timeSlot.trim()) {
      onBookSession(activeMentor.id, topic, timeSlot);
      setTopic("");
      setTimeSlot("");
      setIsSessionModalOpen(false);
      setSuccessMessage(`Session successfully booked with ${activeMentor.name} for ${timeSlot}. Check your notification panel for invitation credentials.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro Hub */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c082c] to-[#040118] flex items-center gap-4">
        <div className="p-3.5 bg-brand-purple/20 border border-brand-purple/40 text-brand-cyan rounded-2xl">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">24/7 Hacker Mentor Corner</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Book rapid 1-on-1 architecture checks, submit bug-squashing queries, or connect with expert researchers across AI, Cloud, Systems, and Frontend domains.
          </p>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <motion.div
            key={mentor.id}
            whileHover={{ y: -4 }}
            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-brand-purple/40 hover:shadow-[0_4px_25px_rgba(124,58,237,0.15)] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{mentor.name}</h4>
                  <p className="text-[10px] text-slate-400">{mentor.college}</p>
                  <span className="inline-block text-[9px] font-mono text-brand-cyan mt-1 px-1.5 py-0.2 rounded bg-brand-cyan/10 border border-brand-cyan/20">
                    {mentor.specialty}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4 min-h-[48px]">
                {mentor.bio}
              </p>

              <div className="space-y-1 mb-4">
                <span className="text-[10px] text-slate-500 font-mono">Expertise Domain</span>
                <div className="flex flex-wrap gap-1">
                  {mentor.skills.map((skill, index) => (
                    <span key={index} className="text-[9px] font-mono bg-white/5 text-slate-300 px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Instant Actions */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4 mt-2">
              <button
                onClick={() => {
                  if (!currentUser) {
                    onOpenLogin();
                  } else {
                    setActiveMentor(mentor);
                    setIsQuestionModalOpen(true);
                  }
                }}
                className="py-2.5 rounded-xl bg-brand-purple/15 hover:bg-brand-purple/30 border border-brand-purple/40 text-brand-cyan text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Ask Help
              </button>
              <button
                onClick={() => {
                  if (!currentUser) {
                    onOpenLogin();
                  } else {
                    setActiveMentor(mentor);
                    setIsSessionModalOpen(true);
                  }
                }}
                className="py-2.5 rounded-xl bg-brand-cyan text-slate-950 text-xs font-extrabold hover:bg-white hover:scale-105 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                Book Session
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal 1: Ask Help / Question */}
      <AnimatePresence>
        {isQuestionModalOpen && activeMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 bg-[#040118]/95 text-left"
            >
              <button
                onClick={() => {
                  setIsQuestionModalOpen(false);
                  setActiveMentor(null);
                }}
                className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-brand-purple animate-pulse" />
                Ask Mentor Question
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Submit your bug or architectural question to <span className="text-brand-cyan font-bold">{activeMentor.name}</span>.
              </p>

              <form onSubmit={handleAskSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    What are you struggling with? (Specify details/errors)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. My vector index queries are throwing out of bounds exception in Milvus when we parallelize queries..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-[#07041a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuestionModalOpen(false);
                      setActiveMentor(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-cyan text-slate-950 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    Transmit Query
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Book Session */}
      <AnimatePresence>
        {isSessionModalOpen && activeMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 bg-[#040118]/95 text-left"
            >
              <button
                onClick={() => {
                  setIsSessionModalOpen(false);
                  setActiveMentor(null);
                }}
                className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-brand-cyan animate-pulse" />
                Book 1-on-1 Mentorship Session
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Schedule a 15-minute screen share review session with <span className="text-brand-cyan font-bold">{activeMentor.name}</span>.
              </p>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Session Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pitch presentation review / Database indexing schema review"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Choose Available Time Slot
                  </label>
                  <select
                    required
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                  >
                    <option value="">Select a time slot...</option>
                    <option value="Today, 7:00 PM - 7:15 PM UTC">Today, 7:00 PM - 7:15 PM UTC</option>
                    <option value="Today, 8:30 PM - 8:45 PM UTC">Today, 8:30 PM - 8:45 PM UTC</option>
                    <option value="Tomorrow, 2:00 PM - 2:15 PM UTC">Tomorrow, 2:00 PM - 2:15 PM UTC</option>
                    <option value="Tomorrow, 4:45 PM - 5:00 PM UTC">Tomorrow, 4:45 PM - 5:00 PM UTC</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSessionModalOpen(false);
                      setActiveMentor(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-cyan text-slate-950 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    Confirm Session
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
