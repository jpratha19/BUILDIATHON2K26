import React, { useState } from "react";
import { MessageSquare, Heart, Send, Sparkles, Filter, CheckCircle2, CornerDownRight, X, AlertCircle } from "lucide-react";
import { FeedPost, FirestoreUser } from "../../types/networking";
import { motion, AnimatePresence } from "motion/react";
import { serverTimestamp } from "firebase/firestore";

interface NetworkingFeedProps {
  currentUser: FirestoreUser | null;
  posts: FeedPost[];
  onAddPost: (content: string, category: FeedPost["category"]) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onAddReply: (postId: string, commentId: string, replyText: string) => void;
  onOpenLogin: () => void;
}

export default function NetworkingFeed({
  currentUser,
  posts,
  onAddPost,
  onLikePost,
  onAddComment,
  onAddReply,
  onOpenLogin
}: NetworkingFeedProps) {
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<FeedPost["category"]>("General");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null); // commentId
  const [selectedFeedFilter, setSelectedFeedFilter] = useState<string>("All");

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!postContent.trim()) return;
    onAddPost(postContent, postCategory);
    setPostContent("");
    setPostCategory("General");
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    const commentText = commentInputs[postId] || "";
    if (!commentText.trim()) return;
    onAddComment(postId, commentText);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleReplySubmit = (postId: string, commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    const replyText = replyInputs[commentId] || "";
    if (!replyText.trim()) return;
    onAddReply(postId, commentId, replyText);
    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    setActiveReplyBox(null);
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedFeedFilter === "All") return true;
    return p.category === selectedFeedFilter;
  });

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      {/* Create Post Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
          Broadcast to Lounge Feed
        </h3>

        <form onSubmit={handlePostSubmit} className="space-y-3">
          <textarea
            placeholder={
              currentUser
                ? "Broadcast your needs, e.g. 'Looking for a PyTorch backend developer for an Agentic chatbot...' "
                : "Please authenticate to broadcast updates to the participant feed."
            }
            rows={3}
            disabled={!currentUser}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full bg-[#07041a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple leading-relaxed resize-none disabled:opacity-50"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">Category:</span>
              <select
                disabled={!currentUser}
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as FeedPost["category"])}
                className="bg-[#07041a] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-purple disabled:opacity-50"
              >
                <option value="General">General / Brainstorm</option>
                <option value="Looking for Backend Developer">Looking for Backend Developer</option>
                <option value="Need UI Designer">Need UI Designer</option>
                <option value="Searching for AI Engineer">Searching for AI Engineer</option>
              </select>
            </div>

            {currentUser ? (
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-cyan text-slate-950 font-extrabold text-xs shadow-[0_4px_15px_rgba(34,211,238,0.25)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Post
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-5 py-2 rounded-xl bg-brand-purple text-white font-semibold text-xs hover:bg-brand-purple/85 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Authenticate
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter Feed Category */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Public Networking Feed</span>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
          <Filter className="w-3 h-3 text-brand-cyan" />
          <select
            value={selectedFeedFilter}
            onChange={(e) => setSelectedFeedFilter(e.target.value)}
            className="bg-transparent text-[11px] text-slate-300 focus:outline-none border-none cursor-pointer"
          >
            <option value="All" className="bg-[#090520]">All Activities</option>
            <option value="Looking for Backend Developer" className="bg-[#090520]">Backend Seeking</option>
            <option value="Need UI Designer" className="bg-[#090520]">UX/UI Seeking</option>
            <option value="Searching for AI Engineer" className="bg-[#090520]">AI Engineer Seeking</option>
            <option value="General" className="bg-[#090520]">General</option>
          </select>
        </div>
      </div>

      {/* Feed Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 text-slate-500">
          <p className="text-sm font-mono">No networking feed broadcasts found matching filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const hasLiked = currentUser ? post.likes.includes(currentUser.uid) : false;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl glass-panel p-5 border border-white/10"
              >
                {/* Author Info */}
                <div className="flex items-center gap-2.5 mb-3">
                  <img
                    src={post.userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={post.userName}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {post.userName}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-cyan/15 border border-brand-cyan/20 text-brand-cyan font-mono font-medium">
                        {post.category}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : "Live"}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-200 leading-relaxed font-sans mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Like / Comment Actions Bar */}
                <div className="flex items-center gap-4 border-t border-b border-white/5 py-2 mb-4">
                  <button
                    onClick={() => {
                      if (!currentUser) onOpenLogin();
                      else onLikePost(post.id);
                    }}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                      hasLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
                    <span>{post.likes.length} Likes</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </div>
                </div>

                {/* Comment Section list */}
                <div className="space-y-3.5 mb-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="text-xs space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-3">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={comment.userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                          alt={comment.userName}
                          className="w-6 h-6 rounded-full object-cover border border-white/5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h5 className="font-bold text-white">{comment.userName}</h5>
                          <p className="text-slate-300 mt-1 leading-relaxed font-sans">{comment.text}</p>

                          {/* Trigger Reply link */}
                          <div className="mt-1 flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (!currentUser) onOpenLogin();
                                else setActiveReplyBox(activeReplyBox === comment.id ? null : comment.id);
                              }}
                              className="text-[10px] text-brand-cyan hover:underline cursor-pointer"
                            >
                              Reply
                            </button>
                            <span className="text-[9px] text-slate-500 font-mono">{comment.createdAt || "Live"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hierarchical replies render */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-6 space-y-2 mt-2.5 border-l border-white/5">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2 text-slate-300">
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                              <img
                                src={reply.userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                                alt={reply.userName}
                                className="w-5 h-5 rounded-full object-cover border border-white/5"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1">
                                <h6 className="font-bold text-white text-[10px]">{reply.userName}</h6>
                                <p className="text-slate-300 mt-0.5 leading-relaxed font-sans">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Submission Field inside comment */}
                      <AnimatePresence>
                        {activeReplyBox === comment.id && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={(e) => handleReplySubmit(post.id, comment.id, e)}
                            className="flex gap-2 pl-6 mt-3"
                          >
                            <input
                              type="text"
                              placeholder={`Reply to ${comment.userName}...`}
                              value={replyInputs[comment.id] || ""}
                              onChange={(e) =>
                                setReplyInputs((prev) => ({ ...prev, [comment.id]: e.target.value }))
                              }
                              className="flex-1 text-[11px] bg-[#07041a] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-purple"
                            />
                            <button
                              type="submit"
                              className="px-3 rounded-lg bg-brand-cyan text-slate-950 font-bold text-[10px] cursor-pointer"
                            >
                              Reply
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Post comment input */}
                <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    disabled={!currentUser}
                    placeholder={currentUser ? "Write a comment on this broadcast..." : "Login to write comment"}
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    className="flex-1 text-xs bg-[#07041a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-purple disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!currentUser}
                    className="px-4 rounded-xl bg-brand-purple/20 border border-brand-purple/35 text-brand-cyan text-xs font-bold hover:bg-brand-purple/35 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
