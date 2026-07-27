import { Sparkles, Building2, ExternalLink } from "lucide-react";

interface Sponsor {
  name: string;
  category: "Gold" | "Platinum" | "AI Cloud Provider";
  logoText: string;
  desc: string;
  color: string;
}

export default function Sponsors() {
  const sponsorsList: Sponsor[] = [
    {
      name: "Google Cloud",
      category: "AI Cloud Provider",
      logoText: "Google Cloud",
      desc: "Providing $100K in vertex API credits",
      color: "from-blue-500 via-red-500 to-yellow-500"
    },
    {
      name: "OpenAI",
      category: "Platinum",
      logoText: "OpenAI",
      desc: "Access to advanced multimodal models",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      name: "Vercel",
      category: "Gold",
      logoText: "Vercel",
      desc: "Speedy edge deployment pipeline servers",
      color: "from-white to-slate-400"
    },
    {
      name: "Supabase",
      category: "Gold",
      logoText: "Supabase",
      desc: "Providing database backend solutions",
      color: "from-brand-cyan to-brand-blue"
    },
    {
      name: "Hugging Face",
      category: "Platinum",
      logoText: "Hugging Face",
      desc: "Access to 500k+ models & weights",
      color: "from-yellow-400 to-orange-500"
    },
    {
      name: "Pinecone",
      category: "Gold",
      logoText: "Pinecone",
      desc: "Supplying real-time vector databases",
      color: "from-brand-purple to-indigo-500"
    }
  ];

  return (
    <section id="sponsors" className="relative py-24 bg-[#030014] overflow-hidden">
      {/* Background visual lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Ecosystem Alliance</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight mb-4">
            Backed by Industry
            <span className="block bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent font-extrabold mt-1">
              AI Pioneers
            </span>
          </h2>
          <p className="font-sans text-slate-300">
            Hackers gain direct integration assistance, credits, and mentorship from core development engineers at top companies.
          </p>
        </div>

        {/* Sponsors Logo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsorsList.map((sponsor, index) => {
            return (
              <div
                key={index}
                className="relative group rounded-2xl glass-panel p-6 border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-[0_8px_35px_rgba(124,58,237,0.15)] hover:-translate-y-1 text-left flex flex-col justify-between"
              >
                {/* Accent Hover Gradient Cover */}
                <div className="absolute -inset-px bg-gradient-to-tr from-brand-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

                <div>
                  {/* Category Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase bg-white/5 border border-white/5 px-2.5 py-1 rounded">
                      {sponsor.category}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-all" />
                  </div>

                  {/* Logo Display */}
                  <div className="h-12 flex items-center mb-4">
                    <span className={`text-2xl font-display font-extrabold bg-gradient-to-r ${sponsor.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                      {sponsor.logoText}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="h-[1px] bg-white/10 my-3"></div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {sponsor.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Pitch Invitation for Sponsors */}
        <div className="mt-12 p-6 rounded-2xl bg-brand-purple/5 border border-brand-purple/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-brand-purple/15 border border-brand-purple/35 rounded-xl text-brand-cyan">
              <Sparkles className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Want to Sponsor HackOps AI?</h4>
              <p className="text-xs text-slate-400 mt-0.5">Recruit premium tech talent and showcase your API frameworks to 15,000+ engineers.</p>
            </div>
          </div>
          <button
            onClick={() => alert("Sponsor brochure pipeline initialized! Connecting with sponsorship desk...")}
            className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Become a Sponsor
          </button>
        </div>
      </div>
    </section>
  );
}
