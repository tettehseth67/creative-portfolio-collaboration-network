/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CollaborationProject, CollabApplication, CreativeProfile } from "../types";
import { Briefcase, MapPin, Sparkles, Filter, Users, Calendar, Coins, Heart, Send, CheckCircle, Clock, Trash2, Shield, Eye, HelpCircle, Palette, Search, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CollaborationHubProps {
  userProfile: CreativeProfile;
  collabs: CollaborationProject[];
  setCollabs: (collabs: CollaborationProject[]) => void;
  applications: CollabApplication[];
  setApplications: (apps: CollabApplication[]) => void;
  searchQuery: string;
  onStartCollabChat: (authorId: string, authorName: string) => void;
  bookmarkedCollabIds: string[];
  onToggleBookmarkCollab: (collabId: string) => void;
}

export default function CollaborationHub({
  userProfile,
  collabs,
  setCollabs,
  applications,
  setApplications,
  searchQuery,
  onStartCollabChat,
  bookmarkedCollabIds,
  onToggleBookmarkCollab
}: CollaborationHubProps) {
  const [activeFilter, setActiveFilter] = useState("All Disciplines");
  const [selectedCollab, setSelectedCollab] = useState<CollaborationProject | null>(null);
  const [isPostingNew, setIsPostingNew] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const [activeHubTab, setActiveHubTab] = useState<"explore" | "contracts">("explore");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState("All");

  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // New Listing States
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newDiscipline, setNewDiscipline] = useState<string[]>([]);
  const [newRewardType, setNewRewardType] = useState<CollaborationProject["rewardType"]>("Collaborative Credit");
  const [newRewardVal, setNewRewardVal] = useState("");
  const [newTags, setNewTags] = useState("");

  // Application Input States
  const [appMessage, setAppMessage] = useState("");
  const [appPortfolio, setAppPortfolio] = useState("");
  const [appProposedReward, setAppProposedReward] = useState("");
  const [appEstimatedTimeline, setAppEstimatedTimeline] = useState("2-4 Weeks");
  const [appDeliverables, setAppDeliverables] = useState("");
  const [appExpertiseLevel, setAppExpertiseLevel] = useState("Mid-Level Professional");
  const [appFileAttachmentUrl, setAppFileAttachmentUrl] = useState("");

  const handlePostListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const tagsArr = newTags
      .split(/[\s,]+/)
      .map(t => t.trim().replace(/^#/, ""))
      .filter(t => t.length > 0);

    const newCollab: CollaborationProject = {
      id: `collab-${Date.now()}`,
      title: newTitle,
      owner: {
        id: userProfile.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
        headline: userProfile.headline,
        discipline: userProfile.discipline
      },
      description: newDesc,
      disciplineRequired: newDiscipline.length > 0 ? newDiscipline : ["Creative Coding"],
      rewardType: newRewardType,
      rewardValue: newRewardVal || "Mutual Portfolio Piece",
      status: "open",
      applicationsCount: 0,
      tags: tagsArr.length > 0 ? tagsArr : ["CollabSpace"],
      details: newDetails,
      createdAt: new Date().toISOString()
    };

    setCollabs([newCollab, ...collabs]);
    setIsPostingNew(false);

    // Reset fields
    setNewTitle("");
    setNewDesc("");
    setNewDetails("");
    setNewDiscipline([]);
    setNewRewardVal("");
    setNewTags("");
  };

  const handleApplyCollab = (collabId: string, projectTitle: string) => {
    if (!appMessage.trim()) return;

    const defaultMilestones = [
      {
        id: `ms-1-${Date.now()}`,
        title: "Milestone 1: Creative Spec Alignment & Kickoff",
        description: "Establish technical pipeline, finalize reference boards, and submit initial artwork concepts.",
        status: "pending" as const,
        rewardValue: appProposedReward ? `30% of ${appProposedReward}` : "Initial Approval"
      },
      {
        id: `ms-2-${Date.now()}`,
        title: "Milestone 2: Alpha Staging & Interactive Prototyping",
        description: "Deliver main assets (e.g., 3D mesh exports, multi-track audio stems, high-contrast layouts) for iteration.",
        status: "pending" as const,
        rewardValue: appProposedReward ? `40% of ${appProposedReward}` : "Alpha Milestone Sign-Off"
      },
      {
        id: `ms-3-${Date.now()}`,
        title: "Milestone 3: Master Handover & Compensation Release",
        description: "Submit final build assets, register shared ownership rights, and distribute rewards.",
        status: "pending" as const,
        rewardValue: appProposedReward ? `30% of ${appProposedReward}` : "Final License Transfer"
      }
    ];

    const newApp: CollabApplication = {
      id: `app-${Date.now()}`,
      projectId: collabId,
      projectTitle,
      applicantId: userProfile.id,
      applicantName: userProfile.name,
      applicantAvatar: userProfile.avatar,
      message: appMessage,
      portfolioLink: appPortfolio || userProfile.website || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      proposedReward: appProposedReward || "Standard Co-Creation Terms",
      estimatedTimeline: appEstimatedTimeline,
      deliverables: appDeliverables || "Co-Creation Deliverables",
      expertiseLevel: appExpertiseLevel,
      fileAttachmentUrl: appFileAttachmentUrl || undefined,
      milestones: defaultMilestones
    };

    setApplications([newApp, ...applications]);
    setIsApplying(null);
    setAppMessage("");
    setAppPortfolio("");
    setAppProposedReward("");
    setAppEstimatedTimeline("2-4 Weeks");
    setAppDeliverables("");
    setAppExpertiseLevel("Mid-Level Professional");
    setAppFileAttachmentUrl("");

    // Increment applications count
    setCollabs(
      collabs.map(c => {
        if (c.id === collabId) {
          return {
            ...c,
            applicationsCount: c.applicationsCount + 1
          };
        }
        return c;
      })
    );
  };

  const handleUpdateApplicationStatus = (appId: string, status: "accepted" | "declined") => {
    setApplications(
      applications.map(app => {
        if (app.id === appId) {
          const updatedMilestones = app.milestones || [
            {
              id: `ms-1-${Date.now()}`,
              title: "Milestone 1: Creative Spec Alignment & Kickoff",
              description: "Establish technical pipeline, finalize reference boards, and submit initial concepts.",
              status: "pending" as const,
              rewardValue: app.proposedReward || "Initial Approval"
            },
            {
              id: `ms-2-${Date.now()}`,
              title: "Milestone 2: Alpha Staging & Interactive Prototyping",
              description: "Deliver main assets (e.g., character renders, audio stems, layout codes) for joint review.",
              status: "pending" as const,
              rewardValue: app.proposedReward || "Alpha Sign-Off"
            },
            {
              id: `ms-3-${Date.now()}`,
              title: "Milestone 3: Master Handover & Share Registration",
              description: "Complete asset transfer, secure IP rights, and release payout balances.",
              status: "pending" as const,
              rewardValue: app.proposedReward || "Final Handover"
            }
          ];
          return {
            ...app,
            status,
            milestones: updatedMilestones
          };
        }
        return app;
      })
    );
  };

  const handleUpdateMilestoneStatus = (appId: string, milestoneId: string, newStatus: "pending" | "completed" | "released") => {
    setApplications(
      applications.map(app => {
        if (app.id === appId && app.milestones) {
          return {
            ...app,
            milestones: app.milestones.map(ms => {
              if (ms.id === milestoneId) {
                return { ...ms, status: newStatus };
              }
              return ms;
            })
          };
        }
        return app;
      })
    );
  };

  // Filter listings
  const filteredCollabs = collabs.filter(collab => {
    // 1. Category Filter ('Music', 'Design', 'Development')
    let matchesCategory = true;
    if (categoryFilter === "Music") {
      matchesCategory = collab.disciplineRequired.some(disc => 
        disc.toLowerCase().includes("sound") || 
        disc.toLowerCase().includes("music") || 
        disc.toLowerCase().includes("composer") ||
        disc.toLowerCase().includes("audio")
      );
    } else if (categoryFilter === "Design") {
      matchesCategory = collab.disciplineRequired.some(disc => 
        disc.toLowerCase().includes("art") || 
        disc.toLowerCase().includes("animation") || 
        disc.toLowerCase().includes("illustration") || 
        disc.toLowerCase().includes("concept") ||
        disc.toLowerCase().includes("design")
      );
    } else if (categoryFilter === "Development") {
      matchesCategory = collab.disciplineRequired.some(disc => 
        disc.toLowerCase().includes("coding") || 
        disc.toLowerCase().includes("developer") || 
        disc.toLowerCase().includes("programmer") || 
        disc.toLowerCase().includes("ui/ux") ||
        disc.toLowerCase().includes("automation")
      );
    }

    // 2. Discipline filter (from activeFilter sidebar)
    const disciplineMatch = 
      activeFilter === "All Disciplines" ||
      collab.disciplineRequired.some(disc => disc.toLowerCase().includes(activeFilter.toLowerCase())) ||
      (activeFilter === "Creative Coding & UI/UX" && collab.disciplineRequired.some(d => d.includes("Coding") || d.includes("UI/UX")));

    // 3. Search query
    const s = localSearch.toLowerCase();
    const searchMatch =
      collab.title.toLowerCase().includes(s) ||
      collab.description.toLowerCase().includes(s) ||
      collab.tags.some(tag => tag.toLowerCase().includes(s)) ||
      collab.rewardType.toLowerCase().includes(s) ||
      collab.owner.name.toLowerCase().includes(s);

    return matchesCategory && disciplineMatch && searchMatch;
  });

  const disciplinesOptions = [
    "Creative Coding & UI/UX",
    "3D Art & Animation",
    "Sound Design & Music",
    "Illustration & Concept Art"
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Page Title & Dashboard Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Briefcase className="text-indigo-600" />
            Collaboration Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Explore active community callouts, draft job proposals, and track active co-creations.</p>
        </div>

        {/* Tab Toggle Controls */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveHubTab("explore")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeHubTab === "explore"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            id="hub-tab-explore-btn"
          >
            Explore Listings
          </button>
          <button
            onClick={() => {
              setActiveHubTab("contracts");
              // Auto select first application if none selected yet
              if (!selectedContractId && applications.length > 0) {
                setSelectedContractId(applications[0].id);
              }
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeHubTab === "contracts"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            id="hub-tab-contracts-btn"
          >
            Contract & Reward Tracker
            <span className="rounded-full bg-indigo-100 text-indigo-700 px-1.5 py-0.5 text-[9px] font-bold">
              {applications.length}
            </span>
          </button>
        </div>
      </div>

      {activeHubTab === "explore" && (
        <>
          {/* Collaboration Hub Search and Category Filter Card */}
          <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search active listings, rewards, or tags..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pr-4 pl-11 text-xs font-sans text-slate-800 placeholder-slate-400 outline-hidden transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  id="collabs-local-search"
                />
                {localSearch && (
                  <button 
                    onClick={() => setLocalSearch("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-2">Discipline:</span>
                {[
                  { id: "All", label: "All Areas", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
                  { id: "Music", label: "Music", color: "bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100" },
                  { id: "Design", label: "Design", color: "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100" },
                  { id: "Development", label: "Development", color: "bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100" }
                ].map((cat) => {
                  const isActive = categoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoryFilter(cat.id);
                        // Clear the sub-filter sidebar to avoid unexpected empty views
                        setActiveFilter("All Disciplines");
                      }}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? "bg-slate-900 text-white shadow-xs" 
                          : `${cat.color}`
                      }`}
                      id={`cat-filter-collabs-${cat.id}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            
            {/* Left column Filters */}
            <div className="space-y-6 lg:col-span-1">
              {/* Create New Project Call */}
              <button
                onClick={() => setIsPostingNew(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 px-4 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer"
                id="create-collab-btn"
              >
                <Sparkles size={16} />
                <span>Launch Collab Listing</span>
              </button>

              {/* Filtering sidebar */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Filter size={14} className="text-slate-400" />
                  Required Skills
                </h4>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setActiveFilter("All Disciplines")}
                    className={`w-full text-left rounded-xl py-2 px-3 text-xs font-semibold transition-colors ${
                      activeFilter === "All Disciplines" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Disciplines
                  </button>
                  {disciplinesOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setActiveFilter(opt)}
                      className={`w-full text-left rounded-xl py-2 px-3 text-xs font-semibold transition-colors ${
                        activeFilter === opt ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guidelines on Safe Collaboration splits */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 shadow-xs">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Shield size={14} />
                  Fair Share Guidelines
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
                  Our community strictly promotes mutual credit. When launching revenue share proposals, ensure formal agreement drafts are established early inside messaging channels.
                </p>
              </div>
            </div>

            {/* Mid Column: Listings */}
            <div className="space-y-6 lg:col-span-2">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h2 className="font-display text-lg font-bold text-slate-800">Available Collaborations</h2>
                <span className="font-mono text-xs text-slate-400">{filteredCollabs.length} open callouts</span>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredCollabs.map((collab) => (
                    <motion.div
                      key={collab.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
                      id={`collab-card-${collab.id}`}
                    >
                      
                      {/* Top: Owner & Discipline tag */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-3">
                          {collab.owner.avatar ? (
                            <img src={collab.owner.avatar} alt={collab.owner.name} className="h-9 w-9 rounded-xl object-cover border border-slate-50 shrink-0" />
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-slate-50 shrink-0 select-none">
                              {collab.owner.name ? collab.owner.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                          <div>
                            <h4 className="font-display text-sm font-bold text-slate-800 hover:text-indigo-600 cursor-pointer">{collab.owner.name}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{collab.owner.headline}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 text-right">
                          <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                            {collab.rewardType}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-emerald-600 mt-0.5">{collab.rewardValue}</span>
                        </div>
                      </div>

                      {/* Body Title & Short description */}
                      <div className="mt-4">
                        <h3 className="font-display text-base font-bold text-slate-800 leading-snug">
                          {collab.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                          {collab.description}
                        </p>
                      </div>

                      {/* Skills tags needed */}
                      <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 font-display">Targeting:</span>
                        {collab.disciplineRequired.map((disc) => (
                          <span key={disc} className="rounded-lg bg-indigo-50/50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                            {disc}
                          </span>
                        ))}
                      </div>

                      {/* Footer actions */}
                      <div className="mt-5 border-t border-slate-50 pt-3.5 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {collab.applicationsCount} applicants
                          </span>
                          <span className="font-mono text-[10px]">
                            {new Date(collab.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onToggleBookmarkCollab(collab.id)}
                            className={`rounded-lg border px-2.5 py-1.5 font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                              bookmarkedCollabIds?.includes(collab.id)
                                ? "border-indigo-200 bg-indigo-50/50 text-indigo-700"
                                : "border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                            id={`collab-bookmark-btn-${collab.id}`}
                            title={bookmarkedCollabIds?.includes(collab.id) ? "Unsave" : "Save Opportunity"}
                          >
                            <Bookmark 
                              size={14} 
                              fill={bookmarkedCollabIds?.includes(collab.id) ? "currentColor" : "none"} 
                            />
                          </button>

                          <button
                            onClick={() => setSelectedCollab(collab)}
                            className="rounded-lg border border-slate-100 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                            id={`collab-details-btn-${collab.id}`}
                          >
                            Read Details
                          </button>

                          {collab.owner.id !== userProfile.id && (
                            <button
                              onClick={() => setIsApplying(collab.id)}
                              className="rounded-lg bg-indigo-600 px-4 py-1.5 font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                              id={`collab-apply-btn-${collab.id}`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  ))}

                  {filteredCollabs.length === 0 && (
                    <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-100 bg-white">
                      <Briefcase size={40} className="mx-auto text-slate-300" />
                      <h3 className="mt-4 font-display font-bold text-slate-700">No collaborations found</h3>
                      <p className="text-xs text-slate-400 mt-1">Try resetting your filters or creating the first listing yourself!</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right column: Submitted Applications Log */}
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3 mb-4">
                  <Clock size={16} className="text-indigo-500" />
                  Your Active Applications
                </h3>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {applications.map((app) => (
                    <div key={app.id} className="rounded-xl border border-slate-50 bg-slate-50/50 p-3 text-xs">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-slate-800 line-clamp-1">{app.projectTitle}</h5>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          app.status === "pending" 
                            ? "bg-amber-50 text-amber-700" 
                            : app.status === "accepted" 
                              ? "bg-emerald-50 text-emerald-700" 
                              : "bg-rose-50 text-rose-700"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 italic leading-relaxed">
                        "{app.message}"
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400">
                        <span className="font-bold text-indigo-500">{app.proposedReward}</span>
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  {applications.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4 italic">No collaborative entries submitted.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {activeHubTab === "contracts" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-fade-in">
          
          {/* Column 1: Active Contracts List */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3 mb-4">
                <Briefcase size={16} className="text-indigo-500" />
                Contracts & Proposals
              </h3>

              <div className="space-y-3 max-h-[550px] overflow-y-auto">
                {applications.map((app) => {
                  const isSelected = selectedContractId === app.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => setSelectedContractId(app.id)}
                      className={`w-full text-left rounded-xl border p-3.5 transition-all block cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/10 ring-2 ring-indigo-50"
                          : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                      id={`contract-item-${app.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider ${
                          app.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : app.status === "accepted"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-xs mt-2 line-clamp-1">{app.projectTitle}</h4>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <img src={app.applicantAvatar} alt={app.applicantName} className="h-5 w-5 rounded-full object-cover" />
                        <span className="text-[10px] font-medium text-slate-500">Applicant: {app.applicantName}</span>
                      </div>

                      {app.proposedReward && (
                        <div className="mt-2.5 flex items-center justify-between text-[9px] bg-slate-50/50 rounded-lg p-1.5 border border-slate-50 font-mono">
                          <span className="text-slate-400">Reward Setup:</span>
                          <span className="font-bold text-indigo-600">{app.proposedReward}</span>
                        </div>
                      )}
                    </button>
                  );
                })}

                {applications.length === 0 && (
                  <div className="text-center py-12 text-slate-400 italic text-xs">
                    No active proposals or contract logs found. Create some applications inside the "Explore" tab!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Detailed Contract Analytics, Specialized Application Data, & Milestones */}
          <div className="lg:col-span-2 space-y-6">
            {(() => {
              const currentApp = applications.find(a => a.id === selectedContractId) || applications[0];
              if (!currentApp) {
                return (
                  <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-white p-12 text-center text-slate-400">
                    <Shield size={40} className="mx-auto text-slate-300 mb-3" />
                    <h4 className="font-display font-bold text-slate-700">No Contract Selected</h4>
                    <p className="text-xs text-slate-400 mt-1">Select an active contract or draft proposal from the left sidebar to access live tracking and rewards triggers.</p>
                  </div>
                );
              }

              // Compute stats
              const totalMilestones = currentApp.milestones?.length || 0;
              const completedMilestones = currentApp.milestones?.filter(m => m.status === "completed" || m.status === "released").length || 0;
              const releasedMilestones = currentApp.milestones?.filter(m => m.status === "released").length || 0;
              const percentComplete = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <div className="space-y-6">
                  
                  {/* Contract Header & Sandboxed Status Toggles */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-50 pb-4 mb-4">
                      <div>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[9px] font-mono font-bold text-indigo-700 uppercase tracking-wide">
                          Contract Scope
                        </span>
                        <h2 className="font-display text-base font-bold text-slate-900 mt-1.5 leading-tight">
                          {currentApp.projectTitle}
                        </h2>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span>Applicant: <strong className="text-slate-800">{currentApp.applicantName}</strong></span>
                          <span>•</span>
                          <span>Level: <strong className="text-slate-800">{currentApp.expertiseLevel || "Mid-Level"}</strong></span>
                        </div>
                      </div>

                      {/* Interactive Proposal Decision (if Pending) */}
                      {currentApp.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateApplicationStatus(currentApp.id, "declined")}
                            className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            Decline Proposal
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(currentApp.id, "accepted")}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
                          >
                            Accept & Sign Contract
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-100 p-2 text-xs">
                          <span className="text-slate-400 font-mono">Contract State:</span>
                          <span className={`font-bold ${currentApp.status === "accepted" ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentApp.status === "accepted" ? "ACTIVE & SIGNED" : "DECLINED"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Specialized Proposal Information Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-50 text-xs mb-4">
                      <div>
                        <span className="text-slate-400 block font-medium">Timeline Expected:</span>
                        <span className="font-bold text-slate-800 block mt-0.5">{currentApp.estimatedTimeline || "Not specified"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Contract Compensation:</span>
                        <span className="font-bold text-indigo-600 block mt-0.5">{currentApp.proposedReward || "Co-Ownership"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Milestone Progress:</span>
                        <span className="font-bold text-slate-800 block mt-0.5">{completedMilestones} / {totalMilestones} done</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Rewards Released:</span>
                        <span className="font-bold text-emerald-600 block mt-0.5">{releasedMilestones} / {totalMilestones} released</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <strong className="text-slate-700 font-display block">Pitch & Cover Letter:</strong>
                        <p className="text-slate-500 italic mt-1 leading-relaxed bg-slate-50/30 p-2.5 rounded-lg border border-slate-100/50">
                          "{currentApp.message}"
                        </p>
                      </div>

                      {currentApp.deliverables && (
                        <div>
                          <strong className="text-slate-700 font-display block">Committed Deliverables:</strong>
                          <p className="text-slate-600 mt-1 font-sans">{currentApp.deliverables}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <a
                          href={currentApp.portfolioLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline font-bold inline-flex items-center gap-1"
                        >
                          View Applicant Portfolio Link ↗
                        </a>

                        {currentApp.fileAttachmentUrl && (
                          <a
                            href={currentApp.fileAttachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-slate-800 font-semibold"
                          >
                            Attachment File ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Milestones Pipeline / Reward Tracking Controls */}
                  {currentApp.status === "accepted" && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-5">
                        <div>
                          <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <Coins size={16} className="text-amber-500" />
                            Milestone Payment & Equity Tracker
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Sandbox simulation: Click to progress deliverables and unlock compensations.</p>
                        </div>

                        {/* Interactive Radial/Linear Progression indicator */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{percentComplete}% Complete</span>
                          <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600" style={{ width: `${percentComplete}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {currentApp.milestones?.map((ms) => (
                          <div
                            key={ms.id}
                            className={`rounded-xl border p-4 transition-all ${
                              ms.status === "released"
                                ? "border-emerald-200 bg-emerald-50/10"
                                : ms.status === "completed"
                                  ? "border-indigo-200 bg-indigo-50/10"
                                  : "border-slate-100 bg-slate-50/40"
                            }`}
                          >
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                                  <span className={`inline-block h-2 w-2 rounded-full ${
                                    ms.status === "released" 
                                      ? "bg-emerald-500" 
                                      : ms.status === "completed" 
                                        ? "bg-indigo-500" 
                                        : "bg-amber-400"
                                  }`} />
                                  {ms.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{ms.description}</p>
                              </div>

                              {/* Reward Tag */}
                              <div className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-[9px] text-slate-600 font-bold">
                                {ms.rewardValue || "Standard Compensation"}
                              </div>
                            </div>

                            {/* Milestone Actions */}
                            <div className="mt-3.5 pt-3.5 border-t border-slate-100/50 flex flex-wrap items-center justify-between gap-3 text-[10px]">
                              <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                                <span>Status:</span>
                                <span className={`font-bold ${
                                  ms.status === "released" 
                                    ? "text-emerald-600" 
                                    : ms.status === "completed" 
                                      ? "text-indigo-600" 
                                      : "text-amber-600"
                                }`}>
                                  {ms.status.toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {ms.status === "pending" && (
                                  <button
                                    onClick={() => handleUpdateMilestoneStatus(currentApp.id, ms.id, "completed")}
                                    className="rounded-lg bg-white border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer"
                                  >
                                    Mark as Completed
                                  </button>
                                )}

                                {ms.status === "completed" && (
                                  <button
                                    onClick={() => handleUpdateMilestoneStatus(currentApp.id, ms.id, "released")}
                                    className="rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                                  >
                                    Release Reward & Pay
                                  </button>
                                )}

                                {ms.status === "released" && (
                                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle size={12} /> Reward Distributed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Smart Digital Rights Agreement Box */}
                      <div className="mt-5 rounded-xl bg-slate-900 text-white p-4 font-mono text-[9px] leading-relaxed border border-slate-800">
                        <span className="text-indigo-400 font-bold block mb-1">CO-CREATIVE SECURE DIGITAL REGISTRY</span>
                        <p className="text-slate-300">
                          [ID: CONT-{currentApp.id.substring(4)}] All co-creation files are compiled with client hashes. Marking milestone 3 as released locks down mutual digital IP licensing on secondary stores automatically.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* If declined */}
                  {currentApp.status === "declined" && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/10 p-6 text-center text-rose-800">
                      <p className="text-xs font-semibold">This contract proposal has been declined.</p>
                      <p className="text-[10px] text-slate-400 mt-1">If this was a mistake, you can accept again by clicking "Accept & Sign Contract" above.</p>
                    </div>
                  )}

                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* Slide-In Modal: Create Collab Listing */}
      <AnimatePresence>
        {isPostingNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPostingNew(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
              id="collab-form-modal"
            >
              <h2 className="font-display text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Briefcase size={20} className="text-indigo-600" />
                Launch Co-Creation Listing
              </h2>

              <form onSubmit={handlePostListing} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3D Shader Developer for Cyberpunk RPG"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Elevator Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="A quick 2-sentence hook detailing your creative goal and who you need..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Detailed Technical Specs</label>
                  <textarea
                    rows={3}
                    placeholder="Enumerate the workflow, milestones, required experience, and file deliverable expectations..."
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Reward Framework</label>
                    <select
                      value={newRewardType}
                      onChange={(e) => setNewRewardType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                    >
                      <option value="Revenue Share">Revenue Share</option>
                      <option value="Co-Ownership">Co-Ownership</option>
                      <option value="Paid Contract">Paid Contract</option>
                      <option value="Collaborative Credit">Collaborative Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Value details</label>
                    <input
                      type="text"
                      placeholder="e.g. 20% Royalty Split, $1,500 Contract"
                      value={newRewardVal}
                      onChange={(e) => setNewRewardVal(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Required Disciplines (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Creative Coding, Sound Design"
                    onChange={(e) => setNewDiscipline(e.target.value.split(",").map(s => s.trim()))}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Project Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. UnrealEngine5, Synth, Retro (space/comma separated)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPostingNew(false)}
                    className="rounded-xl border border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-In Modal: Apply to Collab */}
      <AnimatePresence>
        {isApplying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsApplying(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
              id="collab-apply-modal"
            >
              {(() => {
                const target = collabs.find(c => c.id === isApplying);
                if (!target) return null;
                return (
                  <>
                    <h2 className="font-display text-lg font-bold text-slate-900 mb-1">
                      Specialized Job Application Form
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">
                      Submitting professional proposal for: <span className="font-semibold text-indigo-600">{target.title}</span>
                    </p>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Direct Proposal / Cover Letter</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Introduce yourself, your specific vision for this project, and how your skills can solve the artistic needs..."
                          value={appMessage}
                          onChange={(e) => setAppMessage(e.target.value)}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Primary Portfolio URL</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Behance, ArtStation, GitHub"
                            value={appPortfolio}
                            onChange={(e) => setAppPortfolio(e.target.value)}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Proposed Reward/Rate</label>
                          <input
                            type="text"
                            placeholder="e.g. $1,200 Fixed, 20% Rev-Share"
                            value={appProposedReward}
                            onChange={(e) => setAppProposedReward(e.target.value)}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Timeline</label>
                          <select
                            value={appEstimatedTimeline}
                            onChange={(e) => setAppEstimatedTimeline(e.target.value)}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                          >
                            <option value="1 Week">Under 1 Week</option>
                            <option value="2-4 Weeks">2-4 Weeks</option>
                            <option value="1-2 Months">1-2 Months</option>
                            <option value="Ongoing">Ongoing / Retainer</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Expertise Level</label>
                          <select
                            value={appExpertiseLevel}
                            onChange={(e) => setAppExpertiseLevel(e.target.value)}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                          >
                            <option value="Junior / Beginner">Junior / Beginner</option>
                            <option value="Mid-Level Professional">Mid-Level Professional</option>
                            <option value="Senior Leader / Expert">Senior Leader / Expert</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Proposed Specific Deliverables</label>
                        <textarea
                          rows={2}
                          placeholder="Describe the exact files, codebases, or sound elements you plan to hand over..."
                          value={appDeliverables}
                          onChange={(e) => setAppDeliverables(e.target.value)}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Attachment / Pitch Deck Link (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Google Drive, Figma, or Loom walkthrough URL"
                          value={appFileAttachmentUrl}
                          onChange={(e) => setAppFileAttachmentUrl(e.target.value)}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                        />
                      </div>

                      <div className="flex gap-2 pt-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsApplying(null)}
                          className="rounded-xl border border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleApplyCollab(target.id, target.title)}
                          disabled={!appMessage.trim() || !appPortfolio.trim()}
                          className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
                        >
                          Submit Pitch Form
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Full Modal */}
      <AnimatePresence>
        {selectedCollab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCollab(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-2xl overflow-hidden"
              id="collab-details-modal"
            >
              <div className="flex justify-between items-start gap-4 border-b border-slate-50 pb-4 mb-5">
                <div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    {selectedCollab.rewardType}
                  </span>
                  <h2 className="font-display text-xl font-bold text-slate-900 mt-2 leading-tight">
                    {selectedCollab.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Published by: {selectedCollab.owner.name}</span>
                    <span>•</span>
                    <span>{new Date(selectedCollab.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCollab(null)}
                  className="rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 p-1.5 transition-all text-xs"
                >
                  Close
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Project Abstract</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                    {selectedCollab.description}
                  </p>
                </div>

                {selectedCollab.details && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Technical Pipeline & Specs</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                      {selectedCollab.details}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-50 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Credit & Compensation:</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedCollab.rewardValue}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Active Applicants:</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedCollab.applicationsCount} creatives</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
                  <button
                    onClick={() => onToggleBookmarkCollab(selectedCollab.id)}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      bookmarkedCollabIds?.includes(selectedCollab.id)
                        ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold"
                        : "border-slate-100 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Bookmark 
                      size={14} 
                      fill={bookmarkedCollabIds?.includes(selectedCollab.id) ? "currentColor" : "none"} 
                    />
                    <span>{bookmarkedCollabIds?.includes(selectedCollab.id) ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    onClick={() => {
                      onStartCollabChat(selectedCollab.owner.id, selectedCollab.owner.name);
                      setSelectedCollab(null);
                    }}
                    className="rounded-xl border border-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Discuss in Chat
                  </button>

                  {selectedCollab.owner.id !== userProfile.id && (
                    <button
                      onClick={() => {
                        setIsApplying(selectedCollab.id);
                        setSelectedCollab(null);
                      }}
                      className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
