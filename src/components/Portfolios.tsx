/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreativeProfile } from "../types";
import { ARTISTIC_DISCIPLINES } from "../data/initialData";
import { Search, MapPin, ExternalLink, MessageSquare, Sparkles, Filter, Users, Palette, Layers, Grid, List, Check, ThumbsUp, Heart, Play, Pause, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PortfoliosProps {
  profiles: CreativeProfile[];
  setProfiles?: React.Dispatch<React.SetStateAction<CreativeProfile[]>>;
  searchQuery: string;
  onStartCollabChat: (authorId: string, authorName: string) => void;
  userProfile: CreativeProfile;
}

export default function Portfolios({
  profiles,
  setProfiles,
  searchQuery,
  onStartCollabChat,
  userProfile
}: PortfoliosProps) {
  const [activeDiscipline, setActiveDiscipline] = useState("All Disciplines");
  const [selectedCreative, setSelectedCreative] = useState<CreativeProfile | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Active Project for Carousel/Slideshow view
  const [activeProject, setActiveProject] = useState<{
    title: string;
    desc: string;
    url: string;
    images: string[];
    creativeId: string;
    creativeName: string;
  } | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);

  // Autoplay cycle effect
  React.useEffect(() => {
    let interval: any;
    if (isAutoplayActive && activeProject) {
      interval = setInterval(() => {
        setActiveSlideIdx(prev => (prev + 1) % activeProject.images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoplayActive, activeProject]);

  // Track likes count and if liked by current user in state or local storage
  const [portfolioLikes, setPortfolioLikes] = useState<{
    [key: string]: { count: number; likedByMe: boolean };
  }>(() => {
    const saved = localStorage.getItem("artcollab_portfolio_likes");
    if (saved) return JSON.parse(saved);

    // Initial realistic mock likes
    return {
      "creative-anya-The Cyber Sentry": { count: 18, likedByMe: false },
      "creative-anya-Gothic Gargoyle Reimagined": { count: 12, likedByMe: false },
      "creative-anya-Nomadic Arch-Mesh": { count: 9, likedByMe: false },
      "creative-anya-Mechanized Core": { count: 14, likedByMe: false },
      "creative-marcus-Atmospheric Pulse": { count: 32, likedByMe: false },
      "creative-marcus-Max/MSP Live Glitch": { count: 21, likedByMe: false },
      "creative-marcus-Indie Game Scoring": { count: 15, likedByMe: false },
      "creative-hana-Celestial Scribe": { count: 24, likedByMe: false },
      "creative-hana-Lumina Character Board": { count: 17, likedByMe: false },
      "creative-hana-Forest Guardian": { count: 28, likedByMe: false },
      "creative-hana-The Nebulous Scribe": { count: 11, likedByMe: false },
      "creative-devon-Fluid Menu WebGL": { count: 45, likedByMe: false },
      "creative-devon-Spatial Web Interface": { count: 39, likedByMe: false },
      "creative-devon-Particle Vortex Canvas": { count: 26, likedByMe: false },
    };
  });

  // Track floating heart particles for the burst feedback
  const [heartParticles, setHeartParticles] = useState<{ id: number; x: number; y: number; angle: number; scale: number }[]>([]);

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem("artcollab_portfolio_likes", JSON.stringify(portfolioLikes));
  }, [portfolioLikes]);

  const triggerHeartBurst = (clientX: number, clientY: number) => {
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: clientX,
      y: clientY,
      angle: (i * 45) + (Math.random() * 20 - 10), // scatter in 360 degrees
      scale: Math.random() * 0.4 + 0.8
    }));
    setHeartParticles(prev => [...prev, ...newParticles]);
  };

  // Clean up particles
  React.useEffect(() => {
    if (heartParticles.length > 0) {
      const timer = setTimeout(() => {
        setHeartParticles(prev => prev.filter(p => Date.now() - p.id < 1000));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [heartParticles]);

  const handleToggleLike = (e: React.MouseEvent, creativeId: string, itemTitle: string) => {
    e.stopPropagation(); // prevent opening/closing modals or other clicks
    const key = `${creativeId}-${itemTitle}`;
    setPortfolioLikes(prev => {
      const current = prev[key] || { count: Math.floor(Math.random() * 20) + 5, likedByMe: false };
      const likedByMe = !current.likedByMe;
      const count = likedByMe ? current.count + 1 : Math.max(0, current.count - 1);
      return {
        ...prev,
        [key]: { count, likedByMe }
      };
    });

    triggerHeartBurst(e.clientX, e.clientY);
  };

  const getEndorsersForSkill = (creative: CreativeProfile, skill: string) => {
    const endorserIds = creative.endorsements?.[skill] || [];
    return endorserIds.map(id => {
      const p = profiles.find(profile => profile.id === id);
      return p ? { id: p.id, name: p.name, avatar: p.avatar } : { id, name: "Community Member", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50&q=80" };
    });
  };

  const handleToggleEndorsement = (creativeId: string, skill: string) => {
    if (!setProfiles) return;
    
    setProfiles((prevProfiles) => {
      return prevProfiles.map((p) => {
        if (p.id !== creativeId) return p;
        
        const currentEndorsements = p.endorsements || {};
        const skillEndorsers = currentEndorsements[skill] || [];
        const isAlreadyEndorsed = skillEndorsers.includes(userProfile.id);
        
        let newEndorsers: string[];
        if (isAlreadyEndorsed) {
          newEndorsers = skillEndorsers.filter((id) => id !== userProfile.id);
        } else {
          newEndorsers = [...skillEndorsers, userProfile.id];
        }
        
        const updatedProfile = {
          ...p,
          endorsements: {
            ...currentEndorsements,
            [skill]: newEndorsers,
          }
        };
        
        // Instantly update selectedCreative details in modal view
        if (selectedCreative && selectedCreative.id === creativeId) {
          setSelectedCreative(updatedProfile);
        }
        
        return updatedProfile;
      });
    });
  };

  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Expanded portfolio items matching artists' real skills
  const getPortfolioItems = (creativeId: string) => {
    switch (creativeId) {
      case "creative-anya":
        return [
          { 
            title: "The Cyber Sentry", 
            desc: "Digital sculpture in Unreal Engine 5 with procedural neon texturing", 
            url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Gothic Gargoyle Reimagined", 
            desc: "ZBrush high fidelity displacement bake with dynamic ambient occlusion mapping", 
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Nomadic Arch-Mesh", 
            desc: "Low-poly sci-fi landscape module for real-time mobile graphics rendering", 
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Mechanized Core", 
            desc: "Concept mechanical joint test rig featuring automated vertex shader bone weighting", 
            url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
            ]
          }
        ];
      case "creative-marcus":
        return [
          { 
            title: "Atmospheric Pulse", 
            desc: "Modular synthesizer ambient waveforms with polyphonic frequency modulation", 
            url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Max/MSP Live Glitch", 
            desc: "Procedural sound design algorithm visual with real-time Fourier transformations", 
            url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Indie Game Scoring", 
            desc: "Cinematic orchestration track sheet and wave simulation for interactive RPG zones", 
            url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
            ]
          }
        ];
      case "creative-hana":
        return [
          { 
            title: "Celestial Scribe", 
            desc: "Traditional ink with watercolor washes mapping fictional cosmological structures", 
            url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Lumina Character Board", 
            desc: "Initial storyboards for immersive fantasy VR featuring deep ray-traced shadows", 
            url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Forest Guardian", 
            desc: "Procreate concept visual with lighting studies and volumetric atmospheric mist", 
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "The Nebulous Scribe", 
            desc: "Digital print graphic asset utilizing high-frequency vectors and textures", 
            url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80"
            ]
          }
        ];
      case "creative-devon":
        return [
          { 
            title: "Fluid Menu WebGL", 
            desc: "Dynamic interaction test bed, GPU-bound fragment shaders and particle physics", 
            url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Spatial Web Interface", 
            desc: "3D portfolio engine built in React & ThreeJS with orbit camera controls", 
            url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Particle Vortex Canvas", 
            desc: "Interactive GLSL mouse-bound simulation utilizing noise and velocity fields", 
            url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80"
            ]
          }
        ];
      default:
        // User profile / Fallback creative coding portfolio
        return [
          { 
            title: "YAW Automation Hub", 
            desc: "Sleek react dashboard featuring automated API flows and responsive graphs", 
            url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Shader-Bound Audio Waves", 
            desc: "Generative particle simulator on visual audio trigger using modern Web Audio APIs", 
            url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80"
            ]
          },
          { 
            title: "Indie WebVR reader", 
            desc: "3D scene porting for comic book visuals using customized WebGL depth shaders", 
            url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
            images: [
              "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80"
            ]
          }
        ];
    }
  };

  // Filter and search creatives profiles
  const filteredProfiles = profiles.filter(profile => {
    // 1. Category filter ('Music', 'Design', 'Development')
    let matchesCategory = true;
    if (categoryFilter === "Music") {
      matchesCategory = profile.discipline === "Sound Design & Music";
    } else if (categoryFilter === "Design") {
      matchesCategory = 
        profile.discipline === "3D Art & Animation" || 
        profile.discipline === "Illustration & Concept Art";
    } else if (categoryFilter === "Development") {
      matchesCategory = 
        profile.discipline === "Creative Coding & UI/UX" || 
        profile.discipline === "Creative Coding & AI Automation" ||
        profile.discipline.toLowerCase().includes("coding") ||
        profile.discipline.toLowerCase().includes("automation");
    }

    // 2. Discipline filter (from detailed sub-disciplines rail)
    const matchesDiscipline = activeDiscipline === "All Disciplines" || profile.discipline === activeDiscipline;

    // 3. Search query
    const searchVal = localSearch.toLowerCase();
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchVal) ||
      profile.headline.toLowerCase().includes(searchVal) ||
      profile.skills.some(skill => skill.toLowerCase().includes(searchVal)) ||
      profile.discipline.toLowerCase().includes(searchVal);

    return matchesCategory && matchesDiscipline && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Title & Filter bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Explore Creative Portfolios
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse high-fidelity works, interactive canvases, and connect directly for collaborative projects.
          </p>
        </div>

        {/* View Mode & filter layout controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2 transition-colors ${
              viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-2 transition-colors ${
              viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Portfolios Search and Category Filter Card */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search creatives, skills, or locations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pr-4 pl-11 text-xs font-sans text-slate-800 placeholder-slate-400 outline-hidden transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              id="portfolios-local-search"
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
                    // Clear sub-disciplines to avoid weird overlaps
                    setActiveDiscipline("All Disciplines");
                  }}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-xs" 
                      : `${cat.color}`
                  }`}
                  id={`cat-filter-portfolios-${cat.id}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Filter Rail */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        {ARTISTIC_DISCIPLINES.map((discipline) => (
          <button
            key={discipline}
            onClick={() => setActiveDiscipline(discipline)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              activeDiscipline === discipline
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Palette size={13} />
            <span>{discipline}</span>
          </button>
        ))}
      </div>

      {/* Grid or List Layout for Creative Portfolios */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" 
        : "space-y-4"
      }>
        <AnimatePresence>
          {filteredProfiles.map((creative) => {
            const portfolio = getPortfolioItems(creative.id);
            return (
              <motion.div
                key={creative.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => setSelectedCreative(creative)}
                className={`group cursor-pointer rounded-2xl border border-slate-100 bg-white transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg ${
                  viewMode === "list" ? "flex flex-col md:flex-row gap-5 p-5" : "overflow-hidden p-5"
                }`}
                id={`creative-card-${creative.id}`}
              >
                
                {/* Profile header part */}
                <div className={viewMode === "list" ? "flex-1 md:max-w-xs" : ""}>
                  <div className="flex gap-3 items-start">
                    <img 
                      src={creative.avatar} 
                      alt={creative.name} 
                      className="h-12 w-12 rounded-xl object-cover border border-slate-50" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {creative.name}
                      </h3>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5 leading-tight">{creative.discipline}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin size={10} />
                        {creative.location}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {creative.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {creative.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-md bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                        {skill}
                      </span>
                    ))}
                    {creative.skills.length > 3 && (
                      <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-400">
                        +{creative.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vertical Divider for List view */}
                {viewMode === "list" && (
                  <div className="hidden md:block w-px bg-slate-100" />
                )}

                {/* Portfolio Visual Thumbnails Part */}
                <div className={viewMode === "list" ? "flex-2" : "mt-5"}>
                  <div className="grid grid-cols-3 gap-2">
                    {portfolio.slice(0, 3).map((item, idx) => {
                      const likeKey = `${creative.id}-${item.title}`;
                      const likeInfo = portfolioLikes[likeKey] || { count: Math.floor(Math.random() * 15) + 3, likedByMe: false };
                      return (
                        <div 
                          key={idx} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProject({
                              title: item.title,
                              desc: item.desc,
                              url: item.url,
                              images: item.images || [item.url],
                              creativeId: creative.id,
                              creativeName: creative.name
                            });
                            setActiveSlideIdx(0);
                            setIsAutoplayActive(false);
                          }}
                          className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 hover:scale-[1.03] active:scale-95 cursor-zoom-in transition-all group/item"
                        >
                          <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                            
                            {/* Tiny hover Like Button */}
                            <div className="flex justify-end">
                              <button
                                onClick={(e) => handleToggleLike(e, creative.id, item.title)}
                                className={`rounded-full p-1 transition-all cursor-pointer shadow-xs ${
                                  likeInfo.likedByMe
                                    ? "bg-rose-500 text-white"
                                    : "bg-white/90 hover:bg-white text-rose-500 backdrop-blur-xs scale-90 hover:scale-100"
                                }`}
                                title={likeInfo.likedByMe ? "Liked!" : "Like Project"}
                              >
                                <Heart size={9} fill={likeInfo.likedByMe ? "currentColor" : "none"} />
                              </button>
                            </div>

                            <p className="text-[8px] font-semibold text-white truncate w-full leading-tight">{item.title}</p>
                          </div>

                          {/* Mini Like Badge Overlay */}
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-black/60 px-1 py-0.5 text-[7px] font-bold text-white backdrop-blur-xs opacity-0 group-hover/item:opacity-100 transition-all pointer-events-none">
                            <Heart size={7} fill="currentColor" className="text-rose-400" />
                            <span>{likeInfo.count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Creative connection count */}
                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-sans border-t border-slate-50 pt-3">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {creative.connectionsCount} connections
                    </span>
                    <span className="text-indigo-600 font-bold group-hover:underline flex items-center gap-1">
                      View Aesthetic Bento
                      <ExternalLink size={10} />
                    </span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredProfiles.length === 0 && (
          <div className="col-span-full text-center py-16 rounded-2xl border-2 border-dashed border-slate-100 bg-white">
            <Palette size={48} className="mx-auto text-slate-300 animate-pulse" />
            <h3 className="mt-4 font-display font-bold text-slate-700">No portfolio matches</h3>
            <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or choosing another discipline.</p>
          </div>
        )}
      </div>

      {/* High-Fidelity Aesthetic Showcase Modal */}
      <AnimatePresence>
        {selectedCreative && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCreative(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.97, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden"
              id="portfolio-showcase-modal"
            >
              {/* Header profile banner in modal */}
              <div className="relative h-44 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 flex flex-end">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px]" />
                <button
                  onClick={() => setSelectedCreative(null)}
                  className="absolute top-4 right-4 rounded-full bg-black/40 text-white hover:bg-black/60 p-2 text-xs transition-all"
                >
                  Close
                </button>

                <div className="absolute bottom-4 left-6 flex gap-4 items-end translate-y-12">
                  <img 
                    src={selectedCreative.avatar} 
                    alt={selectedCreative.name} 
                    className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-md" 
                  />
                  <div className="mb-2">
                    <h2 className="font-display text-2xl font-bold text-slate-900 bg-white px-3 py-1 rounded-xl shadow-xs inline-block">
                      {selectedCreative.name}
                    </h2>
                    <p className="text-xs font-semibold text-white drop-shadow-sm mt-1 bg-indigo-600/80 px-2 py-0.5 rounded-lg inline-block">
                      {selectedCreative.discipline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid content inside modal */}
              <div className="pt-16 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Artist Info Sidebar */}
                <div className="space-y-6 md:col-span-1 border-r border-slate-100 pr-0 md:pr-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">About the Artist</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {selectedCreative.bio}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Technical Arsenal & Endorsements</span>
                      <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {selectedCreative.skills.reduce((sum, skill) => sum + (selectedCreative.endorsements?.[skill]?.length || 0), 0)} Total
                      </span>
                    </h4>
                    <div className="mt-3 space-y-2">
                      {selectedCreative.skills.map((skill) => {
                        const endorsers = getEndorsersForSkill(selectedCreative, skill);
                        const hasEndorsed = selectedCreative.endorsements?.[skill]?.includes(userProfile.id) || false;
                        const isOwnProfile = selectedCreative.id === userProfile.id;

                        return (
                          <div 
                            key={skill} 
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 transition-all"
                            id={`skill-item-${skill.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <span className="block text-xs font-bold text-slate-700 truncate">
                                {skill}
                              </span>
                              
                              {/* Endorsers Avatars */}
                              {endorsers.length > 0 ? (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="flex -space-x-1.5 overflow-hidden">
                                    {endorsers.slice(0, 4).map((endorser) => (
                                      <img
                                        key={endorser.id}
                                        className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white object-cover"
                                        src={endorser.avatar}
                                        alt={endorser.name}
                                        title={endorser.name}
                                        referrerPolicy="no-referrer"
                                      />
                                    ))}
                                  </div>
                                  {endorsers.length > 4 && (
                                    <span className="text-[9px] font-bold text-slate-400 font-mono pl-0.5">
                                      +{endorsers.length - 4}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-slate-400 truncate pl-0.5 font-medium" title={endorsers.map(e => e.name).join(", ")}>
                                    by {endorsers.slice(0, 2).map(e => e.name.split(" ")[0]).join(" & ")}
                                    {endorsers.length > 2 && " & others"}
                                  </span>
                                </div>
                              ) : (
                                <span className="block text-[9px] text-slate-400 italic mt-0.5">
                                  No endorsements yet
                                </span>
                              )}
                            </div>

                            {/* Endorse Action Button */}
                            <button
                              onClick={() => {
                                if (!isOwnProfile) {
                                  handleToggleEndorsement(selectedCreative.id, skill);
                                }
                              }}
                              disabled={isOwnProfile}
                              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all shrink-0 ${
                                isOwnProfile
                                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                  : hasEndorsed
                                    ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/20"
                              }`}
                              title={
                                isOwnProfile 
                                  ? "You cannot endorse your own skills" 
                                  : hasEndorsed 
                                    ? "Remove your endorsement" 
                                    : "Endorse this skill"
                              }
                            >
                              {hasEndorsed ? (
                                <Check size={11} strokeWidth={3} className="shrink-0" />
                              ) : (
                                <ThumbsUp size={10} className="shrink-0" />
                              )}
                              <span>{endorsers.length}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedCreative.id !== userProfile.id ? (
                      <button
                        onClick={() => {
                          onStartCollabChat(selectedCreative.id, selectedCreative.name);
                          setSelectedCreative(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
                      >
                        <MessageSquare size={14} />
                        <span>Propose Collab</span>
                      </button>
                    ) : (
                      <span className="text-xs text-center text-slate-400 italic block w-full bg-slate-50 py-2 rounded-xl">
                        This is your public showcase
                      </span>
                    )}
                  </div>
                </div>

                {/* Bento Artwork Grid */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <Layers size={14} className="text-indigo-500" />
                    Portfolio Bento Grid
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {getPortfolioItems(selectedCreative.id).map((item, index) => {
                      // Alternate grid spanning for visual organic rhythm
                      const isLarge = index === 0;
                      const likeKey = `${selectedCreative.id}-${item.title}`;
                      const likeInfo = portfolioLikes[likeKey] || { count: Math.floor(Math.random() * 15) + 3, likedByMe: false };

                      return (
                        <div 
                          key={index} 
                          onClick={() => {
                            setActiveProject({
                              title: item.title,
                              desc: item.desc,
                              url: item.url,
                              images: item.images || [item.url],
                              creativeId: selectedCreative.id,
                              creativeName: selectedCreative.name
                            });
                            setActiveSlideIdx(0);
                            setIsAutoplayActive(false);
                          }}
                          className={`group/bento cursor-zoom-in relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xs transition-transform hover:scale-[1.01] ${
                            isLarge ? "col-span-2 h-48" : "h-36"
                          }`}
                        >
                          <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                          
                          {/* Heart/Like Action Overlay - Glassmorphic Pill */}
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold shadow-md backdrop-blur-xs transition-all hover:bg-white border border-white/50">
                            <button
                              onClick={(e) => handleToggleLike(e, selectedCreative.id, item.title)}
                              className="group/btn relative flex items-center justify-center cursor-pointer p-1 rounded-full hover:bg-rose-50 transition-colors"
                              title={likeInfo.likedByMe ? "Unlike Project" : "Like Project"}
                            >
                              <Heart 
                                size={13} 
                                className={`transition-all duration-300 ${
                                  likeInfo.likedByMe 
                                    ? "text-rose-500 scale-110 fill-rose-500 animate-pulse" 
                                    : "text-slate-400 hover:text-rose-500 hover:scale-115"
                                }`} 
                                fill={likeInfo.likedByMe ? "currentColor" : "none"}
                              />
                            </button>
                            <span className="font-mono text-slate-700 select-none min-w-[12px] text-center pr-1">
                              {likeInfo.count}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end opacity-90 group-hover/bento:opacity-100 transition-opacity">
                            <h5 className="font-display text-xs font-bold text-white">{item.title}</h5>
                            <p className="text-[10px] text-slate-200 mt-1 leading-normal pr-16">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Slideshow / Carousel Modal */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg"
            onClick={() => {
              setActiveProject(null);
              setIsAutoplayActive(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[70vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setActiveProject(null);
                  setIsAutoplayActive(false);
                }}
                className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white/90 backdrop-blur-xs hover:bg-black/70 hover:scale-105 active:scale-95 cursor-pointer transition-all"
                id="close-slideshow"
              >
                <X size={18} />
              </button>

              {/* Left Side: Responsive Image Display & Navigation */}
              <div className="relative flex-1 bg-slate-950 flex items-center justify-center h-[50%] md:h-full overflow-hidden group">
                {/* Main Image with animation on change */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSlideIdx}
                    src={activeProject.images[activeSlideIdx]}
                    alt={`${activeProject.title} slide ${activeSlideIdx + 1}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full object-contain"
                  />
                </AnimatePresence>

                {/* Left Navigation Arrow */}
                {activeProject.images.length > 1 && (
                  <button
                    onClick={() => {
                      setActiveSlideIdx((prev) => (prev - 1 + activeProject.images.length) % activeProject.images.length);
                      setIsAutoplayActive(false); // pause on user manual control
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-xs hover:bg-white/45 hover:scale-110 active:scale-90 cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                    title="Previous Slide"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                )}

                {/* Right Navigation Arrow */}
                {activeProject.images.length > 1 && (
                  <button
                    onClick={() => {
                      setActiveSlideIdx((prev) => (prev + 1) % activeProject.images.length);
                      setIsAutoplayActive(false); // pause on user manual control
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-xs hover:bg-white/45 hover:scale-110 active:scale-90 cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                    title="Next Slide"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>
                )}

                {/* Badge/Counter */}
                <div className="absolute bottom-4 left-4 rounded-md bg-black/60 px-2 py-1 text-[10px] font-mono font-bold text-white tracking-wider backdrop-blur-xs">
                  {activeSlideIdx + 1} / {activeProject.images.length}
                </div>
              </div>

              {/* Right Side: Details & Autoplay / Thumbnails sidebar */}
              <div className="w-full md:w-[320px] bg-white p-6 flex flex-col justify-between h-[50%] md:h-full overflow-y-auto">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold font-mono text-indigo-600 uppercase">
                      Creative Project
                    </span>
                    {isAutoplayActive && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Autoplay On
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-extrabold text-slate-900 leading-tight">
                    {activeProject.title}
                  </h3>
                  
                  <p className="text-[10px] text-slate-400 mt-1">
                    by <span className="font-bold text-slate-600">{activeProject.creativeName}</span>
                  </p>

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-sans">
                    {activeProject.desc}
                  </p>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-4 mt-4">
                  {/* Action row (Likes + Autoplay Play/Pause) */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl">
                    {/* Autoplay toggle */}
                    <button
                      onClick={() => setIsAutoplayActive(!isAutoplayActive)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        isAutoplayActive 
                          ? "bg-slate-900 text-white shadow-xs" 
                          : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                      title={isAutoplayActive ? "Pause slideshow" : "Start slideshow autoplay"}
                    >
                      {isAutoplayActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                      <span>Slideshow</span>
                    </button>

                    {/* Like Action with Heart count */}
                    {(() => {
                      const likeKey = `${activeProject.creativeId}-${activeProject.title}`;
                      const likeInfo = portfolioLikes[likeKey] || { count: Math.floor(Math.random() * 15) + 3, likedByMe: false };
                      return (
                        <button
                          onClick={(e) => handleToggleLike(e, activeProject.creativeId, activeProject.title)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                            likeInfo.likedByMe
                              ? "bg-rose-500 text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-700 hover:text-rose-500 hover:border-rose-200"
                          }`}
                        >
                          <Heart size={12} fill={likeInfo.likedByMe ? "currentColor" : "none"} className={likeInfo.likedByMe ? "animate-pulse" : ""} />
                          <span>{likeInfo.count} Likes</span>
                        </button>
                      );
                    })()}
                  </div>

                  {/* Thumbnail Row Indicator */}
                  {activeProject.images.length > 1 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Slideshow Navigation
                      </h4>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {activeProject.images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setActiveSlideIdx(i);
                              setIsAutoplayActive(false);
                            }}
                            className={`relative h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer ${
                              activeSlideIdx === i
                                ? "border-indigo-600 scale-105 shadow-md"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={img} alt="Thumbnail preview" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Contact Button */}
                  {activeProject.creativeId !== userProfile.id && (
                    <button
                      onClick={() => {
                        onStartCollabChat(activeProject.creativeId, activeProject.creativeName);
                        setActiveProject(null);
                        setIsAutoplayActive(false);
                        setSelectedCreative(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all"
                    >
                      <MessageSquare size={13} />
                      <span>Inquire about this project</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Heart Particles Overlay */}
      <div className="pointer-events-none fixed inset-0 z-100 overflow-hidden">
        {heartParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 1, 
              scale: p.scale, 
              x: p.x - 10, 
              y: p.y - 10 
            }}
            animate={{ 
              opacity: 0, 
              scale: 0.3,
              x: p.x - 10 + Math.cos(p.angle * Math.PI / 180) * 90,
              y: p.y - 10 - 120 + Math.sin(p.angle * Math.PI / 180) * 40, // drift upward & outward
              rotate: p.angle
            }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="absolute text-rose-500"
          >
            <Heart size={18} fill="currentColor" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
