import React, { useState } from "react";
import { Search, Filter, Github, Linkedin, UserPlus, Send, ExternalLink, ChevronRight, MapPin, X, Star, Calendar } from "lucide-react";
import { FirestoreUser } from "../../types/networking";
import { motion, AnimatePresence } from "motion/react";

interface ParticipantDirectoryProps {
  users: FirestoreUser[];
  currentUserId: string | null;
  connections: any[];
  teamInvites: any[];
  onConnect: (targetUserId: string) => void;
  onInviteToTeam: (targetUserId: string, message: string) => void;
  onOpenLogin: () => void;
}

export default function ParticipantDirectory({
  users,
  currentUserId,
  connections,
  teamInvites,
  onConnect,
  onInviteToTeam,
  onOpenLogin
}: ParticipantDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [targetInviteUser, setTargetInviteUser] = useState<FirestoreUser | null>(null);

  // List of filterable skills categories from prompt
  const filterSkills = [
    "All",
    "AI / ML",
    "Web Development",
    "App Development",
    "Cyber Security",
    "Blockchain",
    "Cloud Computing",
    "UI/UX"
  ];

  const handleOpenInvite = (user: FirestoreUser) => {
    if (!currentUserId) {
      onOpenLogin();
      return;
    }
    setTargetInviteUser(user);
    setInviteMessage(`Hey ${user.name}! I love your profile and skills. Let's form a team together for the HackOps AI Hackathon!`);
    setIsInviteModalOpen(true);
  };

  const handleSendInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetInviteUser && inviteMessage.trim()) {
      onInviteToTeam(targetInviteUser.uid, inviteMessage);
      setIsInviteModalOpen(false);
      setTargetInviteUser(null);
    }
  };

  // Helper to check connection status
  const getConnectionStatus = (userId: string) => {
    if (!currentUserId) return "none";
    const conn = connections.find(
      (c) =>
        (c.userIds.includes(currentUserId) && c.userIds.includes(userId))
    );
    if (!conn) return "none";
    return conn.status; // 'pending' or 'accepted'
  };

  // Helper to check if invited to team
  const isTeamInvited = (userId: string) => {
    if (!currentUserId) return false;
    return teamInvites.some(
      (invite) =>
        invite.senderId === currentUserId &&
        invite.receiverId === userId &&
        invite.status === "pending"
    );
  };

  // Match tags with broad categories
  const skillMatchesCategory = (skills: string[] | undefined, techStack: string | undefined, category: string) => {
    if (category === "All") return true;
    const allText = ((skills || []).join(" ") + " " + (techStack || "")).toLowerCase();
    
    if (category === "AI / ML") {
      return allText.includes("ai") || allText.includes("ml") || allText.includes("pytorch") || allText.includes("tensor") || allText.includes("model") || allText.includes("hugging") || allText.includes("langchain") || allText.includes("openai");
    }
    if (category === "Web Development") {
      return allText.includes("web") || allText.includes("react") || allText.includes("vue") || allText.includes("next.js") || allText.includes("node") || allText.includes("html") || allText.includes("css") || allText.includes("tailwind");
    }
    if (category === "App Development") {
      return allText.includes("app") || allText.includes("flutter") || allText.includes("react native") || allText.includes("android") || allText.includes("ios") || allText.includes("swift");
    }
    if (category === "Cyber Security") {
      return allText.includes("cyber") || allText.includes("security") || allText.includes("pentest") || allText.includes("cryptography") || allText.includes("shield");
    }
    if (category === "Blockchain") {
      return allText.includes("blockchain") || allText.includes("solidity") || allText.includes("web3") || allText.includes("rust") || allText.includes("ethereum") || allText.includes("smart contract");
    }
    if (category === "Cloud Computing") {
      return allText.includes("cloud") || allText.includes("aws") || allText.includes("gcp") || allText.includes("kubernetes") || allText.includes("docker") || allText.includes("devops");
    }
    if (category === "UI/UX") {
      return allText.includes("ui") || allText.includes("ux") || allText.includes("design") || allText.includes("figma") || allText.includes("adobe") || allText.includes("wireframe");
    }
    return false;
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    // Exclude current user from directory to make finding others easier
    if (u.uid === currentUserId) return false;

    const nameMatch = u.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const collegeMatch = u.college?.toLowerCase().includes(searchQuery.toLowerCase());
    const skillSearchMatch = (u.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) || u.techStack?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSearch = nameMatch || collegeMatch || skillSearchMatch;

    const matchesRole = selectedRole === "All" || u.preferredRole === selectedRole;
    const matchesExperience = selectedExperience === "All" || u.experienceLevel === selectedExperience;
    const matchesStatus = selectedStatus === "All" || u.teamStatus === selectedStatus;
    const matchesSkillCategory = skillMatchesCategory(u.skills, u.techStack, selectedSkillFilter);

    return matchesSearch && matchesRole && matchesExperience && matchesStatus && matchesSkillCategory;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Search and Filters Hub */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        {/* Search Field */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search hackers by name, college, skills, or programming languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#07041a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Skill / Field Category */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Field of Interest
            </label>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="w-full bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
            >
              {filterSkills.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Role */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Preferred Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
            >
              <option value="All">All Roles</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="AI/ML">AI/ML</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Blockchain">Blockchain</option>
              <option value="Cloud">Cloud</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Fullstack">Fullstack</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Experience Level
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Team Status */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Team Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
            >
              <option value="All">All Statuses</option>
              <option value="Looking for Team">Looking for Team</option>
              <option value="Already in Team">Already in Team</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Participant Cards */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 text-slate-500">
          <p className="text-sm font-mono">No matching participant profiles found in directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const connStatus = getConnectionStatus(user.uid);
            const isInvited = isTeamInvited(user.uid);

            return (
              <motion.div
                key={user.uid}
                layout
                className="relative flex flex-col justify-between rounded-2xl glass-panel p-5 border border-white/10 hover:border-brand-purple/40 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all group"
              >
                <div>
                  {/* Card Header Profile Details */}
                  <div className="flex items-start gap-3">
                    <img
                      src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/15"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-cyan transition-colors">
                        {user.name}
                      </h4>
                      {user.college && (
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          {user.college}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-purple/15 text-brand-cyan border border-brand-purple/20">
                          {user.preferredRole}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          {user.experienceLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Status Glow */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-b border-white/5 py-1.5 my-3">
                    <span className="text-[10px] text-slate-500 font-mono">Team Status</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        user.teamStatus === "Looking for Team"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {user.teamStatus}
                    </span>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">Skills Tags</span>
                    <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-hidden">
                      {(user.skills || []).slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="text-[9px] font-mono bg-[#0c082c] border border-white/5 text-slate-300 px-1.5 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {(user.skills || []).length > 5 && (
                        <span className="text-[9px] font-mono text-slate-500 bg-[#0c082c] px-1 px-1 py-0.5 rounded">
                          +{user.skills!.length - 5}
                        </span>
                      )}
                      {(user.skills || []).length === 0 && (
                        <span className="text-[9px] font-mono text-slate-600">None declared</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Drawer Buttons */}
                <div className="mt-5 pt-3 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {/* GitHub Link */}
                    {user.github ? (
                      <a
                        href={user.github.startsWith("http") ? user.github : `https://github.com/${user.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-slate-400 flex items-center justify-center flex-1"
                        title="GitHub Profile"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-600 flex items-center justify-center flex-1 cursor-not-allowed"
                        title="No GitHub declared"
                      >
                        <Github className="w-4 h-4 opacity-30" />
                      </button>
                    )}

                    {/* LinkedIn Link */}
                    {user.linkedin ? (
                      <a
                        href={user.linkedin.startsWith("http") ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-slate-400 flex items-center justify-center flex-1"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-600 flex items-center justify-center flex-1 cursor-not-allowed"
                        title="No LinkedIn declared"
                      >
                        <Linkedin className="w-4 h-4 opacity-30" />
                      </button>
                    )}

                    {/* View Profile */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1.5 text-[10px] font-semibold rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Full Profile
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Connect and Invite Actions Row */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {/* Connection Button */}
                    {connStatus === "accepted" ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        Connected
                      </button>
                    ) : connStatus === "pending" ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-[#0d0a27] border border-white/5 text-slate-400 font-semibold text-[11px] cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        Request Sent
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUserId) {
                            onOpenLogin();
                          } else {
                            onConnect(user.uid);
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/35 border border-brand-purple/40 text-brand-cyan font-bold text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Connect
                      </button>
                    )}

                    {/* Team Invitation Button */}
                    {isInvited ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-[#0d0a27] border border-white/5 text-slate-500 font-semibold text-[11px] cursor-not-allowed"
                      >
                        Invited
                      </button>
                    ) : user.teamStatus === "Already in Team" ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-800/10 border border-white/5 text-slate-500 font-medium text-[11px] cursor-not-allowed"
                        title="Hacker is already on a team"
                      >
                        In Team
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenInvite(user)}
                        className="w-full py-2 rounded-xl bg-brand-cyan text-slate-950 font-bold text-[11px] hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        Invite
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 1. Modal: View Full Profile */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/10 p-6 md:p-8 bg-[#040118]/95 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 text-left items-start">
                <img
                  src={selectedUser.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-brand-purple"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest bg-brand-purple/20 px-2.5 py-0.5 rounded-full border border-brand-purple/35">
                      {selectedUser.preferredRole}
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-2">{selectedUser.name}</h3>
                    {selectedUser.college && (
                      <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-purple" />
                        {selectedUser.college} {selectedUser.year ? `• ${selectedUser.year}` : ""}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 rounded-2xl p-4">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Availability</span>
                      <span className="text-sm font-semibold text-white">{selectedUser.availability || "Not declared"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Experience Level</span>
                      <span className="text-sm font-semibold text-white">{selectedUser.experienceLevel || "Intermediate"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Team Status</span>
                      <span className="text-sm font-semibold text-emerald-400">{selectedUser.teamStatus}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Email Profile</span>
                      <span className="text-sm font-semibold text-slate-300 truncate block">{selectedUser.email}</span>
                    </div>
                  </div>

                  {selectedUser.techStack && (
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Tech Stack</span>
                      <p className="text-sm text-slate-200 bg-white/5 border border-white/5 rounded-xl px-3 py-2 leading-relaxed">
                        {selectedUser.techStack}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Skills Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {(selectedUser.skills || []).map((skill, index) => (
                        <span key={index} className="text-xs px-2.5 py-1 rounded bg-brand-purple/10 border border-brand-purple/20 text-slate-200">
                          {skill}
                        </span>
                      ))}
                      {(selectedUser.skills || []).length === 0 && (
                        <span className="text-xs text-slate-600 font-mono">No skill tags selected.</span>
                      )}
                    </div>
                  </div>

                  {/* Social Buttons Drawer */}
                  <div className="flex gap-4 border-t border-white/5 pt-4">
                    {selectedUser.github && (
                      <a
                        href={selectedUser.github.startsWith("http") ? selectedUser.github : `https://github.com/${selectedUser.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        <Github className="w-4 h-4 text-slate-300" />
                        GitHub
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {selectedUser.linkedin && (
                      <a
                        href={selectedUser.linkedin.startsWith("http") ? selectedUser.linkedin : `https://linkedin.com/in/${selectedUser.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        <Linkedin className="w-4 h-4 text-slate-300" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: Team Invitation Sender */}
      <AnimatePresence>
        {isInviteModalOpen && targetInviteUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 bg-[#040118]/95 text-left"
            >
              <button
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setTargetInviteUser(null);
                }}
                className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-brand-cyan animate-pulse" />
                Invite to Hackathon Team
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Send a personalized invitation to <span className="text-brand-cyan font-bold">{targetInviteUser.name}</span>. They will be notified immediately.
              </p>

              <form onSubmit={handleSendInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Invitation Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full bg-[#07041a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setTargetInviteUser(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-cyan text-slate-950 text-xs font-extrabold shadow-[0_4px_15px_rgba(34,211,238,0.25)] hover:shadow-[0_4px_25px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Invite
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
