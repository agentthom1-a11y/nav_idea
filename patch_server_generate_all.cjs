const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const newEndpoint = `
  app.post("/api/generate-all-details", async (req, res) => {
    try {
      const { topic, platform, contentType } = req.body;
      
      const prompt = \`You are an expert social media manager and content creator.
The user wants to generate a complete content plan based on the following topic or rough idea: "\${topic}".
Target Platform: \${platform || "Any appropriate platform"}
Content Type: \${contentType || "Any appropriate format"}

Requirements:
1. Search the web for current news, trends, and accurate information related to this topic.
2. Ensure all generated data is valid, factual, and highly engaging.
3. Generate a complete set of details for this content piece.

Respond ONLY with a valid JSON object representing the generated content details. Do not include markdown code blocks like \\\`\\\`\\\`json.
The JSON object must have this exact schema:
{
  "title": "A catchy, optimized title for internal tracking and the post itself",
  "description": "A detailed content brief (what the content is about, key points, goals, call to action)",
  "script": "A detailed script or outline if it's a video/audio, or a longer format body structure",
  "caption": "The actual post caption optimized for the platform, including emojis and hashtags"
}\`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
        }
      });

      const details = JSON.parse(response.text || "{}");
      res.json({ details });
    } catch (error) {
      console.error("Gemini API error (Generate All):", error);
      res.status(500).json({ error: error.message || "Failed to generate all details" });
    }
  });
`;

if (!content.includes("/api/generate-all-details")) {
  content = content.replace('app.post("/api/seo-audit"', newEndpoint + '\n  app.post("/api/seo-audit"');
  fs.writeFileSync(file, content);
  console.log('Patched server.ts with /api/generate-all-details');
} else {
  console.log('Endpoint already exists');
}
