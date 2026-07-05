/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreativeProfile, Post, CollaborationProject, Conversation, CollabApplication } from "./types";
import {
  INITIAL_USER_PROFILE,
  INITIAL_PROFILES,
  INITIAL_POSTS,
  INITIAL_COLLAB_PROJECTS,
  INITIAL_CONVERSATIONS,
  INITIAL_APPLICATIONS
} from "./data/initialData";
import Header from "./components/Header";
import HomeFeed from "./components/HomeFeed";
import Portfolios from "./components/Portfolios";
import CollaborationHub from "./components/CollaborationHub";
import Messaging from "./components/Messaging";
import MyProfile from "./components/MyProfile";
import NotificationSettings from "./components/NotificationSettings";

export default function App() {
  // Navigation active tab
  const [currentTab, setCurrentTab] = useState<string>("feed");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Global State (persisting in LocalStorage for persistent user changes)
  const [userProfile, setUserProfile] = useState<CreativeProfile>(() => {
    const saved = localStorage.getItem("artcollab_user_profile");
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [profiles, setProfiles] = useState<CreativeProfile[]>(() => {
    const saved = localStorage.getItem("artcollab_profiles");
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("artcollab_posts");
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [collabs, setCollabs] = useState<CollaborationProject[]>(() => {
    const saved = localStorage.getItem("artcollab_collabs");
    return saved ? JSON.parse(saved) : INITIAL_COLLAB_PROJECTS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("artcollab_conversations");
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [applications, setApplications] = useState<CollabApplication[]>(() => {
    const saved = localStorage.getItem("artcollab_applications");
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Saved/Bookmarked posts and collaboration projects
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("artcollab_bookmarked_posts");
    return saved ? JSON.parse(saved) : [];
  });

  const [bookmarkedCollabIds, setBookmarkedCollabIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("artcollab_bookmarked_collabs");
    return saved ? JSON.parse(saved) : [];
  });

  const [profileSubTab, setProfileSubTab] = useState<"details" | "saved">("details");

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("artcollab_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("artcollab_profiles", JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    // Sync userProfile changes into profiles array
    setProfiles((prev) => {
      const existingUser = prev.find(p => p.id === userProfile.id);
      if (existingUser && JSON.stringify(existingUser) === JSON.stringify(userProfile)) {
        return prev;
      }
      return prev.map(p => p.id === userProfile.id ? userProfile : p);
    });
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("artcollab_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("artcollab_collabs", JSON.stringify(collabs));
  }, [collabs]);

  useEffect(() => {
    localStorage.setItem("artcollab_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("artcollab_applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("artcollab_bookmarked_posts", JSON.stringify(bookmarkedPostIds));
  }, [bookmarkedPostIds]);

  useEffect(() => {
    localStorage.setItem("artcollab_bookmarked_collabs", JSON.stringify(bookmarkedCollabIds));
  }, [bookmarkedCollabIds]);

  const handleToggleBookmarkPost = (postId: string) => {
    setBookmarkedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleToggleBookmarkCollab = (collabId: string) => {
    setBookmarkedCollabIds(prev => 
      prev.includes(collabId) ? prev.filter(id => id !== collabId) : [...prev, collabId]
    );
  };

  // Compute total unread messages count
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Helper to jump directly from a profile or post to discussion
  const handleStartCollabChat = (targetUserId: string, targetUserName: string) => {
    // Find target user details in profiles list
    const foundProfile = INITIAL_PROFILES.find(p => p.id === targetUserId);
    if (!foundProfile) return;

    // Check if a conversation already exists
    const existingConv = conversations.find(c => c.participant.id === targetUserId);

    if (existingConv) {
      setActiveConversationId(existingConv.id);
    } else {
      // Create a new conversation record
      const newConvId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        participant: {
          id: foundProfile.id,
          name: foundProfile.name,
          avatar: foundProfile.avatar,
          headline: foundProfile.headline,
          discipline: foundProfile.discipline,
          isOnline: true
        },
        messages: [
          {
            id: `m-init-${Date.now()}`,
            senderId: targetUserId,
            text: `Hi ${userProfile.name}! I saw you wanted to collaborate on a new creative pipeline. Let's discuss details and milestones here in the Greenroom!`,
            timestamp: new Date().toISOString()
          }
        ],
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1
      };

      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConvId);
    }

    // Direct routing to Messaging Tab
    setCurrentTab("messaging");
  };

  return (
    <div className="min-h-screen bg-[#fafafb] font-sans antialiased text-slate-800 flex flex-col">
      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadCount={unreadMessagesCount}
        conversations={conversations}
        setConversations={setConversations}
        setActiveConversationId={setActiveConversationId}
        bookmarkedPostIds={bookmarkedPostIds}
        bookmarkedCollabIds={bookmarkedCollabIds}
        setProfileSubTab={setProfileSubTab}
      />

      {/* Main Container */}
      <main className={`flex-grow ${currentTab === "messaging" ? "h-[calc(100vh-4rem)] overflow-hidden" : "pb-20 sm:pb-0"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {currentTab === "feed" && (
              <HomeFeed
                userProfile={userProfile}
                posts={posts}
                setPosts={setPosts}
                searchQuery={searchQuery}
                onNavigateToProfile={() => {
                  setCurrentTab("profile");
                  setProfileSubTab("details");
                }}
                onStartCollabChat={handleStartCollabChat}
                bookmarkedPostIds={bookmarkedPostIds}
                onToggleBookmarkPost={handleToggleBookmarkPost}
              />
            )}

            {currentTab === "portfolios" && (
              <Portfolios
                profiles={profiles}
                setProfiles={setProfiles}
                searchQuery={searchQuery}
                onStartCollabChat={handleStartCollabChat}
                userProfile={userProfile}
              />
            )}

            {currentTab === "collaborations" && (
              <CollaborationHub
                userProfile={userProfile}
                collabs={collabs}
                setCollabs={setCollabs}
                applications={applications}
                setApplications={setApplications}
                searchQuery={searchQuery}
                onStartCollabChat={handleStartCollabChat}
                bookmarkedCollabIds={bookmarkedCollabIds}
                onToggleBookmarkCollab={handleToggleBookmarkCollab}
              />
            )}

            {currentTab === "messaging" && (
              <Messaging
                userProfile={userProfile}
                conversations={conversations}
                setConversations={setConversations}
                activeConversationId={activeConversationId}
                setActiveConversationId={setActiveConversationId}
              />
            )}

            {currentTab === "profile" && (
              <MyProfile
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                bookmarkedPostIds={bookmarkedPostIds}
                bookmarkedCollabIds={bookmarkedCollabIds}
                onToggleBookmarkPost={handleToggleBookmarkPost}
                onToggleBookmarkCollab={handleToggleBookmarkCollab}
                posts={posts}
                collabs={collabs}
                initialSubTab={profileSubTab}
                setInitialSubTab={setProfileSubTab}
                onStartCollabChat={handleStartCollabChat}
              />
            )}

            {currentTab === "settings" && (
              <NotificationSettings
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                onBack={() => setCurrentTab("profile")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Minimalistic professional footer */}
      {currentTab !== "messaging" && (
        <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>© 2026 ArtCollab Professional Creative Network. Empowering the global canvas of co-creation.</span>
            <div className="flex gap-4">
              <button onClick={() => setCurrentTab("feed")} className="hover:text-indigo-600 transition-colors">Workspace</button>
              <button onClick={() => setCurrentTab("portfolios")} className="hover:text-indigo-600 transition-colors">Bento Showcases</button>
              <button onClick={() => setCurrentTab("collaborations")} className="hover:text-indigo-600 transition-colors">Opportunities</button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
