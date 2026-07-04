/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CreativeProfile {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  headline: string;
  bio: string;
  location: string;
  discipline: string;
  openToWork: boolean;
  skills: string[];
  featuredProjects: FeaturedProject[];
  connectionsCount: number;
  collabsCompleted: number;
  website?: string;
  endorsements?: { [skill: string]: string[] };
  emailSettings?: {
    newApplications: boolean;
    newEndorsements: boolean;
    newMessages: boolean;
    weeklyDigest: boolean;
  };
}

export interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  likesCount: number;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
    discipline: string;
  };
  content: string;
  imageUrl?: string;
  tags: string[];
  likesCount: number;
  likedByUser: boolean;
  comments: Comment[];
  createdAt: string;
  category?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorHeadline: string;
  content: string;
  createdAt: string;
}

export interface CollaborationProject {
  id: string;
  title: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
    discipline: string;
  };
  description: string;
  disciplineRequired: string[];
  rewardType: "Revenue Share" | "Co-Ownership" | "Paid Contract" | "Collaborative Credit";
  rewardValue: string;
  status: "open" | "filled";
  applicationsCount: number;
  tags: string[];
  details: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  isMilestone?: boolean;
  milestoneTitle?: string;
  milestoneStatus?: "pending" | "approved" | "declined";
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
    discipline: string;
    isOnline: boolean;
  };
  messages: Message[];
  lastMessageTime: string;
  unreadCount: number;
}

export interface CollabApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  message: string;
  portfolioLink: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  // Specialized application form fields
  proposedReward?: string;
  estimatedTimeline?: string;
  deliverables?: string;
  expertiseLevel?: string;
  fileAttachmentUrl?: string;
  // Interactive Contract Milestones for Reward Tracker
  milestones?: {
    id: string;
    title: string;
    description: string;
    status: "pending" | "completed" | "released";
    rewardValue?: string;
  }[];
}
