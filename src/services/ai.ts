
export interface SeoAnalysis {
  score: number;
  readabilityScore: number;
  keywordAnalysis: string;
  readabilityFeedback: string;
  suggestions: string[];
}
export interface DailySuggestion {
  title: string;
  platform: string;
  contentType: string;
  publishAt: string;
  caption: string;
}

export const aiService = {
  async generateDailySuggestions(platforms: string[], topics: string[], date?: string, brandContext?: any): Promise<DailySuggestion[]> {
    const response = await fetch('/api/generate-daily-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platforms, topics, date, brandContext }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate daily suggestions');
    }

    const data = await response.json();
    return data.suggestions || [];
  },

  async generateContent(platform: string, pillar: string, topic?: string): Promise<string> {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, pillar, topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data.content || '';
  },

  async generateWeeklyPlan(platforms: string[], topics: string[], startDate: string, brandContext?: any): Promise<any[]> {
    const response = await fetch('/api/generate-weekly-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platforms, topics, startDate, brandContext }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate weekly plan');
    }

    const data = await response.json();
    return data.plan || [];
  },

  async generateAllDetails(platform?: string, contentType?: string, topic?: string, brandContext?: any): Promise<{ title?: string; description?: string; script?: string; caption?: string }> {
    const response = await fetch('/api/generate-all-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, contentType, topic, brandContext }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate all details');
    }

    const data = await response.json();
    return data.details || {};
  },

  async auditSEO(text: string, keywords: string, platform: string, brandContext?: any): Promise<SeoAnalysis> {
    const response = await fetch('/api/seo-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, keywords, platform, brandContext }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze SEO');
    }

    return await response.json();
  }
};

