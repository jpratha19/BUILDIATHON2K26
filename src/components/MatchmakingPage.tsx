import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  User, 
  Search, 
  Filter, 
  Send, 
  Check, 
  X, 
  Github, 
  Linkedin, 
  Mail, 
  Award, 
  Briefcase, 
  Clock, 
  Users, 
  Compass, 
  Heart, 
  BookOpen, 
  Shield, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  serverTimestamp, 
  deleteDoc 
} from "firebase/firestore";

interface MatchmakingPageProps {
  onOpenLogin: () => void;
}

// Predefined selections for profile setup
const PRESET_SKILLS = [
  "React", "Vue", "Next.js", "Node.js", "Python", "PyTorch", "TensorFlow", 
  "Solidity", "Rust", "Docker", "Kubernetes", "Figma", "Tailwind CSS", 
  "PostgreSQL", "Firebase", "MongoDB", "Go", "TypeScript", "OpenAI API", 
  "LangChain", "Hugging Face", "AWS", "GCP", "CyberSecurity", "Blockchain"
];

const PRESET_LANGUAGES = [
  "JavaScript", "TypeScript", "Python", "C++", "Java", "Rust", "Go", "Solidity", "SQL", "HTML/CSS"
];

const PRESET_INTERESTS = [
  "Generative AI", "AI Agents", "Web3/DeFi", "Healthcare Tech", "FinTech", 
  "ClimateTech", "DevTools", "CyberDefense", "IoT", "GameDev"
];

const PRESET_ROLES = [
  "Frontend", "Backend", "AI/ML", "UI/UX", "Blockchain", "Cloud", "Cybersecurity", "Fullstack", "DevOps"
];

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  college?: string;
  year?: string;
  skills?: string[];
  preferredRole?: string;
  languages?: string[];
  interests?: string[];
  experienceLevel?: "Beginner" | "Intermediate" | "Advanced";
  github?: string;
  linkedin?: string;
  availability?: string;
  preferredTeamSize?: number;
}

interface TeamInvite {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderCollege?: string;
  receiverId: string;
  receiverName: string;
  receiverRole?: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  message: string;
  createdAt: any;
}

interface Team {
  id: string;
  name: string;
  members: {
    uid: string;
    name: string;
    email: string;
    role?: string;
  }[];
  createdAt: any;
}

