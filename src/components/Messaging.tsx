/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Conversation, Message, CreativeProfile } from "../types";
import { 
  Send, 
  Image as ImageIcon, 
  CheckCheck, 
  Search, 
  MoreHorizontal, 
  SquarePen, 
  Star, 
  ChevronDown, 
  Sparkles, 
  FolderKanban, 
  Info, 
  X, 
  CheckCircle2, 
  ExternalLink,
  ThumbsUp,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MessagingProps {
  userProfile: CreativeProfile;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

type FilterPill = "Focused" | "Jobs" | "Unread" | "Connections" | "InMail" | "Starred";

export default function Messaging({
  userProfile,
  conversations,
  setConversations,
  activeConversationId,
  setActiveConversationId
}: MessagingProps) {
  const [typedMessage, setTypedMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterPill>("Focused");
  const [isTyping, setIsTyping] = useState(false);
  const [showMilestoneProposer, setShowMilestoneProposer] = useState(false);
  
  // Custom states for interactive application modal and follow status
  const [isFollowingSchwank, setIsFollowingSchwank] = useState(false);
  const [appModal, setAppModal] = useState<{
    isOpen: boolean;
    role: string;
    company: string;
    submitted: boolean;
  } | null>(null);

  // Milestone proposer form inputs
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation on mount if none is selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, setActiveConversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConversationId, isTyping]);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  // Star / unstar a conversation
  const toggleStarConversation = (id: string) => {
    const updated = conversations.map(c => {
      if (c.id === id) {
        return { ...c, isStarred: !c.isStarred };
      }
      return c;
    });
    setConversations(updated);
  };

  // Filter conversations list based on Search query & active filter pills
  const filteredConversations = conversations.filter(conv => {
    // 1. Filter by search query
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.participant.headline.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Filter by Active Pill Selection
    if (activeFilter === "Unread") {
      return conv.unreadCount > 0;
    }
    if (activeFilter === "Starred") {
      return !!conv.isStarred;
    }
    // "Jobs", "Connections", "InMail" have dedicated visual empty screens, handled separately
    return true;
  });

  // Simulated AI response rules
  const getSimulatedResponse = (userText: string, participantName: string): string => {
    const text = userText.toLowerCase();
    
    if (participantName.includes("Anya")) {
      if (text.includes("webgl") || text.includes("shader") || text.includes("three")) {
        return "Baking the normals at 2K resolution right now, Seth! I'll test how it compiles on my end. This WebGL bento showcase is going to look so sleek.";
      }
      return "That sounds like a solid workflow! I'm opening up Unreal right now to double check the texture channels. Let's make sure the diffuse and specular elements remain separate.";
    } else if (participantName.includes("Sophie")) {
      if (text.includes("placement") || text.includes("recent")) {
        return "Hope you got the info you needed! If you'd like to apply, we'd love to see your application come through!";
      }
      return "Thanks for reaching out! At Formation, we focus on building genuine engineering careers. Let me know if you want to explore standard roles or specialized tracks!";
    } else {
      return "I'll package the project and post the Google Drive link here in a bit. Let me know if you need any adjustments to the tempo or key!";
    }
  };

  const handleSendMessage = (e?: React.FormEvent, customText?: string, customMilestone?: { title: string }, isSophieAutoReply = false) => {
    if (e) e.preventDefault();
    
    const textToSend = customText || typedMessage;
    if (!textToSend.trim() && !customMilestone) return;
    if (!activeConv) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: userProfile.id,
      text: customMilestone ? `[Milestone Proposed] ${customMilestone.title}` : textToSend,
      timestamp: new Date().toISOString(),
      ...(customMilestone ? {
        isMilestone: true,
        milestoneTitle: customMilestone.title,
        milestoneStatus: "pending"
      } : {})
    };

    // Update conversation state with user message
    const updatedConversations = conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        };
      }
      return c;
    });

    setConversations(updatedConversations);
    if (!customText) setTypedMessage("");

    // Simulate co-creator replying after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = "";
      let actionsArray: string[] | undefined = undefined;

      if (isSophieAutoReply) {
        replyText = "Hope you got the info you needed! If you'd like to apply, we'd love to see your application come through!";
        actionsArray = ["Apply today"];
      } else {
        replyText = customMilestone 
          ? "Excellent! I see the milestone proposal. I have marked this as Approved and will begin my phase of deliverables."
          : getSimulatedResponse(textToSend, activeConv.participant.name);
      }

      const replyMsg: Message = {
        id: `m-reply-${Date.now()}`,
        senderId: activeConv.participant.id,
        text: replyText,
        timestamp: new Date().toISOString(),
        actions: actionsArray
      };

      setConversations(
        updatedConversations.map(c => {
          if (c.id === activeConv.id) {
            let updatedMessages = [...c.messages, replyMsg];
            if (customMilestone) {
              updatedMessages = updatedMessages.map(m => {
                if (m.isMilestone && m.milestoneTitle === customMilestone.title) {
                  return {
                    ...m,
                    milestoneStatus: "approved" as const
                  };
                }
                return m;
              });
            }
            return {
              ...c,
              messages: updatedMessages,
              lastMessageTime: new Date().toISOString()
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const handleProposeMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    handleSendMessage(undefined, undefined, { title: milestoneTitle });
    setMilestoneTitle("");
    setShowMilestoneProposer(false);
  };

  // Helper to render customized avatars (including the black/cyan "YAW" bubble for Seth)
  const renderAvatar = (url: string, name: string, isUser: boolean, size = "h-10 w-10") => {
    if (isUser) {
      return (
        <div className={`${size} shrink-0 flex items-center justify-center rounded-full bg-black border border-slate-800 font-bold text-[9px] text-cyan-400 tracking-wider shadow-sm select-none`}>
          YAW
        </div>
      );
    }
    return (
      <img 
        src={url} 
        alt={name} 
        className={`${size} shrink-0 rounded-full object-cover border border-slate-200 shadow-xs`} 
        referrerPolicy="no-referrer"
      />
    );
  };

  // Format message timestamps neatly
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full bg-[#f4f2ee] h-full py-4 px-4 flex flex-col min-h-0 overflow-hidden">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0 w-full">
        
        {/* Main Messaging Container (Left list + Center Chat Panel) */}
        <div className="lg:col-span-9 bg-white border border-[#e0dfdc] rounded-lg shadow-xs overflow-hidden flex flex-col h-full min-h-0">
          
          {/* Header Area (Now spans the full width of the main container to prevent buttons from being hidden) */}
          <div className="p-4 border-b border-[#e0dfdc] shrink-0 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-800 tracking-tight">Messaging</h2>
              <div className="flex items-center gap-3 text-slate-500">
                <button className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                  <MoreHorizontal size={20} />
                </button>
                <button className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                  <SquarePen size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              {/* LinkedIn Signature Search bar */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#edf3f8] border-none rounded-md py-2 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-500 outline-hidden focus:bg-white focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>

              {/* Horizontal filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                {(["Focused", "Jobs", "Unread", "Connections", "InMail", "Starred"] as FilterPill[]).map((pill) => {
                  // In the screenshot, when Jobs is selected, both "Focused ▾" and "Jobs" are active and highlighted in dark green
                  const isSelected = activeFilter === pill || (activeFilter === "Jobs" && pill === "Focused");
                  return (
                    <button
                      key={pill}
                      onClick={() => setActiveFilter(pill)}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? "bg-[#01754f] text-white border-transparent shadow-xs"
                          : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {pill === "Focused" ? "Focused" : pill}
                        {pill === "Focused" && <ChevronDown size={12} className={isSelected ? "text-white" : "text-slate-400"} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Area under the Header */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden bg-white">
            
            {/* Left Panel: Conversations List (Hidden on mobile if a conversation is open) */}
            <div className={`md:col-span-5 border-r border-[#e0dfdc] flex flex-col h-full bg-white min-h-0 overflow-hidden ${activeConv && "hidden md:flex"}`}>
              
              {/* Conversation Feed Items or Empty Filters */}
              <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100">
              
              {/* Special View for selected Jobs Filter (Matches User screenshot empty state) */}
              {activeFilter === "Jobs" && (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full bg-white select-none">
                  {/* High Fidelity "No job messages" Illustration matching screenshot */}
                  <div className="relative group transition-transform duration-500 hover:scale-[1.02]">
                    <svg width="175" height="130" viewBox="0 0 175 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto my-4">
                      {/* Platform */}
                      <path d="M10 110 H165 V114 H10 Z" fill="#e0e4ec" />
                      <rect x="25" y="105" width="125" height="6" rx="3" fill="#cbd5e1" />
                      
                      {/* Background dotted window arches */}
                      <path d="M40 100 C 40 40, 130 40, 130 100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                      
                      {/* Two Office Chairs */}
                      {/* Chair 1 (Left) */}
                      <rect x="40" y="80" width="18" height="14" rx="3" fill="#94a3b8" />
                      <rect x="42" y="75" width="14" height="6" rx="1" fill="#64748b" />
                      <line x1="49" y1="94" x2="49" y2="105" stroke="#475569" strokeWidth="2" />
                      <line x1="43" y1="105" x2="55" y2="105" stroke="#475569" strokeWidth="2" />
                      {/* Chair 2 (Middle Left) */}
                      <rect x="68" y="80" width="18" height="14" rx="3" fill="#94a3b8" />
                      <rect x="70" y="75" width="14" height="6" rx="1" fill="#64748b" />
                      <line x1="77" y1="94" x2="77" y2="105" stroke="#475569" strokeWidth="2" />
                      <line x1="71" y1="105" x2="83" y2="105" stroke="#475569" strokeWidth="2" />

                      {/* Standing Girl holding Laptop */}
                      {/* Head */}
                      <circle cx="125" cy="45" r="7" fill="#fcd34d" />
                      <path d="M123 40 C118 42, 120 48, 124 48 C128 48, 130 44, 128 40 Z" fill="#1e1b4b" /> {/* Hair */}
                      {/* Torso / Pink Shirt */}
                      <path d="M115 54 C115 54, 120 52, 125 52 C130 52, 135 54, 135 54 L132 75 H118 Z" fill="#db2777" />
                      {/* Pants / Blue */}
                      <rect x="119" y="75" width="6" height="25" rx="1" fill="#3b82f6" />
                      <rect x="127" y="75" width="6" height="25" rx="1" fill="#3b82f6" />
                      {/* Laptop and Arms */}
                      <path d="M112 58 L103 62 L112 66" stroke="#fcd34d" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M102 62 H92" stroke="#64748b" strokeWidth="3" strokeLinecap="round" /> {/* laptop */}
                      <path d="M96 62 L94 56" stroke="#94a3b8" strokeWidth="2" /> {/* screen */}
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No job messages</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-[240px] mx-auto leading-normal">
                    When you contact job posters or apply to jobs, those messages will appear here.
                  </p>
                </div>
              )}

              {/* Empty state for other filters */}
              {activeFilter !== "Jobs" && filteredConversations.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center h-48 text-slate-400">
                  <p className="text-xs">No conversations match your "{activeFilter}" filter settings.</p>
                </div>
              )}

              {/* Conversation items rendering */}
              {activeFilter !== "Jobs" && filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const lastMsg = conv.messages[conv.messages.length - 1];
                const hasUnread = conv.unreadCount > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setConversations(
                        conversations.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
                      );
                    }}
                    className={`flex gap-3 p-4 border-l-4 cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#edf3f8] border-[#0a66c2]" 
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative">
                      {renderAvatar(conv.participant.avatar, conv.participant.name, false, "h-12 w-12")}
                      {conv.participant.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-semibold truncate ${isActive ? "text-[#0a66c2]" : "text-slate-800"}`}>
                          {conv.participant.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{conv.participant.headline}</p>
                      <p className={`mt-1 text-xs truncate ${hasUnread ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                        {lastMsg?.senderId === userProfile.id && <span className="text-slate-400 mr-1">You:</span>}
                        {lastMsg?.text}
                      </p>
                    </div>

                    {conv.isStarred && (
                      <div className="flex items-center text-amber-500">
                        <Star size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Chat Panel */}
          {activeConv ? (
            <div className="md:col-span-7 flex flex-col h-full bg-white min-h-0 overflow-hidden">
              
              {/* Header bar matching LinkedIn perfectly */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0dfdc] bg-white shrink-0">
                <div className="flex gap-2.5 min-w-0 items-center">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden p-1 mr-1 text-slate-500 hover:bg-slate-100 rounded-full cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                  <div className="relative">
                    {renderAvatar(activeConv.participant.avatar, activeConv.participant.name, false, "h-11 w-11")}
                    {activeConv.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-[15px] font-semibold text-slate-900 truncate leading-tight hover:underline cursor-pointer">
                        {activeConv.participant.name}
                      </h3>
                      {activeConv.participant.pronouns && (
                        <span className="text-[11px] text-slate-500 font-normal">{activeConv.participant.pronouns}</span>
                      )}
                      <CheckCircle2 size={13} className="text-blue-500 shrink-0" fill="currentColor" stroke="white" />
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-tight mt-1 max-w-lg">{activeConv.participant.headline}</p>
                  </div>
                </div>

                {/* Right side Actions */}
                <div className="flex items-center gap-3 text-slate-500">
                  <button 
                    onClick={() => toggleStarConversation(activeConv.id)}
                    className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${activeConv.isStarred ? 'text-amber-500' : ''}`}
                  >
                    <Star size={18} fill={activeConv.isStarred ? "currentColor" : "none"} />
                  </button>
                  <button className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                    <MoreHorizontal size={18} />
                  </button>
                  {/* Milestone proposer toggle */}
                  <button
                    onClick={() => setShowMilestoneProposer(!showMilestoneProposer)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0a66c2] bg-[#f2f6fa] hover:bg-[#e4eff9] border border-[#0a66c2]/20 rounded-full px-2.5 py-1 transition-all cursor-pointer"
                  >
                    <FolderKanban size={12} />
                    <span className="hidden sm:inline">Milestone</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread Area (LinkedIn Timeline Style Feed) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
                
                {/* Dynamic staging workspace prompt */}
                <div className="rounded-md border border-[#e0dfdc] bg-slate-50/75 p-3.5 text-xs text-slate-600 flex gap-2.5 items-start mb-2">
                  <Info size={16} className="text-[#0a66c2] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Staging & Co-Creation Network</span>
                    Connect pipelines, discuss requirements, and propose formal milestones securely. Click specialized actions inside messages to simulate active recruitment pipelines.
                  </div>
                </div>                {/* Message Log */}
                {activeConv.messages.map((msg) => {
                  const isMe = msg.senderId === userProfile.id;
                  const senderName = isMe ? userProfile.name : activeConv.participant.name;
                  const senderAvatar = isMe ? userProfile.avatar : activeConv.participant.avatar;
                  const senderHeadline = isMe 
                    ? "Creative Developer & AI Automation Specialist" 
                    : activeConv.participant.headline;

                  return (
                    <div key={msg.id} className="flex gap-3 group items-start hover:bg-slate-50/40 p-2.5 rounded-lg transition-all">
                      
                      {/* Avatar */}
                      {renderAvatar(senderAvatar, senderName, isMe, "h-10 w-10")}

                      {/* Content block */}
                      <div className="flex-1 min-w-0">
                        
                        {/* Header metadata */}
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="font-semibold text-slate-900 hover:underline cursor-pointer">
                            {senderName}
                          </span>
                          {!isMe && activeConv.participant.pronouns && (
                            <span className="text-[10px] text-slate-500 font-normal">{activeConv.participant.pronouns}</span>
                          )}
                          {!isMe && <CheckCircle2 size={12} className="text-blue-500 shrink-0" fill="currentColor" stroke="white" />}
                          <span className="text-[10px] text-slate-400 ml-1">
                            • {formatTime(msg.timestamp)}
                          </span>
                          {isMe && <CheckCheck size={12} className="text-emerald-500 ml-1.5 shrink-0" />}
                        </div>

                        {/* Sender headline */}
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5 max-w-xl truncate">{senderHeadline}</p>

                        {/* Body Text */}
                        <div className="mt-2 text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap font-sans font-normal">
                          {msg.isMilestone ? (
                            <div className="rounded-lg border border-[#0a66c2]/20 bg-[#f2f6fa] p-4 max-w-sm mt-1 shadow-xs">
                              <div className="flex items-center gap-1.5 text-[#0a66c2] font-semibold text-xs">
                                <FolderKanban size={15} />
                                <span>Co-Creation Contract Milestone</span>
                              </div>
                              <h4 className="font-bold text-slate-800 mt-2 text-sm">{msg.milestoneTitle}</h4>
                              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Pipeline Status:</span>
                                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                                  msg.milestoneStatus === "pending" 
                                    ? "bg-amber-100 text-amber-800 animate-pulse" 
                                    : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {msg.milestoneStatus}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-900 leading-relaxed">{msg.text}</p>
                          )}
                        </div>

                        {/* Interactive LinkedIn action buttons matching the screenshot */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.actions.map((actionLabel) => {
                              const isPlacements = actionLabel === "Show me recent placements";
                              const isApply = actionLabel.includes("Apply");
                              
                              return (
                                <button
                                  key={actionLabel}
                                  onClick={() => {
                                    if (isPlacements) {
                                      // Execute response trigger
                                      handleSendMessage(undefined, "Show me recent placements", undefined, true);
                                    } else if (isApply) {
                                      // Open apply details modal
                                      setAppModal({
                                        isOpen: true,
                                        role: "Specialized Software Engineer (Integration & WebGL)",
                                        company: "Formation Co.",
                                        submitted: false
                                      });
                                    }
                                  }}
                                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer border ${
                                    isPlacements 
                                      ? "border-[#0a66c2] text-[#0a66c2] bg-white hover:bg-[#f2f6fa]" 
                                      : "border-[#0a66c2] text-[#0a66c2] bg-white font-extrabold shadow-xs hover:bg-[#f2f6fa] hover:border-[#004182]"
                                  }`}
                                >
                                  {actionLabel}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Simulated Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-center text-xs text-slate-400 italic">
                    {renderAvatar(activeConv.participant.avatar, activeConv.participant.name, false, "h-8 w-8")}
                    <span className="flex items-center gap-1">
                      {activeConv.participant.name} is typing a response...
                      <span className="inline-flex gap-0.5 ml-1">
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-0" />
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-150" />
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce delay-300" />
                      </span>
                    </span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Milestone Proposer Drawer Overlay inside right chat pane */}
              <AnimatePresence>
                {showMilestoneProposer && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="mx-4 my-2 p-4 border border-[#0a66c2]/20 bg-[#f2f6fa] rounded-lg shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-[#0a66c2] uppercase tracking-wider">
                        Propose Collaboration Milestone
                      </h4>
                      <button onClick={() => setShowMilestoneProposer(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>
                    <form onSubmit={handleProposeMilestoneSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Build WebGL render, Export sound stems"
                          value={milestoneTitle}
                          onChange={(e) => setMilestoneTitle(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-hidden focus:border-[#0a66c2]"
                        />
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={milestoneDate}
                            onChange={(e) => setMilestoneDate(e.target.value)}
                            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-500 outline-hidden focus:border-[#0a66c2]"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-[#0a66c2] hover:bg-[#004182] px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Input Editor Bar */}
              <form onSubmit={(e) => handleSendMessage(e)} className="border-t border-[#e0dfdc] bg-white p-3 flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <ImageIcon size={18} />
                </button>

                <input
                  type="text"
                  placeholder="Write a message or paste coordinates..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 rounded-full border border-slate-300 bg-[#f4f2ee]/50 hover:bg-[#f4f2ee] py-2 px-4 text-xs text-slate-800 outline-hidden focus:bg-white focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                  id="message-text-input"
                />

                <button
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className="rounded-full bg-[#0a66c2] text-white font-semibold text-xs px-4 py-2 hover:bg-[#004182] disabled:opacity-40 disabled:hover:bg-[#0a66c2] transition-all cursor-pointer"
                  id="message-send-btn"
                >
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full md:col-span-7 p-8 text-center text-slate-400 bg-slate-50/20">
              <Send size={40} className="text-slate-300 mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">Select a Conversation</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                Click an artist from your Inbox to collaborate, deploy shaders, or review deliverables.
              </p>
            </div>
          )}
          </div> {/* Close the inner Grid Area container */}
        </div>

        {/* Right Sidebar: Promoted Banner & Standard Corporate Footer (Matches Screenshot) */}
        <div className="hidden lg:col-span-3 lg:flex flex-col gap-4">
          
          {/* Promoted card layout */}
          <div className="bg-white border border-[#e0dfdc] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-3">
              <span>Promoted</span>
              <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <MoreHorizontal size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Schwank Logo mock */}
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-orange-400 to-amber-600 flex items-center justify-center text-white font-display font-extrabold text-2xl shadow-sm border border-orange-200 select-none mb-3">
                S
              </div>
              
              <h4 className="text-sm font-bold text-slate-800 hover:underline hover:text-[#0a66c2] cursor-pointer">
                Schwank North America
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Seth Ansah, explore relevant opportunities with Schwank North America
              </p>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Get the latest jobs, engineering tools and industrial automation updates.
              </p>

              <button
                onClick={() => setIsFollowingSchwank(!isFollowingSchwank)}
                className={`w-full mt-4 rounded-full py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isFollowingSchwank 
                    ? "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200" 
                    : "text-[#0a66c2] hover:bg-[#f2f6fa] border border-[#0a66c2] bg-white hover:border-[#004182]"
                }`}
              >
                {isFollowingSchwank ? "✓ Following" : "Follow"}
              </button>
            </div>
          </div>

          {/* Standard LinkedIn Links Footer */}
          <div className="px-2 text-center lg:text-left">
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-2 gap-y-1.5 text-[11px] text-slate-500 font-normal">
              <a href="#" className="hover:underline hover:text-[#0a66c2]">About</a>
              <a href="#" className="hover:underline hover:text-[#0a66c2]">Accessibility</a>
              <a href="#" className="hover:underline hover:text-[#0a66c2]">Help Center</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:underline hover:text-[#0a66c2] flex items-center gap-0.5">
                Privacy & Terms <ChevronDown size={10} />
              </a>
              <a href="#" className="hover:underline hover:text-[#0a66c2]">Ad Choices</a>
              <a href="#" className="hover:underline hover:text-[#0a66c2]">Advertising</a>
              <a href="#" className="hover:underline hover:text-[#0a66c2] flex items-center gap-0.5">
                Business Services <ChevronDown size={10} />
              </a>
              <a href="#" className="hover:underline hover:text-[#0a66c2]">Get the LinkedIn app</a>
              <a href="#" className="hover:underline hover:text-[#0a66c2]">More</a>
            </div>

            <div className="mt-4 flex items-center justify-center lg:justify-start gap-1 text-xs text-slate-700 font-bold select-none">
              <span className="text-[#0a66c2] font-display font-extrabold text-sm tracking-tighter">Co-Create</span>
              <span className="bg-[#0a66c2] text-white px-1 py-0.5 rounded-xs text-[10px] uppercase font-black">Link</span>
              <span className="text-slate-400 font-normal text-[10px] ml-1">LinkedIn Integration © 2026</span>
            </div>
          </div>
        </div>

      </div>

      {/* Automated High Fidelity Application Modal */}
      <AnimatePresence>
        {appModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg border border-[#e0dfdc] shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white font-extrabold px-2 py-1 rounded-sm text-xs font-display">in</div>
                  <h3 className="text-sm font-bold text-slate-800">Easy Apply</h3>
                </div>
                <button 
                  onClick={() => setAppModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {!appModal.submitted ? (
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] text-[#0a66c2] font-bold uppercase tracking-wider">Recruiting Pipeline</span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{appModal.role}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{appModal.company} • San Francisco, CA (Remote)</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <div className="flex gap-3 items-center">
                      {renderAvatar(userProfile.avatar, userProfile.name, true, "h-11 w-11")}
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{userProfile.name}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{userProfile.headline}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{userProfile.location}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 mt-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Email address</label>
                        <input 
                          type="text" 
                          readOnly 
                          value="tettehseth67@gmail.com" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-600 outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Phone number</label>
                        <input 
                          type="text" 
                          placeholder="+1 (555) 019-2834" 
                          className="w-full border border-slate-300 focus:border-[#0a66c2] rounded-md p-2 text-xs text-slate-700 outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Resume</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-md p-3 text-center bg-slate-50">
                          <span className="text-xs font-semibold text-[#0a66c2] hover:underline cursor-pointer">
                            Seth_Ansah_Resume_2026.pdf
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">Generated automatically from Co-Create Profile data</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                    <button
                      onClick={() => setAppModal(null)}
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setAppModal({ ...appModal, submitted: true })}
                      className="rounded-full bg-[#0a66c2] hover:bg-[#004182] px-5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 size={24} fill="currentColor" stroke="white" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Application Submitted!</h4>
                  <p className="text-xs text-slate-500 max-w-[320px] mx-auto leading-relaxed">
                    Your profile and portfolio were successfully routed to <span className="font-bold text-slate-800">{appModal.company}</span>'s hiring dashboard. Sophie Z. Novati will be notified immediately.
                  </p>
                  <button
                    onClick={() => setAppModal(null)}
                    className="mt-4 rounded-full bg-[#0a66c2] hover:bg-[#004182] px-6 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
