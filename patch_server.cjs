const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const helper = `
const buildContextString = (brandContext: any) => {
  if (!brandContext) return '';
  const { brandName, targetAudience, brandVoice, competitors, additionalContext } = brandContext;
  if (!brandName && !targetAudience && !brandVoice && !competitors && !additionalContext) return '';
  
  let ctx = '\\n\\n--- BRAND CONTEXT ---\\n';
  if (brandName) ctx += \`Brand Name: \${brandName}\\n\`;
  if (targetAudience) ctx += \`Target Audience: \${targetAudience}\\n\`;
  if (brandVoice) ctx += \`Brand Voice/Tone: \${brandVoice}\\n\`;
  if (competitors) ctx += \`Competitors: \${competitors}\\n\`;
  if (additionalContext) ctx += \`Additional Context: \${additionalContext}\\n\`;
  ctx += '---------------------\\n\\nPlease ensure all generated content aligns strictly with the Brand Context provided above.';
  return ctx;
};
`;

if (!server.includes('buildContextString')) {
  server = server.replace('app.use(express.json());', 'app.use(express.json());\n' + helper);
}

// 1. generate-content
server = server.replace(
  'const { platform, pillar, topic } = req.body;',
  'const { platform, pillar, topic, brandContext } = req.body;'
);
server = server.replace(
  '-- Output ONLY the post content, no extra markdown or pleasantries.`;',
  '-- Output ONLY the post content, no extra markdown or pleasantries.` + buildContextString(brandContext);'
);

// 2. generate-weekly-plan
server = server.replace(
  'const { platforms, topics, startDate } = req.body;',
  'const { platforms, topics, startDate, brandContext } = req.body;'
);
server = server.replace(
  '  "caption": "The full post text, including hashtags and structure appropriate for the platform"\n}`;',
  '  "caption": "The full post text, including hashtags and structure appropriate for the platform"\n}` + buildContextString(brandContext);'
);

// 3. generate-daily-suggestions
server = server.replace(
  'const { platforms, topics, date } = req.body;',
  'const { platforms, topics, date, brandContext } = req.body;'
);
server = server.replace(
  '  "caption": "The full post text, including hashtags and structure appropriate for the platform"\n}`;',
  '  "caption": "The full post text, including hashtags and structure appropriate for the platform"\n}` + buildContextString(brandContext);'
);

// 4. generate-all-details
server = server.replace(
  'const { topic, platform, contentType } = req.body;',
  'const { topic, platform, contentType, brandContext } = req.body;'
);
server = server.replace(
  '  "caption": "The actual post caption optimized for the platform, including emojis and hashtags"\n}`;',
  '  "caption": "The actual post caption optimized for the platform, including emojis and hashtags"\n}` + buildContextString(brandContext);'
);

// 5. seo-audit
server = server.replace(
  'const { text, keywords, platform } = req.body;',
  'const { text, keywords, platform, brandContext } = req.body;'
);
server = server.replace(
  '  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]\n}`;',
  '  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]\n}` + buildContextString(brandContext);'
);

fs.writeFileSync('server.ts', server);
console.log('Server patched');