export default function MatchmakingPage({ onOpenLogin }: MatchmakingPageProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"match" | "profile" | "invites">("match");

  // Profile Form state
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    year: "1st Year",
    skills: [] as string[],
    preferredRole: "Fullstack",
    languages: [] as string[],
    interests: [] as string[],
    experienceLevel: "Intermediate" as "Beginner" | "Intermediate" | "Advanced",
    github: "",
    linkedin: "",
    availability: "Part-time",
    preferredTeamSize: 3,
  });

  // Matchmaking State
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<{ profile: UserProfile; score: number; reason: string }[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<{ profile: UserProfile; score: number; reason: string }[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Matchmaking Filter State
  const [skillFilter, setSkillFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("All");

  // Connection/Invite Modal State
  const [selectedMatch, setSelectedMatch] = useState<UserProfile | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Invite Logs State
  const [sentInvites, setSentInvites] = useState<TeamInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<TeamInvite[]>([]);
  const [activeInvitesSubtab, setActiveInvitesSubtab] = useState<"received" | "sent" | "teams">("received");
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Status Alerts
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Track Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setLoadingProfile(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync profile data to form when loaded
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        college: userProfile.college || "",
        year: userProfile.year || "1st Year",
        skills: userProfile.skills || [],
        preferredRole: userProfile.preferredRole || "Fullstack",
        languages: userProfile.languages || [],
        interests: userProfile.interests || [],
        experienceLevel: userProfile.experienceLevel || "Intermediate",
        github: userProfile.github || "",
        linkedin: userProfile.linkedin || "",
        availability: userProfile.availability || "Part-time",
        preferredTeamSize: userProfile.preferredTeamSize || 3,
      });
    }
  }, [userProfile]);

  // Load Matchmaking & Invites when authenticated and tab switches
  useEffect(() => {
    if (currentUser && userProfile?.college) {
      if (activeTab === "match") {
        fetchMatchmakingData();
      } else if (activeTab === "invites") {
        fetchInvitationsAndTeams();
      }
    }
  }, [activeTab, currentUser, userProfile]);

  // Handle Match Filters local trigger
  useEffect(() => {
    applyFilters();
  }, [matches, skillFilter, roleFilter, collegeFilter, experienceFilter]);

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const fetchUserProfile = async (uid: string) => {
    setLoadingProfile(true);
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);
        if (!data.college) {
          // If college is missing, we consider profile incomplete, open editing mode immediately
          setIsEditingProfile(true);
        }
      } else {
        // Create skeleton if not found
        const newUser: UserProfile = {
          uid,
          name: auth.currentUser?.displayName || "Developer",
          email: auth.currentUser?.email || "",
        };
        setUserProfile(newUser);
        setIsEditingProfile(true);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!formData.name.trim() || !formData.college.trim()) {
      triggerAlert("error", "Please provide your Full Name and College/University.");
      return;
    }

    setLoadingProfile(true);
    const docPath = `users/${currentUser.uid}`;
    try {
      const profileUpdates = {
        uid: currentUser.uid,
        name: formData.name.trim(),
        email: currentUser.email || "",
        college: formData.college.trim(),
        year: formData.year,
        skills: formData.skills,
        preferredRole: formData.preferredRole,
        languages: formData.languages,
        interests: formData.interests,
        experienceLevel: formData.experienceLevel,
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        availability: formData.availability,
        preferredTeamSize: Number(formData.preferredTeamSize),
        updatedAt: serverTimestamp(),
      };

      // Create / update document
      await setDoc(doc(db, "users", currentUser.uid), profileUpdates, { merge: true });
      setUserProfile(profileUpdates as any);
      setIsEditingProfile(false);
      triggerAlert("success", "Developer profile synchronized with matchmaking index!");
      // Automatically navigate to Match tab to trigger matchmaking
      setActiveTab("match");
    } catch (err: any) {
      console.error("Firestore error saving profile:", err);
      handleFirestoreError(err, OperationType.WRITE, docPath);
      triggerAlert("error", "Vulnerability Refused. Check database security rules.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const toggleArrayItem = (field: "skills" | "languages" | "interests", value: string) => {
    setFormData(prev => {
      const current = [...prev[field]];
      const index = current.indexOf(value);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(value);
      }
      return { ...prev, [field]: current };
    });
  };

  /**
   * WEIGHTED SIMILARITY MATCHMAKING ALGORITHM
   * 
   * This algorithm calculates a match score (0-100) between the current user
   * and potential teammates using weighted similarity factors:
   * 
   * 1. Preferred Role Complementarity (Weight: 25%)
   *    - Pairs different tech specialists (e.g. Frontend & Backend, or AI/ML & Frontend).
   * 2. Skillset Synergy (Weight: 25%)
   *    - Calculates overlap of matching skills + presence of complementary tools.
   * 3. Experience Level Balance (Weight: 15%)
   *    - Higher scores for similar expertise or healthy mentor-mentee pairs.
   * 4. Mutual Project Interests (Weight: 15%)
   *    - Computes similarity of focus areas like GenAI, Web3, ClimateTech.
   * 5. Shared Programming Languages (Weight: 10%)
   *    - Measures language stack compatibility.
   * 6. College Affiliation Bonus (Weight: 5%)
   *    - Optional bonus score if students are from the same campus.
   * 7. Team Size Alignment (Weight: 5%)
   *    - Matches preferred team structures.
   */
  const calculateMatchScoreAndReason = (me: UserProfile, target: UserProfile) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Role Match (25 Points)
    const myRole = me.preferredRole || "Fullstack";
    const targetRole = target.preferredRole || "Fullstack";
    let roleScore = 0;
    if (myRole !== targetRole) {
      // Complementary roles: UI/UX & Frontend, Frontend & Backend, AI/ML & Backend etc.
      if (
        (myRole === "Frontend" && targetRole === "Backend") ||
        (myRole === "Backend" && targetRole === "Frontend") ||
        (myRole === "AI/ML" && (targetRole === "Backend" || targetRole === "Frontend" || targetRole === "Fullstack")) ||
        (myRole === "UI/UX" && (targetRole === "Frontend" || targetRole === "Fullstack")) ||
        (myRole === "Cloud" && targetRole === "Backend") ||
        (myRole === "Cybersecurity" && targetRole === "Backend")
      ) {
        roleScore = 25;
        reasons.push(`Perfect role compatibility between your ${myRole} expertise and Aman's ${targetRole} focus.`);
      } else {
        roleScore = 18;
        reasons.push(`Complementary team roles (${myRole} + ${targetRole}) to divide tasks.`);
      }
    } else {
      roleScore = 10;
      reasons.push(`Both are focusing on ${myRole} development, sharing direct technical tasks.`);
    }
    score += roleScore;

    // 2. Skill synergy (25 Points)
    const mySkills = me.skills || [];
    const targetSkills = target.skills || [];
    const matchingSkills = mySkills.filter(s => targetSkills.includes(s));
    const targetComplementary = targetSkills.filter(s => !mySkills.includes(s));

    let skillScore = 0;
    if (matchingSkills.length > 0) {
      // Direct overlap is great for co-authoring
      const overlapWeight = Math.min(matchingSkills.length * 6, 15);
      skillScore += overlapWeight;
    }
    if (targetComplementary.length > 0) {
      // Complementary tools they have that you don't expands team capability
      const gapWeight = Math.min(targetComplementary.length * 4, 10);
      skillScore += gapWeight;
    }
    score += skillScore;

    if (matchingSkills.length > 0) {
      reasons.push(`You share ${matchingSkills.length} skills: ${matchingSkills.slice(0, 3).join(", ")}.`);
    }
    if (targetComplementary.length > 0) {
      reasons.push(`Aman expands your stack with tools like: ${targetComplementary.slice(0, 3).join(", ")}.`);
    }

    // 3. Experience Match (15 Points)
    const myExp = me.experienceLevel || "Intermediate";
    const targetExp = target.experienceLevel || "Intermediate";
    let expScore = 0;
    if (myExp === targetExp) {
      expScore = 15;
      reasons.push(`Identical experience levels (${myExp}) ensures smooth workflow pacing.`);
    } else if (
      (myExp === "Beginner" && targetExp === "Advanced") ||
      (myExp === "Advanced" && targetExp === "Beginner")
    ) {
      expScore = 10;
      reasons.push(`Strong mentorship synergy between a ${myExp} builder and an ${targetExp} engineer.`);
    } else {
      expScore = 12;
      reasons.push(`Complementary expertise synergy (${myExp} and ${targetExp}).`);
    }
    score += expScore;

    // 4. Interests Match (15 Points)
    const myInterests = me.interests || [];
    const targetInterests = target.interests || [];
    const matchingInterests = myInterests.filter(i => targetInterests.includes(i));
    let interestScore = 0;
    if (matchingInterests.length > 0) {
      interestScore = Math.min(matchingInterests.length * 7.5, 15);
      reasons.push(`Shared passion in: ${matchingInterests.join(", ")}.`);
    }
    score += interestScore;

    // 5. Programming Languages Match (10 Points)
    const myLang = me.languages || [];
    const targetLang = target.languages || [];
    const matchingLang = myLang.filter(l => targetLang.includes(l));
    let langScore = 0;
    if (matchingLang.length > 0) {
      langScore = Math.min(matchingLang.length * 4, 10);
      reasons.push(`Compatible codebase languages: ${matchingLang.slice(0, 2).join(", ")}.`);
    }
    score += langScore;

    // 6. College Affiliation (5 Points)
    const myCollege = (me.college || "").toLowerCase().trim();
    const targetCollege = (target.college || "").toLowerCase().trim();
    if (myCollege && targetCollege && myCollege === targetCollege) {
      score += 5;
      reasons.push(`Both study at ${target.college} allowing physical hackathon collaboration.`);
    }

    // 7. Preferred Team Size (5 Points)
    const mySize = me.preferredTeamSize || 3;
    const targetSize = target.preferredTeamSize || 3;
    if (mySize === targetSize) {
      score += 5;
      reasons.push(`Aligned team structure goals (Preferred Size: ${mySize} members).`);
    }

    // Final clean reason formatting
    const finalReason = reasons.join(" ").replace(/Aman/g, target.name);
    return {
      score: Math.min(Math.round(score), 100),
      reason: finalReason || "Shared focus in hackathon tracks and collaborative builder mindset."
    };
  };

  const fetchMatchmakingData = async () => {
    if (!currentUser || !userProfile) return;
    setLoadingMatches(true);
    try {
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const profiles: UserProfile[] = [];

      usersSnap.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        // Exclude current logged in user and profiles that are incomplete
        if (data.uid !== currentUser.uid && data.college && data.skills && data.skills.length > 0) {
          profiles.push(data);
        }
      });

      setAllProfiles(profiles);

      // Run weighted comparison
      const comparisons = profiles.map(profile => {
        const result = calculateMatchScoreAndReason(userProfile, profile);
        return {
          profile,
          score: result.score,
          reason: result.reason
        };
      });

      // Sort matches descending by score
      comparisons.sort((a, b) => b.score - a.score);
      setMatches(comparisons);
    } catch (err) {
      console.error("Error loading matchmaking profiles:", err);
      triggerAlert("error", "Could not load match index. Secure network is offline.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...matches];

    // Skill filter
    if (skillFilter.trim()) {
      const search = skillFilter.toLowerCase().trim();
      filtered = filtered.filter(m => 
        m.profile.skills?.some(s => s.toLowerCase().includes(search))
      );
    }

    // Preferred Role filter
    if (roleFilter !== "All") {
      filtered = filtered.filter(m => m.profile.preferredRole === roleFilter);
    }

    // College filter
    if (collegeFilter.trim()) {
      const search = collegeFilter.toLowerCase().trim();
      filtered = filtered.filter(m => 
        m.profile.college?.toLowerCase().includes(search)
      );
    }

    // Experience level filter
    if (experienceFilter !== "All") {
      filtered = filtered.filter(m => m.profile.experienceLevel === experienceFilter);
    }

    setFilteredMatches(filtered);
  };

  const fetchInvitationsAndTeams = async () => {
    if (!currentUser) return;
    setLoadingInvites(true);
    try {
      // 1. Fetch Sent invites
      const sentRef = collection(db, "teamInvites");
      const sentQ = query(sentRef, where("senderId", "==", currentUser.uid));
      const sentSnap = await getDocs(sentQ);
      const sent: TeamInvite[] = [];
      sentSnap.forEach(d => {
        sent.push({ id: d.id, ...d.data() } as TeamInvite);
      });
      setSentInvites(sent);

      // 2. Fetch Received invites
      const receivedQ = query(sentRef, where("receiverId", "==", currentUser.uid));
      const receivedSnap = await getDocs(receivedQ);
      const received: TeamInvite[] = [];
      receivedSnap.forEach(d => {
        received.push({ id: d.id, ...d.data() } as TeamInvite);
      });
      setReceivedInvites(received);

      // 3. Fetch Teams
      const teamsRef = collection(db, "teams");
      const teamsSnap = await getDocs(teamsRef);
      const teams: Team[] = [];
      teamsSnap.forEach(d => {
        const data = d.data();
        if (data.members && data.members.some((m: any) => m.uid === currentUser.uid)) {
          teams.push({ id: d.id, ...data } as Team);
        }
      });
      setMyTeams(teams);

    } catch (err) {
      console.error("Error loading invitations:", err);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleSendInvite = async () => {
    if (!currentUser || !userProfile || !selectedMatch) return;
    setSendingInvite(true);
    const inviteId = `${currentUser.uid}_${selectedMatch.uid}`;
    const docPath = `teamInvites/${inviteId}`;

    try {
      const inviteData = {
        id: inviteId,
        senderId: currentUser.uid,
        senderName: userProfile.name,
        senderRole: userProfile.preferredRole || "Fullstack",
        senderCollege: userProfile.college || "",
        receiverId: selectedMatch.uid,
        receiverName: selectedMatch.name,
        receiverRole: selectedMatch.preferredRole || "Fullstack",
        status: "pending",
        message: inviteMessage.trim() || `Hi ${selectedMatch.name}, I reviewed our matchmaking compatibility report and think our skills complement each other perfectly. Let's form an outstanding team for HackOps AI!`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "teamInvites", inviteId), inviteData);
      triggerAlert("success", `Secure invitation sent to @${selectedMatch.name}!`);
      setSelectedMatch(null);
      setInviteMessage("");
      // Refresh invites
      fetchInvitationsAndTeams();
    } catch (err: any) {
      console.error("Error writing invite doc:", err);
      handleFirestoreError(err, OperationType.WRITE, docPath);
      triggerAlert("error", "Failed to transmit invitation. Check security protocols.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleInviteDecision = async (invite: TeamInvite, decision: "accepted" | "declined") => {
    if (!currentUser) return;
    setLoadingInvites(true);
    const docPath = `teamInvites/${invite.id}`;
    try {
      // 1. Update invite status
      const inviteRef = doc(db, "teamInvites", invite.id);
      await updateDoc(inviteRef, {
        status: decision,
        updatedAt: serverTimestamp()
      });

      if (decision === "accepted") {
        // Create/Update a shared Team
        const teamId = `team_${invite.senderId}_${invite.receiverId}`;
        const teamRef = doc(db, "teams", teamId);
        
        // Fetch sender user info
        const senderUserRef = doc(db, "users", invite.senderId);
        const senderUserSnap = await getDoc(senderUserRef);
        const senderData = senderUserSnap.exists() ? senderUserSnap.data() : {};

        const newTeam = {
          id: teamId,
          name: `${invite.senderName} & ${invite.receiverName} Hack Squad`,
          members: [
            {
              uid: invite.senderId,
              name: invite.senderName,
              email: senderData.email || "",
              role: invite.senderRole || "Specialist",
            },
            {
              uid: invite.receiverId,
              name: invite.receiverName,
              email: currentUser.email || "",
              role: invite.receiverRole || "Specialist",
            }
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(teamRef, newTeam);
        triggerAlert("success", `Excellent choice! Team successfully formed with @${invite.senderName}!`);
      } else {
        triggerAlert("success", `Invitation declined.`);
      }

      // Refresh invitations tab
      fetchInvitationsAndTeams();
    } catch (err: any) {
      console.error("Error making invitation decision:", err);
      handleFirestoreError(err, OperationType.WRITE, docPath);
      triggerAlert("error", "Secure handshake could not compile. Action declined.");
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleCancelInvite = async (invite: TeamInvite) => {
    setLoadingInvites(true);
    const docPath = `teamInvites/${invite.id}`;
    try {
      await deleteDoc(doc(db, "teamInvites", invite.id));
      triggerAlert("success", "Invitation successfully cancelled.");
      fetchInvitationsAndTeams();
    } catch (err: any) {
      console.error("Error deleting invite:", err);
      handleFirestoreError(err, OperationType.DELETE, docPath);
      triggerAlert("error", "Error cancelling. Check clearance rules.");
    } finally {
      setLoadingInvites(false);
    }
  };

  // If user is not logged in, show polished prompt card
  if (!currentUser) {
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#030014]">
        {/* Ambient backdrops */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-purple/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full max-w-xl text-center glass-panel border border-white/10 p-8 md:p-12 rounded-3xl bg-[#040118]/90 shadow-2xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-purple/15 border border-brand-purple/30 text-brand-cyan text-[10px] font-bold uppercase tracking-wider mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
            <span>HackOps Matching System</span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight uppercase">
              AI Team Matchmaking
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Skip the manual search. Our cognitive weighted matchmaking engine connects you with elite developers based on role complementarity, tech stacks, and shared hackathon tracks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left max-w-md mx-auto">
            <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan">
              <Users className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono">Join Active Pools</h4>
              <p className="text-[11px] text-slate-400">Establish your developer identity, set skills, and discover teammates instantly.</p>
            </div>
          </div>

          <button
            onClick={onOpenLogin}
            className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan text-white font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
          >
            Authenticate Developer Identity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-12 md:py-16 selection:bg-brand-purple/30 selection:text-brand-cyan text-[#f3f4f6]">
      {/* Decorative cyber backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/10 via-transparent to-transparent pointer-events-none" />

      {/* Alert Banner */}
      {alert && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border flex items-start gap-3 shadow-2xl animate-slide-in max-w-md ${
          alert.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300" 
            : "bg-rose-950/90 border-rose-500/30 text-rose-300"
        }`}>
          {alert.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-semibold leading-relaxed font-sans">{alert.message}</span>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span>AI Team Matchmaking</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight uppercase">
            Team Synergy Console
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Synergy metric: <span className="text-brand-purple font-semibold">Weighted Tech Compatibility Model</span>. Exclude offline profiles automatically.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shrink-0 self-start md:self-end">
          <button
            onClick={() => setActiveTab("match")}
            disabled={isEditingProfile}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "match" 
                ? "bg-brand-purple/20 text-brand-cyan border border-brand-purple/40" 
                : "text-slate-400 hover:text-white"
            } ${isEditingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Compass className="w-3.5 h-3.5" />
            Find Teammates
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "profile" 
                ? "bg-brand-purple/20 text-brand-cyan border border-brand-purple/40" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            My Matchmaking Profile
          </button>
          <button
            onClick={() => setActiveTab("invites")}
            disabled={isEditingProfile}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "invites" 
                ? "bg-brand-purple/20 text-brand-cyan border border-brand-purple/40" 
                : "text-slate-400 hover:text-white"
            } ${isEditingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Users className="w-3.5 h-3.5" />
            My Invites / Teams
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Loading state of core user profile */}
        {loadingProfile && (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Synchronizing profile telemetry...</p>
          </div>
        )}

        {/* 1. MATCH TAB */}
        {!loadingProfile && activeTab === "match" && (
          <div className="space-y-8 animate-fade-in text-left">
            {/* If profile is incomplete, force warning */}
            {!userProfile?.college ? (
              <div className="glass-panel border border-amber-500/20 bg-amber-500/5 rounded-3xl p-6 md:p-8 text-center space-y-4 max-w-2xl mx-auto">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white uppercase">Profile Incomplete</h3>
                  <p className="text-xs text-slate-300">
                    To start matching with elite builders, please populate your Matchmaking Profile with your college name, tech skills, and preferred roles.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("profile")}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Configure Matchmaking Profile
                </button>
              </div>
            ) : (
              <>
                {/* Advanced Search Filter Rail */}
                <div className="glass-panel border border-white/5 bg-[#05021a]/70 p-5 rounded-2xl flex flex-col md:flex-row flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-brand-cyan shrink-0">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Search Filters</span>
                  </div>

                  {/* Filter inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full md:flex-1">
                    {/* Role Filter */}
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Preferred Role:</label>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 p-2 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-purple/40"
                      >
                        <option value="All" className="bg-[#040118]">All Roles</option>
                        {PRESET_ROLES.map(role => (
                          <option key={role} value={role} className="bg-[#040118]">{role}</option>
                        ))}
                      </select>
                    </div>

                    {/* Skill Search */}
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Skill Search:</label>
                      <input
                        type="text"
                        placeholder="e.g. Python, PyTorch, React"
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 p-2 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-purple/40"
                      />
                    </div>

                    {/* College Search */}
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">College/University:</label>
                      <input
                        type="text"
                        placeholder="e.g. Stanford, MIT"
                        value={collegeFilter}
                        onChange={(e) => setCollegeFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 p-2 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-purple/40"
                      />
                    </div>

                    {/* Experience Level */}
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Experience Level:</label>
                      <select
                        value={experienceFilter}
                        onChange={(e) => setExperienceFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 p-2 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-purple/40"
                      >
                        <option value="All" className="bg-[#040118]">All Experience</option>
                        <option value="Beginner" className="bg-[#040118]">Beginner</option>
                        <option value="Intermediate" className="bg-[#040118]">Intermediate</option>
                        <option value="Advanced" className="bg-[#040118]">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Reset/Search trigger */}
                  <div className="flex items-end self-stretch pt-5 md:pt-0">
                    <button
                      onClick={() => {
                        setRoleFilter("All");
                        setSkillFilter("");
                        setCollegeFilter("");
                        setExperienceFilter("All");
                      }}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all self-end w-full md:w-auto"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* AI Matching CTA */}
                <div className="flex justify-between items-center bg-gradient-to-r from-brand-purple/10 to-brand-cyan/5 border border-brand-purple/20 p-6 rounded-2xl">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                      Dynamic Synaptic Matching Pool
                    </h3>
                    <p className="text-xs text-slate-400">
                      Instantly cross-references your developer coordinates against all signed-up registrations.
                    </p>
                  </div>
                  <button
                    onClick={fetchMatchmakingData}
                    disabled={loadingMatches}
                    className="px-6 py-3 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {loadingMatches ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Compass className="w-4 h-4 text-slate-950" />
                        AI Find My Team
                      </>
                    )}
                  </button>
                </div>

                {/* Results Section */}
                {loadingMatches ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-mono">Running weighted cross-match matrix...</p>
                  </div>
                ) : filteredMatches.length === 0 ? (
                  <div className="text-center py-20 border border-white/5 rounded-3xl bg-[#040118]/40 space-y-4">
                    <Users className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white uppercase">No suitable teammates found</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Try clearing or relaxing your filters, or click "AI Find My Team" to fetch the latest registered profiles.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredMatches.map(({ profile, score, reason }) => (
                      <div 
                        key={profile.uid}
                        className="relative rounded-3xl glass-panel border border-white/10 p-6 md:p-8 bg-[#040118]/90 shadow-lg hover:shadow-brand-purple/5 transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* High compatibility banner */}
                        {score >= 80 && (
                          <div className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-brand-purple/20 border border-brand-purple/35 text-[9px] font-bold text-brand-cyan tracking-widest uppercase">
                            High Match
                          </div>
                        )}

                        <div className="space-y-4">
                          {/* Profile Core */}
                          <div className="flex items-start gap-4">
                            {/* Profile Photo Placeholder */}
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border border-white/10 flex items-center justify-center text-brand-cyan text-lg font-black shrink-0 font-mono">
                              {profile.name ? profile.name.charAt(0).toUpperCase() : "@"}
                            </div>
                            
                            <div className="space-y-1 text-left">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-base font-bold text-white leading-none">{profile.name}</h3>
                                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-white/5 text-brand-cyan rounded">
                                  {profile.preferredRole}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-none">{profile.college} ({profile.year})</p>
                              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                Experience: <span className="text-white font-bold">{profile.experienceLevel}</span>
                              </p>
                            </div>
                          </div>

                          {/* Matching Score Circle / Bar */}
                          <div className="p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-2xl flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center w-12 h-12 shrink-0 rounded-xl bg-[#06021d] border border-brand-purple/30 text-center relative">
                              <span className="text-base font-black text-white leading-none">{score}%</span>
                              <span className="text-[7px] text-brand-cyan uppercase font-bold tracking-wider leading-none mt-0.5">Score</span>
                            </div>
                            <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
                              "{reason}"
                            </p>
                          </div>

                          {/* Tech stack lists */}
                          <div className="space-y-2">
                            {/* Skills list */}
                            <div>
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Synergized Skills:</span>
                              <div className="flex flex-wrap gap-1">
                                {profile.skills?.map(skill => {
                                  const isShared = userProfile.skills?.includes(skill);
                                  return (
                                    <span 
                                      key={skill} 
                                      className={`px-2 py-0.5 rounded-md text-[9px] font-semibold font-mono ${
                                        isShared 
                                          ? "bg-brand-purple/20 text-brand-cyan border border-brand-purple/30" 
                                          : "bg-white/5 text-slate-300 border border-white/5"
                                      }`}
                                    >
                                      {skill}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Languages & Interests */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Languages:</span>
                                <div className="text-[10px] text-slate-300 font-mono">
                                  {profile.languages?.join(", ") || "No stacks"}
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Interests:</span>
                                <div className="text-[10px] text-slate-300 font-mono truncate">
                                  {profile.interests?.join(", ") || "General"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 gap-3">
                          {/* Left Profile Connections */}
                          <div className="flex items-center gap-2">
                            {profile.github && (
                              <a 
                                href={profile.github.startsWith("http") ? profile.github : `https://github.com/${profile.github}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
                                title="GitHub"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {profile.linkedin && (
                              <a 
                                href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
                                title="LinkedIn"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          {/* CTA trigger */}
                          <button
                            onClick={() => {
                              setSelectedMatch(profile);
                              setInviteMessage("");
                            }}
                            className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-brand-purple/20"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Connect / Invite
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 2. PROFILE TAB */}
        {!loadingProfile && activeTab === "profile" && (
          <div className="max-w-3xl mx-auto w-full animate-fade-in text-left">
            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="glass-panel border border-white/10 rounded-3xl p-6 md:p-8 bg-[#040118]/95 shadow-2xl space-y-6">
                
                {/* Header */}
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                    Edit Matchmaking Coordinates
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete your developer coordinates to join the passive recruitment and synergy matchmaking pool.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase">Full Name:</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Satyendra Nath"
                      className="w-full glass-input p-3 rounded-xl text-slate-200 text-xs"
                    />
                  </div>

                  {/* College */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase">College/University:</label>
                    <input
                      type="text"
                      required
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. Indian Institute of Technology"
                      className="w-full glass-input p-3 rounded-xl text-slate-200 text-xs"
                    />
                  </div>

                  {/* Year */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase">College Year:</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-purple/40"
                    >
                      <option value="1st Year" className="bg-[#040118]">1st Year</option>
                      <option value="2nd Year" className="bg-[#040118]">2nd Year</option>
                      <option value="3rd Year" className="bg-[#040118]">3rd Year</option>
                      <option value="4th Year" className="bg-[#040118]">4th Year</option>
                      <option value="Post-Graduate" className="bg-[#040118]">Post-Graduate</option>
                      <option value="Other" className="bg-[#040118]">Other</option>
                    </select>
                  </div>

                  {/* Preferred Role */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase">Preferred Team Role:</label>
                    <select
                      value={formData.preferredRole}
                      onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-purple/40"
                    >
                      {PRESET_ROLES.map(role => (
                        <option key={role} value={role} className="bg-[#040118]">{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase">Experience Level:</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-purple/40"
                    >
                      <option value="Beginner" className="bg-[#040118]">Beginner</option>
                      <option value="Intermediate" className="bg-[#040118]">Intermediate</option>
                      <option value="Advanced" className="bg-[#040118]">Advanced</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase">Weekly Availability:</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-purple/40"
                    >
                      <option value="Part-time" className="bg-[#040118]">Part-time (5-10 hrs/week)</option>
                      <option value="Full-time" className="bg-[#040118]">Full-time (Highly active)</option>
                      <option value="Weekends" className="bg-[#040118]">Weekends Only</option>
                    </select>
                  </div>

                  {/* GitHub link */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1">
                      <Github className="w-3.5 h-3.5" />
                      GitHub Profile / Username:
                    </label>
                    <input
                      type="text"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="e.g. satoshi99"
                      className="w-full glass-input p-3 rounded-xl text-slate-200 text-xs"
                    />
                  </div>

                  {/* LinkedIn link */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1">
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn Profile / Link:
                    </label>
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="e.g. satyendra-nath"
                      className="w-full glass-input p-3 rounded-xl text-slate-200 text-xs"
                    />
                  </div>

                  {/* Team size */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 uppercase">Preferred Team Size:</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={formData.preferredTeamSize}
                      onChange={(e) => setFormData({ ...formData, preferredTeamSize: Number(e.target.value) })}
                      className="w-full glass-input p-3 rounded-xl text-slate-200 text-xs"
                    />
                  </div>
                </div>

                {/* Multiple Tags Inputs */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  {/* Skills Tag Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Select Tech Skills (Multiple):</label>
                    <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-2 border border-white/5 bg-[#030014]/50 rounded-2xl">
                      {PRESET_SKILLS.map(skill => {
                        const isSelected = formData.skills.includes(skill);
                        return (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => toggleArrayItem("skills", skill)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-semibold cursor-pointer transition-all ${
                              isSelected 
                                ? "bg-brand-purple text-white border border-brand-purple" 
                                : "bg-white/5 text-slate-400 border border-white/5 hover:text-white"
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Programming Languages Tag Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Core Programming Languages:</label>
                    <div className="flex flex-wrap gap-1.5 p-2 border border-white/5 bg-[#030014]/50 rounded-2xl">
                      {PRESET_LANGUAGES.map(lang => {
                        const isSelected = formData.languages.includes(lang);
                        return (
                          <button
                            type="button"
                            key={lang}
                            onClick={() => toggleArrayItem("languages", lang)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-semibold cursor-pointer transition-all ${
                              isSelected 
                                ? "bg-brand-blue text-white border border-brand-blue" 
                                : "bg-white/5 text-slate-400 border border-white/5 hover:text-white"
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project Interests Tag Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase block">Mutual Focus Interests:</label>
                    <div className="flex flex-wrap gap-1.5 p-2 border border-white/5 bg-[#030014]/50 rounded-2xl">
                      {PRESET_INTERESTS.map(interest => {
                        const isSelected = formData.interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleArrayItem("interests", interest)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-semibold cursor-pointer transition-all ${
                              isSelected 
                                ? "bg-brand-cyan text-slate-950 border border-brand-cyan" 
                                : "bg-white/5 text-slate-400 border border-white/5 hover:text-white"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit row */}
                <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
                  {userProfile?.college && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Save Match Coordinates
                  </button>
                </div>
              </form>
            ) : (
              /* View profile layout */
              <div className="glass-panel border border-white/10 rounded-3xl p-6 md:p-8 bg-[#040118]/95 shadow-2xl space-y-6">
                <div className="flex items-start justify-between border-b border-white/5 pb-6 flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border border-white/10 flex items-center justify-center text-brand-cyan text-2xl font-black font-mono">
                      {userProfile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-display font-black text-white leading-none">{userProfile?.name}</h3>
                      <p className="text-xs text-slate-400">{userProfile?.email}</p>
                      <p className="text-xs text-brand-cyan leading-none font-semibold mt-1">
                        Preferred Role: <span className="text-white">{userProfile?.preferredRole}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold cursor-pointer transition-all self-start sm:self-auto"
                  >
                    Edit Profile Coordinates
                  </button>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Academic info */}
                  <div className="space-y-1 p-4 rounded-2xl bg-white/2 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Academic Institute:</span>
                    <p className="text-sm text-slate-200">{userProfile?.college || "Not set"}</p>
                    <p className="text-xs text-slate-400">Year: {userProfile?.year || "Not set"}</p>
                  </div>

                  {/* Availability info */}
                  <div className="space-y-1 p-4 rounded-2xl bg-white/2 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Commitment Details:</span>
                    <p className="text-sm text-slate-200">{userProfile?.availability || "Not set"}</p>
                    <p className="text-xs text-slate-400">Target Team Size: {userProfile?.preferredTeamSize || "3"} members</p>
                  </div>
                </div>

                {/* Stacks and Lists */}
                <div className="space-y-4">
                  {/* Skills tags */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Synchronized Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {userProfile?.skills?.map(skill => (
                        <span key={skill} className="px-2.5 py-1 text-[10px] font-semibold bg-brand-purple/10 border border-brand-purple/20 text-brand-cyan rounded-lg">
                          {skill}
                        </span>
                      )) || <p className="text-xs text-slate-500 font-mono">No skills set</p>}
                    </div>
                  </div>

                  {/* Languages list */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Stack Programming Languages:</span>
                    <p className="text-xs text-slate-300 font-mono">
                      {userProfile?.languages?.join(", ") || "No languages specified"}
                    </p>
                  </div>

                  {/* Interests */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Strategic Project Focus:</span>
                    <p className="text-xs text-slate-300 font-mono">
                      {userProfile?.interests?.join(", ") || "General tech scope"}
                    </p>
                  </div>
                </div>

                {/* Social references */}
                {(userProfile?.github || userProfile?.linkedin) && (
                  <div className="pt-4 border-t border-white/5 flex gap-4">
                    {userProfile.github && (
                      <a 
                        href={`https://github.com/${userProfile.github}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono"
                      >
                        <Github className="w-4 h-4 text-brand-cyan" />
                        github.com/{userProfile.github}
                      </a>
                    )}
                    {userProfile.linkedin && (
                      <a 
                        href={userProfile.linkedin.startsWith("http") ? userProfile.linkedin : `https://linkedin.com/in/${userProfile.linkedin}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono"
                      >
                        <Linkedin className="w-4 h-4 text-brand-purple" />
                        linkedin profile
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. INVITES TAB */}
        {!loadingProfile && activeTab === "invites" && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Sub-tabs selection */}
            <div className="flex border-b border-white/5 pb-2 gap-6">
              <button
                onClick={() => setActiveInvitesSubtab("received")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                  activeInvitesSubtab === "received" ? "text-brand-cyan" : "text-slate-400 hover:text-white"
                }`}
              >
                Received Invites
                {receivedInvites.filter(i => i.status === "pending").length > 0 && (
                  <span className="absolute -top-1 -right-4 w-4 h-4 rounded-full bg-brand-cyan text-slate-950 text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {receivedInvites.filter(i => i.status === "pending").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveInvitesSubtab("sent")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeInvitesSubtab === "sent" ? "text-brand-cyan" : "text-slate-400 hover:text-white"
                }`}
              >
                Sent Invites
              </button>
              <button
                onClick={() => setActiveInvitesSubtab("teams")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  activeInvitesSubtab === "teams" ? "text-brand-cyan" : "text-slate-400 hover:text-white"
                }`}
              >
                Formed Squads
                {myTeams.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-cyan text-[10px] font-bold">
                    {myTeams.length}
                  </span>
                )}
              </button>
            </div>

            {loadingInvites ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-mono">Syncing server invitations...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* A. RECEIVED SUB-TAB */}
                {activeInvitesSubtab === "received" && (
                  receivedInvites.length === 0 ? (
                    <div className="py-12 text-center border border-white/5 rounded-2xl bg-white/2 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">You haven't received any team matchmaking invites yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {receivedInvites.map(invite => (
                        <div key={invite.id} className="p-5 md:p-6 rounded-2xl border border-white/10 bg-[#040118]/80 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                          <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-white">@{invite.senderName}</span>
                              <span className="px-1.5 py-0.5 text-[9px] bg-brand-purple/20 text-brand-cyan rounded">
                                {invite.senderRole}
                              </span>
                              <span className="text-[10px] text-slate-400">({invite.senderCollege})</span>
                            </div>
                            <p className="text-xs text-slate-300 italic font-mono bg-[#030014]/50 p-3 rounded-xl border border-white/5 leading-relaxed">
                              "{invite.message}"
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                            {invite.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleInviteDecision(invite, "declined")}
                                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-rose-400 border border-white/5 text-xs font-bold rounded-xl cursor-pointer transition-all"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => handleInviteDecision(invite, "accepted")}
                                  className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/95 text-slate-950 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Accept & Form Squad
                                </button>
                              </>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                invite.status === "accepted" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-slate-400"
                              }`}>
                                {invite.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* B. SENT SUB-TAB */}
                {activeInvitesSubtab === "sent" && (
                  sentInvites.length === 0 ? (
                    <div className="py-12 text-center border border-white/5 rounded-2xl bg-white/2 space-y-2">
                      <Send className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">You haven't transmitted any custom match invitations yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {sentInvites.map(invite => (
                        <div key={invite.id} className="p-5 md:p-6 rounded-2xl border border-white/10 bg-[#040118]/80 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                          <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-white">To: @{invite.receiverName}</span>
                              <span className="px-1.5 py-0.5 text-[9px] bg-brand-cyan/20 text-brand-cyan rounded">
                                {invite.receiverRole}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-sans">
                              Message: "{invite.message}"
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              invite.status === "pending" 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                : invite.status === "accepted"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-white/5 text-slate-400 border border-white/5"
                            }`}>
                              {invite.status}
                            </span>
                            {invite.status === "pending" && (
                              <button
                                onClick={() => handleCancelInvite(invite)}
                                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                                title="Cancel Invitation"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* C. TEAMS SUB-TAB */}
                {activeInvitesSubtab === "teams" && (
                  myTeams.length === 0 ? (
                    <div className="py-12 text-center border border-white/5 rounded-2xl bg-white/2 space-y-2">
                      <Users className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">No active hacker squads formed yet. Connect with matches to lock in your squad!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myTeams.map(team => (
                        <div key={team.id} className="p-5 md:p-6 rounded-3xl border border-brand-cyan/20 bg-[#040118]/90 shadow-xl relative overflow-hidden">
                          {/* Ambient glow accent */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-2xl" />

                          <div className="space-y-4 text-left">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-brand-cyan" />
                                {team.name}
                              </h4>
                              <span className="px-2 py-0.5 text-[8px] font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/35 rounded uppercase">
                                Registered Squad
                              </span>
                            </div>

                            {/* Members roster */}
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Members Roster:</span>
                              {team.members.map(member => (
                                <div key={member.uid} className="flex items-center justify-between p-2 rounded-xl bg-white/2 border border-white/5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                                      {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-white">@{member.name}</p>
                                      <p className="text-[9px] text-slate-500 font-mono">{member.email}</p>
                                    </div>
                                  </div>
                                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-white/5 text-slate-300 rounded uppercase">
                                    {member.role || "Builder"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Connection / Invitation Dialog Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/80 backdrop-blur-md animate-fade-in text-left">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/10 p-6 md:p-8 bg-[#040118]/95 shadow-2xl animate-scale-in space-y-6">
            
            {/* Close */}
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-wider">Synergy Connection Handshake</span>
              <h3 className="text-lg font-display font-black text-white uppercase leading-none">
                Invite @{selectedMatch.name} to Team
              </h3>
              <p className="text-xs text-slate-400">
                Send a personalized invitation message. Once accepted, your squad will be formed!
              </p>
            </div>

            {/* Recipient summary card */}
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border border-white/10 flex items-center justify-center text-brand-cyan text-sm font-black font-mono">
                  {selectedMatch.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">@{selectedMatch.name}</p>
                  <p className="text-[10px] text-slate-400">{selectedMatch.college} • {selectedMatch.preferredRole}</p>
                </div>
              </div>
            </div>

            {/* Custom message field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Personalized Message:</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder={`Hi ${selectedMatch.name}, I reviewed our matchmaking compatibility report and think our skills complement each other perfectly. Let's form an outstanding team for HackOps AI!`}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-brand-purple/40 resize-none"
              />
              <span className="text-[9px] text-slate-500 font-mono text-right">{inviteMessage.length}/500 characters</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="px-5 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-slate-300 hover:text-white transition-all text-center cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={sendingInvite}
                className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-brand-cyan/20"
              >
                {sendingInvite ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    Transmit Invite
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
