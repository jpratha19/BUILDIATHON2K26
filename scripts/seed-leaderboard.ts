import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch, serverTimestamp } from "firebase/firestore";

import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);
const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

function calculateLevel(xp: number): number {
  if (xp >= 5000) return 6;
  if (xp >= 3500) return 5;
  if (xp >= 2000) return 4;
  if (xp >= 1000) return 3;
  if (xp >= 500) return 2;
  return 1;
}

const demoUsers = [
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

async function seed() {
  console.log("Starting seeding process via Client SDK...");
  const batch = writeBatch(db);

  for (const user of demoUsers) {
    const docRef = doc(db, "users", user.uid);
    const calculatedLevel = calculateLevel(user.xp);
    
    const payload = {
      ...user,
      level: calculatedLevel,
      role: "user",
      isAdmin: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    batch.set(docRef, payload, { merge: true });
    console.log(`Prepared user: ${user.name} (XP: ${user.xp}, Level: ${calculatedLevel})`);
  }

  await batch.commit();
  console.log("Successfully seeded 10 unique demo users via Client SDK!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
