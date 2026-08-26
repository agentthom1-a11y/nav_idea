const fs = require('fs');

let aiService = fs.readFileSync('src/services/ai.ts', 'utf8');

aiService = aiService.replace(
  "async generateDailySuggestions(platforms: string[], topics: string[], date?: string)",
  "async generateDailySuggestions(platforms: string[], topics: string[], date?: string, brandContext?: any)"
);
aiService = aiService.replace(
  "body: JSON.stringify({ platforms, topics, date }),",
  "body: JSON.stringify({ platforms, topics, date, brandContext }),"
);

aiService = aiService.replace(
  "async generateWeeklyPlan(platforms: string[], topics: string[], startDate: string)",
  "async generateWeeklyPlan(platforms: string[], topics: string[], startDate: string, brandContext?: any)"
);
aiService = aiService.replace(
  "body: JSON.stringify({ platforms, topics, startDate }),",
  "body: JSON.stringify({ platforms, topics, startDate, brandContext }),"
);

fs.writeFileSync('src/services/ai.ts', aiService);
