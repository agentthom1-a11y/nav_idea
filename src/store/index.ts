import { create } from 'zustand';
import { ContentItem, Idea, Campaign, User, ContentPillar, BrandContext, Comment, Asset } from '../types';
import { mockContent, mockIdeas, campaigns, users, pillars, currentUser, mockComments, mockAssets } from '../lib/mockData';

interface AppState {
  brandContext: BrandContext;
  updateBrandContext: (updates: Partial<BrandContext>) => void;
  currentUser: User;
  users: User[];
  pillars: ContentPillar[];
  campaigns: Campaign[];
  content: ContentItem[];
  ideas: Idea[];
  comments: Comment[];
  assets: Asset[];
  
  // Actions
  addContent: (item: ContentItem) => void;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  moveContent: (id: string, newStatus: any, newIndex: number) => void;
  
  addIdea: (idea: Idea) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;

  addComment: (comment: Comment) => void;
  toggleResolveComment: (id: string) => void;
  deleteComment: (id: string) => void;

  addAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
}

const initialBrandContext: BrandContext = (() => {
  try {
    const saved = localStorage.getItem('northstar_brand_context');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore localStorage errors
  }
  return { brandName: '', targetAudience: '', brandVoice: '', competitors: '', additionalContext: '' };
})();

export const useStore = create<AppState>((set) => ({
  brandContext: initialBrandContext,
  updateBrandContext: (updates) => set((state) => {
    const updated = { ...state.brandContext, ...updates };
    try {
      localStorage.setItem('northstar_brand_context', JSON.stringify(updated));
    } catch (e) {
      // Ignore localStorage errors
    }
    return { brandContext: updated };
  }),
  currentUser,
  users,
  pillars,
  campaigns,
  content: mockContent,
  ideas: mockIdeas,
  comments: mockComments,
  assets: mockAssets,
  
  addContent: (item) => set((state) => ({ content: [item, ...state.content] })),
  updateContent: (id, updates) => set((state) => ({
    content: state.content.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
  })),
  deleteContent: (id) => set((state) => ({
    content: state.content.filter(c => c.id !== id)
  })),
  moveContent: (id, newStatus, newIndex) => set((state) => {
    const itemIndex = state.content.findIndex(c => c.id === id);
    if (itemIndex === -1) return state;
    
    const item = { ...state.content[itemIndex], status: newStatus, updatedAt: new Date().toISOString() };
    
    const newContent = [...state.content];
    newContent.splice(itemIndex, 1);
    
    const targetColumnItems = newContent.filter(c => c.status === newStatus);
    
    if (newIndex >= targetColumnItems.length) {
      const lastItemInStatus = targetColumnItems[targetColumnItems.length - 1];
      if (lastItemInStatus) {
        const lastGlobalIndex = newContent.indexOf(lastItemInStatus);
        newContent.splice(lastGlobalIndex + 1, 0, item);
      } else {
        newContent.push(item);
      }
    } else {
      const itemAtNewIndex = targetColumnItems[newIndex];
      const insertGlobalIndex = newContent.indexOf(itemAtNewIndex);
      newContent.splice(insertGlobalIndex, 0, item);
    }
    
    return { content: newContent };
  }),
  
  addIdea: (idea) => set((state) => ({ ideas: [idea, ...state.ideas] })),
  updateIdea: (id, updates) => set((state) => ({
    ideas: state.ideas.map(i => i.id === id ? { ...i, ...updates } : i)
  })),
  deleteIdea: (id) => set((state) => ({
    ideas: state.ideas.filter(i => i.id !== id)
  })),

  addComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),
  toggleResolveComment: (id) => set((state) => ({
    comments: state.comments.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c)
  })),
  deleteComment: (id) => set((state) => ({
    comments: state.comments.filter(c => c.id !== id)
  })),

  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  deleteAsset: (id) => set((state) => ({
    assets: state.assets.filter(a => a.id !== id)
  })),
}));
