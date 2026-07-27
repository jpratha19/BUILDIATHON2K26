import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

let geminiClient: GoogleGenAI | null = null;
let adminFirestore: any = null;

function getAdminDb() {
  if (!adminFirestore) {
    try {
      if (getApps().length === 0) {
        initializeApp({
          projectId: "hackops-ai"
        });
      }
      adminFirestore = getFirestore();
    } catch (err) {
      console.error("Firebase Admin initialization error, returning null fallback:", err);
    }
  }
  return adminFirestore;
}

const XP_MAP: Record<string, number> = {
  daily_login: 5,
  registration: 100,
  participation: 150,
  submission: 200,
  completion: 250,
  winner_1: 500,
  runner_up: 350,
  winner_3: 250,
  mentor_appreciation: 75,
  community_discussion: 20,
  project_like: 2,
  profile_completion: 50,
  referral: 100
};

function calculateLevel(xp: number): number {
  if (xp >= 5000) return 6;
  if (xp >= 3500) return 5;
  if (xp >= 2000) return 4;
  if (xp >= 1000) return 3;
  if (xp >= 500) return 2;
  return 1;
}

function determineBadges(level: number, wins: number, participated: number, streak: number, existingBadges: string[] = []): string[] {
  const badgesSet = new Set<string>(existingBadges || []);
  badgesSet.add("Hacker");
  if (level >= 3) badgesSet.add("Pro");
  if (level >= 4) badgesSet.add("Elite");
  if (level >= 5) badgesSet.add("Master");
  if (level >= 6) badgesSet.add("Champion");
  if (wins > 0) {
    badgesSet.add("Winner");
    badgesSet.add("Champion");
  }
  if (participated >= 3) badgesSet.add("Veteran");
  if (streak >= 3) badgesSet.add("Streak Hacker");
  
  return Array.from(badgesSet);
}

