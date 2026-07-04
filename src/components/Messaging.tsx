/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Conversation, Message, CreativeProfile } from "../types";
import { Send, Image as ImageIcon, CheckCheck, Clock, MapPin, Sparkles, FolderKanban, Info, Zap, Calendar, Heart, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MessagingProps {
  userProfile: CreativeProfile;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

export default function Messaging({
  userProfile,
  conversations,
  setConversations,
  activeConversationId,
  setActiveConversationId
}: MessagingProps) {
  const [typedMessage, setTypedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMilestoneProposer, setShowMilestoneProposer] = useState(false);
  
  // Milestone proposer form inputs
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConversationId, isTyping]);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  // Select a contextual response based on what the user typed
  const getSimulatedResponse = (userText: string, participantName: string): string => {
    const text = userText.toLowerCase();
    
    if (participantName.includes("Anya")) {
      if (text.includes("webgl") || text.includes("shader") || text.includes("three")) {
        return "Baking the normals at 2K resolution right now, Seth! I'll test how it compiles on my end. This WebGL bento showcase is going to look so sleek.";
      }
      if (text.includes("mesh") || text.includes("poly") || text.includes("blender")) {
        return "I decimated the cyberpunk wanderer model from 2M polygons down to about 45k. The details held up remarkably well! Let's get it hooked into the ThreeJS stage.";
      }
      if (text.includes("milestone") || text.includes("propose") || text.includes("contract")) {
        return "Brilliant. I saw the milestone proposal pop up in our chat! I've approved it. Let's secure our asset pipeline first.";
      }
      return "That sounds like a solid workflow! I'm opening up Unreal right now to double check the texture channels. Let's make sure the diffuse and specular elements remain separate.";
    } else {
      // Marcus Vance
      if (text.includes("stem") || text.includes("audio") || text.includes("ableton")) {
        return "Perfect! I am exporting the stems as WAV 44.1kHz. I have separate tracks for the bass drone, modular synth bleeps, and transient noise so they map cleanly to your particle triggers.";
      }
      if (text.includes("particle") || text.includes("wave") || text.includes("visual")) {
        return "The idea of having the modular pads control the size of the procedural particles is brilliant, Seth. It creates a complete visual-audio loop.";
      }
      return "I'll package the Ableton project and post the Google Drive link here in a bit. Let me know if you need any adjustments to the tempo or key!";
    }
  };

  const handleSendMessage = (e?: React.FormEvent, customMilestone?: { title: string }) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() && !customMilestone) return;

    if (!activeConv) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: userProfile.id,
      text: customMilestone ? `[Milestone Proposed] ${customMilestone.title}` : typedMessage,
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
    const sentText = typedMessage;
    setTypedMessage("");

    // Simulate co-creator replying after 2.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      const replyText = customMilestone 
        ? "Excellent! I see the milestone proposal. I have marked this as Approved and will begin my phase of deliverables."
        : getSimulatedResponse(sentText, activeConv.participant.name);

      const replyMsg: Message = {
        id: `m-reply-${Date.now()}`,
        senderId: activeConv.participant.id,
        text: replyText,
        timestamp: new Date().toISOString()
      };

      // If user sent a milestone, let's auto-approve it in simulation!
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
    }, 2500);
  };

  const handleProposeMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    handleSendMessage(undefined, { title: milestoneTitle });
    setMilestoneTitle("");
    setShowMilestoneProposer(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs md:grid-cols-3">
        
        {/* Left Side: Conversations List */}
        <div className="flex flex-col border-r border-slate-100 md:col-span-1">
          <div className="border-b border-slate-50 p-4">
            <h2 className="font-display text-base font-bold text-slate-800">The Greenroom</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Active co-creation and chat channels</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    // Mark as read
                    setConversations(
                      conversations.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
                    );
                  }}
                  className={`flex cursor-pointer gap-3 p-4 transition-colors ${
                    isActive ? "bg-indigo-50/50" : "hover:bg-slate-50"
                  }`}
                  id={`conversation-tab-${conv.id}`}
                >
                  <div className="relative">
                    <img src={conv.participant.avatar} alt={conv.participant.name} className="h-10 w-10 rounded-xl object-cover border border-slate-50" />
                    {conv.participant.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-xs font-bold text-slate-800 truncate">{conv.participant.name}</h4>
                      <span className="font-mono text-[9px] text-slate-400">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-indigo-600 font-semibold truncate mt-0.5">{conv.participant.discipline}</p>
                    <p className="mt-1 text-xs text-slate-500 truncate">
                      {lastMsg?.text}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Chat Pane */}
        {activeConv ? (
          <div className="flex flex-col h-full md:col-span-2 bg-slate-50/30">
            {/* Active chat header */}
            <div className="flex items-center justify-between border-b border-slate-50 bg-white p-4">
              <div className="flex gap-3">
                <img src={activeConv.participant.avatar} alt={activeConv.participant.name} className="h-10 w-10 rounded-xl object-cover border border-slate-50" />
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-800">{activeConv.participant.name}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{activeConv.participant.headline}</p>
                </div>
              </div>

              {/* Propose milestone toggle */}
              <button
                onClick={() => setShowMilestoneProposer(!showMilestoneProposer)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 cursor-pointer"
                id="propose-milestone-btn"
              >
                <FolderKanban size={13} />
                <span>Propose Milestone</span>
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="rounded-xl border border-indigo-50 bg-indigo-50/20 p-3.5 text-xs text-slate-600 flex gap-2.5 items-start">
                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Staging Environment</span>
                  You are discussing a creative collaboration pipeline with <span className="font-semibold text-indigo-700">{activeConv.participant.name}</span>. Try discussing 3D models, Ableton stems, or shaders to see smart contextual responses.
                </div>
              </div>

              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === userProfile.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMe && (
                        <img src={activeConv.participant.avatar} alt={activeConv.participant.name} className="h-7 w-7 rounded-lg object-cover" />
                      )}

                      <div>
                        {/* Rendering regular message vs Milestone Card */}
                        {msg.isMilestone ? (
                          <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 shadow-sm w-72">
                            <div className="flex items-center gap-2 text-indigo-700">
                              <Award size={18} />
                              <span className="font-display text-xs font-bold">Collaborative Milestone</span>
                            </div>
                            <h4 className="font-display text-sm font-bold text-slate-800 mt-2">{msg.milestoneTitle}</h4>
                            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                              <span className="text-[10px] font-mono text-slate-400">Status:</span>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                msg.milestoneStatus === "pending" 
                                  ? "bg-amber-50 text-amber-700 animate-pulse" 
                                  : msg.milestoneStatus === "approved" 
                                    ? "bg-emerald-50 text-emerald-700" 
                                    : "bg-rose-50 text-rose-700"
                              }`}>
                                {msg.milestoneStatus}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isMe 
                              ? "bg-indigo-600 text-white shadow-sm" 
                              : "bg-white border border-slate-100 text-slate-700"
                          }`}>
                            <p className="whitespace-pre-line">{msg.text}</p>
                          </div>
                        )}

                        <span className="mt-1 block text-right font-mono text-[8px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Simulated Typing Status */}
              {isTyping && (
                <div className="flex justify-start items-center gap-2 text-xs text-slate-400 font-sans italic">
                  <img src={activeConv.participant.avatar} alt={activeConv.participant.name} className="h-7 w-7 rounded-lg object-cover" />
                  <span>{activeConv.participant.name} is typing an artistic response...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Milestone Proposer Popover */}
            <AnimatePresence>
              {showMilestoneProposer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mx-4 mb-2 rounded-2xl border border-indigo-100 bg-white p-4 shadow-md"
                >
                  <h4 className="font-display text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
                    Propose Collaboration Milestone
                  </h4>
                  <form onSubmit={handleProposeMilestoneSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Draft shader blueprint, Finalize stems"
                          value={milestoneTitle}
                          onChange={(e) => setMilestoneTitle(e.target.value)}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={milestoneDate}
                          onChange={(e) => setMilestoneDate(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs text-slate-400 outline-hidden focus:border-indigo-400 focus:bg-white"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat editor */}
            <form onSubmit={(e) => handleSendMessage(e)} className="border-t border-slate-50 bg-white p-4 flex gap-2">
              <button
                type="button"
                className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <ImageIcon size={18} />
              </button>

              <input
                type="text"
                placeholder="Discuss coordinates, code, or art stems..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 rounded-xl border border-slate-100 bg-slate-50 py-2 px-4 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                id="message-text-input"
              />

              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
                id="message-send-btn"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full md:col-span-2 bg-slate-50/10 p-8 text-center text-slate-400">
            <Send size={48} className="text-slate-200 mb-4 animate-bounce" />
            <h3 className="font-display font-bold text-slate-700">No active discussion</h3>
            <p className="text-xs text-slate-400 mt-1">Select an artist from the sidebar Greenroom to discuss collaboration details.</p>
          </div>
        )}

      </div>
    </div>
  );
}
