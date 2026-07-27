import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface Message {
  sender: "user" | "mentor";
  message: string;
  timestamp: string;
}

const SUGGESTIONS = [
  { label: "Explain this error", prompt: "Can you help me understand what is causing this error?" },
  { label: "Help me debug code", prompt: "Here is my code that needs debugging, can you help find the bug?" },
  { label: "Suggest project ideas", prompt: "What are some highly innovative project ideas for a hackathon?" },
  { label: "Recommend tech stack", prompt: "Can you recommend a fast and scalable tech stack for my web/mobile app?" },
  { label: "Improve my project", prompt: "How can I improve my project's features, scalability, or code quality?" },
  { label: "Explain React", prompt: "Can you explain how React hooks work and how to avoid unnecessary re-renders?" },
  { label: "Firebase Help", prompt: "How do I secure my Firestore database using security rules and prevent unauthorized reads?" },
  { label: "DSA Help", prompt: "Can you help me understand a specific data structure or algorithm concept?" }
];

export default function AIMentorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener("open-ai-mentor", handleOpenEvent);
    return () => window.removeEventListener("open-ai-mentor", handleOpenEvent);
  }, []);

  // Auto-scroll on new messages or typing state changes
  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Auth sync and history loader
  useEffect(() => {
    const initialGreeting: Message = {
      sender: "mentor",
      message: "👋 G'day hacker! I'm your 24/7 AI Hackathon Mentor. Stuck on an API connection, pitching logic, or code compilation? Select a prompt below or ask me anything!",
      timestamp: new Date().toISOString()
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const chatRef = doc(db, "users", currentUser.uid, "chats", "hackops-session");
        try {
          const docSnap = await getDoc(chatRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages(data.messages);
            } else {
              setMessages([initialGreeting]);
              await setDoc(chatRef, {
                chatId: "hackops-session",
                userId: currentUser.uid,
                messages: [initialGreeting],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            }
          } else {
            setMessages([initialGreeting]);
            await setDoc(chatRef, {
              chatId: "hackops-session",
              userId: currentUser.uid,
              messages: [initialGreeting],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error loading chat history:", error);
          setMessages([initialGreeting]);
        }
      } else {
        const localHistory = localStorage.getItem("hackops_chat_history");
        if (localHistory) {
          try {
            const parsed = JSON.parse(localHistory);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
            } else {
              setMessages([initialGreeting]);
            }
          } catch (e) {
            setMessages([initialGreeting]);
          }
        } else {
          setMessages([initialGreeting]);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const saveMessages = async (updatedMessages: Message[], currentUser: User | null) => {
    setMessages(updatedMessages);
    if (currentUser) {
      const chatRef = doc(db, "users", currentUser.uid, "chats", "hackops-session");
      try {
        await setDoc(chatRef, {
          chatId: "hackops-session",
          userId: currentUser.uid,
          messages: updatedMessages,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving chat history to Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}/chats/hackops-session`);
      }
    } else {
      localStorage.setItem("hackops_chat_history", JSON.stringify(updatedMessages));
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const currentMsg: Message = {
      message: textToSend,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, currentMsg];
    setInputValue("");
    setIsTyping(true);
    
    // Save locally or to Firestore
    await saveMessages(updatedMessages, user);

    try {
      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from AI Mentor");
      }

      const data = await response.json();
      const replyText = data.reply || "I'm sorry, I could not generate a response.";

      const aiMsg: Message = {
        message: replyText,
        sender: "mentor",
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMsg];
      await saveMessages(finalMessages, user);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        message: "⚠️ Connection error. I couldn't reach the HackOps AI core. Please check your network or try again.",
        sender: "mentor",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    const initialGreeting: Message = {
      sender: "mentor",
      message: "👋 G'day hacker! I'm your 24/7 AI Hackathon Mentor. Stuck on an API connection, pitching logic, or code compilation? Select a prompt below or ask me anything!",
      timestamp: new Date().toISOString()
    };
    await saveMessages([initialGreeting], user);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "Just now";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-[calc(100vw-32px)] sm:w-[380px] h-[550px] max-h-[80vh] rounded-3xl glass-panel border border-brand-purple/30 bg-[#060320]/95 shadow-[0_10px_50px_rgba(124,58,237,0.35)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#0b072c] border-b border-white/5 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 text-left">
                <div className="relative">
                  <div className="absolute -inset-1 rounded bg-gradient-to-r from-brand-purple to-brand-cyan opacity-80 blur-xs"></div>
                  <div className="relative bg-[#0d092c] p-1.5 rounded border border-white/10">
                    <Bot className="w-4 h-4 text-brand-cyan animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    AI Hack Mentor
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  </h4>
                  <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-widest">Always Online</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear Chat History"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Premium sign-in notice if guest */}
            {!user && (
              <div className="bg-brand-purple/10 border-b border-brand-purple/20 px-4 py-2 text-left flex items-center justify-between gap-2 shrink-0">
                <span className="text-[10px] text-slate-300">
                  🔒 Sign in to persist your mentoring chat history.
                </span>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] rounded-2xl p-3.5 text-left ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white ml-auto rounded-tr-none shadow-[0_4px_15px_rgba(124,58,237,0.15)]"
                      : "bg-white/5 border border-white/5 text-slate-300 mr-auto rounded-tl-none"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  ) : (
                    <div className="markdown-body text-slate-300 select-text leading-relaxed">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = !match;
                            return !isInline ? (
                              <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d092d]/90 font-mono text-[11px] shadow-lg">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-[#090520] border-b border-white/5 text-slate-400 select-none">
                                  <span className="text-[9px] font-semibold text-brand-cyan tracking-wider uppercase">{match[1]}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
                                    }}
                                    type="button"
                                    className="text-[9px] font-mono hover:text-white transition-colors border border-white/10 hover:border-white/20 px-1.5 py-0.5 rounded"
                                  >
                                    Copy
                                  </button>
                                </div>
                                <pre className="p-3 overflow-x-auto text-slate-200 leading-relaxed max-w-full">
                                  <code>{children}</code>
                                </pre>
                              </div>
                            ) : (
                              <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-brand-cyan font-mono text-[11px] font-semibold" {...props}>
                                {children}
                              </code>
                            );
                          },
                          p({ children }) { return <p className="mb-2 last:mb-0 leading-relaxed text-slate-300">{children}</p>; },
                          ul({ children }) { return <ul className="list-disc pl-4 mb-2 flex flex-col gap-1 text-slate-300">{children}</ul>; },
                          ol({ children }) { return <ol className="list-decimal pl-4 mb-2 flex flex-col gap-1 text-slate-300">{children}</ol>; },
                          li({ children }) { return <li className="text-slate-300 leading-relaxed">{children}</li>; },
                          h1({ children }) { return <h1 className="text-sm font-bold text-white mt-3 mb-1.5">{children}</h1>; },
                          h2({ children }) { return <h2 className="text-xs font-bold text-white mt-2.5 mb-1">{children}</h2>; },
                          h3({ children }) { return <h3 className="text-[11px] font-bold text-slate-200 mt-2 mb-1">{children}</h3>; },
                          strong({ children }) { return <strong className="font-semibold text-white">{children}</strong>; }
                        }}
                      >
                        {msg.message}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className="text-[8px] font-mono text-slate-500 mt-1.5 block text-right select-none">
                    {formatTime(msg.timestamp)}
                  </span>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 border border-white/5 text-slate-300 p-3 rounded-2xl rounded-tl-none mr-auto max-w-[55px] flex items-center justify-center gap-1.5 animate-pulse"
                >
                  <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
                </motion.div>
              )}
              <div ref={threadEndRef}></div>
            </div>

            {/* Quick Suggestions scrollable panel */}
            <div className="px-3 py-2 border-t border-white/5 bg-[#030014]/40 flex gap-2 overflow-x-auto scrollbar-none select-none shrink-0">
              {SUGGESTIONS.map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(btn.prompt)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-[#120e3a]/60 border border-brand-purple/20 text-[10px] text-slate-300 hover:text-brand-cyan hover:bg-brand-purple/20 hover:border-brand-purple/40 transition-all cursor-pointer flex items-center gap-1 font-medium shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                >
                  <span>{btn.label}</span>
                  <Sparkles className="w-2.5 h-2.5 text-brand-cyan" />
                </button>
              ))}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-3 bg-[#030014] border-t border-white/5 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask mentor a technical question..."
                className="flex-1 glass-input py-2.5 px-3 rounded-xl text-xs text-slate-200 bg-white/2 outline-none focus:bg-white/5 border border-white/5 focus:border-brand-purple/40 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-lg hover:shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:scale-102"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main floating FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-4 rounded-full text-white bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan shadow-2xl active:scale-[0.94] hover:scale-105 transition-all duration-300 focus:outline-none flex items-center justify-center cursor-pointer"
      >
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan opacity-40 blur group-hover:opacity-100 transition duration-300 animate-pulse"></span>
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center gap-1.5">
            <Bot className="w-6 h-6 text-white" />
            <span className="text-xs font-bold font-display max-w-0 overflow-hidden group-hover:max-w-24 transition-all duration-300 whitespace-nowrap pr-0 group-hover:pr-1">AI Mentor</span>
          </div>
        )}
      </button>
    </div>
  );
}
