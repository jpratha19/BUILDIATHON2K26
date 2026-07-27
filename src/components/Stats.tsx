import { Users, Award, Trophy, Globe, Briefcase } from "lucide-react";

export default function Stats() {
  const statsList = [
    {
      id: "stat-participants",
      label: "Participants Active",
      value: "15,000+",
      icon: Users,
      color: "from-brand-purple to-pink-500",
      description: "Global builders scaling solutions",
    },
    {
      id: "stat-teams",
      label: "Collaborative Teams",
      value: "3,200+",
      icon: Globe,
      color: "from-brand-blue to-brand-cyan",
      description: "Assembled cross-border alliances",
    },
    {
      id: "stat-mentors",
      label: "AI Technical Mentorship",
      value: "24/7",
      icon: Briefcase,
      color: "from-emerald-400 to-teal-500",
      description: "A Free AI Chatbot Available",
    },
    {
      id: "stat-sponsors",
      label: "Venture Partners",
      value: "80+",
      icon: Award,
      color: "from-amber-400 to-orange-500",
      description: "Top-tier AI tech providers & VCs",
    },
    {
      id: "stat-prizepool",
      label: "Global Prize Pool",
      value: "₹500,000",
      icon: Trophy,
      color: "from-brand-purple to-brand-cyan",
      description: "In grants, API credits & VC funding",
    },
  ];

  return (
    <section id="stats" className="relative py-12 md:py-20 bg-[#030014] overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {statsList.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                id={stat.id}
                className="relative group rounded-2xl glass-panel p-6 border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-[0_4px_30px_rgba(124,58,237,0.1)] hover:-translate-y-1 flex flex-col items-start text-left"
              >
                {/* Accent glow on hover */}
                <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-brand-purple/10 glow-blur group-hover:scale-150 transition-transform duration-500"></div>

                {/* Animated colored bar at the top */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`}></div>

                {/* Icon Wrapper */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-4 text-slate-300 group-hover:text-white transition-all group-hover:scale-110">
                  <Icon className="w-5 h-5 text-brand-cyan" />
                </div>

                {/* Stat value */}
                <div className="text-3xl font-display font-extrabold text-white tracking-tight mb-1">
                  {stat.value}
                </div>

                {/* Stat label */}
                <div className="text-sm font-semibold text-slate-200 mb-2">
                  {stat.label}
                </div>

                {/* Stat Description */}
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
