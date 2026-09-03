import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../services/ai';

describe('AI Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generateContent should call /api/generate-content and return text', async () => {
    const mockResponse = { content: 'Generated social post content #success' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await aiService.generateContent('Instagram', 'Growth Tips', '5 tips');
    expect(global.fetch).toHaveBeenCalledWith('/api/generate-content', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ platform: 'Instagram', pillar: 'Growth Tips', topic: '5 tips', type: 'caption', contentType: 'Post' }),
    }));
    expect(result).toBe('Generated social post content #success');
  });

  it('generateDailySuggestions should call /api/generate-daily-suggestions', async () => {
    const mockSuggestions = [
      {
        title: 'Daily Tech Trend',
        platform: 'LinkedIn',
        contentType: 'Post',
        publishAt: '2026-08-26T12:00:00Z',
        caption: 'Trending tech topic today'
      }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: mockSuggestions }),
    });

    const results = await aiService.generateDailySuggestions(['LinkedIn'], ['Tech']);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Daily Tech Trend');
  });

  it('generateWeeklyPlan should call /api/generate-weekly-plan', async () => {
    const mockPlan = [
      { title: 'Day 1 Post', platform: 'Instagram', contentType: 'Reel', publishAt: '2026-08-27T12:00:00Z', caption: 'Post text' }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ plan: mockPlan }),
    });

    const plan = await aiService.generateWeeklyPlan(['Instagram'], ['Growth'], '2026-08-27');
    expect(plan).toHaveLength(1);
    expect(plan[0].title).toBe('Day 1 Post');
  });

  it('generateAllDetails should call /api/generate-all-details', async () => {
    const mockDetails = {
      title: 'Complete Masterclass',
      description: 'Comprehensive overview',
      script: 'Scene 1: Hook',
      caption: 'Full post caption'
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ details: mockDetails }),
    });

    const res = await aiService.generateAllDetails('YouTube', 'Video', 'Product Launch');
    expect(res.title).toBe('Complete Masterclass');
    expect(res.script).toBe('Scene 1: Hook');
  });

  it('auditSEO should call /api/seo-audit and return analysis', async () => {
    const mockAnalysis = {
      score: 92,
      readabilityScore: 88,
      keywordAnalysis: 'Good distribution',
      readabilityFeedback: 'Easy to digest',
      suggestions: ['Add a call to action']
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAnalysis,
    });

    const audit = await aiService.auditSEO('Check out this great content', 'marketing', 'LinkedIn');
    expect(audit.score).toBe(92);
    expect(audit.suggestions).toContain('Add a call to action');
  });

  it('handles error response gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Custom API Error' }),
    });

    await expect(aiService.generateContent('Instagram', 'Topic')).rejects.toThrow('Custom API Error');
  });
});
