/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Compass, 
  MessageSquare, 
  Briefcase, 
  User, 
  Search, 
  Palette, 
  Bell, 
  Mail, 
  Settings, 
  LogOut, 
  Check, 
  Heart, 
  ThumbsUp, 
  CheckCircle,
  ExternalLink,
  Sparkles,
  Award,
  ArrowLeft,
  Menu,
  X,
  Bookmark
} from "lucide-react";
import { CreativeProfile, Conversation } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile: CreativeProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadCount: number;
  conversations?: Conversation[];
  setConversations?: (conversations: Conversation[]) => void;
  setActiveConversationId?: (id: string | null) => void;
  bookmarkedPostIds: string[];
  bookmarkedCollabIds: string[];
  setProfileSubTab: (tab: "details" | "saved") => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  userProfile,
  searchQuery,
  setSearchQuery,
  unreadCount,
  conversations,
  setConversations,
  setActiveConversationId,
  bookmarkedPostIds,
  bookmarkedCollabIds,
  setProfileSubTab
}: HeaderProps) {
  // Local state for dropdown visibility
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSparkQuote, setCurrentSparkQuote] = useState("Perfect is the enemy of the finished project. Shipping is standard practice.");

  // Creative focus intention states for drawer
  const [creativeFocus, setCreativeFocus] = useState<string>(() => {
    return localStorage.getItem("artcollab_creative_focus") || "";
  });
  const [isFocusCompleted, setIsFocusCompleted] = useState<boolean>(() => {
    return localStorage.getItem("artcollab_focus_completed") === "true";
  });
  const [newFocusInput, setNewFocusInput] = useState("");
  const [isAddingFocus, setIsAddingFocus] = useState(false);

  // Improved Hamburger Drawer Motion Variants
  const drawerContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05
      }
    }
  };

  const drawerItemVariants = {
    hidden: { opacity: 0, x: 15 },
    show: { 
      opacity: 1, 
      x: 0, 
      transition: { type: "spring", stiffness: 350, damping: 25 } 
    }
  };

  // Mock Notifications with states
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      sender: {
        name: "Anya Kovalenko",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
      },
      title: "New Application",
      description: "applied to your project 'Interactive Fluid Web GL Shaders'",
      time: "10m ago",
      type: "application",
      unread: true,
      tab: "collaborations"
    },
    {
      id: "notif-2",
      sender: {
        name: "Marcus Vance",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80"
      },
      title: "Skill Endorsement",
      description: "endorsed your skill 'AI Automation & Workflows'",
      time: "2h ago",
      type: "endorsement",
      unread: true,
      tab: "profile"
    },
    {
      id: "notif-3",
      sender: {
        name: "Hana Katsura",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
      },
      title: "Appreciation",
      description: "appreciated your artwork 'Yaw Generative Shaders'",
      time: "1d ago",
      type: "like",
      unread: false,
      tab: "feed"
    }
  ]);

  // Merge unread messages from conversations into our notifications array dynamically (2,4 Integration)
  const chatNotifications = (conversations || [])
    .filter(c => c.unreadCount > 0)
    .map(c => {
      const lastMsg = c.messages[c.messages.length - 1];
      return {
        id: `chat-notif-${c.id}`,
        sender: {
          name: c.participant.name,
          avatar: c.participant.avatar
        },
        title: "New Message",
        description: `sent a message: "${lastMsg?.text || ""}"`,
        time: lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
        type: "message",
        unread: true,
        tab: "messaging",
        conversationId: c.id
      };
    });

  const allNotifications = [...chatNotifications, ...notifications];

  // Derive unread count from both static and dynamic message notifications
  const unreadNotificationsCount = allNotifications.filter(n => n.unread).length;

  const handleMarkAllNotificationsAsRead = () => {
    // Read static ones
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    // Read dynamic conversations
    if (setConversations && conversations) {
      setConversations(conversations.map(c => ({ ...c, unreadCount: 0 })));
    }
  };

  const handleNotificationClick = (notif: any) => {
    // If it's a dynamic message notification
    if (notif.type === "message" && notif.conversationId) {
      if (setActiveConversationId && setConversations && conversations) {
        setActiveConversationId(notif.conversationId);
        setConversations(
          conversations.map(c => c.id === notif.conversationId ? { ...c, unreadCount: 0 } : c)
        );
      }
      setCurrentTab("messaging");
      setNotificationDropdownOpen(false);
      return;
    }

    // Mark specific notification as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setNotificationDropdownOpen(false);
    
    // Custom action: if notification settings tab is targeted, redirect to settings page
    if (notif.tab === "profile") {
      setCurrentTab("settings");
    } else {
      setCurrentTab(notif.tab);
    }
  };

  const handleGoToNotificationSettings = () => {
    setProfileDropdownOpen(false);
    setNotificationDropdownOpen(false);
    setCurrentTab("settings");
  };

  const handleSignOutMock = () => {
    setProfileDropdownOpen(false);
    alert("This is a demonstration of the Sign Out flow on ArtCollab. Your profile has been kept secure in your browser context!");
  };

  const navItems = [
    { id: "feed", label: "Feed", icon: Compass },
    { id: "portfolios", label: "Portfolios", icon: Palette },
    { id: "collaborations", label: "Collabs", icon: Briefcase },
    { id: "messaging", label: "Messages", icon: MessageSquare, badge: unreadCount },
  ];

  return (
    <>
      <header className={`sticky top-0 w-full border-b border-slate-100 bg-white shadow-xs backdrop-blur-md transition-all ${mobileMenuOpen ? "z-130" : "z-50"}`}>
      
      {/* Invisible backdrop for closing dropdowns when clicking outside */}
      {(profileDropdownOpen || notificationDropdownOpen) && (
        <div 
          className="fixed inset-0 z-30 bg-transparent" 
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationDropdownOpen(false);
          }} 
        />
      )}

      {/* Expanded search overlay on mobile */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-0 z-50 flex h-16 w-full items-center bg-white px-4 shadow-sm sm:hidden gap-3"
          >
            <button 
              onClick={() => setMobileSearchOpen(false)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Search creatives, projects, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pr-10 pl-10 text-sm font-sans text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                id="mobile-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 relative z-40">
        {/* Left section: Logo and Search */}
        <div className="flex flex-1 items-center gap-2 sm:gap-4 md:gap-8 min-w-0">
          <div 
            onClick={() => {
              setCurrentTab("feed");
              setProfileDropdownOpen(false);
              setNotificationDropdownOpen(false);
            }} 
            className="flex cursor-pointer items-center gap-2 text-indigo-600 transition-all hover:opacity-95 shrink-0"
            id="header-logo-container"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-100">
              <Palette size={20} strokeWidth={2.5} />
            </div>
            <span className="hidden font-display text-xl font-bold tracking-tight text-slate-800 sm:block">
              Art<span className="text-indigo-600">Collab</span>
            </span>
          </div>

          {/* Standard Desktop Search bar */}
          <div className="relative hidden sm:block w-full max-w-xs md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={`Search creatives, projects, posts...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pr-4 pl-10 text-sm font-sans text-slate-800 placeholder-slate-400 outline-hidden transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:shadow-xs"
              id="global-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Compact Mobile Search Button Trigger */}
          <button 
            onClick={() => setMobileSearchOpen(true)}
            className="sm:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shrink-0"
            title="Search"
            id="mobile-search-trigger-btn"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Right section: LinkedIn-style Nav Items + Drops */}
        <nav className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setProfileDropdownOpen(false);
                    setNotificationDropdownOpen(false);
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-xl py-1 px-1.5 sm:px-3 text-center transition-all duration-200 min-w-[44px] sm:min-w-[64px] ${
                    isActive 
                      ? "text-indigo-600 font-medium" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  id={`nav-${item.id}`}
                >
                  <div className="relative p-1">
                    <Icon size={20} className={isActive ? "scale-110" : "scale-100 transition-transform"} />
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="hidden text-[10px] font-sans tracking-wide md:block">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mx-1 sm:mx-2 h-8 w-px bg-slate-100 hidden sm:block" />

          {/* Interactive Notification Dropdown Toggle */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationDropdownOpen(!notificationDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className={`relative rounded-xl p-2 transition-all cursor-pointer ${
                notificationDropdownOpen 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
              id="header-notification-bell-btn"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 font-mono text-[9px] font-bold text-white ring-2 ring-white animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
              {notificationDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl z-50 focus:outline-hidden"
                  id="notifications-dropdown-panel"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="ml-1.5 rounded-full bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-600">
                          {unreadNotificationsCount} New
                        </span>
                      )}
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={handleMarkAllNotificationsAsRead}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                        id="mark-all-read-btn"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 py-1">
                    {allNotifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex gap-3 p-3 text-left hover:bg-slate-50 cursor-pointer transition-all rounded-xl ${
                          notif.unread ? "bg-indigo-50/10" : ""
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img 
                            src={notif.sender.avatar} 
                            alt={notif.sender.name} 
                            className="h-9 w-9 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {notif.type === "application" && (
                            <span className="absolute -bottom-1 -right-1 rounded-full bg-indigo-500 p-0.5 text-white ring-1 ring-white">
                              <Briefcase size={8} />
                            </span>
                          )}
                          {notif.type === "endorsement" && (
                            <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 text-white ring-1 ring-white">
                              <CheckCircle size={8} />
                            </span>
                          )}
                          {notif.type === "like" && (
                            <span className="absolute -bottom-1 -right-1 rounded-full bg-rose-500 p-0.5 text-white ring-1 ring-white">
                              <Heart size={8} className="fill-white text-white" />
                            </span>
                          )}
                          {notif.type === "message" && (
                            <span className="absolute -bottom-1 -right-1 rounded-full bg-indigo-600 p-0.5 text-white ring-1 ring-white">
                              <MessageSquare size={8} className="text-white" />
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 leading-normal">
                            <span className="font-bold text-slate-900">{notif.sender.name}</span>{" "}
                            {notif.description}
                          </p>
                          <span className="text-[9px] font-mono font-medium text-slate-400 block mt-1">
                            {notif.time}
                          </span>
                        </div>

                        {notif.unread && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))}

                    {allNotifications.length === 0 && (
                      <div className="text-center py-6">
                        <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                        <span className="text-xs text-slate-400">All caught up! No notifications.</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-50 p-1.5">
                    <button 
                      onClick={handleGoToNotificationSettings}
                      className="w-full rounded-xl bg-slate-50 hover:bg-slate-100 py-1.5 text-center text-[10px] font-bold text-slate-600 transition-colors"
                    >
                      Configure notification settings
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Profile Dropdown Toggle */}
          <div className="relative">
            <button 
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationDropdownOpen(false);
              }}
              className={`flex items-center gap-1 p-1 rounded-full transition-all cursor-pointer ring-2 ${
                currentTab === "profile" || profileDropdownOpen
                  ? "ring-indigo-500 bg-indigo-50" 
                  : "ring-transparent hover:bg-slate-50"
              }`}
              id="header-profile-dropdown-btn"
              title="Profile Menu"
            >
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name} 
                  className="h-8 w-8 rounded-full object-cover shadow-xs border border-slate-100"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shadow-xs border border-slate-100">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </button>

            {/* Profile Dropdown Panel */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl z-50 focus:outline-hidden"
                  id="profile-dropdown-panel"
                >
                  {/* Miniature User Card */}
                  <div className="flex flex-col items-center p-4 text-center border-b border-slate-50 bg-slate-50/10 rounded-xl">
                    {userProfile.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt={userProfile.name} 
                        className="h-14 w-14 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-indigo-500/15"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center border-2 border-white ring-2 ring-indigo-500/15">
                        {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <span className="font-display text-sm font-bold text-slate-800 mt-2">{userProfile.name}</span>
                    <span className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2 leading-relaxed">
                      {userProfile.headline}
                    </span>
                  </div>

                  {/* Micro Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center py-2 px-1 text-slate-500">
                    <div className="rounded-lg bg-slate-50/40 p-2 border border-slate-50">
                      <span className="font-mono text-xs font-bold text-slate-700">{userProfile.connectionsCount}</span>
                      <p className="text-[8px] tracking-wide uppercase font-bold text-slate-400 mt-0.5">Connections</p>
                    </div>
                    <div className="rounded-lg bg-slate-50/40 p-2 border border-slate-50">
                      <span className="font-mono text-xs font-bold text-slate-700">{userProfile.collabsCompleted}</span>
                      <p className="text-[8px] tracking-wide uppercase font-bold text-slate-400 mt-0.5">Collabs Done</p>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setCurrentTab("profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>My Portfolio & Bio</span>
                    </button>

                    <button
                      onClick={handleGoToNotificationSettings}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>Notification Settings</span>
                    </button>

                    <button
                      onClick={handleSignOutMock}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <LogOut size={14} className="text-rose-400" />
                      <span>Sign Out (Demo)</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setProfileDropdownOpen(false);
              setNotificationDropdownOpen(false);
            }}
            className="sm:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all ml-1 cursor-pointer"
            id="mobile-hamburger-btn"
            title="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>
    </header>

    {/* Hamburger Drawer Panel */}
    <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs sm:hidden"
              id="mobile-menu-backdrop"
            />

            {/* Sliding Panel with Glassmorphism */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white/95 backdrop-blur-md shadow-[0_0_50px_rgba(15,23,42,0.15)] z-50 flex flex-col sm:hidden border-l border-slate-100"
              id="mobile-hamburger-drawer"
            >
              {/* Drawer Header with gradient accent */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-100">
                    <Palette size={16} strokeWidth={2.5} />
                  </div>
                  <span className="font-display text-base font-bold tracking-tight text-slate-800">
                    Art<span className="text-indigo-600">Collab</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-slate-100/80 p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition-all cursor-pointer"
                  title="Close Menu"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Drawer Content Area - Animated Staggered List */}
              <motion.div 
                variants={drawerContainerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none"
              >
                {/* User Info Micro Profile Card */}
                <motion.div 
                  variants={drawerItemVariants}
                  className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50/50 border border-slate-100"
                >
                  <div className="relative">
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="h-14 w-14 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-indigo-500/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <span className="font-display text-sm font-bold text-slate-800 mt-2.5">{userProfile.name}</span>
                  <span className="text-[10px] text-slate-400 font-sans mt-1 line-clamp-2 leading-relaxed max-w-[200px]">
                    {userProfile.headline}
                  </span>

                  {/* Micro stats */}
                  <div className="grid grid-cols-2 gap-3 w-full mt-3.5 text-slate-500 pt-3 border-t border-slate-100/80">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-700">{userProfile.connectionsCount}</span>
                      <p className="text-[8px] tracking-wide uppercase font-bold text-slate-400">Connections</p>
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-700">{userProfile.collabsCompleted}</span>
                      <p className="text-[8px] tracking-wide uppercase font-bold text-slate-400">Collabs Done</p>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Interactive Daily Creative Fuel & Intention Box */}
                <motion.div 
                  variants={drawerItemVariants}
                  className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 relative overflow-hidden space-y-3.5"
                >
                  <div className="absolute -top-1 -right-1 p-3 text-indigo-500 opacity-15 pointer-events-none">
                    <Sparkles size={45} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 text-indigo-700">
                      <Sparkles size={14} className="animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider font-display">Daily Creative Fuel</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 font-medium leading-relaxed italic">
                      "{currentSparkQuote}"
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const quotes = [
                          "Perfect is the enemy of the finished project. Shipping is standard practice.",
                          "Creativity is intelligence having fun. Mix sound and visual with zero boundaries.",
                          "Collaborate with someone from a totally different medium today.",
                          "Constraint inspires innovation. Try writing a shader with only 3 colors.",
                          "Your portfolio is your story. Make your Bento Grid uniquely authentic.",
                          "Aesthetics are not a veneer. They are an architectural truth."
                        ];
                        const nextQuote = quotes[(quotes.indexOf(currentSparkQuote) + 1) % quotes.length];
                        setCurrentSparkQuote(nextQuote);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Generate Spark →
                    </button>
                  </div>

                  <div className="border-t border-indigo-100/50 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 font-display">
                        Today's Intention
                      </span>
                      {!creativeFocus && !isAddingFocus && (
                        <button
                          onClick={() => setIsAddingFocus(true)}
                          className="text-[9px] font-bold text-indigo-700 hover:underline cursor-pointer"
                        >
                          + Set Focus
                        </button>
                      )}
                    </div>

                    {isAddingFocus ? (
                      <div className="mt-2 flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Set today's focus..."
                          value={newFocusInput}
                          onChange={(e) => setNewFocusInput(e.target.value)}
                          className="flex-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-[11px] outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newFocusInput.trim()) {
                              setCreativeFocus(newFocusInput.trim());
                              localStorage.setItem("artcollab_creative_focus", newFocusInput.trim());
                              setIsFocusCompleted(false);
                              localStorage.setItem("artcollab_focus_completed", "false");
                              setNewFocusInput("");
                              setIsAddingFocus(false);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newFocusInput.trim()) {
                              setCreativeFocus(newFocusInput.trim());
                              localStorage.setItem("artcollab_creative_focus", newFocusInput.trim());
                              setIsFocusCompleted(false);
                              localStorage.setItem("artcollab_focus_completed", "false");
                              setNewFocusInput("");
                              setIsAddingFocus(false);
                            }
                          }}
                          className="rounded-lg bg-indigo-600 px-2 py-1 text-white hover:bg-indigo-700 font-bold text-[10px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : creativeFocus ? (
                      <div className="mt-2 flex items-start gap-2 bg-white/70 rounded-xl p-2.5 border border-indigo-50">
                        <input
                          type="checkbox"
                          checked={isFocusCompleted}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsFocusCompleted(checked);
                            localStorage.setItem("artcollab_focus_completed", checked ? "true" : "false");
                          }}
                          className="h-3.5 w-3.5 mt-0.5 rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-[11px] leading-tight block ${isFocusCompleted ? "line-through text-slate-400 font-normal" : "text-slate-700 font-semibold"}`}>
                            {creativeFocus}
                          </span>
                          <button
                            onClick={() => {
                              setCreativeFocus("");
                              localStorage.removeItem("artcollab_creative_focus");
                              setIsFocusCompleted(false);
                              localStorage.removeItem("artcollab_focus_completed");
                            }}
                            className="text-[9px] text-slate-400 hover:text-rose-500 mt-1 block"
                          >
                            Clear Intention
                          </button>
                        </div>
                        {isFocusCompleted && (
                          <span className="text-[10px] animate-bounce text-emerald-500">🎉</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-indigo-500/70 italic mt-1 leading-normal">
                        No target set. What are you going to build today?
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Navigation Sections */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1 font-display">
                    Core Navigation
                  </span>

                  <motion.button
                    variants={drawerItemVariants}
                    onClick={() => {
                      setCurrentTab("feed");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      currentTab === "feed"
                        ? "bg-indigo-50/80 text-indigo-600 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Compass size={15} />
                      <span>Workspace Feed</span>
                    </span>
                  </motion.button>

                  <motion.button
                    variants={drawerItemVariants}
                    onClick={() => {
                      setCurrentTab("portfolios");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      currentTab === "portfolios"
                        ? "bg-indigo-50/80 text-indigo-600 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Palette size={15} />
                      <span>Bento Showcases</span>
                    </span>
                  </motion.button>

                  <motion.button
                    variants={drawerItemVariants}
                    onClick={() => {
                      setCurrentTab("collaborations");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      currentTab === "collaborations"
                        ? "bg-indigo-50/80 text-indigo-600 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Briefcase size={15} />
                      <span>Opportunities Hub</span>
                    </span>
                  </motion.button>

                  <motion.button
                    variants={drawerItemVariants}
                    onClick={() => {
                      setCurrentTab("messaging");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      currentTab === "messaging"
                        ? "bg-indigo-50/80 text-indigo-600 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageSquare size={15} />
                      <span>Greenroom Chats</span>
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white px-1.5 py-0.5 shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Personal Vault Section (Bookmarked Items & Profile Details) */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1 font-display">
                    Personal Vault
                  </span>

                  <motion.button
                    variants={drawerItemVariants}
                    onClick={() => {
                      setCurrentTab("profile");
                      setProfileSubTab("saved");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      currentTab === "profile" && (bookmarkedPostIds?.length || bookmarkedCollabIds?.length)
                        ? "bg-indigo-50/80 text-indigo-600 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                    id="mobile-drawer-saved-items"
                  >
                    <span className="flex items-center gap-2.5">
                      <Bookmark size={15} className="text-indigo-600 fill-indigo-50" />
                      <span className="text-indigo-600 font-extrabold">Saved Items</span>
                    </span>
                    {((bookmarkedPostIds?.length || 0) + (bookmarkedCollabIds?.length || 0)) > 0 && (
                      <span className="rounded-full bg-indigo-100 font-mono text-[9px] font-bold text-indigo-800 px-1.5 py-0.5">
                        {(bookmarkedPostIds?.length || 0) + (bookmarkedCollabIds?.length || 0)}
                      </span>
                    )}
                  </motion.button>

                  <motion.button
                    variants={drawerItemVariants}
                    onClick={() => {
                      setCurrentTab("profile");
                      setProfileSubTab("details");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      currentTab === "profile"
                        ? "bg-slate-50 text-slate-800 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <User size={15} />
                      <span>My Portfolio & Bio</span>
                    </span>
                  </motion.button>

                  <motion.button
                    variants={drawerItemVariants}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleGoToNotificationSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Settings size={15} />
                    <span>Notification Settings</span>
                  </motion.button>
                </div>

                {/* Aesthetic Spotlight Artist Recommendation Card */}
                <motion.div 
                  variants={drawerItemVariants}
                  className="rounded-2xl border border-slate-100 bg-linear-to-tr from-slate-900 to-indigo-950 p-4 text-white relative overflow-hidden shadow-md"
                >
                  <div className="absolute top-0 right-0 p-3 text-indigo-400 opacity-20 pointer-events-none">
                    <Award size={40} />
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Sparkles size={11} className="text-yellow-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider font-display">Aesthetic Spotlight</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2.5">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" 
                      alt="Spotlight Artist" 
                      className="h-10 w-10 rounded-xl object-cover border-2 border-indigo-400" 
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">Anya Kovalenko</h4>
                      <p className="text-[9px] text-indigo-200">3D Artist & Unreal Specialist</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab("portfolios");
                      setMobileMenuOpen(false);
                    }}
                    className="mt-3 w-full text-center rounded-lg bg-indigo-600 hover:bg-indigo-700 py-1.5 text-[10px] font-bold text-white transition-all cursor-pointer shadow-xs"
                  >
                    View Showcases
                  </button>
                </motion.div>
              </motion.div>

              {/* Drawer Footer */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOutMock();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out (Demo)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    {/* Floating Bottom Navigation Bar for Mobile Viewports */}
    <div className="fixed bottom-0 inset-x-0 z-40 block sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(15,23,42,0.05)] px-4 pb-safe">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const label = item.id === "collaborations" ? "Collabs" : item.label;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setProfileDropdownOpen(false);
                setNotificationDropdownOpen(false);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 text-center transition-all duration-200 flex-1 min-w-0 ${
                isActive 
                  ? "text-indigo-600 font-bold" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
              id={`mobile-nav-${item.id}`}
            >
              <div className="relative p-1">
                <Icon size={20} className={isActive ? "scale-110 text-indigo-600" : "scale-100 transition-transform text-slate-500"} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] font-sans font-semibold tracking-tight truncate w-full px-1">{label}</span>
              {isActive && (
                <motion.span 
                  layoutId="activeTabIndicatorMobile"
                  className="absolute bottom-1 h-0.5 w-6 rounded-full bg-indigo-600" 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </>
);
}
