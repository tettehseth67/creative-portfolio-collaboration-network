/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreativeProfile, FeaturedProject, Post, CollaborationProject } from "../types";
import { MapPin, Globe, ExternalLink, Mail, Edit, Plus, Trash2, Camera, Compass, Award, Briefcase, PlusCircle, Check, Palette, CheckCircle, TrendingUp, Eye, ThumbsUp, Calendar, Bookmark, MessageSquare, Sparkles, Users, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MOCK_COMMUNITY_USERS = [
  {
    id: "creative-anya",
    name: "Anya Kovalenko",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    discipline: "3D Art & Animation"
  },
  {
    id: "creative-marcus",
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    discipline: "Sound Design & Music"
  },
  {
    id: "creative-hana",
    name: "Hana Katsura",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    discipline: "Illustration & Concept Art"
  },
  {
    id: "creative-devon",
    name: "Devon Sinclair",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    discipline: "Creative Coding & UI/UX"
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl font-sans text-xs">
        <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-400" />
          {label}
        </p>
        <div className="space-y-1.5">
          <p className="flex items-center justify-between gap-6 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Profile Views
            </span>
            <span className="font-mono font-bold text-slate-800">{payload[0].value}</span>
          </p>
          <p className="flex items-center justify-between gap-6 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Skill Endorsements
            </span>
            <span className="font-mono font-bold text-slate-800">{payload[1]?.value ?? 0}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface MyProfileProps {
  userProfile: CreativeProfile;
  setUserProfile: (profile: CreativeProfile) => void;
  bookmarkedPostIds: string[];
  bookmarkedCollabIds: string[];
  onToggleBookmarkPost: (postId: string) => void;
  onToggleBookmarkCollab: (collabId: string) => void;
  posts: Post[];
  collabs: CollaborationProject[];
  initialSubTab?: "details" | "saved";
  setInitialSubTab?: (tab: "details" | "saved") => void;
  onStartCollabChat?: (authorId: string, authorName: string) => void;
}

export default function MyProfile({ 
  userProfile, 
  setUserProfile,
  bookmarkedPostIds,
  bookmarkedCollabIds,
  onToggleBookmarkPost,
  onToggleBookmarkCollab,
  posts,
  collabs,
  initialSubTab = "details",
  setInitialSubTab,
  onStartCollabChat
}: MyProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<"details" | "saved">(initialSubTab);

  React.useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const handleSubTabChange = (tab: "details" | "saved") => {
    setActiveSubTab(tab);
    if (setInitialSubTab) {
      setInitialSubTab(tab);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [selectedSkillForEndorsement, setSelectedSkillForEndorsement] = useState<string | null>(null);
  
  // State for saved items tab view category ("posts" or "collabs")
  const [savedCategory, setSavedCategory] = useState<"posts" | "collabs">("posts");
  const [localSelectedCollab, setLocalSelectedCollab] = useState<CollaborationProject | null>(null);

  const analyticsData = React.useMemo(() => {
    const totalEndorsements = userProfile.skills.reduce((sum, s) => sum + (userProfile.endorsements?.[s]?.length || 0), 0);
    const data = [];
    const baseViews = 180;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const dailyViews = Math.floor(baseViews + (29 - i) * 5 + Math.sin(i * 0.4) * 12 + Math.cos(i * 0.2) * 6);
      
      const dailyEndorsements = Math.max(
        0,
        Math.floor(totalEndorsements - Math.round((i * (totalEndorsements / 35)) + (Math.sin(i * 0.8) * 0.6)))
      );
      
      data.push({
        date: dateStr,
        views: dailyViews,
        endorsements: dailyEndorsements,
      });
    }
    return data;
  }, [userProfile.endorsements, userProfile.skills]);

  const handleToggleMockEndorsement = (skill: string, endorserId: string) => {
    const currentEndorsements = userProfile.endorsements || {};
    const skillEndorsers = currentEndorsements[skill] || [];
    const isAlreadyEndorsed = skillEndorsers.includes(endorserId);

    let newEndorsers: string[];
    if (isAlreadyEndorsed) {
      newEndorsers = skillEndorsers.filter(id => id !== endorserId);
    } else {
      newEndorsers = [...skillEndorsers, endorserId];
    }

    setUserProfile({
      ...userProfile,
      endorsements: {
        ...currentEndorsements,
        [skill]: newEndorsers
      }
    });
  };

  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (isCameraActive) {
      setCameraError(null);
      let activeStream: MediaStream | null = null;
      navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" }
      })
      .then((mediaStream) => {
        activeStream = mediaStream;
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCameraError("Unable to access camera. Please check your browser permissions or connect a webcam.");
      });

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
    }
  }, [isCameraActive]);

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;
        const minSize = Math.min(videoWidth, videoHeight);
        const sx = (videoWidth - minSize) / 2;
        const sy = (videoHeight - minSize) / 2;
        
        ctx.drawImage(video, sx, sy, minSize, minSize, 0, 0, 500, 500);
        
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          setUserProfile({
            ...userProfile,
            avatar: dataUrl
          });
          setIsCameraActive(false);
        } catch (e) {
          console.error("Failed to generate base64 image", e);
        }
      }
    }
  };

  // Avatar update states
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleAvatarFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, JPEG, GIF, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds the 5MB platform threshold.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUserProfile({
          ...userProfile,
          avatar: e.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit fields
  const [editName, setEditName] = useState(userProfile.name);
  const [editHeadline, setEditHeadline] = useState(userProfile.headline);
  const [editBio, setEditBio] = useState(userProfile.bio);
  const [editLocation, setEditLocation] = useState(userProfile.location);
  const [editOpenToWork, setEditOpenToWork] = useState(userProfile.openToWork);
  const [editSkills, setEditSkills] = useState(userProfile.skills.join(", "));

  // New project fields
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projImage, setProjImage] = useState("");
  const [projVideoUrl, setProjVideoUrl] = useState("");
  const [projCategory, setProjCategory] = useState("Creative Coding");

  // Portfolio upload improvements (Drag & Drop + Progress simulation)
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, JPEG, GIF, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds the 5MB platform threshold.");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(15);
    
    // Simulate upload progress bar
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setUploadStatus("success");
        if (e.target?.result) {
          setProjImage(e.target.result as string);
        }
      }, 500);
    };
    reader.onerror = () => {
      clearInterval(interval);
      setUploadStatus("error");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      ...userProfile,
      name: editName,
      headline: editHeadline,
      bio: editBio,
      location: editLocation,
      openToWork: editOpenToWork,
      skills: editSkills.split(",").map(s => s.trim()).filter(Boolean)
    });
    setIsEditing(false);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    const newProject: FeaturedProject = {
      id: `proj-${Date.now()}`,
      title: projTitle,
      description: projDesc,
      imageUrl: projImage || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
      category: projCategory,
      likesCount: 0,
      videoUrl: projVideoUrl.trim() || undefined
    };

    setUserProfile({
      ...userProfile,
      featuredProjects: [...userProfile.featuredProjects, newProject]
    });

    setIsAddingProject(false);
    setProjTitle("");
    setProjDesc("");
    setProjImage("");
    setProjVideoUrl("");
  };

  const handleDeleteProject = (projId: string) => {
    setUserProfile({
      ...userProfile,
      featuredProjects: userProfile.featuredProjects.filter(p => p.id !== projId)
    });
  };

  const handleToggleEmailSetting = (key: 'newApplications' | 'newEndorsements' | 'newMessages' | 'weeklyDigest') => {
    const currentSettings = userProfile.emailSettings || {
      newApplications: true,
      newEndorsements: true,
      newMessages: false,
      weeklyDigest: true
    };
    setUserProfile({
      ...userProfile,
      emailSettings: {
        ...currentSettings,
        [key]: !currentSettings[key]
      }
    });
  };

  // Curated list of visual options for new project mock backgrounds
  const visualOptions = [
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80"
  ];

  const renderSavedItemsView = () => {
    const savedPosts = posts.filter((p) => bookmarkedPostIds?.includes(p.id));
    const savedCollabs = collabs.filter((c) => bookmarkedCollabIds?.includes(c.id));

    return (
      <div className="space-y-6 animate-fade-in" id="saved-items-tab-view">
        {/* Saved Subtabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setSavedCategory("posts")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                savedCategory === "posts"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              id="saved-category-posts-btn"
            >
              Saved Posts ({savedPosts.length})
            </button>
            <button
              onClick={() => setSavedCategory("collabs")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                savedCategory === "collabs"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              id="saved-category-collabs-btn"
            >
              Saved Opportunities ({savedCollabs.length})
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Click the bookmark icon to remove an item from your list.
          </p>
        </div>

        {/* Content Lists */}
        {savedCategory === "posts" ? (
          <div className="space-y-4" id="saved-posts-list">
            {savedPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-xs">
                <Bookmark className="mx-auto text-slate-300 mb-3" size={36} />
                <h4 className="font-display font-bold text-slate-700 text-sm">No saved posts</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Go to the Feed to bookmark inspirational artworks, visual pipelines, or updates from your network.
                </p>
              </div>
            ) : (
              savedPosts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col md:flex-row gap-5 relative">
                  {/* Unsave button in the corner */}
                  <button
                    onClick={() => onToggleBookmarkPost(post.id)}
                    className="absolute top-4 right-4 rounded-full bg-slate-50 p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Bookmark size={16} fill="currentColor" />
                  </button>

                  {/* Left Column of Post: Post metadata & content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <img src={post.author.avatar} alt={post.author.name} className="h-8 w-8 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{post.author.name}</h4>
                        <p className="text-[10px] text-slate-400">{post.author.headline}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pr-6">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.map(t => (
                        <span key={t} className="text-[10px] font-semibold text-indigo-600">#{t}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium pt-2">
                      <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.likesCount} appreciations</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments.length} comments</span>
                    </div>
                  </div>

                  {/* Right Column of Post: image attachment if any */}
                  {post.imageUrl && (
                    <div className="w-full md:w-48 aspect-video md:aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                      <img src={post.imageUrl} alt="Saved asset" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4" id="saved-collabs-list">
            {savedCollabs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-xs">
                <Briefcase className="mx-auto text-slate-300 mb-3" size={36} />
                <h4 className="font-display font-bold text-slate-700 text-sm">No saved opportunities</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Explore the Collaboration Hub to find paid contracts, co-ownerships, and revenue share callouts to bookmark.
                </p>
              </div>
            ) : (
              savedCollabs.map((collab) => (
                <div key={collab.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between gap-4 relative">
                  {/* Unsave button */}
                  <button
                    onClick={() => onToggleBookmarkCollab(collab.id)}
                    className="absolute top-4 right-4 rounded-full bg-slate-50 p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Bookmark size={16} fill="currentColor" />
                  </button>

                  <div>
                    {/* Header: Owner & details */}
                    <div className="flex gap-2.5 items-center pr-8">
                      <img src={collab.owner.avatar} alt={collab.owner.name} className="h-8 w-8 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{collab.owner.name}</h4>
                        <p className="text-[10px] text-slate-400">{collab.owner.headline}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">{collab.rewardType}</span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">{collab.rewardValue}</span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-slate-800 mt-1.5">{collab.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{collab.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {collab.disciplineRequired.map(d => (
                        <span key={d} className="rounded-md bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600">{d}</span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users size={12} /> {collab.applicationsCount} applicants
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setLocalSelectedCollab(collab)}
                        className="rounded-lg border border-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                        id={`saved-collab-details-${collab.id}`}
                      >
                        Read Specs
                      </button>

                      {collab.owner.id !== userProfile.id && onStartCollabChat && (
                        <button
                          onClick={() => onStartCollabChat(collab.owner.id, collab.owner.name)}
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                        >
                          Pitch & Discuss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Local Selected Collab Specs Slide-Over/Modal */}
        <AnimatePresence>
          {localSelectedCollab && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLocalSelectedCollab(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl overflow-hidden"
              >
                <div className="flex justify-between items-start gap-4 border-b border-slate-50 pb-3 mb-4">
                  <div>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                      {localSelectedCollab.rewardType}
                    </span>
                    <h2 className="font-display text-base font-bold text-slate-900 mt-2 leading-tight">
                      {localSelectedCollab.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setLocalSelectedCollab(null)}
                    className="rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 p-1 px-2.5 transition-all text-xs font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-600">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Abstract</h4>
                    <p className="mt-1.5 leading-relaxed whitespace-pre-line">{localSelectedCollab.description}</p>
                  </div>

                  {localSelectedCollab.details && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Specs</h4>
                      <p className="mt-1.5 leading-relaxed whitespace-pre-line">{localSelectedCollab.details}</p>
                    </div>
                  )}

                  <div className="rounded-lg bg-slate-50 p-3 flex justify-between font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Reward:</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{localSelectedCollab.rewardValue}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Applicants:</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{localSelectedCollab.applicationsCount} creatives</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-50 mt-5">
                  <button
                    onClick={() => {
                      onToggleBookmarkCollab(localSelectedCollab.id);
                      setLocalSelectedCollab(null);
                    }}
                    className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-rose-600 border-rose-100 hover:bg-rose-50/50 cursor-pointer"
                  >
                    Unsave Opportunity
                  </button>

                  {localSelectedCollab.owner.id !== userProfile.id && onStartCollabChat && (
                    <button
                      onClick={() => {
                        onStartCollabChat(localSelectedCollab.owner.id, localSelectedCollab.owner.name);
                        setLocalSelectedCollab(null);
                      }}
                      className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Pitch & Discuss
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      
      {/* Sub-Tabs Selector */}
      <div className="mb-6 flex border-b border-slate-200">
        <button
          onClick={() => handleSubTabChange("details")}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "details"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="profile-tab-details"
        >
          <Palette size={14} />
          <span>My Profile</span>
        </button>
        <button
          onClick={() => handleSubTabChange("saved")}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-all flex items-center gap-1.5 cursor-pointer relative ${
            activeSubTab === "saved"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="profile-tab-saved"
        >
          <Bookmark size={14} />
          <span>Saved Items</span>
          {((bookmarkedPostIds?.length || 0) + (bookmarkedCollabIds?.length || 0)) > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono text-[9px] font-bold">
              {(bookmarkedPostIds?.length || 0) + (bookmarkedCollabIds?.length || 0)}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === "details" ? (
        <div className="space-y-6">
          
          {/* Profile Card Header - Mirroring the User screenshot exactly */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
          {/* Custom drawing resembling the "YAW AI AUTOMATION" banner in screenshot */}
          <div className="relative h-64 bg-slate-950 flex flex-col justify-center overflow-hidden">
            {/* Grid & Glowing backdrop lines */}
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />
            <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
            
            {/* Real Screenshot Text Content styled elegantly */}
            <div className="relative z-10 px-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="h-6 w-1 bg-indigo-500 rounded-full" />
                  <span className="font-mono text-xs font-bold tracking-widest text-indigo-400 uppercase">Yaw AI Automation</span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-2 leading-none">
                  Helping Businesses <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Automate, Scale</span> & Save Time
                </h1>
                <p className="font-mono text-[10px] tracking-wide text-slate-400 mt-2">WITH CUSTOM GENERATIVE SYSTEMS & WEB GL VIEWPORTS</p>
              </div>

              {/* Minimal geometric graphic representing a high-tech dashboard */}
              <div className="hidden md:flex h-36 w-52 rounded-xl bg-slate-900/40 border border-slate-800 p-4 backdrop-blur-md flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] text-slate-500">DASHBOARD</span>
                  <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[8px] text-indigo-400 border border-indigo-500/20">78% efficiency</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-indigo-500 rounded-full" />
                  </div>
                  <div className="h-1 w-3/4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-violet-400 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                  <span>SYSTEM TRIGGER</span>
                  <span className="text-emerald-400">● LIVE</span>
                </div>
              </div>
            </div>

            {/* Quick action button to edit header */}
            <button 
              onClick={() => setIsEditing(true)} 
              className="absolute right-4 bottom-4 rounded-full bg-black/60 hover:bg-black/80 text-white p-2.5 transition-all cursor-pointer shadow-md"
              title="Edit Profile Info"
            >
              <Edit size={16} />
            </button>
          </div>

          {/* Profile particulars segment */}
          <div className="relative px-6 pb-6 md:px-8">
            {/* Avatar overlapping */}
            <div className="relative -mt-16 inline-block group/avatar">
              <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-lg relative">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-display text-3xl font-black select-none">
                    {userProfile.name ? userProfile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                  </div>
                )}
                
                {/* Dual action overlay on hover */}
                <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                  <button
                    onClick={() => document.getElementById("direct-avatar-upload")?.click()}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white p-1 px-2.5 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Upload Profile Picture"
                    id="direct-avatar-upload-btn"
                  >
                    <Upload size={10} />
                    <span>Upload</span>
                  </button>
                  {userProfile.avatar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserProfile({
                          ...userProfile,
                          avatar: ""
                        });
                      }}
                      className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white p-1 px-2.5 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Delete Profile Picture"
                      id="delete-avatar-btn"
                    >
                      <Trash2 size={10} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hidden Direct File Input */}
              <input 
                type="file" 
                id="direct-avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAvatarFileChange(e.target.files[0]);
                  }
                }}
              />

              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute bottom-1 right-1 rounded-full bg-white p-2 text-slate-600 hover:text-indigo-600 hover:scale-105 active:scale-95 shadow-md cursor-pointer transition-all flex items-center justify-center border border-slate-100"
                title="Update or Delete Profile Photo"
                id="profile-avatar-camera-btn"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* General Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900">{userProfile.name}</h2>
                  <span className="rounded-full bg-indigo-50 p-1 text-indigo-600" title="Verified Creator">
                    <Check size={14} strokeWidth={3} />
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 font-sans">{userProfile.headline}</p>
                
                <div className="mt-3 flex flex-wrap gap-4 items-center text-xs text-slate-500 font-sans">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {userProfile.location}
                  </span>
                  {userProfile.website && (
                    <a href={userProfile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                      <Globe size={13} />
                      Artistic Portfolio
                    </a>
                  )}
                  <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                    {userProfile.connectionsCount} connections
                  </span>
                </div>

                {/* Open to Work segment card from screenshot */}
                {userProfile.openToWork && (
                  <div className="mt-5 max-w-md rounded-xl bg-indigo-50/40 p-3.5 border border-indigo-50 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-indigo-800 block">Open to Collaborate</span>
                      <span className="text-slate-500 mt-0.5 block">Detroit Metropolitan Area • Remote • Interactive Web & Shaders</span>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="text-xs font-semibold text-indigo-600 hover:underline">
                      Edit details
                    </button>
                  </div>
                )}
              </div>

              {/* Side card containing current affiliations */}
              <div className="md:col-span-1 flex flex-col justify-start gap-4">
                <div className="rounded-xl border border-slate-50 p-4 bg-slate-50/30">
                  <div className="flex gap-3 items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                      <Palette size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Freelance Specialization</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Custom generative art systems</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-50 p-4 bg-slate-50/30">
                  <div className="flex gap-3 items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Presbyterian University</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Computer Science & Visual Media</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* About segment */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
          <h3 className="font-display text-base font-bold text-slate-800">About Scribe</h3>
          <p className="mt-4 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
            {userProfile.bio}
          </p>
        </div>

        {/* Featured Projects Showcase grid */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Award size={18} className="text-indigo-600" />
                Featured Artworks & Systems
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Bento-mesh of your proudest creative productions</p>
            </div>

            <button
              onClick={() => setIsAddingProject(true)}
              className="flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              id="add-featured-proj-btn"
            >
              <PlusCircle size={14} />
              <span>Add Artwork</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {userProfile.featuredProjects.map((proj) => (
                <motion.div
                  key={proj.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs"
                >
                  <div className="aspect-video overflow-hidden bg-slate-50 relative">
                    {proj.videoUrl ? (
                      <>
                        <video 
                          src={proj.videoUrl} 
                          poster={proj.imageUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102" 
                        />
                        <div className="absolute top-2.5 left-2.5 z-10 rounded-md bg-slate-950/75 backdrop-blur-xs px-2 py-0.5 text-[8px] font-mono font-extrabold tracking-wider text-emerald-400 flex items-center gap-1 border border-emerald-500/20">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          MOTION PREVIEW
                        </div>
                      </>
                    ) : (
                      <img src={proj.imageUrl} alt={proj.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                      {proj.category}
                    </span>
                    <h4 className="font-display text-xs font-bold text-slate-800 mt-2">{proj.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{proj.description}</p>
                    
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                      title="Delete artwork"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {userProfile.featuredProjects.length === 0 && (
                <div className="col-span-full text-center py-8 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100">
                  <Palette className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-xs text-slate-400">No active featured artwork listings. Add one above!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Profile Analytics & Growth */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-4 mb-6 gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp size={18} className="text-indigo-600" />
                Profile Analytics & Growth
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Analysis of traffic, engagement rate, and peer endorsements over the last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp size={10} />
                +14.2% Growth
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                Last 30 Days
              </span>
            </div>
          </div>

          {/* Metrics Overview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-slate-50 bg-slate-50/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Views</span>
                <span className="rounded-md bg-indigo-50 p-1.5 text-indigo-600">
                  <Eye size={12} />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 font-sans mt-2">
                324
              </p>
              <span className="text-[9px] text-emerald-600 font-bold mt-1 block">
                ↑ 46 new views this week
              </span>
            </div>

            <div className="rounded-xl border border-slate-50 bg-slate-50/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Endorsements</span>
                <span className="rounded-md bg-emerald-50 p-1.5 text-emerald-600">
                  <ThumbsUp size={12} />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 font-sans mt-2">
                {userProfile.skills.reduce((sum, s) => sum + (userProfile.endorsements?.[s]?.length || 0), 0)}
              </p>
              <span className="text-[9px] text-slate-500 font-medium mt-1 block">
                Across {userProfile.skills.length} verified technical disciplines
              </span>
            </div>

            <div className="rounded-xl border border-slate-50 bg-slate-50/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Endorsement Rate</span>
                <span className="rounded-md bg-amber-50 p-1.5 text-amber-600">
                  <CheckCircle size={12} />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 font-sans mt-2">
                {(() => {
                  const endorsements = userProfile.skills.reduce((sum, s) => sum + (userProfile.endorsements?.[s]?.length || 0), 0);
                  return endorsements > 0 ? ((endorsements / 324) * 100).toFixed(1) : "0.0";
                })()}%
              </p>
              <span className="text-[9px] text-indigo-600 font-bold mt-1 block">
                High profile-to-credibility conversion
              </span>
            </div>
          </div>

          {/* Area Chart visualization */}
          <div className="w-full h-64 relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="endorseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#viewsGrad)" 
                  name="Views" 
                />
                <Area 
                  type="monotone" 
                  dataKey="endorsements" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#endorseGrad)" 
                  name="Endorsements" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 justify-center text-[10px] font-bold text-slate-500 font-sans border-t border-slate-50 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Daily Profile Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Cumulative Skill Endorsements
            </span>
          </div>
        </div>

        {/* Skills & tech stack list */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle size={18} className="text-indigo-600" />
                Verified Skill Endorsements
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Click any skill block below to manage mock endorsers and test professional credibility</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-mono font-bold text-indigo-700">
              {userProfile.skills.reduce((sum, s) => sum + (userProfile.endorsements?.[s]?.length || 0), 0)} Total Endorsements
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userProfile.skills.map((skill) => {
              const endorserIds = userProfile.endorsements?.[skill] || [];
              const skillEndorsers = endorserIds.map(id => 
                MOCK_COMMUNITY_USERS.find(mu => mu.id === id)
              ).filter(Boolean) as typeof MOCK_COMMUNITY_USERS;

              return (
                <div 
                  key={skill}
                  onClick={() => setSelectedSkillForEndorsement(skill)}
                  className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-md flex flex-col justify-between"
                  id={`my-skill-${skill.replace(/\s+/g, '-').toLowerCase()}`}
                  title={`Manage endorsers for ${skill}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {skill}
                    </span>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-extrabold text-indigo-700 shrink-0">
                      {endorserIds.length}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-50">
                    {/* Endorsers avatars overlapping list */}
                    {skillEndorsers.length > 0 ? (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {skillEndorsers.map((endorser) => (
                          <img
                            key={endorser.id}
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                            src={endorser.avatar}
                            alt={endorser.name}
                            title={endorser.name}
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No endorsers yet</span>
                    )}

                    <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs animate-fade-in" id="notification-settings-section">
          <div className="border-b border-slate-50 pb-4 mb-6">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Mail size={18} className="text-indigo-600" />
              Notification & Email Settings
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Manage how and when you receive email communications from ArtCollab concerning new opportunities, applications, and network activity.
            </p>
          </div>

          <div className="space-y-4">
            {/* Option 1: New Collaboration Applications */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!!(userProfile.emailSettings?.newApplications ?? true)}
                onChange={() => handleToggleEmailSetting("newApplications")}
                className="mt-1 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                id="checkbox-email-applications"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Email Notifications for Collaboration Applications
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                  Receive an immediate email notification when a creative developer or digital artist applies to join your published collaboration projects.
                </span>
              </div>
            </label>

            {/* Option 2: Skill Endorsements */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!!(userProfile.emailSettings?.newEndorsements ?? true)}
                onChange={() => handleToggleEmailSetting("newEndorsements")}
                className="mt-1 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                id="checkbox-email-endorsements"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Email Notifications for Skill Endorsements
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                  Get notified when peers endorse your technical skill disciplines on your profile.
                </span>
              </div>
            </label>

            {/* Option 3: Direct Messages */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!!(userProfile.emailSettings?.newMessages ?? false)}
                onChange={() => handleToggleEmailSetting("newMessages")}
                className="mt-1 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                id="checkbox-email-messages"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Email Notifications for Direct Messages (Greenroom Chat)
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                  Notify me via email when a connection starts a discussion or sends a message to me in the Greenroom.
                </span>
              </div>
            </label>

            {/* Option 4: Weekly Digest */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!!(userProfile.emailSettings?.weeklyDigest ?? true)}
                onChange={() => handleToggleEmailSetting("weeklyDigest")}
                className="mt-1 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                id="checkbox-email-digest"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Platform Weekly Digest
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block leading-relaxed">
                  A comprehensive weekly newsletter containing trending creative portfolios, network growth tips, and recommended project team recruitments.
                </span>
              </div>
            </label>
          </div>
        </div>

      </div>
      ) : (
        renderSavedItemsView()
      )}

      {/* Edit Profile Info Drawer / Overlay */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
              id="edit-profile-modal"
            >
              <h2 className="font-display text-lg font-bold text-slate-900 mb-5">
                Edit Professional Credentials
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Professional Headline</label>
                  <input
                    type="text"
                    required
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Biographical Background</label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Skills Arsenal (comma-separated)</label>
                  <input
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="editOpenWork"
                    checked={editOpenToWork}
                    onChange={(e) => setEditOpenToWork(e.target.checked)}
                    className="rounded-sm text-indigo-600"
                  />
                  <label htmlFor="editOpenWork" className="text-xs font-semibold text-slate-600 cursor-pointer">
                    Enable 'Open to Collaborate' badge status
                  </label>
                </div>

                <div className="flex gap-2 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    Save Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Artwork / Featured Project Modal */}
      <AnimatePresence>
        {isAddingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddingProject(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
              id="add-artwork-modal"
            >
              <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                Showcase Featured Artwork
              </h2>

              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Artwork Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lumina Procedural WebGL Engine"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Discipline Category</label>
                  <select
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  >
                    <option value="Creative Coding">Creative Coding</option>
                    <option value="3D Art">3D Art & Sculpting</option>
                    <option value="Sound Design">Sound Design & Music</option>
                    <option value="Illustration">Illustration & Concept Art</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Concept Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of your creative technique, software stack, or artistic theme..."
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Video Clip URL (optional, for motion & animation)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://example.com/loop.mp4"
                    value={projVideoUrl}
                    onChange={(e) => setProjVideoUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-800 outline-hidden focus:border-indigo-400 focus:bg-white"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] font-bold text-slate-400 font-mono">MOTION PRESETS:</span>
                    <button
                      type="button"
                      onClick={() => setProjVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-abstract-digital-technology-circuit-loop-43188-large.mp4")}
                      className="rounded-md bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-600 transition-colors cursor-pointer"
                    >
                      Circuit
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-blue-ink-swirling-in-water-43339-large.mp4")}
                      className="rounded-md bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-600 transition-colors cursor-pointer"
                    >
                      Fluid
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-neon-city-scenery-at-night-42289-large.mp4")}
                      className="rounded-md bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-600 transition-colors cursor-pointer"
                    >
                      Cyberpunk
                    </button>
                  </div>
                </div>

                {/* Upload or Choose Canvas Style Section */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Upload Artwork Canvas
                  </label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-xl border-2 border-dashed p-5 text-center transition-all ${
                      isDragging 
                        ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]" 
                        : projImage 
                          ? "border-emerald-200 bg-emerald-50/10" 
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {projImage ? (
                      <div className="space-y-3">
                        <div className="relative mx-auto h-28 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
                          <img src={projImage} alt="Artwork Preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setProjImage("");
                              setUploadStatus("idle");
                              setUploadProgress(0);
                            }}
                            className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-[9px] font-bold text-white hover:bg-slate-900 transition-colors cursor-pointer shadow-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-[10px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle size={12} /> Canvas Loaded Successfully
                        </p>
                      </div>
                    ) : (
                      <div>
                        {uploadStatus === "uploading" ? (
                          <div className="py-4 space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-mono text-indigo-600 font-bold px-1">
                              <span>PROCESSING ARTWORK ASSETS...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-indigo-600 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                            <p className="text-[9px] text-slate-400">Rendering high-resolution compression buffers...</p>
                          </div>
                        ) : (
                          <div className="cursor-pointer" onClick={() => document.getElementById("portfolio-file-picker")?.click()}>
                            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <PlusCircle size={18} />
                            </div>
                            <p className="text-xs font-bold text-slate-800">
                              Drag & Drop Artwork or <span className="text-indigo-600 underline">Browse</span>
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              Supports PNG, JPG, WebP (Max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <input
                      type="file"
                      id="portfolio-file-picker"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Curated Presets Option */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Or select from pre-rendered creative presets:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {visualOptions.map((optUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setProjImage(optUrl);
                            setUploadStatus("success");
                            setUploadProgress(100);
                          }}
                          className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            projImage === optUrl ? "border-indigo-600 scale-95" : "border-transparent hover:opacity-80"
                          }`}
                        >
                          <img src={optUrl} alt="Visual choice" className="h-full w-full object-cover" />
                          {projImage === optUrl && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center text-white">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="rounded-xl border border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    Showcase Artwork
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Avatar Editor Modal (Upload + Delete + Camera + Presets) */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAvatarModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
              id="avatar-manager-modal"
            >
              <div className="text-center mb-5">
                <h3 className="font-display text-base font-bold text-slate-900 mb-1">
                  Update Profile Avatar
                </h3>
                <p className="text-[10px] text-slate-400">
                  Select a new photo file, capture a fresh portrait with your camera, or clear the current image.
                </p>
              </div>

              {/* Current Preview vs Upload / Action Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-white shadow-md shrink-0">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Current Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-display text-xl font-black select-none">
                        {userProfile.name ? userProfile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-slate-700">Currently Active Avatar</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {userProfile.avatar ? "Custom high-fidelity photo asset loaded" : "Default letter initials placeholder active"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 font-sans">
                  {/* File Upload Trigger */}
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-white rounded-xl p-5 cursor-pointer transition-all group/upload">
                    <Upload size={20} className="text-slate-400 group-hover/upload:text-indigo-600 transition-colors mb-1.5 animate-bounce" />
                    <span className="text-xs font-bold text-slate-800">Upload Photo File</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, WebP (Max 5MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAvatarFileChange(e.target.files[0]);
                          setIsAvatarModalOpen(false);
                        }
                      }}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Camera snapshot */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAvatarModalOpen(false);
                        setIsCameraActive(true);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 py-3 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Camera size={14} className="text-indigo-600" />
                      <span>Take Photo</span>
                    </button>

                    {/* Delete action */}
                    <button
                      type="button"
                      disabled={!userProfile.avatar}
                      onClick={() => {
                        setUserProfile({
                          ...userProfile,
                          avatar: ""
                        });
                        setIsAvatarModalOpen(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-bold transition-all cursor-pointer ${
                        userProfile.avatar 
                          ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100" 
                          : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                      }`}
                    >
                      <Trash2 size={14} />
                      <span>Delete Photo</span>
                    </button>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2 text-left">
                    Or select a pre-rendered portrait persona:
                  </span>
                  <div className="flex gap-2 justify-center">
                    {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                    ].map((avatarUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setUserProfile({
                            ...userProfile,
                            avatar: avatarUrl
                          });
                          setIsAvatarModalOpen(false);
                        }}
                        className={`relative h-11 w-11 rounded-xl overflow-hidden border-2 transition-all ${
                          userProfile.avatar === avatarUrl ? "border-indigo-600 scale-95" : "border-slate-100 hover:scale-105 hover:border-slate-300"
                        }`}
                      >
                        <img src={avatarUrl} alt="Portrait choice" className="h-full w-full object-cover" />
                        {userProfile.avatar === avatarUrl && (
                          <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center text-indigo-600">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="rounded-xl border border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Device Camera Overlay */}
      <AnimatePresence>
        {isCameraActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCameraActive(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
              id="camera-capture-modal"
            >
              <div className="text-center">
                <h3 className="font-display text-base font-bold text-white mb-1">
                  Capture Portrait Mode
                </h3>
                <p className="text-[10px] text-slate-400 mb-5">
                  Smile and take a high-fidelity snapshot to update your professional profile avatar.
                </p>
              </div>

              {/* Viewport frame mimicking the circular/rounded-2xl avatar */}
              <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-2xl border-4 border-slate-700 bg-slate-950 shadow-inner flex items-center justify-center">
                {cameraError ? (
                  <div className="p-4 text-center">
                    <span className="text-rose-400 text-xs font-semibold block mb-2">Camera Blocked</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                      {cameraError}
                    </p>
                    <button
                      onClick={() => {
                        // Toggle trigger to re-invoke permission
                        setIsCameraActive(false);
                        setTimeout(() => setIsCameraActive(true), 200);
                      }}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-slate-700"
                    >
                      Retry Permission
                    </button>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover scale-x-[-1]"
                  />
                )}
                
                {/* Mirror overlay indicator */}
                {!cameraError && (
                  <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[8px] text-slate-300">
                    MIRROR PREVIEW
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCameraActive(false)}
                  className="rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                {!cameraError && (
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-950/20 transition-all cursor-pointer"
                    id="capture-photo-submit"
                  >
                    <Camera size={14} />
                    <span>Capture Photo</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Endorsements Management Sandbox Modal */}
      <AnimatePresence>
        {selectedSkillForEndorsement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSkillForEndorsement(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
              id="manage-endorsements-modal"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Credibility Sandbox</span>
                  <h3 className="font-display text-base font-bold text-slate-900 mt-1">
                    Manage Endorsements
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{selectedSkillForEndorsement}</p>
                </div>
                <button
                  onClick={() => setSelectedSkillForEndorsement(null)}
                  className="rounded-full bg-slate-100 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Toggle which community members have endorsed you for this skill. This simulates peer reviews and instantly updates your public-facing credibility metrics.
              </p>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 font-sans">
                {MOCK_COMMUNITY_USERS.map((user) => {
                  const endorsers = userProfile.endorsements?.[selectedSkillForEndorsement] || [];
                  const isEndorsed = endorsers.includes(user.id);

                  return (
                    <div 
                      key={user.id}
                      onClick={() => handleToggleMockEndorsement(selectedSkillForEndorsement, user.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isEndorsed 
                          ? "border-indigo-100 bg-indigo-50/20" 
                          : "border-slate-100 bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex gap-3 items-center">
                        <img src={user.avatar} alt={user.name} className="h-8.5 w-8.5 rounded-lg object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{user.name}</h4>
                          <p className="text-[10px] text-slate-500">{user.discipline}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMockEndorsement(selectedSkillForEndorsement, user.id);
                        }}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                          isEndorsed
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isEndorsed ? "Endorsed ✓" : "Endorse"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSkillForEndorsement(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
