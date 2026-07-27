import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "What makes HackOps AI different from other hackathon platforms?",
      answer: "HackOps AI is the world's first AI-native hackathon ecosystem. Unlike legacy platforms where you coordinate teams manually and suffer subjective judging, HackOps automates your experience. We utilize neural team matchmaking, provide a 24/7 AI Coding Mentor for immediate assistance, and execute unbiased, automated AI technical evaluations that audit code quality, UX polish, and functional MVP depth.",
    },
    {
      question: "Who is eligible to register and participate in the hackathons?",
      answer: "Anyone! Whether you are a veteran machine learning researcher, an undergraduate computer science student, an experienced product manager, or a self-taught frontend designer, you are welcome. HackOps hosts tracks ranging from beginner-friendly AI prompt challenges to advanced decentralized protocol integrations.",
    },
    {
      question: "What is the team size limit for submission?",
      answer: "Teams can consist of 1 to 5 members. If you enter solo, our interactive AI Synergy Matchmaker can analyze your project interests and match you with developers or designers who perfectly complement your tech stack in seconds.",
    },
    {
      question: "Is there any cost associated with registration?",
      answer: "No, HackOps AI is 100% free for all hackers. Thanks to our elite sponsors and VC networks, we provide zero-cost access, $1,000+ API credits, and global server hosting setups for all validated teams.",
    },
    {
      question: "How does the AI Evaluator grade our projects fairly?",
      answer: "The AI Evaluator doesn't just read summaries. It compiles your code, tests execution routines, checks for vulnerability hazards, and uses vision models to inspect UI design fidelity against your design files. Every project receives a highly granular, multi-page feedback scorecard detailing Innovation, Feasibility, and impact, ensuring equal, unbiased grading.",
    },
    {
      question: "Can we recruit or raise venture investment directly on the platform?",
      answer: "Absolutely. Top-tier venture capital firms and AI labs have direct access to our Recruiter Radar Dashboard. They actively watch live code push activity during the weekend and schedule pitches with high-scoring teams immediately after submissions close.",
    }
  ];

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section id="faq" className="relative py-24 bg-[#030014] overflow-hidden">
      {/* Background divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-brand-purple" />
            <span>Information Desk</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight mb-4">
            Frequently Asked
            <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent font-extrabold mt-1">
              Queries
            </span>
          </h2>
          <p className="font-sans text-slate-300">
            Got questions? We've got answers. Explore our detailed resources or connect with support in our Discord lobby.
          </p>
        </div>

        {/* Accordion Layout */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 text-left overflow-hidden ${
                  isOpen
                    ? "glass-panel border-brand-purple/40 bg-[#0d092c]/40"
                    : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                }`}
              >
                {/* Header question button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-display font-bold text-sm md:text-base text-white hover:text-brand-cyan transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brand-purple">0{index + 1}</span>
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-brand-cyan shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Answer body with transition height effect */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-60 border-t border-white/5 opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <p className="px-6 py-5 font-sans text-sm text-slate-300 leading-relaxed bg-[#020010]/50">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
