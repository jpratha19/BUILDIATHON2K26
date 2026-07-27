import React, { useState, useEffect, useRef } from "react";
import { Send, Github, Lightbulb, AlertTriangle, MessageSquare, ChevronRight, Check, AlertCircle } from "lucide-react";
import { ChatMessage, FirestoreUser } from "../../types/networking";
import { motion } from "motion/react";

interface ChatSectionProps {
  currentUser: FirestoreUser | null;
  allUsers: FirestoreUser[];
  connections: any[];
  messages: ChatMessage[];
  onSendMessage: (receiverId: string, text: string, details?: { github?: string; projectIdea?: string; problemDiscussed?: string }) => void;
}

export default function ChatSection({
  currentUser,
  allUsers,
  connections,
  messages,
  onSendMessage
}: ChatSectionProps) {
  const [selectedPeer, setSelectedPeer] = useState<FirestoreUser | null>(null);
  const [messageText, setMessageText] = useState("");
  
  // Key-value attachment fields
  const [githubLink, setGithubLink] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [problemDiscussed, setProblemDiscussed] = useState("");
  const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter out accepted connections
  const connectedPeers = allUsers.filter((u) => {
    if (!currentUser) return false;
    const conn = connections.find(
      (c) =>
        c.status === "accepted" &&
        c.userIds.includes(currentUser.uid) &&
        c.userIds.includes(u.uid)
    );
    return !!conn;
  });

  // Filter messages for active discussion
  const activeMessages = messages.filter((m) => {
    if (!currentUser || !selectedPeer) return false;
    return (
      (m.senderId === currentUser.uid && m.receiverId === selectedPeer.uid) ||
      (m.senderId === selectedPeer.uid && m.receiverId === currentUser.uid)
    );
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPeer) return;
    if (!messageText.trim() && !githubLink.trim() && !projectIdea.trim() && !problemDiscussed.trim()) return;

    onSendMessage(selectedPeer.uid, messageText, {
      github: githubLink.trim() || undefined,
      projectIdea: projectIdea.trim() || undefined,
      problemDiscussed: problemDiscussed.trim() || undefined
    });

    setMessageText("");
    setGithubLink("");
    setProjectIdea("");
    setProblemDiscussed("");
    setShowAttachmentDrawer(false);
  };

  if (!currentUser) {
    return (
      <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center space-y-3">
        <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
        <h4 className="text-sm font-bold text-white">Direct Chat Secure Channel</h4>
        <p className="text-xs text-slate-400">Please sign in to exchange collaborative direct messages with connected hackers.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px] text-left">
      {/* Sidebar - Connections list (3 cols) */}
      <div className="md:col-span-4 border-r border-white/10 bg-[#06041a]/60 flex flex-col">
        <div className="p-4 border-b border-white/5 bg-[#050316]">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hacker Connections</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Select a peer hacker to coordinate team builds.</p>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[480px] p-2 space-y-1">
          {connectedPeers.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-mono">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
              No active connections. Use the Directory to connect!
            </div>
          ) : (
            connectedPeers.map((peer) => {
              const isSelected = selectedPeer?.uid === peer.uid;
              return (
                <button
                  key={peer.uid}
                  onClick={() => setSelectedPeer(peer)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand-purple/20 border border-brand-purple/40 text-white"
                      : "border border-transparent hover:bg-white/5 text-slate-300"
                  }`}
                >
                  <img
                    src={peer.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={peer.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <h5 className="text-xs font-bold truncate">{peer.name}</h5>
                    <p className="text-[9px] text-slate-400 truncate">{peer.preferredRole} • {peer.college}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area - (8 cols) */}
      <div className="md:col-span-8 flex flex-col justify-between h-[550px] bg-[#040118]/40">
        {selectedPeer ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-[#050316] flex items-center gap-2.5">
              <img
                src={selectedPeer.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={selectedPeer.name}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs font-bold text-white">{selectedPeer.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono">{selectedPeer.college} • {selectedPeer.preferredRole}</p>
              </div>
            </div>

            {/* Message Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-mono">Secure collaborative channel established.</p>
                    <p className="text-[10px] text-slate-600">Send an initial message or project attachments to start.</p>
                  </div>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 space-y-2 ${
                          isMine
                            ? "bg-brand-purple/20 border border-brand-purple/40 text-white rounded-tr-none"
                            : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                        }`}
                      >
                        {msg.text && <p className="text-xs leading-relaxed font-sans">{msg.text}</p>}

                        {/* Special discussion nodes attachments */}
                        {(msg.githubLink || msg.projectIdea || msg.problemDiscussed) && (
                          <div className="space-y-1.5 border-t border-white/10 pt-2.5 mt-2">
                            {msg.githubLink && (
                              <div className="flex items-center gap-1.5 bg-black/30 rounded-lg p-2 border border-white/5">
                                <Github className="w-3.5 h-3.5 text-slate-400" />
                                <div className="text-left">
                                  <span className="text-[8px] text-slate-400 font-mono block">SHARED CODEBASE</span>
                                  <a
                                    href={msg.githubLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] text-brand-cyan hover:underline truncate block max-w-[180px]"
                                  >
                                    {msg.githubLink}
                                  </a>
                                </div>
                              </div>
                            )}

                            {msg.projectIdea && (
                              <div className="flex items-start gap-1.5 bg-brand-cyan/5 rounded-lg p-2 border border-brand-cyan/20 text-left">
                                <Lightbulb className="w-3.5 h-3.5 text-brand-cyan shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[8px] text-brand-cyan font-mono block font-bold">PROJECT IDEA</span>
                                  <p className="text-[10px] text-slate-200 leading-normal">{msg.projectIdea}</p>
                                </div>
                              </div>
                            )}

                            {msg.problemDiscussed && (
                              <div className="flex items-start gap-1.5 bg-amber-500/5 rounded-lg p-2 border border-amber-500/20 text-left">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[8px] text-amber-400 font-mono block font-bold">PROBLEM DISCUSSION</span>
                                  <p className="text-[10px] text-slate-200 leading-normal">{msg.problemDiscussed}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-[8px] text-slate-500 block text-right font-mono mt-1">
                          {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sent"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Actions Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-[#050316] space-y-2">
              {/* Optional Attachment Drawer toggle */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded border transition-all cursor-pointer ${
                    showAttachmentDrawer
                      ? "bg-brand-cyan/15 border-brand-cyan text-brand-cyan"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {showAttachmentDrawer ? "Close Discussion attachments" : "Incorporate Discussion attachments (GitHub / Idea)"}
                </button>
              </div>

              {/* Attachment Fields */}
              {showAttachmentDrawer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-black/20 p-2.5 rounded-xl border border-white/5 grid grid-cols-1 gap-2 text-xs"
                >
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block mb-1">GitHub Link Reference</span>
                    <input
                      type="url"
                      placeholder="https://github.com/org/repo"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      className="w-full text-xs bg-[#07041a] border border-white/10 rounded-lg px-2 py-1 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block mb-1">Project Idea Pitch</span>
                    <input
                      type="text"
                      placeholder="e.g. AI-driven logistics tracker with Spanner backend"
                      value={projectIdea}
                      onChange={(e) => setProjectIdea(e.target.value)}
                      className="w-full text-xs bg-[#07041a] border border-white/10 rounded-lg px-2 py-1 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block mb-1">Technical Blocker / Problem Discussion</span>
                    <input
                      type="text"
                      placeholder="e.g. Need to configure CORS configuration for Gemini API integration"
                      value={problemDiscussed}
                      onChange={(e) => setProblemDiscussed(e.target.value)}
                      className="w-full text-xs bg-[#07041a] border border-white/10 rounded-lg px-2 py-1 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </motion.div>
              )}

              {/* Core Message Text */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Chat with ${selectedPeer.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-cyan text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 hover:bg-white active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmit
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-700 mb-2 animate-bounce" />
            <div className="space-y-1 max-w-xs">
              <p className="text-xs font-mono font-bold text-white">Direct Hacker Channels</p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Select an accepted connection from the sidebar to establish a secure collaborative line and share ideas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
