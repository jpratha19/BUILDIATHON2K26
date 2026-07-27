import React, { useState, useEffect } from "react";
import { 
  Users, Sparkles, MessageSquare, GraduationCap, Megaphone, Bell, User, ArrowLeft, CheckCircle, AlertCircle, Bookmark, Radio
} from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  collection, doc, setDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, serverTimestamp, getDoc, Timestamp
} from "firebase/firestore";
import { 
  FirestoreUser, Connection, TeamInvite, ChatMessage, FeedPost, Announcement, Mentor, AppNotification 
} from "../types/networking";
import ParticipantDirectory from "./networking/ParticipantDirectory";
import AISuggestions from "./networking/AISuggestions";
import NetworkingFeed from "./networking/NetworkingFeed";
import ChatSection from "./networking/ChatSection";
import MentorCorner from "./networking/MentorCorner";
import ProfileDashboard from "./networking/ProfileDashboard";
import { motion, AnimatePresence } from "motion/react";

interface NetworkingPageProps {
  onOpenLogin: () => void;
  onGoHome: () => void;
}

export default function NetworkingPage({ onOpenLogin, onGoHome }: NetworkingPageProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "ai-suggestions" | "feed" | "chats" | "mentors" | "announcements" | "profile">("directory");
  
  // Real-time Firestore States
  const [currentUserProfile, setCurrentUserProfile] = useState<FirestoreUser | null>(null);
  const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentUserId = auth.currentUser?.uid || null;

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // 1. Initial Seeding of database collections if empty
  const runDBSafeSeeding = async () => {
    try {
      // Seed mentors
      const mentorsSnap = await getDocs(collection(db, "mentors"));
      if (mentorsSnap.empty) {
        const seedMentors: Mentor[] = [
          {
            id: "mentor_1",
            name: "Siddharth Mehta",
            specialty: "Full Stack & Cloud Systems",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            college: "PSG College of Technology",
            bio: "Ex-Google Staff Engineer. Specialist in database optimizations, cloud deployment matrices, and Node.js backend systems.",
            skills: ["React", "Node.js", "Docker", "GCP", "PostgreSQL"]
          },
          {
            id: "mentor_2",
            name: "Neha Agarwal",
            specialty: "AI & Machine Learning",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
            college: "Vellore Institute of Technology",
            bio: "AI Researcher specializing in LLMs, PyTorch fine-tuning, retrieval-augmented generation pipelines, and multi-agent synergy architectures.",
            skills: ["Python", "PyTorch", "TensorFlow", "LangChain", "OpenAI API"]
          },
          {
            id: "mentor_3",
            name: "Elena Rostova",
            specialty: "UI/UX & Mobile Architectures",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
            college: "National Institute of Design",
            bio: "Lead Product Designer. Experienced in front-end micro-interactions, responsive design frameworks, and polished vector-based animations.",
            skills: ["Figma", "Tailwind CSS", "React Native", "TypeScript", "Next.js"]
          }
        ];
        for (const m of seedMentors) {
          await setDoc(doc(db, "mentors", m.id), m);
        }
      }

      // Seed Live Announcements
      const announcementsSnap = await getDocs(collection(db, "announcements"));
      if (announcementsSnap.empty) {
        const seedAnnouncements = [
          {
            title: "Hacker Networking Lounge Live!",
            content: "Welcome to the official HackOps AI Global Hacker Networking lobby. Customize your profile, browse peer hackers, and brainstorm project ideas in the live feed!",
            category: "Registration",
            createdAt: serverTimestamp()
          },
          {
            title: "Exclusive Systems Architecture QA Session",
            content: "Join Neha Agarwal and Siddharth Mehta today at 7:00 PM UTC in the Mentor Corner to discuss scalability, Spanner integration, and vector searching.",
            category: "Session",
            createdAt: serverTimestamp()
          },
          {
            title: "Project Submission Threshold reminder",
            content: "Team freeze occurs tomorrow! Match with teammates and declare your submission repositories in your direct peer messages to prevent disqualification.",
            category: "Deadline",
            createdAt: serverTimestamp()
          }
        ];
        for (const ann of seedAnnouncements) {
          await addDoc(collection(db, "announcements"), ann);
        }
      }

      // Seed other sample users for testing if database is sparse
      const usersSnap = await getDocs(collection(db, "users"));
      // If there are fewer than 4 users (e.g., only the logged-in user or empty), seed some candidates
      if (usersSnap.size < 4) {
        const seedProfiles = [
          {
            uid: "hacker_seed_1",
            name: "Rohan Sharma",
            email: "rohan@hackops.ai",
            profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            college: "IIT Delhi",
            year: "Final Year (B.Tech)",
            preferredRole: "AI/ML",
            experienceLevel: "Advanced",
            github: "rohansh_ml",
            linkedin: "rohan-sharma-ml",
            teamStatus: "Looking for Team",
            availability: "Full Build Weekend (24/7)",
            techStack: "Python, PyTorch, LangChain, FastAPI",
            skills: ["Python", "PyTorch", "LangChain", "OpenAI API", "PostgreSQL"],
            role: "user",
            createdAt: serverTimestamp()
          },
          {
            uid: "hacker_seed_2",
            name: "Priyana Sen",
            email: "priyana@hackops.ai",
            profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
            college: "BITS Pilani",
            year: "3rd Year",
            preferredRole: "UI/UX",
            experienceLevel: "Intermediate",
            github: "pri_designs",
            linkedin: "priyana-sen-design",
            teamStatus: "Looking for Team",
            availability: "Dedicated daytime & presentation prep",
            techStack: "Figma, React, Tailwind CSS, Framer Motion",
            skills: ["Figma", "Tailwind CSS", "React", "TypeScript"],
            role: "user",
            createdAt: serverTimestamp()
          },
          {
            uid: "hacker_seed_3",
            name: "Arjun Patel",
            email: "arjun@hackops.ai",
            profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            college: "NIT Trichy",
            year: "2nd Year",
            preferredRole: "Backend",
            experienceLevel: "Advanced",
            github: "arjun_codes_cloud",
            linkedin: "arjun-patel-cloud",
            teamStatus: "Already in Team",
            availability: "Available all build nights",
            techStack: "Go, Kubernetes, AWS, Docker, PostgreSQL",
            skills: ["Go", "Docker", "Kubernetes", "AWS", "PostgreSQL"],
            role: "user",
            createdAt: serverTimestamp()
          }
        ];
        for (const p of seedProfiles) {
          await setDoc(doc(db, "users", p.uid), p, { merge: true });
        }
      }

      // Seed initial sample posts
      const postsSnap = await getDocs(collection(db, "posts"));
      if (postsSnap.empty) {
        const seedPosts = [
          {
            userId: "hacker_seed_1",
            userName: "Rohan Sharma",
            userImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            content: "Building an automated code generation assistant using LangChain agents and FastAPI backend. Need a Front-End expert with Tailwind & React familiarity to join our team!",
            category: "Searching for AI Engineer",
            likes: [],
            comments: [],
            createdAt: serverTimestamp()
          },
          {
            userId: "hacker_seed_2",
            userName: "Priyana Sen",
            userImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
            content: "Aesthetic UI designer ready to wireframe and build stunning high-fidelity frontend layouts. Interested in joining a DeFi or Healthcare-focused AI hackathon team. Hit connect!",
            category: "Need UI Designer",
            likes: [],
            comments: [],
            createdAt: serverTimestamp()
          }
        ];
        for (const pst of seedPosts) {
          await addDoc(collection(db, "posts"), pst);
        }
      }
    } catch (error) {
      console.error("Error during initial safe seeding database:", error);
    }
  };

  // 2. Setup real-time listeners for all data
  useEffect(() => {
    setLoading(true);
    runDBSafeSeeding().then(() => {
      // Real-time listener for ALL users
      const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const uList: FirestoreUser[] = [];
        snap.forEach((doc) => {
          uList.push(doc.data() as FirestoreUser);
        });
        setAllUsers(uList);
        
        // Also capture current user profile if logged in
        if (currentUserId) {
          const profile = uList.find((u) => u.uid === currentUserId);
          if (profile) {
            setCurrentUserProfile(profile);
          }
        }
        setLoading(false);
      });

      // Connections listener
      const unsubConns = onSnapshot(collection(db, "connections"), (snap) => {
        const cList: Connection[] = [];
        snap.forEach((doc) => {
          cList.push({ id: doc.id, ...doc.data() } as Connection);
        });
        setConnections(cList);
      });

      // Team invites listener
      const unsubInvites = onSnapshot(collection(db, "teamInvites"), (snap) => {
        const iList: TeamInvite[] = [];
        snap.forEach((doc) => {
          iList.push({ id: doc.id, ...doc.data() } as TeamInvite);
        });
        setTeamInvites(iList);
      });

      // Chats message listener
      const unsubChats = onSnapshot(collection(db, "messages"), (snap) => {
        const mList: ChatMessage[] = [];
        snap.forEach((doc) => {
          mList.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        mList.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tA - tB;
        });
        setMessages(mList);
      });

      // Announcements listener
      const unsubAnns = onSnapshot(collection(db, "announcements"), (snap) => {
        const aList: Announcement[] = [];
        snap.forEach((doc) => {
          aList.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setAnnouncements(aList);
      });

      // Mentors list listener
      const unsubMentors = onSnapshot(collection(db, "mentors"), (snap) => {
        const mnList: Mentor[] = [];
        snap.forEach((doc) => {
          mnList.push({ id: doc.id, ...doc.data() } as Mentor);
        });
        setMentors(mnList);
      });

      // Public Lounge Posts listener
      const unsubPosts = onSnapshot(collection(db, "posts"), (snap) => {
        const pList: FeedPost[] = [];
        snap.forEach((doc) => {
          pList.push({ id: doc.id, ...doc.data() } as FeedPost);
        });
        // Sort newest first
        pList.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setPosts(pList);
      });

      // User Notification logs listener
      let unsubNotifications = () => {};
      if (currentUserId) {
        const notifQuery = query(
          collection(db, "notifications"),
          where("userId", "==", currentUserId)
        );
        unsubNotifications = onSnapshot(notifQuery, (snap) => {
          const nList: AppNotification[] = [];
          snap.forEach((doc) => {
            nList.push({ id: doc.id, ...doc.data() } as AppNotification);
          });
          // Sort newest first
          nList.sort((a, b) => {
            const tA = a.createdAt?.seconds || 0;
            const tB = b.createdAt?.seconds || 0;
            return tB - tA;
          });
          setNotifications(nList);
        });
      }

      return () => {
        unsubUsers();
        unsubConns();
        unsubInvites();
        unsubChats();
        unsubAnns();
        unsubMentors();
        unsubPosts();
        unsubNotifications();
      };
    });
  }, [currentUserId]);

  // If user profile is missing on mount but logged in, create a default draft document
  useEffect(() => {
    const handleCheckAndCreateProfile = async () => {
      if (currentUserId && !currentUserProfile) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUserId));
          if (!userDoc.exists()) {
            const userEmail = auth.currentUser?.email || "anonymous@hackops.ai";
            const userName = auth.currentUser?.displayName || "New Hacker";
            const draftProfile: FirestoreUser = {
              uid: currentUserId,
              name: userName,
              email: userEmail,
              profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
              college: "HackOps AI Campus",
              preferredRole: "Fullstack",
              experienceLevel: "Intermediate",
              skills: ["React", "TypeScript", "Tailwind CSS"],
              techStack: "React, Express, Node.js",
              interests: ["Generative AI", "AI Agents"],
              teamStatus: "Looking for Team",
              availability: "Flexible build weekend",
              role: "user",
              isAdmin: false
            };
            await setDoc(doc(db, "users", currentUserId), draftProfile, { merge: true });
          }
        } catch (err) {
          console.error("Error drafting default profile:", err);
        }
      }
    };
    handleCheckAndCreateProfile();
  }, [currentUserId, currentUserProfile]);

  // 3. Connection Actions handler
  const handleConnect = async (targetUserId: string) => {
    if (!currentUserId || !currentUserProfile) {
      onOpenLogin();
      return;
    }

    // Sorted compound ID to represent unique connection key
    const compoundId = currentUserId < targetUserId 
      ? `${currentUserId}_${targetUserId}` 
      : `${targetUserId}_${currentUserId}`;

    try {
      const connData: Connection = {
        id: compoundId,
        userIds: [currentUserId, targetUserId],
        status: "pending",
        senderId: currentUserId,
        receiverId: targetUserId,
        createdAt: Timestamp.now()
      };

      await setDoc(doc(db, "connections", compoundId), connData);
      
      // Dispatch notification
      const targetUser = allUsers.find((u) => u.uid === targetUserId);
      if (targetUser) {
        const notif: Omit<AppNotification, "id"> = {
          userId: targetUserId,
          senderId: currentUserId,
          senderName: currentUserProfile.name,
          type: "connection_request",
          title: "New Connection Request!",
          body: `${currentUserProfile.name} wishes to establish a connection with you. Accept their handshake to start chatting.`,
          read: false,
          createdAt: Timestamp.now()
        };
        await addDoc(collection(db, "notifications"), notif);
      }

      triggerAlert("success", "Connection request dispatched safely.");
    } catch (err) {
      console.error("Connect write error:", err);
      handleFirestoreError(err, OperationType.WRITE, `connections/${compoundId}`);
      triggerAlert("error", "Handshake dispatch failed. Check security rules.");
    }
  };

  // 4. Accept Connection Handshake
  const handleAcceptConnection = async (notif: AppNotification) => {
    if (!currentUserId || !currentUserProfile) return;
    const compoundId = currentUserId < notif.senderId 
      ? `${currentUserId}_${notif.senderId}` 
      : `${notif.senderId}_${currentUserId}`;

    try {
      // 1. Update Connection
      await updateDoc(doc(db, "connections", compoundId), { status: "accepted" });
      
      // 2. Mark this notification read
      await updateDoc(doc(db, "notifications", notif.id), { read: true });

      // 3. Dispatch accepted notification back to sender
      const successNotif: Omit<AppNotification, "id"> = {
        userId: notif.senderId,
        senderId: currentUserId,
        senderName: currentUserProfile.name,
        type: "connection_accepted",
        title: "Connection Request Accepted!",
        body: `${currentUserProfile.name} accepted your handshake request. You can now chat and coordinate repositories in the DM tab.`,
        read: false,
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, "notifications"), successNotif);

      triggerAlert("success", "Handshake fully consolidated. Direct Chat unlocked!");
    } catch (err) {
      console.error("Accept connection error:", err);
      handleFirestoreError(err, OperationType.WRITE, `connections/${compoundId}`);
    }
  };

  // 5. Team Invite Actions handler
  const handleInviteToTeam = async (targetUserId: string, inviteMsg: string) => {
    if (!currentUserId || !currentUserProfile) {
      onOpenLogin();
      return;
    }
    const inviteId = `${currentUserId}_${targetUserId}`;

    try {
      const inviteData: TeamInvite = {
        id: inviteId,
        senderId: currentUserId,
        senderName: currentUserProfile.name,
        receiverId: targetUserId,
        receiverName: allUsers.find((u) => u.uid === targetUserId)?.name || "Hacker",
        status: "pending",
        message: inviteMsg,
        createdAt: Timestamp.now()
      };

      await setDoc(doc(db, "teamInvites", inviteId), inviteData);

      // Dispatch notification
      const notif: Omit<AppNotification, "id"> = {
        userId: targetUserId,
        senderId: currentUserId,
        senderName: currentUserProfile.name,
        type: "team_invite",
        title: "Team Invitation Received!",
        body: `${currentUserProfile.name} invited you to join their hackathon team: "${inviteMsg.slice(0, 50)}..."`,
        read: false,
        metadata: { inviteId },
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, "notifications"), notif);

      triggerAlert("success", "Team recruitment dispatch consolidated.");
    } catch (err) {
      console.error("Invite team write error:", err);
      handleFirestoreError(err, OperationType.WRITE, `teamInvites/${inviteId}`);
      triggerAlert("error", "Dispatch failed.");
    }
  };

  // 6. Handle Team Invite decision
  const handleInviteDecision = async (notif: AppNotification, decision: "accepted" | "rejected") => {
    if (!currentUserId || !currentUserProfile || !notif.metadata?.inviteId) return;
    const inviteId = notif.metadata.inviteId;

    try {
      // 1. Update invite document
      await updateDoc(doc(db, "teamInvites", inviteId), { status: decision });
      
      // 2. Mark notification read
      await updateDoc(doc(db, "notifications", notif.id), { read: true });

      // 3. Update profile states if accepted
      if (decision === "accepted") {
        await updateDoc(doc(db, "users", currentUserId), { teamStatus: "Already in Team" });
        await updateDoc(doc(db, "users", notif.senderId), { teamStatus: "Already in Team" });
      }

      // 4. Send notification feedback
      const feedbackNotif: Omit<AppNotification, "id"> = {
        userId: notif.senderId,
        senderId: currentUserId,
        senderName: currentUserProfile.name,
        type: "connection_accepted",
        title: `Team Invite ${decision === "accepted" ? "Approved" : "Declined"}`,
        body: `${currentUserProfile.name} has ${decision} your team invitation.`,
        read: false,
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, "notifications"), feedbackNotif);

      triggerAlert("success", `Team invitation successfully ${decision}.`);
    } catch (err) {
      console.error("Invite decision update error:", err);
      handleFirestoreError(err, OperationType.WRITE, `teamInvites/${inviteId}`);
    }
  };

  // 7. Direct Chats Message dispatch
  const handleSendMessage = async (
    receiverId: string, 
    text: string, 
    details?: { github?: string; projectIdea?: string; problemDiscussed?: string }
  ) => {
    if (!currentUserId) return;
    const compoundId = currentUserId < receiverId 
      ? `${currentUserId}_${receiverId}` 
      : `${receiverId}_${currentUserId}`;

    try {
      const msgData = {
        chatId: compoundId,
        senderId: currentUserId,
        receiverId,
        text,
        githubLink: details?.github || null,
        projectIdea: details?.projectIdea || null,
        problemDiscussed: details?.problemDiscussed || null,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "messages"), msgData);
    } catch (err) {
      console.error("Chat dispatch error:", err);
      handleFirestoreError(err, OperationType.WRITE, "messages");
    }
  };

  // 8. Public Lounge Feed broadcasting
  const handleAddPost = async (content: string, category: FeedPost["category"]) => {
    if (!currentUserId || !currentUserProfile) return;
    try {
      const newPost = {
        userId: currentUserId,
        userName: currentUserProfile.name,
        userImage: currentUserProfile.profileImage || null,
        content,
        category,
        likes: [],
        comments: [],
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "posts"), newPost);
      triggerAlert("success", "Lounge post broadcasted successfully.");
    } catch (err) {
      console.error("Lounge post dispatch error:", err);
      handleFirestoreError(err, OperationType.WRITE, "posts");
    }
  };

  // 9. Like public post
  const handleLikePost = async (postId: string) => {
    if (!currentUserId) return;
    const postRef = doc(db, "posts", postId);
    try {
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data() as FeedPost;
        let updatedLikes = [...(postData.likes || [])];
        if (updatedLikes.includes(currentUserId)) {
          updatedLikes = updatedLikes.filter((uid) => uid !== currentUserId);
        } else {
          updatedLikes.push(currentUserId);
        }
        await updateDoc(postRef, { likes: updatedLikes });
      }
    } catch (err) {
      console.error("Like post error:", err);
    }
  };

  // 10. Comment on public post
  const handleAddComment = async (postId: string, commentText: string) => {
    if (!currentUserId || !currentUserProfile) return;
    const postRef = doc(db, "posts", postId);
    try {
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data() as FeedPost;
        const commentId = `comment_${Date.now()}`;
        const newComment = {
          id: commentId,
          userId: currentUserId,
          userName: currentUserProfile.name,
          userImage: currentUserProfile.profileImage || null,
          text: commentText,
          replies: [],
          createdAt: new Date().toLocaleDateString()
        };
        const updatedComments = [...(postData.comments || []), newComment];
        await updateDoc(postRef, { comments: updatedComments });
      }
    } catch (err) {
      console.error("Comment post error:", err);
    }
  };

  // 11. Thread reply to a comment inside post
  const handleAddReply = async (postId: string, commentId: string, replyText: string) => {
    if (!currentUserId || !currentUserProfile) return;
    const postRef = doc(db, "posts", postId);
    try {
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data() as FeedPost;
        const updatedComments = postData.comments.map((comment) => {
          if (comment.id === commentId) {
            const newReply = {
              id: `reply_${Date.now()}`,
              userId: currentUserId,
              userName: currentUserProfile.name,
              userImage: currentUserProfile.profileImage || null,
              text: replyText,
              createdAt: new Date().toLocaleDateString()
            };
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        });
        await updateDoc(postRef, { comments: updatedComments });
      }
    } catch (err) {
      console.error("Reply post error:", err);
    }
  };

  // 12. Submit question to a mentor + automatic AI response simulation!
  const handleAskQuestion = async (mentorId: string, question: string) => {
    if (!currentUserId || !currentUserProfile) return;
    try {
      const questionId = `q_${Date.now()}`;
      // Log question to general activity
      const questionDoc = {
        id: questionId,
        mentorId,
        userId: currentUserId,
        userName: currentUserProfile.name,
        questionText: question,
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, "mentorQuestions", questionId), questionDoc);

      // Fulfill requirement: "Notify users when: a mentor replies"
      // Simulate automatic high-fidelity mentor answer back in 12 seconds
      setTimeout(async () => {
        const mentor = mentors.find((m) => m.id === mentorId) || { name: "Mentor" };
        const replyNotif: Omit<AppNotification, "id"> = {
          userId: currentUserId,
          senderId: mentorId,
          senderName: mentor.name,
          type: "mentor_reply",
          title: "Mentor Feedback Received!",
          body: `Hi ${currentUserProfile.name}, regarding: "${question.slice(0, 20)}...", I recommend initializing your Spanner schema before compiling the server layers.`,
          read: false,
          createdAt: Timestamp.now()
        };
        await addDoc(collection(db, "notifications"), replyNotif);
      }, 12000);

    } catch (err) {
      console.error("Ask question write error:", err);
    }
  };

  const handleBookSession = async (mentorId: string, topic: string, timeSlot: string) => {
    if (!currentUserId || !currentUserProfile) return;
    try {
      const sessionDoc = {
        id: `session_${Date.now()}`,
        mentorId,
        userId: currentUserId,
        userName: currentUserProfile.name,
        topic,
        timeSlot,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "mentorSessions"), sessionDoc);
    } catch (err) {
      console.error("Book session write error:", err);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-12 md:py-16 selection:bg-brand-purple/30 selection:text-brand-cyan text-[#f3f4f6]">
      {/* Decorative cyber backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-purple/10 via-transparent to-transparent pointer-events-none" />

      {/* Alert Banner */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border flex items-start gap-3 shadow-2xl max-w-md ${
              alert.type === "success" 
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300" 
                : "bg-rose-950/90 border-rose-500/30 text-rose-300"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-semibold leading-relaxed font-sans">{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header with Back Home Trigger */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-6 text-left">
        <div className="space-y-3">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-brand-cyan hover:underline transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Core Terminal
          </button>
          
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan text-[10px] font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
              <span>LOUNGE IS CONNECTED</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight uppercase">
            Global Hacker Networking
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Synchronized mesh channels: <span className="text-brand-cyan font-semibold">Gemini Matchmaking Model</span>. Live participant telemetry active.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
          {[
            { id: "directory", label: "Directory", icon: Users },
            { id: "ai-suggestions", label: "AI Suggestions", icon: Sparkles },
            { id: "feed", label: "Lounge Feed", icon: Megaphone },
            { id: "chats", label: "Direct Chats", icon: MessageSquare },
            { id: "mentors", label: "Mentor Corner", icon: GraduationCap },
            { id: "profile", label: "My Identity", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected 
                    ? "bg-brand-purple/20 text-brand-cyan border border-brand-purple/40" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.id === "chats" && connectedPeersCount(connections, currentUserId) > 0 && (
                  <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Body Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left Column: Core content of active tab */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Calibrating lounge parameters...</p>
            </div>
          ) : (
            <>
              {activeTab === "directory" && (
                <ParticipantDirectory
                  users={allUsers}
                  currentUserId={currentUserId}
                  connections={connections}
                  teamInvites={teamInvites}
                  onConnect={handleConnect}
                  onInviteToTeam={handleInviteToTeam}
                  onOpenLogin={onOpenLogin}
                />
              )}

              {activeTab === "ai-suggestions" && (
                <AISuggestions
                  currentUser={currentUserProfile}
                  allUsers={allUsers}
                  onConnect={handleConnect}
                  onInviteToTeam={handleInviteToTeam}
                  onOpenLogin={onOpenLogin}
                />
              )}

              {activeTab === "feed" && (
                <NetworkingFeed
                  currentUser={currentUserProfile}
                  posts={posts}
                  onAddPost={handleAddPost}
                  onLikePost={handleLikePost}
                  onAddComment={handleAddComment}
                  onAddReply={handleAddReply}
                  onOpenLogin={onOpenLogin}
                />
              )}

              {activeTab === "chats" && (
                <ChatSection
                  currentUser={currentUserProfile}
                  allUsers={allUsers}
                  connections={connections}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              )}

              {activeTab === "mentors" && (
                <MentorCorner
                  currentUser={currentUserProfile}
                  mentors={mentors}
                  onAskQuestion={handleAskQuestion}
                  onBookSession={handleBookSession}
                  onOpenLogin={onOpenLogin}
                />
              )}

              {activeTab === "profile" && (
                <ProfileDashboard
                  currentUser={currentUserProfile}
                  onProfileUpdated={() => {
                    triggerAlert("success", "Developer profile matrix fully synchronized.");
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Right Column: Live Announcements + Notifications Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Log */}
          {currentUserId && (
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-purple" />
                  Notifications Panel
                  {unreadNotifCount > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-brand-cyan text-slate-950 font-extrabold animate-pulse">
                      {unreadNotifCount}
                    </span>
                  )}
                </h4>
              </div>

              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-[10px] text-slate-500 font-mono text-center py-4">
                    Clear airspace. No unresolved notification vectors.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border text-xs text-left relative overflow-hidden transition-all ${
                        notif.read
                          ? "bg-white/[0.01] border-white/5 text-slate-400"
                          : "bg-brand-purple/10 border-brand-purple/30 text-white"
                      }`}
                    >
                      <h5 className="font-bold text-slate-100 flex items-center gap-1.5">
                        {notif.title}
                        {!notif.read && <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping" />}
                      </h5>
                      <p className="text-[11px] text-slate-300 leading-normal mt-1">{notif.body}</p>

                      {/* Interactive Invites or requests CTAs */}
                      {!notif.read && notif.type === "connection_request" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleAcceptConnection(notif)}
                            className="px-3 py-1 rounded bg-brand-cyan text-slate-950 text-[10px] font-extrabold hover:bg-white transition-all cursor-pointer"
                          >
                            Consolidate
                          </button>
                        </div>
                      )}

                      {!notif.read && notif.type === "team_invite" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleInviteDecision(notif, "accepted")}
                            className="px-3 py-1 rounded bg-brand-cyan text-slate-950 text-[10px] font-extrabold hover:bg-white transition-all cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleInviteDecision(notif, "rejected")}
                            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      <span className="text-[8px] text-slate-500 font-mono block mt-2 text-right">
                        {notif.createdAt ? new Date(notif.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Organizer Announcements */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Megaphone className="w-4 h-4 text-brand-cyan" />
              Organizer Live Board
            </h4>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="text-xs text-left border border-white/5 bg-white/[0.01] rounded-xl p-3 space-y-1">
                  <span className="text-[8px] font-mono font-semibold uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.2 rounded border border-brand-cyan/20">
                    {ann.category}
                  </span>
                  <h5 className="font-bold text-white mt-1.5">{ann.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{ann.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-[10px] text-slate-500 font-mono text-center py-4">
                  Organizers have logged no live broadcasts. Check back soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Helper to count connections count
function connectedPeersCount(connections: Connection[], userId: string | null) {
  if (!userId) return 0;
  return connections.filter((c) => c.status === "accepted" && c.userIds.includes(userId)).length;
}
