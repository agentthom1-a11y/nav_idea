const fs = require('fs');
const file = 'src/services/ai.ts';
let content = fs.readFileSync(file, 'utf8');

const interfaceToAdd = `
export interface SeoAnalysis {
  score: number;
  readabilityScore: number;
  keywordAnalysis: string;
  readabilityFeedback: string;
  suggestions: string[];
}
`;

const functionToAdd = `
  async auditSEO(text: string, keywords: string, platform: string): Promise<SeoAnalysis> {
    const response = await fetch('/api/seo-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, keywords, platform }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze SEO');
    }

    return await response.json();
  }
};
`;

content = interfaceToAdd + content.replace('};', functionToAdd);
fs.writeFileSync(file, content);
console.log('ai.ts patched');
