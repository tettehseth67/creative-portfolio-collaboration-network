/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MessageSquare, Heart, Share2, Image as ImageIcon, Sparkles, Send, MapPin, Tag, Palette, Trophy, Users, Check, Bookmark } from "lucide-react";
import { CreativeProfile, Post, Comment } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HomeFeedProps {
  userProfile: CreativeProfile;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  searchQuery: string;
  onNavigateToProfile: () => void;
  onStartCollabChat: (authorId: string, authorName: string) => void;
  bookmarkedPostIds: string[];
  onToggleBookmarkPost: (postId: string) => void;
}

export default function HomeFeed({
  userProfile,
  posts,
  setPosts,
  searchQuery,
  onNavigateToProfile,
  onStartCollabChat,
  bookmarkedPostIds,
  onToggleBookmarkPost
}: HomeFeedProps) {
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("3D Art");
  const [newPostTags, setNewPostTags] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showPublisherDetails, setShowPublisherDetails] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Heart particle animation states
  const [floatingHearts, setFloatingHearts] = useState<{ id: string; postId: string; x: number; y: number; scale: number; rotation: number }[]>([]);
  const [imageSplashes, setImageSplashes] = useState<{ [postId: string]: boolean }>({});

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    const s = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(s) ||
      post.author.name.toLowerCase().includes(s) ||
      post.author.headline.toLowerCase().includes(s) ||
      post.tags.some(tag => tag.toLowerCase().includes(s)) ||
      (post.category && post.category.toLowerCase().includes(s))
    );
  });

  const triggerHearts = (postId: string) => {
    const newHearts = Array.from({ length: 6 }).map((_, i) => ({
      id: `${postId}-${Date.now()}-${i}-${Math.random()}`,
      postId,
      x: (Math.random() - 0.5) * 60, // random horizontal dispersion
      y: -20 - Math.random() * 45,   // trajectory upwards
      scale: 0.6 + Math.random() * 0.7,
      rotation: (Math.random() - 0.5) * 50
    }));
    setFloatingHearts(prev => [...prev, ...newHearts]);
    
    // Auto-clean floating particles after animation ends
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 1000);
  };

  const handleLike = (postId: string) => {
    let isNowLiked = false;
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          const liked = !post.likedByUser;
          isNowLiked = liked;
          return {
            ...post,
            likedByUser: liked,
            likesCount: liked ? post.likesCount + 1 : post.likesCount - 1
          };
        }
        return post;
      })
    );

    if (isNowLiked) {
      triggerHearts(postId);
    }
  };

  const handleImageDoubleClick = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.likedByUser) {
      handleLike(postId);
    } else {
      triggerHearts(postId);
    }

    setImageSplashes(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setImageSplashes(prev => ({ ...prev, [postId]: false }));
    }, 800);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    // Split tags by comma or space
    const tagsArr = newPostTags
      .split(/[\s,]+/)
      .map(t => t.trim().replace(/^#/, ""))
      .filter(t => t.length > 0);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        id: userProfile.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
        headline: userProfile.headline,
        discipline: userProfile.discipline
      },
      content: newPostText,
      imageUrl: newPostImage || undefined,
      tags: tagsArr.length > 0 ? tagsArr : ["CreativeSpace", "ArtCollab"],
      likesCount: 0,
      likedByUser: false,
      comments: [],
      createdAt: new Date().toISOString(),
      category: newPostCategory
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
    setNewPostImage("");
    setNewPostTags("");
    setShowPublisherDetails(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      authorHeadline: userProfile.headline,
      content: text,
      createdAt: new Date().toISOString()
    };

    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );

    setCommentInputs({
      ...commentInputs,
      [postId]: ""
    });
  };

  // Pre-configured image choices to simulate uploading high-quality portfolio pieces
  const simulatedImages = [
    { label: "Cosmic Render", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" },
    { label: "Vaporwave Neon", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80" },
    { label: "Surreal Canvas", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80" },
    { label: "Generative Shaders", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        
        {/* Left Sidebar: User Quick Card */}
        <div className="space-y-6 md:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
            {/* Custom Banner Art Representing his Automation and Digital Focus */}
            <div className="relative h-24 bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-700">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />
              <div className="absolute right-4 top-4 rounded-full bg-white/20 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-white uppercase backdrop-blur-xs">
                YAW AUTO
              </div>
            </div>
            
            <div className="relative px-6 pb-6 text-center">
              <div className="absolute top-0 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-sm flex items-center justify-center">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xl">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              
              <div className="pt-10">
                <h3 
                  onClick={onNavigateToProfile}
                  className="cursor-pointer font-display text-base font-bold text-slate-800 transition-colors hover:text-indigo-600"
                >
                  {userProfile.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {userProfile.headline}
                </p>
                <div className="mt-2 flex justify-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open to Collaboration
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 text-left">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Connections</span>
                  <span className="font-mono font-medium text-slate-800">{userProfile.connectionsCount}</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Active Collabs</span>
                  <span className="font-mono font-medium text-slate-800">{userProfile.collabsCompleted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <h4 className="font-display text-sm font-bold text-slate-800">Your Creative Workspace</h4>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Palette size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Digital Portfolio</p>
                  <p className="text-[10px] text-slate-500">3 project showcases</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Trophy size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Artistic Milestones</p>
                  <p className="text-[10px] text-slate-500">4 items pending review</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Posts Feed & Creator */}
        <div className="space-y-6 md:col-span-2 lg:col-span-2">
          
          {/* Creative Post Publisher */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex gap-4">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.name} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border shrink-0">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="w-full">
                <textarea
                  placeholder="Share a project draft, sketches, or seek co-creators..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  onFocus={() => setShowPublisherDetails(true)}
                  className="w-full min-h-[50px] resize-none border-0 p-2 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:ring-0"
                  id="feed-post-textarea"
                />
              </div>
            </div>

            {/* Simulated file/image addition and tagging */}
            <AnimatePresence>
              {showPublisherDetails && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 border-t border-slate-100 pt-4"
                >
                  <div className="space-y-4">
                    {/* Select Category */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-medium text-slate-600">Discipline Category:</span>
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {["3D Art", "Creative Coding", "Sound Design", "Illustration"].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewPostCategory(cat)}
                            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                              newPostCategory === cat 
                                ? "bg-indigo-600 text-white" 
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tag Input */}
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Hashtags (e.g. CGI, ShaderArt, IndieVibe)"
                        value={newPostTags}
                        onChange={(e) => setNewPostTags(e.target.value)}
                        className="w-full border-0 bg-transparent text-xs text-slate-700 outline-hidden focus:ring-0"
                      />
                    </div>

                    {/* Simulating image upload selector */}
                    <div>
                      <span className="text-xs font-medium text-slate-600 block mb-2">Attach Portfolio Artwork:</span>
                      <div className="grid grid-cols-4 gap-2">
                        {simulatedImages.map((img) => (
                          <button
                            key={img.label}
                            type="button"
                            onClick={() => setNewPostImage(newPostImage === img.url ? "" : img.url)}
                            className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              newPostImage === img.url 
                                ? "border-indigo-600 scale-95" 
                                : "border-transparent hover:opacity-80"
                            }`}
                          >
                            <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                            {newPostImage === img.url && (
                              <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                                <Check size={16} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
              <button
                type="button"
                onClick={() => setShowPublisherDetails(!showPublisherDetails)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                id="feed-post-media-btn"
              >
                <ImageIcon size={16} className="text-indigo-500" />
                <span>Media & Tags</span>
              </button>

              <button
                onClick={handlePublish}
                disabled={!newPostText.trim()}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                id="feed-post-submit-btn"
              >
                <Send size={14} />
                <span>Publish</span>
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs"
                >
                  {/* Author Header */}
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      {post.author.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border shrink-0">
                          {post.author.name ? post.author.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-display text-sm font-bold text-slate-800">{post.author.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{post.author.headline}</p>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      {post.category && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                          {post.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mt-4">
                    <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                      {post.content}
                    </p>

                    {/* Post Hashtags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Media Attachment - Gorgeous layout */}
                    {post.imageUrl && (
                      <div 
                        onDoubleClick={() => handleImageDoubleClick(post.id)}
                        onClick={() => setExpandedImage(post.imageUrl || null)}
                        className="group relative mt-4 cursor-zoom-in overflow-hidden rounded-xl border border-slate-100 bg-slate-50 max-h-[400px]"
                      >
                        <img 
                          src={post.imageUrl} 
                          alt="Portfolio piece" 
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-102"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="rounded-lg bg-black/60 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                            View Fullscreen
                          </span>
                        </div>

                        {/* Overlay big heart splash on double tap */}
                        <AnimatePresence>
                          {imageSplashes[post.id] && (
                            <motion.div
                              initial={{ scale: 0.3, opacity: 0 }}
                              animate={{ scale: [0.3, 1.25, 1], opacity: [0, 1, 0] }}
                              exit={{ scale: 1.5, opacity: 0 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                            >
                              <div className="rounded-full bg-white/25 p-5 backdrop-blur-xs shadow-lg border border-white/20">
                                <Heart size={52} className="text-rose-500 fill-rose-500 drop-shadow-[0_4px_12px_rgba(244,63,94,0.45)]" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Post Actions Bar */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-3 text-slate-500">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`relative flex items-center gap-1.5 text-xs font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-slate-50 ${
                        post.likedByUser 
                          ? "text-rose-500" 
                          : "text-slate-500 hover:text-rose-500"
                      }`}
                      id={`like-btn-${post.id}`}
                    >
                      <motion.div
                        whileTap={{ scale: 1.4 }}
                        animate={post.likedByUser ? { scale: [1, 1.35, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Heart 
                          size={16} 
                          fill={post.likedByUser ? "currentColor" : "none"} 
                          className={post.likedByUser ? "drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]" : ""} 
                        />
                      </motion.div>
                      <span>{post.likesCount} {post.likesCount === 1 ? "Appreciation" : "Appreciations"}</span>

                      {/* Floating Particle Hearts */}
                      <AnimatePresence>
                        {floatingHearts
                          .filter((h) => h.postId === post.id)
                          .map((h) => (
                            <motion.span
                              key={h.id}
                              initial={{ opacity: 1, y: 0, x: 0, scale: 0.4, rotate: 0 }}
                              animate={{ 
                                opacity: 0, 
                                y: h.y, 
                                x: h.x, 
                                scale: h.scale, 
                                rotate: h.rotation 
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="absolute text-rose-500 pointer-events-none text-xs z-30 font-sans"
                              style={{ left: "12px", top: "-5px" }}
                            >
                              ❤️
                            </motion.span>
                          ))}
                      </AnimatePresence>
                    </button>

                    <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-indigo-600 transition-colors">
                      <MessageSquare size={16} />
                      <span>{post.comments.length} Comments</span>
                    </button>

                    <button
                      onClick={() => onToggleBookmarkPost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-slate-50 ${
                        bookmarkedPostIds?.includes(post.id)
                          ? "text-indigo-600 font-bold"
                          : "text-slate-500 hover:text-indigo-600"
                      }`}
                      id={`bookmark-btn-${post.id}`}
                      title={bookmarkedPostIds?.includes(post.id) ? "Remove Bookmark" : "Save to Bookmark"}
                    >
                      <Bookmark 
                        size={16} 
                        className="transition-transform duration-200 active:scale-125"
                        fill={bookmarkedPostIds?.includes(post.id) ? "currentColor" : "none"} 
                      />
                      <span>{bookmarkedPostIds?.includes(post.id) ? "Saved" : "Save"}</span>
                    </button>

                    {post.author.id !== userProfile.id && (
                      <button
                        onClick={() => onStartCollabChat(post.author.id, post.author.name)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg"
                      >
                        <Sparkles size={14} />
                        <span>Discuss Collab</span>
                      </button>
                    )}
                  </div>

                  {/* Comments Sub-Section */}
                  <div className="mt-4 border-t border-slate-50 pt-4 space-y-4">
                    {post.comments.length > 0 && (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2 text-xs">
                           {comment.authorAvatar ? (
                             <img src={comment.authorAvatar} alt={comment.authorName} className="h-7 w-7 rounded-lg object-cover" />
                           ) : (
                             <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border shrink-0">
                               {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : "U"}
                             </div>
                           )}
                            <div className="flex-1 rounded-xl bg-slate-50 p-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{comment.authorName}</span>
                                <span className="text-[9px] font-mono text-slate-400">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-none">{comment.authorHeadline}</p>
                              <p className="mt-1.5 text-slate-700 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Comment Input */}
                    <div className="flex gap-2 pt-2">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt={userProfile.name} className="h-7 w-7 rounded-lg object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border shrink-0">
                          {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Appreciate, suggest, or comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddComment(post.id);
                            }
                          }}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 py-1.5 pr-10 pl-3 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}

              {filteredPosts.length === 0 && (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-100 bg-white">
                  <Palette size={40} className="mx-auto text-slate-300 animate-bounce" />
                  <h3 className="mt-4 font-display font-bold text-slate-700">No artistic updates found</h3>
                  <p className="text-xs text-slate-400 mt-1">Try resetting your search query or posting some work!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar: Recommended Portfolios & Trends */}
        <div className="space-y-6 md:col-span-3 lg:col-span-1">
          {/* Trending Collaborations tags */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <h4 className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-500" />
              Trending Co-creation
            </h4>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["ModularAudio", "SpatialVR", "HoudiniSimulation", "NFTNarrative", "ThreeJSArt", "SubstanceSkins"].map((trend) => (
                <button
                  key={trend}
                  onClick={() => setNewPostTags(prev => prev ? `${prev}, #${trend}` : `#${trend}`)}
                  className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                >
                  #{trend}
                </button>
              ))}
            </div>
          </div>

          {/* Inspirational quotes / prompt ideas */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 shadow-xs">
            <h4 className="font-display text-xs font-bold tracking-wider text-indigo-700 uppercase">
              Creative Slogan
            </h4>
            <blockquote className="mt-2 text-xs italic text-slate-600 leading-relaxed">
              "Technology is our canvas; imagination is the color. Collaboration scales the artistic vision from an individual spark to a global atmosphere."
            </blockquote>
            <p className="mt-2 text-[10px] font-mono text-slate-400 text-right">— Seth Ansah Tetteh, 2026</p>
          </div>
        </div>

      </div>

      {/* Lightbox Modal for Fullscreen Image Viewing */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={expandedImage} alt="Expanded Artwork" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-all"
              >
                Close Fullscreen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
