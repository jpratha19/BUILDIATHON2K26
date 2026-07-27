import { useState, useEffect } from "react";
import { Sparkles, Calendar, Award, Send } from "lucide-react";

interface CTAProps {
  onRegisterClick: () => void;
}

export default function CTA({ onRegisterClick }: CTAProps) {
  // Setup standard countdown: 2 days, 14 hours, 32 minutes, 5 seconds from initial rendering
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 5,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format single digits
  const formatTime = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <section id="cta" className="relative py-28 bg-[#030014] overflow-hidden">
      {/* Background massive glowing aura */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-brand-purple/20 glow-blur animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-brand-cyan/15 glow-blur animate-pulse-slow-reverse"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="rounded-3xl glass-panel border border-brand-purple/30 bg-[#0d092c]/40 p-8 md:p-16 text-center shadow-[0_0_50px_rgba(124,58,237,0.25)] relative overflow-hidden group">
          {/* Subtle background overlay grids */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-6 animate-bounce-subtle">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
            <span>Registration Closes Soon</span>
          </div>

          {/* Heading */}
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-6 max-w-2xl mx-auto leading-tight">
            Join the Next Generation of
            <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent mt-1 pb-1">
              AI Hackathon Pioneers
            </span>
          </h2>

          <p className="font-sans text-slate-300 md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Ready to match with global engineers, receive live AI debugging assists, and pitch your high-performance prototypes to top VCs? Secure your ticket now.
          </p>

          {/* Live Countdown Timer */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-10">
            {[
              { label: "Days", val: timeLeft.days },
              { label: "Hours", val: timeLeft.hours },
              { label: "Mins", val: timeLeft.minutes },
              { label: "Secs", val: timeLeft.seconds },
            ].map((unit, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl glass-panel border border-white/10 flex items-center justify-center text-xl md:text-3xl font-display font-black text-white font-mono shadow-inner relative overflow-hidden bg-[#05021c]">
                  {/* Subtle split overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2 border-b border-white/5"></div>
                  <span>{formatTime(unit.val)}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-semibold mt-2">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-semibold text-base shadow-[0_4px_30px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_40px_rgba(124,58,237,0.6)] active:scale-[0.98] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Claim Your Free Pass
            </button>
            <button
              onClick={() => alert("Connecting with discord ecosystem coordinators...")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-white/10 text-slate-200 hover:text-white hover:bg-white/5 font-semibold text-base active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-brand-cyan" />
              Join Discord Lounge
            </button>
          </div>

          {/* Quick Dates */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-cyan" />
              <span>Starts: September 18, 2026</span>
            </div>
            <div className="hidden sm:block h-1.5 w-1.5 rounded-full bg-white/20"></div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-purple" />
              <span>Grand Finale: September 21, 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
