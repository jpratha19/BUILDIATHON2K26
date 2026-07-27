import { Star, MessageSquareQuote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatarText: string;
  quote: string;
  rating: number;
  trackWon: string;
}

export default function Testimonials() {
  const reviews: Testimonial[] = [
    {
      name: "Sarah Jenkins",
      role: "Lead Machine Learning Architect",
      company: "CognitiveAI Labs",
      avatarText: "SJ",
      quote: "The AI Team Matchmaker was unbelievably accurate. I was matched with an expert UI designer and an smart contract developer under 5 minutes. We went on to secure the $15K Grand Prize in the Autonomous Agents track!",
      rating: 5,
      trackWon: "🏆 Winner: Autonomous Agents"
    },
    {
      name: "Kenji Takahashi",
      role: "Founder & Full-Stack Engineer",
      company: "NeuroSync Systems",
      avatarText: "KT",
      quote: "As a solo developer, HackOps's 24/7 AI Mentor was my co-pilot. Whenever I ran into complex CUDA or memory buffer issues at 3 AM, it provided optimized debug snippets immediately. Our prototype was acquired by a sponsor VC!",
      rating: 5,
      trackWon: "🚀 Acquired by Sponsor VC"
    },
    {
      name: "Amara Okoye",
      role: "Graduate Student & ML Contributor",
      company: "MIT AI Initiative",
      avatarText: "AO",
      quote: "The objective, automated AI evaluations are a massive game-changer. You get real, transparent scores and actionable technical feedback within minutes of submitting your project. Extremely refreshing compared to old, biased panels.",
      rating: 5,
      trackWon: "🎖️ Top 10 • Smart Healthcare"
    }
  ];

  return (
    <section id="testimonials" className="relative py-24 bg-[#030014] overflow-hidden">
      {/* Background glow layers */}
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-purple/10 glow-blur"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-cyan/10 glow-blur"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
            <MessageSquareQuote className="w-3.5 h-3.5 text-brand-purple" />
            <span>Builder Reviews</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight mb-4">
            Validated by Global
            <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent font-extrabold mt-1">
              Top-Tier Innovators
            </span>
          </h2>
          <p className="font-sans text-slate-300">
            Read how developers, student engineers, and founders utilize HackOps AI to accelerate project MVPs into real startup venture investments.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => {
            return (
              <div
                key={index}
                className="relative group rounded-3xl glass-panel p-8 border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-[0_10px_40px_rgba(124,58,237,0.15)] hover:-translate-y-1 text-left flex flex-col justify-between"
              >
                {/* Visual quote indicator ornament */}
                <div className="absolute right-6 top-6 text-white/5 group-hover:text-brand-purple/10 transition-colors pointer-events-none">
                  <span className="font-display font-extrabold text-9xl leading-none">”</span>
                </div>

                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 italic relative z-10">
                    "{review.quote}"
                  </p>
                </div>

                <div>
                  {/* Divider line */}
                  <div className="h-[1px] bg-white/10 my-4"></div>

                  {/* Profile Layout */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center font-bold text-slate-950 text-xs">
                      {review.avatarText}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{review.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{review.role}, <span className="text-brand-cyan font-semibold">{review.company}</span></p>
                    </div>
                  </div>

                  {/* Track Achievement pill */}
                  <div className="mt-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-slate-300 font-mono w-fit">
                    {review.trackWon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
