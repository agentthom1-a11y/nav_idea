import { User, ContentPillar, Campaign, ContentItem, Idea, Asset, Comment } from '../types';
import { addDays, subDays } from 'date-fns';

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex@northstar.com',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  role: 'Content Manager'
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@northstar.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', role: 'Strategist' },
  { id: 'u3', name: 'Marcus Johnson', email: 'marcus@northstar.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b', role: 'Video Editor' },
  { id: 'u4', name: 'Thomas Wright', email: 'thomas@northstar.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c', role: 'Writer' },
];

export const pillars: ContentPillar[] = [
  { id: 'p1', name: 'Education', color: '#3b82f6' },
  { id: 'p2', name: 'Founder Story', color: '#8b5cf6' },
  { id: 'p3', name: 'Product', color: '#10b981' },
  { id: 'p4', name: 'Entertainment', color: '#f59e0b' },
  { id: 'p5', name: 'Community', color: '#ec4899' },
];

export const campaigns: Campaign[] = [
  { id: 'c1', name: 'August Growth Campaign', startDate: new Date().toISOString(), endDate: addDays(new Date(), 30).toISOString(), status: 'Active', goal: 'Reach 2M impressions', color: '#6366f1' },
  { id: 'c2', name: 'Product Launch Q3', startDate: addDays(new Date(), 10).toISOString(), endDate: addDays(new Date(), 40).toISOString(), status: 'Planned', goal: '1000 signups', color: '#14b8a6' },
];

const now = new Date();

export const mockContent: ContentItem[] = [
  {
    id: 'cnt1',
    title: '5 mistakes killing your landing page',
    platform: 'LinkedIn',
    contentType: 'Post',
    status: 'SCHEDULED',
    priority: 'HIGH',
    pillarId: 'p1',
    campaignId: 'c1',
    ownerId: 'u4',
    publishAt: addDays(now, 1).toISOString(),
    createdAt: subDays(now, 3).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
    caption: "Is your landing page converting under 2%? You might be making these 5 critical mistakes.\\n\\n1. No clear value proposition above the fold\\n2. Too many CTAs\\n3. Slow load times\\n4. Missing social proof\\n5. Confusing navigation\\n\\nWhich one are you guilty of? Let me know below! 👇",
  },
  {
    id: 'cnt2',
    title: 'How our team plans 30 posts in 2 hours',
    platform: 'YouTube',
    contentType: 'Video',
    status: 'REVIEW',
    priority: 'HIGH',
    pillarId: 'p2',
    ownerId: 'u1',
    publishAt: addDays(now, 2).toISOString(),
    createdAt: subDays(now, 5).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
  },
  {
    id: 'cnt3',
    title: 'Behind the scenes: product launch',
    platform: 'Instagram',
    contentType: 'Reel',
    status: 'DRAFT',
    priority: 'MEDIUM',
    pillarId: 'p2',
    campaignId: 'c2',
    ownerId: 'u3',
    createdAt: subDays(now, 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cnt4',
    title: 'We analyzed 100 viral hooks',
    platform: 'TikTok',
    contentType: 'Reel',
    status: 'PUBLISHED',
    priority: 'MEDIUM',
    pillarId: 'p1',
    ownerId: 'u2',
    publishAt: subDays(now, 1).toISOString(),
    createdAt: subDays(now, 10).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
    views: 824000,
    engagement: 98000,
  },
  {
    id: 'cnt5',
    title: '3 workflows every creator should automate',
    platform: 'Instagram',
    contentType: 'Carousel',
    status: 'SCHEDULED',
    priority: 'HIGH',
    pillarId: 'p1',
    ownerId: 'u1',
    publishAt: addDays(now, 0).toISOString(), // Today
    createdAt: subDays(now, 4).toISOString(),
    updatedAt: subDays(now, 2).toISOString(),
  },
  {
    id: 'cnt6',
    title: 'Founder story: our first 100 customers',
    platform: 'LinkedIn',
    contentType: 'Article',
    status: 'APPROVED',
    priority: 'MEDIUM',
    pillarId: 'p2',
    ownerId: 'u1',
    publishAt: addDays(now, 3).toISOString(),
    createdAt: subDays(now, 2).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockIdeas: Idea[] = [
  { id: 'i1', title: 'Why most creators fail at B2B', description: 'Analyze the gap between consumer content and business content.', platform: 'LinkedIn', pillarId: 'p1', score: 85, createdAt: subDays(now, 2).toISOString(), createdBy: 'u1' },
  { id: 'i2', title: 'A day in the life of a Product Manager', description: 'Show the messy reality, not just the polished Notion boards.', platform: 'TikTok', pillarId: 'p4', score: 92, createdAt: subDays(now, 3).toISOString(), createdBy: 'u2' },
  { id: 'i3', title: 'How to use our new AI feature', description: 'Step by step tutorial for the new release.', platform: 'YouTube', pillarId: 'p3', score: 78, createdAt: subDays(now, 1).toISOString(), createdBy: 'u3' },
];

export const mockComments: Comment[] = [
  { id: 'cm1', contentId: 'cnt2', userId: 'u2', text: 'Great script outline! Make sure to emphasize the time-saving metric in the hook.', createdAt: subDays(now, 1).toISOString(), resolved: false },
  { id: 'cm2', contentId: 'cnt2', userId: 'u1', text: 'Added updated thumbnail ideas in the assets tab.', createdAt: subDays(now, 1).toISOString(), resolved: true },
];

export const mockAssets: Asset[] = [
  { id: 'ast1', name: 'Thumbnail_v1.png', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', size: 1024 * 340, uploadedAt: subDays(now, 2).toISOString() },
  { id: 'ast2', name: 'Product_Demo_Clip.mp4', type: 'video', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', size: 1024 * 1024 * 2, uploadedAt: subDays(now, 1).toISOString() },
];

