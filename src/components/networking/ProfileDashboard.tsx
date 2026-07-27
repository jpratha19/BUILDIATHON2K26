import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, School, Calendar, Github, Linkedin, Save, Sparkles, AlertCircle, CheckCircle, Flame } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { FirestoreUser, PRESET_AVATARS, PRESET_ROLES, PRESET_SKILLS } from "../../types/networking";
import { motion } from "motion/react";

interface ProfileDashboardProps {
  currentUser: FirestoreUser | null;
  onProfileUpdated: () => void;
}

export default function ProfileDashboard({ currentUser, onProfileUpdated }: ProfileDashboardProps) {
  const [name, setName] = useState(currentUser?.name || "");
  const [college, setCollege] = useState(currentUser?.college || "");
  const [year, setYear] = useState(currentUser?.year || "");
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || PRESET_AVATARS[0]);
  const [preferredRole, setPreferredRole] = useState(currentUser?.preferredRole || "Fullstack");
  const [techStack, setTechStack] = useState(currentUser?.techStack || "");
  const [experienceLevel, setExperienceLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(
    currentUser?.experienceLevel || "Intermediate"
  );
  const [github, setGithub] = useState(currentUser?.github || "");
  const [linkedin, setLinkedin] = useState(currentUser?.linkedin || "");
  const [teamStatus, setTeamStatus] = useState<"Looking for Team" | "Already in Team">(
    currentUser?.teamStatus || "Looking for Team"
  );
  const [availability, setAvailability] = useState(currentUser?.availability || "Full Time");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentUser?.skills || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      setErrorMsg("You must be logged in to update your profile.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Full Name is required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const updatedData = {
      uid: currentUser.uid,
      email: currentUser.email,
      name: name.trim(),
      college: college.trim(),
      year: year.trim(),
      profileImage,
      preferredRole,
      techStack: techStack.trim(),
      experienceLevel,
      github: github.trim(),
      linkedin: linkedin.trim(),
      teamStatus,
      availability,
      skills: selectedSkills,
      role: currentUser.role || "user",
      isAdmin: currentUser.isAdmin || false,
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, "users", currentUser.uid), updatedData, { merge: true });
      setSuccessMsg("Developer profile successfully synchronized.");
      onProfileUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 text-left"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-purple animate-pulse" />
            My Developer Identity
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Build your credential profile to unlock instant AI matching and find peer hackers.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-cyan uppercase tracking-widest font-mono">
            {teamStatus}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Profile Avatars Choice */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Choose Profile Picture
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            {PRESET_AVATARS.map((avatar, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setProfileImage(avatar)}
                className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-200 relative ${
                  profileImage === avatar
                    ? "border-brand-cyan scale-110 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    : "border-white/10 opacity-70 hover:opacity-100 hover:scale-105"
                }`}
              >
                <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {profileImage === avatar && (
                  <span className="absolute inset-0 bg-brand-cyan/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </span>
                )}
              </button>
            ))}
            <div className="flex-1 min-w-[200px]">
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>
        </div>

        {/* Core Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. Rohini Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* College */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              College / Organization
            </label>
            <div className="relative">
              <School className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* College Year / Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Year / Position
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Junior (3rd Year) / Developer"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* Preferred Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Preferred Hackathon Role
            </label>
            <select
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              className="w-full bg-[#090520] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple"
            >
              {PRESET_ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#090520]">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setExperienceLevel(level)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    experienceLevel === level
                      ? "bg-brand-purple/20 border-brand-purple text-brand-cyan"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Team Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Team Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Looking for Team", "Already in Team"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTeamStatus(status)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    teamStatus === status
                      ? "bg-brand-blue/20 border-brand-blue text-brand-cyan"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              GitHub Profile Link
            </label>
            <div className="relative">
              <Github className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. https://github.com/myusername"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* LinkedIn Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              LinkedIn Profile Link
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. https://linkedin.com/in/myusername"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Availability During Build Weekend
            </label>
            <input
              type="text"
              placeholder="e.g. Fully dedicated, available 24 hours, sleep is for weak"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
            />
          </div>

          {/* Tech Stack List */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Current Tech Stack / Core Languages
            </label>
            <input
              type="text"
              placeholder="e.g. Python, PyTorch, FastAPI, Next.js, PostgreSQL"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
            />
          </div>
        </div>

        {/* Skills Tag Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Matchable Skills Tags (Multiselect)
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    isSelected
                      ? "bg-brand-cyan/20 border-brand-cyan text-white shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save CTA */}
        <div className="border-t border-white/5 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white text-sm font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.5)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving Identity Matrix...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Synchronize Identity
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
