import { create } from 'zustand';
import { ContentItem, Idea, Campaign, User, ContentPillar, BrandContext, Comment, Asset, Status } from '../types';
import { mockContent, mockIdeas, campaigns, users, pillars, currentUser, mockComments, mockAssets } from '../lib/mockData';

interface AppState {
  brandContext: BrandContext;
  updateBrandContext: (updates: Partial<BrandContext>) => void;
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => void;
  users: User[];
  pillars: ContentPillar[];
  campaigns: Campaign[];
  content: ContentItem[];
  ideas: Idea[];
  comments: Comment[];
  assets: Asset[];
  isLoading: boolean;
  
  // Actions
  loadInitialData: () => Promise<void>;
  addContent: (item: ContentItem) => void;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  moveContent: (id: string, newStatus: Status, newIndex: number) => void;
  
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
    const saved = localStorage.getItem('navrine_brand_context');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore localStorage errors
  }
  return { brandName: 'NAVRINE', targetAudience: 'Content Creators, Marketers & Growth Teams', brandVoice: 'Visionary, Sharp & High-Impact', competitors: '', additionalContext: '' };
})();

export const useStore = create<AppState>((set, get) => ({
  brandContext: initialBrandContext,
  updateBrandContext: (updates) => {
    set((state) => {
      const updated = { ...state.brandContext, ...updates };
      try {
        localStorage.setItem('navrine_brand_context', JSON.stringify(updated));
      } catch (e) {}
      fetch('/api/brand-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return { brandContext: updated };
    });
  },

  currentUser,
  updateCurrentUser: (updates) => {
    set((state) => {
      const updated = { ...state.currentUser, ...updates };
      fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      return { currentUser: updated };
    });
  },

  users,
  pillars,
  campaigns,
  content: mockContent,
  ideas: mockIdeas,
  comments: mockComments,
  assets: mockAssets,
  isLoading: false,
  
  loadInitialData: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/initial-data');
      if (res.ok) {
        const data = await res.json();
        set({
          currentUser: data.user || get().currentUser,
          users: data.users?.length ? data.users : get().users,
          brandContext: data.brandContext || get().brandContext,
          pillars: data.pillars?.length ? data.pillars : get().pillars,
          campaigns: data.campaigns || get().campaigns,
          content: data.contents || [],
          ideas: data.ideas || [],
          comments: data.comments || [],
          assets: data.assets || [],
          isLoading: false
        });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },

  addContent: (item) => {
    set((state) => ({ content: [item, ...state.content] }));
    fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).catch(() => {});
  },

  updateContent: (id, updates) => {
    set((state) => {
      const item = state.content.find(c => c.id === id);
      const updatedItem = item ? { ...item, ...updates, updatedAt: new Date().toISOString() } : null;
      if (updatedItem) {
        fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        }).catch(() => {});
      }
      return {
        content: state.content.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
      };
    });
  },

  deleteContent: (id) => {
    set((state) => ({ content: state.content.filter(c => c.id !== id) }));
    fetch(`/api/content/${id}`, { method: 'DELETE' }).catch(() => {});
  },

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

    fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).catch(() => {});
    
    return { content: newContent };
  }),
  
  addIdea: (idea) => {
    set((state) => ({ ideas: [idea, ...state.ideas] }));
    fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idea)
    }).catch(() => {});
  },

  updateIdea: (id, updates) => {
    set((state) => {
      const item = state.ideas.find(i => i.id === id);
      const updatedIdea = item ? { ...item, ...updates } : null;
      if (updatedIdea) {
        fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedIdea)
        }).catch(() => {});
      }
      return {
        ideas: state.ideas.map(i => i.id === id ? { ...i, ...updates } : i)
      };
    });
  },

  deleteIdea: (id) => {
    set((state) => ({ ideas: state.ideas.filter(i => i.id !== id) }));
    fetch(`/api/ideas/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  addComment: (comment) => {
    set((state) => ({ comments: [...state.comments, comment] }));
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    }).catch(() => {});
  },

  toggleResolveComment: (id) => {
    set((state) => ({
      comments: state.comments.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c)
    }));
    fetch(`/api/comments/${id}/resolve`, { method: 'PUT' }).catch(() => {});
  },

  deleteComment: (id) => {
    set((state) => ({ comments: state.comments.filter(c => c.id !== id) }));
    fetch(`/api/comments/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  addAsset: (asset) => {
    set((state) => ({ assets: [asset, ...state.assets] }));
    fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset)
    }).catch(() => {});
  },

  deleteAsset: (id) => {
    set((state) => ({ assets: state.assets.filter(a => a.id !== id) }));
    fetch(`/api/assets/${id}`, { method: 'DELETE' }).catch(() => {});
  },
}));
