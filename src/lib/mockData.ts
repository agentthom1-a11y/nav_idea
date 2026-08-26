import { User, ContentPillar, Campaign, ContentItem, Idea, Asset, Comment } from '../types';

export const currentUser: User = {
  id: 'u1',
  name: 'Navrine Admin',
  email: 'admin@navrine.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Workspace Owner'
};

export const users: User[] = [
  currentUser,
  { 
    id: 'u2', 
    name: 'Editorial Lead', 
    email: 'editor@navrine.com', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 
    role: 'Editor' 
  }
];

export const pillars: ContentPillar[] = [
  { id: 'p1', name: 'Education', color: '#3b82f6' },
  { id: 'p2', name: 'Brand Story', color: '#8b5cf6' },
  { id: 'p3', name: 'Product Growth', color: '#10b981' },
  { id: 'p4', name: 'Community', color: '#ec4899' },
];

export const campaigns: Campaign[] = [
  { id: 'c1', name: 'Q3 Growth Sprint', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString(), status: 'Active', goal: '1M impressions', color: '#6366f1' }
];

export const mockContent: ContentItem[] = [];

export const mockIdeas: Idea[] = [];

export const mockComments: Comment[] = [];

export const mockAssets: Asset[] = [];
