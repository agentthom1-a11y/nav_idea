import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';
import { ContentItem, Idea, Comment, Asset } from '../types';

describe('Zustand App Store', () => {
  beforeEach(() => {
    // Reset store state if needed
  });

  it('adds and deletes content items', () => {
    const store = useStore.getState();
    const initialCount = store.content.length;

    const newItem: ContentItem = {
      id: 'test-item-1',
      title: 'Test Content Title',
      platform: 'LinkedIn',
      contentType: 'Post',
      status: 'DRAFT',
      priority: 'HIGH',
      ownerId: 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.addContent(newItem);
    expect(useStore.getState().content.length).toBe(initialCount + 1);
    expect(useStore.getState().content.find(c => c.id === 'test-item-1')).toBeDefined();

    store.deleteContent('test-item-1');
    expect(useStore.getState().content.length).toBe(initialCount);
    expect(useStore.getState().content.find(c => c.id === 'test-item-1')).toBeUndefined();
  });

  it('updates content item properties and status', () => {
    const store = useStore.getState();
    const item = store.content[0];
    if (!item) return;

    store.updateContent(item.id, { title: 'Updated Title Special', status: 'APPROVED' });
    const updated = useStore.getState().content.find(c => c.id === item.id);
    expect(updated?.title).toBe('Updated Title Special');
    expect(updated?.status).toBe('APPROVED');
  });

  it('moves content to a new status and reorders items', () => {
    const store = useStore.getState();
    const item = store.content[0];
    if (!item) return;

    store.moveContent(item.id, 'PUBLISHED', 0);
    const moved = useStore.getState().content.find(c => c.id === item.id);
    expect(moved?.status).toBe('PUBLISHED');
  });

  it('manages ideas inbox (add, update, delete)', () => {
    const store = useStore.getState();
    const initialIdeasCount = store.ideas.length;

    const newIdea: Idea = {
      id: 'test-idea-1',
      title: 'Test Idea for AI',
      description: 'Idea description',
      platform: 'YouTube',
      score: 95,
      createdAt: new Date().toISOString(),
      createdBy: 'u1'
    };

    store.addIdea(newIdea);
    expect(useStore.getState().ideas.length).toBe(initialIdeasCount + 1);

    store.updateIdea('test-idea-1', { score: 99 });
    expect(useStore.getState().ideas.find(i => i.id === 'test-idea-1')?.score).toBe(99);

    store.deleteIdea('test-idea-1');
    expect(useStore.getState().ideas.length).toBe(initialIdeasCount);
  });

  it('manages reviewer comments', () => {
    const store = useStore.getState();
    const newComment: Comment = {
      id: 'comment-test-1',
      contentId: 'cnt1',
      userId: 'u1',
      text: 'Please check this paragraph',
      createdAt: new Date().toISOString(),
      resolved: false
    };

    store.addComment(newComment);
    expect(useStore.getState().comments.find(c => c.id === 'comment-test-1')).toBeDefined();

    store.toggleResolveComment('comment-test-1');
    expect(useStore.getState().comments.find(c => c.id === 'comment-test-1')?.resolved).toBe(true);

    store.deleteComment('comment-test-1');
    expect(useStore.getState().comments.find(c => c.id === 'comment-test-1')).toBeUndefined();
  });

  it('manages media assets', () => {
    const store = useStore.getState();
    const newAsset: Asset = {
      id: 'asset-test-1',
      name: 'Banner.jpg',
      url: 'https://example.com/banner.jpg',
      type: 'image',
      size: 1024,
      uploadedAt: new Date().toISOString()
    };

    store.addAsset(newAsset);
    expect(useStore.getState().assets.find(a => a.id === 'asset-test-1')).toBeDefined();

    store.deleteAsset('asset-test-1');
    expect(useStore.getState().assets.find(a => a.id === 'asset-test-1')).toBeUndefined();
  });

  it('updates and persists brand context', () => {
    const store = useStore.getState();
    store.updateBrandContext({
      brandName: 'TestBrand Pro',
      brandVoice: 'Witty and insightful',
      targetAudience: 'SaaS Founders'
    });

    const ctx = useStore.getState().brandContext;
    expect(ctx.brandName).toBe('TestBrand Pro');
    expect(ctx.brandVoice).toBe('Witty and insightful');
    expect(ctx.targetAudience).toBe('SaaS Founders');
  });
});
