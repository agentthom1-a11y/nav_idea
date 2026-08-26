export type Status = 
  | 'IDEA' 
  | 'RESEARCH' 
  | 'BRIEF' 
  | 'DRAFT' 
  | 'DESIGN' 
  | 'EDITING' 
  | 'REVIEW' 
  | 'CHANGES_REQUESTED' 
  | 'APPROVED' 
  | 'SCHEDULED' 
  | 'PUBLISHING' 
  | 'PUBLISHED' 
  | 'FAILED' 
  | 'ARCHIVED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Platform = 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'X' | 'Facebook' | 'Pinterest' | 'Newsletter' | 'Blog';

export type ContentType = 'Reel' | 'Shorts' | 'Post' | 'Carousel' | 'Article' | 'Video' | 'Story';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface ContentPillar {
  id: string;
  name: string;
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Planned' | 'Completed';
  goal: string;
  color: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  platform: Platform;
  contentType: ContentType;
  status: Status;
  priority: Priority;
  pillarId?: string;
  campaignId?: string;
  ownerId: string;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
  script?: string;
  caption?: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  shares?: number;
  commentsCount?: number;
  engagement?: number;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  platform?: Platform;
  pillarId?: string;
  score: number;
  createdAt: string;
  createdBy: string;
}

export interface Asset {
  id: string;
  contentId?: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  contentId: string;
  userId: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}


export interface BrandContext {
  brandName: string;
  targetAudience: string;
  brandVoice: string;
  competitors: string;
  additionalContext: string;
}