function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/mentor/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages array" });
        return;
      }

      // Map incoming messages to Gemini Content type
      const contents = messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.message || m.text || "" }]
      }));

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: `You are an experienced hackathon mentor, senior software engineer, and technical guide.
You are the HackOps AI Mentor.
You specialize in programming, hackathons, software development, AI, career guidance, and technical mentoring.

Your scope is STRICTLY limited to the following topics:
- Programming (C, C++, Java, Python, JavaScript)
- React
- Node.js
- Express.js
- Firebase
- MongoDB
- SQL
- AI & Machine Learning
- Data Structures & Algorithms
- Git & GitHub
- APIs
- Debugging code
- Web Development
- UI/UX
- Deployment
- Hackathon guidance
- Resume building
- Project ideas
- Presentation tips
- Interview preparation

Your behaviors:
1. Explain technical concepts in simple, accessible language.
2. Give detailed, step-by-step solutions.
3. Generate sample code when requested.
4. Debug user code.
5. Suggest project improvements.
6. Recommend technologies.
7. Help users during hackathons (pitching, dev speed, tech stack, debugging).

CRITICAL DIRECTIVE:
If the user asks something unrelated to technology, coding, software engineering, hackathons, career guidance, or technical mentoring, you MUST politely respond with this exact string:
"I am your HackOps AI Mentor. I specialize in programming, hackathons, software development, AI, career guidance, and technical mentoring."
Do not answer or discuss any topics outside this scope.`
        }
      });

      const reply = response.text || "";
      res.json({ reply });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  app.post("/api/mentor/evaluate", async (req, res) => {
    try {
      const { title, description, githubUrl, demoVideoUrl, zipFileName, techStack, teamMembers } = req.body;
      if (!title || !description || !techStack) {
        res.status(400).json({ error: "Missing required fields: title, description, techStack" });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `Evaluate the following hackathon project submission details and provide professional, deep, objective and comprehensive judging feedback.

Project Title: ${title}
Project Description: ${description}
GitHub Repository URL: ${githubUrl || "Not provided"}
Demo Video URL: ${demoVideoUrl || "Not provided"}
Uploaded File/ZIP Name: ${zipFileName || "Not provided"}
Tech Stack: ${techStack}
Team Members: ${teamMembers || "Solo Developer"}

Please perform a comprehensive, simulated analysis of the repository (if provided) and the description, tech stack, and documentation quality. You must return a strict JSON object with the following fields (do not wrap in markdown quotes except the outer JSON output):
{
  "overallScore": number (integer 0-100, calculate weighted average of scores),
  "grade": string (one of "A+", "A", "B+", "B", "C"),
  "probability": number (integer 0-100, hackathon winning probability),
  "scores": {
    "innovation": number (0-100),
    "technical": number (0-100),
    "uiux": number (0-100),
    "codeQuality": number (0-100),
    "business": number (0-100),
    "scalability": number (0-100),
    "security": number (0-100),
    "presentation": number (0-100),
    "originality": number (0-100),
    "feasibility": number (0-100)
  },
  "strengths": string[] (list of 2-4 strong aspects),
  "weaknesses": string[] (list of 2-4 weaknesses/limitations),
  "improvements": string[] (list of 4-6 step-by-step actionable recommendations starting with check marks or simple verbs),
  "feedback": string (detailed judge review, 2-3 sentences),
  "recruiterInsight": string (recruiter insight statement regarding candidate skill depth based on tech stack & complexity, 1-2 sentences)
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an experienced, high-profile hackathon judge, technical recruiter, and elite systems architect. You grade projects strictly, fairly, and provide deep, high-value technical feedback."
        }
      });

      const resultText = response.text || "{}";
      const evaluation = JSON.parse(resultText);
      res.json(evaluation);
    } catch (error) {
      console.error("Evaluation API Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // AI Hackathon Networking Recommendations
  app.post("/api/networking/recommend", async (req, res) => {
    try {
      const { userProfile, candidateProfiles } = req.body;
      if (!userProfile) {
        res.status(400).json({ error: "Missing required userProfile" });
        return;
      }
      if (!candidateProfiles || !Array.isArray(candidateProfiles) || candidateProfiles.length === 0) {
        res.json({ recommendations: [] });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `You are an elite, high-performance matchmaking algorithm for hackathons.
Compare the following user profile with the list of candidates to identify optimal synergy.

User Profile:
- Name: ${userProfile.name || "User"}
- Preferred Role: ${userProfile.preferredRole || "Any"}
- Skills: ${Array.isArray(userProfile.skills) ? userProfile.skills.join(", ") : (userProfile.skills || "None")}
- Interests: ${Array.isArray(userProfile.interests) ? userProfile.interests.join(", ") : (userProfile.interests || "None")}
- Experience Level: ${userProfile.experienceLevel || "Intermediate"}

Candidate Profiles:
${candidateProfiles.map((c, i) => `${i + 1}. UID: ${c.uid}
   - Name: ${c.name}
   - Preferred Role: ${c.preferredRole || "Any"}
   - Skills: ${Array.isArray(c.skills) ? c.skills.join(", ") : (c.skills || "None")}
   - Interests: ${Array.isArray(c.interests) ? c.interests.join(", ") : (c.interests || "None")}
   - Experience Level: ${c.experienceLevel || "Intermediate"}`).join("\n\n")}

Determine compatibility based on:
1. complementary roles (e.g., Frontend meets Backend, or UI/UX Designer meets AI/ML engineer).
2. skill set coverage (e.g. one knows Python/LangChain while the other knows React/Firebase).
3. complementary experience levels and shared interests.

Calculate compatibilityScore (an integer percentage from 0 to 100) and draft a concise, persuasive, friendly 1-2 sentence description explaining why they would form a formidable hackathon team.

Return a JSON object matching this schema exactly:
{
  "recommendations": [
    {
      "uid": "candidate_uid",
      "compatibilityScore": number,
      "reason": "string"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    uid: { type: Type.STRING },
                    compatibilityScore: { type: Type.INTEGER, description: "Match percentage" },
                    reason: { type: Type.STRING, description: "Detailed 1-2 sentence matching reason" }
                  },
                  required: ["uid", "compatibilityScore", "reason"]
                }
              }
            },
            required: ["recommendations"]
          }
        }
      });

      const text = response.text || "{}";
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("AI Networking suggestions error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Secure Experience Points (XP) awarding endpoint
  app.post("/api/leaderboard/award-xp", async (req, res) => {
    try {
      const { userId, action } = req.body;
      if (!userId || !action) {
        res.status(400).json({ error: "Missing required fields: userId and action" });
        return;
      }

      const xpToAward = XP_MAP[action];
      if (xpToAward === undefined) {
        res.status(400).json({ error: `Invalid action type: ${action}` });
        return;
      }

      const firestore = getAdminDb();
      if (!firestore) {
        res.status(503).json({ error: "Firebase Admin is unavailable in this environment." });
        return;
      }

      const userRef = firestore.collection("users").doc(userId);
      const userDocSnap = await userRef.get();

      if (!userDocSnap.exists) {
        res.status(404).json({ error: "User profile not found in database." });
        return;
      }

      const userData = userDocSnap.data();

      // Implement self-healing timeframe/seasonal resets on the fly
      const now = new Date();
      const lastActiveDate = userData.lastActive ? new Date(userData.lastActive) : null;

      let xpEarnedToday = userData.xpEarnedToday || 0;
      let xpWeekly = userData.xpWeekly || 0;
      let xpMonthly = userData.xpMonthly || 0;
      let xpYearly = userData.xpYearly || 0;

      if (!lastActiveDate) {
        xpEarnedToday = 0;
        xpWeekly = 0;
        xpMonthly = 0;
        xpYearly = 0;
      } else {
        // Daily reset (different calendar day)
        if (
          now.getUTCDate() !== lastActiveDate.getUTCDate() ||
          now.getUTCMonth() !== lastActiveDate.getUTCMonth() ||
          now.getUTCFullYear() !== lastActiveDate.getUTCFullYear()
        ) {
          xpEarnedToday = 0;
        }

        // Weekly reset (different ISO calendar week number)
        const getWeekNumber = (d: Date) => {
          const onejan = new Date(d.getUTCFullYear(), 0, 1);
          return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getUTCDay() + 1) / 7);
        };
        if (
          now.getUTCFullYear() !== lastActiveDate.getUTCFullYear() ||
          getWeekNumber(now) !== getWeekNumber(lastActiveDate)
        ) {
          xpWeekly = 0;
        }

        // Monthly reset
        if (
          now.getUTCMonth() !== lastActiveDate.getUTCMonth() ||
          now.getUTCFullYear() !== lastActiveDate.getUTCFullYear()
        ) {
          xpMonthly = 0;
        }

        // Yearly reset
        if (now.getUTCFullYear() !== lastActiveDate.getUTCFullYear()) {
          xpYearly = 0;
        }
      }

      // Calculate new counts
      const oldXp = userData.xp || 0;
      const newXp = oldXp + xpToAward;

      const newXpEarnedToday = xpEarnedToday + xpToAward;
      const newXpWeekly = xpWeekly + xpToAward;
      const newXpMonthly = xpMonthly + xpToAward;
      const newXpYearly = xpYearly + xpToAward;

      const oldLevel = userData.level || 1;
      const newLevel = calculateLevel(newXp);
      const levelUp = newLevel > oldLevel;

      // Update specific counters
      let wins = userData.wins || 0;
      if (action === "winner_1") wins += 1;

      let participated = userData.participated || 0;
      if (action === "registration" || action === "participation") participated += 1;

      let streak = userData.streak || 1;
      if (action === "daily_login" && lastActiveDate) {
        const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }

      const badges = determineBadges(newLevel, wins, participated, streak, userData.badges || []);

      const updateData: any = {
        xp: newXp,
        xpEarnedToday: newXpEarnedToday,
        xpWeekly: newXpWeekly,
        xpMonthly: newXpMonthly,
        xpYearly: newXpYearly,
        level: newLevel,
        wins,
        participated,
        streak,
        badges,
        lastActive: now.toISOString(),
        latestActivityType: action,
        updatedAt: FieldValue.serverTimestamp()
      };

      await userRef.update(updateData);

      res.json({
        success: true,
        xpAwarded: xpToAward,
        newXp,
        newLevel,
        levelUp,
        updateData
      });
    } catch (error) {
      console.error("XP Award API Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Dynamic automatic seeding of competitors endpoint
  app.post("/api/leaderboard/seed", async (req, res) => {
    try {
      const firestore = getAdminDb();
      if (!firestore) {
        res.status(503).json({ error: "Firebase Admin is unavailable" });
        return;
      }

      const usersColl = firestore.collection("users");
      const snapshot = await usersColl.limit(2).get();
      
      const force = req.body.force === true;
      if (!force && snapshot.size >= 10) {
        res.json({ success: true, message: "Leaderboard already populated with 10+ users, skipping auto-seed.", count: snapshot.size });
        return;
      }

      const mockCompetitors = [
        {
          uid: "aarav-sharma-mock",
          fullName: "Aarav Sharma",
          name: "Aarav Sharma",
          username: "aarav_sharma",
          email: "aarav@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          college: "IIT Bombay",
          xp: 5800,
          xpWeekly: 950,
          xpMonthly: 1950,
          xpYearly: 5800,
          xpEarnedToday: 150,
          wins: 4,
          hackathonsParticipated: 8,
          participated: 8,
          streak: 12,
          badges: ["Champion", "Top Contributor", "Hacker", "Pro", "Elite", "Master"],
          github: "aaravsharma",
          linkedin: "aarav-sharma",
          bio: "Passionate full-stack developer building production-grade AI agents and robust distributed systems.",
          lastActive: new Date().toISOString()
        },
        {
          uid: "ananya-gupta-mock",
          fullName: "Ananya Gupta",
          name: "Ananya Gupta",
          username: "ananya_gupta",
          email: "ananya@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
          college: "BITS Pilani",
          xp: 5450,
          xpWeekly: 850,
          xpMonthly: 1750,
          xpYearly: 5450,
          xpEarnedToday: 120,
          wins: 3,
          hackathonsParticipated: 6,
          participated: 6,
          streak: 15,
          badges: ["Innovation Master", "Rising Star", "Hacker", "Pro", "Elite", "Master", "Champion"],
          github: "ananyag",
          linkedin: "ananya-gupta",
          bio: "Machine learning researcher specializing in NLP, transformer models, and alignment techniques.",
          lastActive: new Date(Date.now() - 3600000).toISOString()
        },
        {
          uid: "rohan-mehta-mock",
          fullName: "Rohan Mehta",
          name: "Rohan Mehta",
          username: "rohan_mehta",
          email: "rohan@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
          college: "Delhi Technological University",
          xp: 5100,
          xpWeekly: 700,
          xpMonthly: 1500,
          xpYearly: 5100,
          xpEarnedToday: 95,
          wins: 2,
          hackathonsParticipated: 5,
          participated: 5,
          streak: 9,
          badges: ["Team Player", "Community Hero", "Hacker", "Pro", "Elite", "Master", "Champion"],
          github: "rohanm",
          linkedin: "rohan-mehta",
          bio: "Cloud native systems architect and backend reliability engineer obsessed with zero-downtime deploys.",
          lastActive: new Date(Date.now() - 7200000).toISOString()
        },
        {
          uid: "priya-verma-mock",
          fullName: "Priya Verma",
          name: "Priya Verma",
          username: "priya_verma",
          email: "priya@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
          college: "IIIT Hyderabad",
          xp: 4800,
          xpWeekly: 600,
          xpMonthly: 1300,
          xpYearly: 4800,
          xpEarnedToday: 110,
          wins: 2,
          hackathonsParticipated: 4,
          participated: 4,
          streak: 7,
          badges: ["Rising Star", "Top Contributor", "Hacker", "Pro", "Elite", "Master"],
          github: "priyav",
          linkedin: "priya-verma",
          bio: "UI/UX engineer focused on beautiful functional designs, CSS masterpieces, and accessibility standards.",
          lastActive: new Date(Date.now() - 10800000).toISOString()
        },
        {
          uid: "aditya-singh-mock",
          fullName: "Aditya Singh",
          name: "Aditya Singh",
          username: "aditya_singh",
          email: "aditya@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
          college: "NSUT Delhi",
          xp: 4450,
          xpWeekly: 550,
          xpMonthly: 1150,
          xpYearly: 4450,
          xpEarnedToday: 40,
          wins: 1,
          hackathonsParticipated: 3,
          participated: 3,
          streak: 10,
          badges: ["Innovation Master", "Team Player", "Hacker", "Pro", "Elite", "Master"],
          github: "adityas",
          linkedin: "aditya-singh",
          bio: "Smart contract auditor, blockchain enthusiast, and web3 integration developer.",
          lastActive: new Date(Date.now() - 14400000).toISOString()
        },
        {
          uid: "sneha-kapoor-mock",
          fullName: "Sneha Kapoor",
          name: "Sneha Kapoor",
          username: "sneha_kapoor",
          email: "sneha@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
          college: "RV College of Engineering",
          xp: 4100,
          xpWeekly: 500,
          xpMonthly: 950,
          xpYearly: 4100,
          xpEarnedToday: 60,
          wins: 1,
          hackathonsParticipated: 5,
          participated: 5,
          streak: 8,
          badges: ["Community Hero", "Rising Star", "Hacker", "Pro", "Elite", "Master"],
          github: "snehak",
          linkedin: "sneha-kapoor",
          bio: "Android SDK enthusiast and Kotlin Multiplatform engineer who loves high-performance mobile UI.",
          lastActive: new Date(Date.now() - 18000000).toISOString()
        },
        {
          uid: "arjun-nair-mock",
          fullName: "Arjun Nair",
          name: "Arjun Nair",
          username: "arjun_nair",
          email: "arjun@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
          college: "NIT Trichy",
          xp: 3750,
          xpWeekly: 400,
          xpMonthly: 800,
          xpYearly: 3750,
          xpEarnedToday: 20,
          wins: 1,
          hackathonsParticipated: 3,
          participated: 3,
          streak: 5,
          badges: ["Team Player", "Hacker", "Pro", "Elite", "Master"],
          github: "arjunn",
          linkedin: "arjun-nair",
          bio: "IoT expert and hardware prototyper building smart connected devices with ESP32 and Rust.",
          lastActive: new Date(Date.now() - 86400000).toISOString()
        },
        {
          uid: "kavya-jain-mock",
          fullName: "Kavya Jain",
          name: "Kavya Jain",
          username: "kavya_jain",
          email: "kavya@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
          college: "Vellore Institute of Technology",
          xp: 3400,
          xpWeekly: 300,
          xpMonthly: 600,
          xpYearly: 3400,
          xpEarnedToday: 15,
          wins: 0,
          hackathonsParticipated: 4,
          participated: 4,
          streak: 6,
          badges: ["Rising Star", "Hacker", "Pro", "Elite"],
          github: "kavyaj",
          linkedin: "kavya-jain",
          bio: "Data storyteller transforming unstructured raw datasets into highly actionable strategic insights.",
          lastActive: new Date(Date.now() - 10800000).toISOString()
        },
        {
          uid: "rahul-mishra-mock",
          fullName: "Rahul Mishra",
          name: "Rahul Mishra",
          username: "rahul_mishra",
          email: "rahul@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
          college: "SRM University",
          xp: 2950,
          xpWeekly: 250,
          xpMonthly: 500,
          xpYearly: 2950,
          xpEarnedToday: 10,
          wins: 0,
          hackathonsParticipated: 3,
          participated: 3,
          streak: 4,
          badges: ["Innovation Master", "Hacker", "Pro", "Elite"],
          github: "rahulm",
          linkedin: "rahul-mishra",
          bio: "Performance optimization geek who loves writing blazingly fast backend handlers and query plans.",
          lastActive: new Date(Date.now() - 172800000).toISOString()
        },
        {
          uid: "neha-agarwal-mock",
          fullName: "Neha Agarwal",
          name: "Neha Agarwal",
          username: "neha_agarwal",
          email: "neha@hackops.ai",
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          college: "PSG College of Technology",
          xp: 2500,
          xpWeekly: 150,
          xpMonthly: 400,
          xpYearly: 2500,
          xpEarnedToday: 0,
          wins: 0,
          hackathonsParticipated: 2,
          participated: 2,
          streak: 3,
          badges: ["Community Hero", "Hacker", "Pro", "Elite"],
          github: "nehaa",
          linkedin: "neha-agarwal",
          bio: "Passionate open source contributor focused on modern front-end framework optimizations.",
          lastActive: new Date(Date.now() - 220000000).toISOString()
        }
      ];

      const batch = firestore.batch();
      for (const comp of mockCompetitors) {
        const ref = usersColl.doc(comp.uid);
        const calculatedLevel = calculateLevel(comp.xp);
        batch.set(ref, {
          ...comp,
          level: calculatedLevel,
          role: "user",
          isAdmin: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();
      res.json({ success: true, message: "Successfully seeded mock competitors onto leaderboard.", count: mockCompetitors.length });
    } catch (error) {
      console.error("Seeding API Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
