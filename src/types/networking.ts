import { Timestamp } from "firebase/firestore";

export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  profileImage?: string;
  college?: string;
  year?: string;
  skills?: string[];
  techStack?: string;
  interests?: string[];
  preferredRole?: string;
  experienceLevel?: "Beginner" | "Intermediate" | "Advanced";
  github?: string;
  linkedin?: string;
  teamStatus?: "Looking for Team" | "Already in Team";
  availability?: string;
  role?: "admin" | "user";
  isAdmin?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Connection {
  id: string; // sorted compound: user1_user2
  userIds: string[];
  status: "pending" | "accepted";
  senderId: string;
  receiverId: string;
  createdAt: Timestamp;
}

export interface TeamInvite {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  githubLink?: string;
  projectIdea?: string;
  problemDiscussed?: string;
  createdAt: Timestamp;
}

export interface FeedReply {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  replies: FeedReply[];
  createdAt: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  category: "Looking for Backend Developer" | "Need UI Designer" | "Searching for AI Engineer" | "General";
  likes: string[]; // list of user uids
  comments: FeedComment[];
  createdAt: Timestamp;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "Registration" | "Session" | "Deadline" | "Winner";
  createdAt: Timestamp;
}

export interface Mentor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  college: string;
  bio: string;
  skills: string[];
}

export interface AppNotification {
  id: string;
  userId: string; // receiver
  senderId: string; // initiator
  senderName: string;
  type: "connection_request" | "connection_accepted" | "team_invite" | "mentor_reply" | "announcement";
  title: string;
  body: string;
  metadata?: {
    inviteId?: string;
    connectionId?: string;
    postId?: string;
    chatId?: string;
  };
  read: boolean;
  createdAt: Timestamp;
}

export const PRESET_SKILLS = [
  "React", "Vue", "Next.js", "Node.js", "Python", "PyTorch", "TensorFlow", 
  "Solidity", "Rust", "Docker", "Kubernetes", "Figma", "Tailwind CSS", 
  "PostgreSQL", "Firebase", "MongoDB", "Go", "TypeScript", "OpenAI API", 
  "LangChain", "Hugging Face", "AWS", "GCP", "CyberSecurity", "Blockchain"
];

export const PRESET_ROLES = [
  "Frontend", "Backend", "AI/ML", "UI/UX", "Blockchain", "Cloud", "Cybersecurity", "Fullstack", "DevOps"
];

export const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
];
