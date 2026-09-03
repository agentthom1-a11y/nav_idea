import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { 
  initDatabase, 
  fetchAllInitialData, 
  dbSaveContent, 
  dbDeleteContent, 
  dbSaveIdea, 
  dbDeleteIdea, 
  dbSaveComment, 
  dbToggleComment, 
  dbDeleteComment, 
  dbSaveAsset, 
  dbDeleteAsset, 
  dbSaveBrandContext, 
  dbUpdateUser,
  dbSavePillar,
  dbDeletePillar,
  dbSaveCampaign,
  dbDeleteCampaign
} from "./src/db";

dotenv.config();

const DEFAULT_BASE_URL = "https://api.justwoker.icu/v1";
const DEFAULT_API_KEY = "sk-vJ44UylFkTsFwWCN4sHh2TJUjHFEfNPxz248yvMe47dD6hJD";
const DEFAULT_MODEL = "claude-opus-5";

const AI_BASE_URL = process.env.AI_BASE_URL || DEFAULT_BASE_URL;
const AI_API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || DEFAULT_API_KEY;
const AI_MODEL = process.env.AI_MODEL || DEFAULT_MODEL;

export function cleanJsonString(raw: string): string {
  if (!raw) return "";
  let clean = raw.trim();
  
  // Strip markdown code fences if present
  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    clean = fenceMatch[1].trim();
  }
  
  // Try direct parse
  try {
    JSON.parse(clean);
    return clean;
  } catch (e) {
    // Attempt to locate outermost JSON object
    const startObj = clean.indexOf('{');
    const endObj = clean.lastIndexOf('}');
    if (startObj !== -1 && endObj > startObj) {
      const candidate = clean.substring(startObj, endObj + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (err) {}
    }

    // Attempt to locate outermost JSON array
    const startArr = clean.indexOf('[');
    const endArr = clean.lastIndexOf(']');
    if (startArr !== -1 && endArr > startArr) {
      const candidate = clean.substring(startArr, endArr + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (err) {}
    }
  }

  return clean;
}

export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const endpoint = `${AI_BASE_URL.replace(/\/+$/, '')}/chat/completions`;
  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const modelsToTry = [AI_MODEL, "claude-opus-5", "claude-opus-5-thinking"].filter(
    (m, idx, self) => self.indexOf(m) === idx
  );

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error (${response.status}) on model ${model}: ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      if (text) {
        return text.trim();
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI] Attempt with model ${model} failed: ${err.message}. Trying next candidate...`);
    }
  }

  throw lastError || new Error("All AI models failed to return a response.");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });

  const activeUsers = new Map();

  io.on("connection", (socket) => {
    let currentRoom: string | null = null;
    let currentUser: any = null;

    socket.on("join-document", ({ documentId, user }) => {
      if (currentRoom) {
        socket.leave(currentRoom);
        const prevRoomUsers = activeUsers.get(currentRoom);
        if (prevRoomUsers) {
          prevRoomUsers.delete(socket.id);
          io.to(currentRoom).emit("presence-update", Array.from(prevRoomUsers.values()));
        }
      }

      currentRoom = `doc_${documentId}`;
      currentUser = user;
      socket.join(currentRoom);

      if (!activeUsers.has(currentRoom)) {
        activeUsers.set(currentRoom, new Map());
      }
      const roomUsers = activeUsers.get(currentRoom);
      roomUsers.set(socket.id, user);

      io.to(currentRoom).emit("presence-update", Array.from(roomUsers.values()));
    });

    socket.on("edit-content", ({ documentId, updates }) => {
      if (documentId) {
        socket.to(`doc_${documentId}`).emit("content-synced", { documentId, updates });
        socket.broadcast.emit("global-content-updated", { documentId, updates });
      }
    });

    socket.on("add-comment", ({ documentId, comment }) => {
      if (documentId) {
        socket.to(`doc_${documentId}`).emit("comment-synced", comment);
      }
    });

    socket.on("toggle-comment", ({ documentId, commentId }) => {
      if (documentId) {
        socket.to(`doc_${documentId}`).emit("comment-toggled", commentId);
      }
    });

    socket.on("delete-comment", ({ documentId, commentId }) => {
      if (documentId) {
        socket.to(`doc_${documentId}`).emit("comment-deleted", commentId);
      }
    });

    socket.on("add-asset", ({ documentId, asset }) => {
      if (documentId) {
        socket.to(`doc_${documentId}`).emit("asset-synced", asset);
      }
    });

    socket.on("delete-asset", ({ documentId, assetId }) => {
      if (documentId) {
        socket.to(`doc_${documentId}`).emit("asset-deleted", assetId);
      }
    });

    socket.on("global-update", (payload) => {
      socket.broadcast.emit("global-synced", payload);
    });

    socket.on("disconnect", () => {
      if (currentRoom && activeUsers.has(currentRoom)) {
        const roomUsers = activeUsers.get(currentRoom);
        roomUsers.delete(socket.id);
        io.to(currentRoom).emit("presence-update", Array.from(roomUsers.values()));
        if (roomUsers.size === 0) {
          activeUsers.delete(currentRoom);
        }
      }
    });
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const buildContextString = (brandContext: any) => {
    if (!brandContext) return '';
    const { brandName, targetAudience, brandVoice, competitors, additionalContext } = brandContext;
    if (!brandName && !targetAudience && !brandVoice && !competitors && !additionalContext) return '';
    
    let ctx = '\n\n--- BRAND CONTEXT ---\n';
    if (brandName) ctx += `Brand Name: ${brandName}\n`;
    if (targetAudience) ctx += `Target Audience: ${targetAudience}\n`;
    if (brandVoice) ctx += `Brand Voice/Tone: ${brandVoice}\n`;
    if (competitors) ctx += `Competitors: ${competitors}\n`;
    if (additionalContext) ctx += `Additional Context: ${additionalContext}\n`;
    ctx += '---------------------\n\nPlease ensure all generated content aligns strictly with the Brand Context provided above.';
    return ctx;
  };

  // ----------------- AI ENDPOINTS -----------------

  app.post("/api/generate-content", async (req, res) => {
    const { platform = "Instagram", pillar, topic, brandContext, type = "caption", contentType = "Post" } = req.body || {};
    const topicName = topic || pillar || 'growth strategy';

    try {
      let prompt = '';
      let systemPrompt = 'You are a world-class social media strategist and copywriting expert.';

      if (type === 'script') {
        prompt = `You are a professional social media scriptwriter. Generate a complete, ready-to-produce script or slide breakdown for:
Topic: "${topicName}"
Platform: ${platform}
Format: ${contentType}

Requirements:
- If format is Carousel or Story: produce clear slide-by-slide breakdowns (Slide 1 Hook, Slide 2 Insight, Slide 3 Deep Dive, Slide 4 Value, Slide 5 Action Step, Slide 6 CTA).
- If format is Reel, Shorts, or Video: produce timestamped director notes & verbal script ([00:00 - Hook], [00:15 - Core Value], [00:45 - Solution], [01:00 - CTA]).
- If format is Article or Post: produce structured section headings and body copy.
- Make it 100% specific to the topic without fluff.
- Output ONLY the finished script text without introductory or conversational pleasantries.` + buildContextString(brandContext);
      } else {
        prompt = `You are an expert social media manager and conversion copywriter. Generate a high-performing post caption for:
Topic: "${topicName}"
Platform: ${platform}
Format: ${contentType}

Requirements:
- Structure with a scroll-stopping hook in the first line.
- Provide high-value, skimmable body points packed with insights specific to "${topicName}".
- Include a compelling Call-to-Action (CTA).
- Include 8-15 highly relevant, niche-specific hashtags and appropriate emojis.
- Tailor tone and formatting specifically for ${platform}.
- Output ONLY the ready-to-publish caption text without preamble or conversational wrapper.` + buildContextString(brandContext);
      }

      const result = await callAI(prompt, systemPrompt);
      if (result) {
        return res.json({ content: result });
      }
    } catch (error: any) {
      console.warn("[AI] Content generation fallback triggered:", error.message);
    }

    // Dynamic contextual fallback if AI service is temporarily unreachable
    const sanitizedTopic = topicName.replace(/[^\w\s-]/g, '').trim();
    const cleanTags = sanitizedTopic.split(/\s+/).filter((w: string) => w.length > 3).map((w: string) => `#${w.toLowerCase()}`).join(' ');

    let fallbackContent = '';
    if (type === 'script') {
      fallbackContent = `🎬 [00:00 - Hook] Here is everything you need to know about ${topicName}.\n\n[00:15 - The Core Problem] Most people struggle with this because of outdated workflows and unnecessary friction.\n\n[00:35 - Step 1] Simplify the experience — focus on what delivers direct value.\n[00:50 - Step 2] Implement instant feedback loops and clear status visibility.\n[01:10 - Step 3] Automate routine tasks so users save hours each week.\n\n[01:25 - Call to Action] Tap the link in our bio to get started, or share this with someone who needs it today! 🚀`;
    } else {
      fallbackContent = `✨ The game changer for ${topicName} on ${platform}:\n\n1️⃣ Direct accessibility without the traditional waiting friction.\n2️⃣ Verified expert guidance right when you need it.\n3️⃣ Seamless digital flow from start to finish.\n\n💡 Have you experienced the difference yet? Drop your thoughts below!\n\n👇 Save this post for your reference.\n\n#${platform.toLowerCase()} ${cleanTags} #innovation #growth #strategy`;
    }

    res.json({ content: fallbackContent });
  });

  app.post("/api/generate-weekly-plan", async (req, res) => {
    const { platforms = ['Instagram', 'LinkedIn', 'X'], topics = ['Growth', 'Strategy'], startDate = new Date().toISOString(), brandContext } = req.body || {};
    
    try {
      const prompt = `You are a social media director. Create a 7-day content schedule starting from ${startDate} for: ${platforms.join(', ')}.
Topics/Pillars: ${topics.join(', ')}.

Respond ONLY with a valid JSON array of objects representing 7 daily content items. No markdown code fences or conversational text.
Schema:
[
  {
    "title": "High CTR catchy title specifically about the topic",
    "platform": "Platform name",
    "contentType": "Post | Reel | Video | Carousel | Article | Story",
    "publishAt": "ISO date string",
    "caption": "Full post caption with emojis and relevant hashtags"
  }
]` + buildContextString(brandContext);

      const result = await callAI(prompt, "You are a JSON-only API. You output ONLY valid JSON arrays with no markdown or text wrapper.");
      const cleaned = cleanJsonString(result);
      const plan = JSON.parse(cleaned);
      if (Array.isArray(plan) && plan.length > 0) {
        return res.json({ plan });
      }
    } catch (error: any) {
      console.warn("[AI] Weekly plan fallback triggered:", error.message);
    }

    // Dynamic fallback 7-day plan
    const fallbackPlan = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const plat = platforms[i % platforms.length] || 'LinkedIn';
      const top = topics[i % topics.length] || 'Productivity';
      return {
        title: `Day ${i + 1}: Key Framework for ${top}`,
        platform: plat,
        contentType: i % 2 === 0 ? 'Post' : 'Carousel',
        publishAt: d.toISOString(),
        caption: `🔥 Day ${i + 1} Deep Dive on ${top}:\n\nDiscover the actionable strategies top performers use to master ${top}.\n\n📌 Save this to review later!\n\n#${plat.toLowerCase()} #${top.replace(/\s+/g, '').toLowerCase()} #growth #tips`
      };
    });

    res.json({ plan: fallbackPlan });
  });

  app.post("/api/generate-daily-suggestions", async (req, res) => {
    const { platforms = ['Instagram', 'LinkedIn', 'X'], topics = ['Industry Insights', 'Growth Tips'], date = new Date().toISOString(), brandContext } = req.body || {};
    
    try {
      const prompt = `You are an expert social media manager. Generate tailored content post suggestions for date: ${date} across platforms: ${platforms.join(", ")}.
Core Topics: ${topics.join(", ")}.

Respond ONLY with a valid JSON array of objects with schema:
[
  {
    "title": "Short catchy title relevant to the topic",
    "platform": "Exact platform name",
    "contentType": "Post | Reel | Video | Carousel | Article | Shorts | Story",
    "publishAt": "ISO date string",
    "caption": "Full post text with structure and hashtags"
  }
]` + buildContextString(brandContext);

      const result = await callAI(prompt, "You are a JSON-only API. Respond strictly with a valid JSON array.");
      const cleaned = cleanJsonString(result);
      const suggestions = JSON.parse(cleaned);
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return res.json({ suggestions });
      }
    } catch (error: any) {
      console.warn("[AI] Daily suggestions fallback triggered:", error.message);
    }

    const fallbackSuggestions = platforms.map((plat, idx) => {
      const top = topics[idx % topics.length] || 'Industry Insights';
      return {
        title: `Insights: ${top} on ${plat}`,
        platform: plat,
        contentType: plat === 'Instagram' || plat === 'TikTok' ? 'Reel' : 'Post',
        publishAt: new Date(date).toISOString(),
        caption: `💡 How to approach ${top} effectively:\n\n1. Prioritize authentic value and clear communication.\n2. Keep your workflow focused and skimmable.\n3. Measure real engagement.\n\nDouble tap if this resonates! ❤️\n\n#${plat.toLowerCase()} #${top.replace(/\s+/g, '').toLowerCase()} #creators`
      };
    });

    res.json({ suggestions: fallbackSuggestions });
  });

  app.post("/api/generate-all-details", async (req, res) => {
    const { topic = "Content Strategy", platform = "Instagram", contentType = "Reel", brandContext } = req.body || {};
    
    try {
      const prompt = `You are an expert social media director. Generate a complete, ready-to-produce content piece for topic: "${topic}".
Target Platform: ${platform}
Content Type: ${contentType}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "High CTR title specifically relevant to ${topic}",
  "description": "Creative brief with target audience, core goal, and unique angle",
  "script": "Complete outline, slide breakdown, or script text formatted for ${contentType}",
  "caption": "Full social caption with emojis, hook, and relevant hashtags"
}` + buildContextString(brandContext);

      const result = await callAI(prompt, "You are a JSON-only social content producer. You must return ONLY valid JSON without markdown code blocks or text.");
      const cleaned = cleanJsonString(result);
      const details = JSON.parse(cleaned);
      if (details && details.title) {
        return res.json({ details });
      }
    } catch (error: any) {
      console.warn("[AI] Generate all details fallback triggered:", error.message);
    }

    const sanitizedTopic = topic.replace(/[^\w\s-]/g, '').trim();
    const cleanTags = sanitizedTopic.split(/\s+/).filter((w: string) => w.length > 3).map((w: string) => `#${w.toLowerCase()}`).join(' ');

    const fallbackDetails = {
      title: `The Comprehensive Guide to ${topic}`,
      description: `A targeted breakdown for modern audiences and teams. Covers key strategies, best practices, and actionable execution for ${topic}.`,
      script: `[Slide 1 / Hook] What you need to know about ${topic}\n[Slide 2] The common hurdles and why old methods fall short.\n[Slide 3] The 3-part blueprint to get results.\n[Slide 4] Real-world implementation checklist.\n[Slide 5] Save & share this guide!`,
      caption: `💡 Everything you need to know about ${topic}:\n\nHere is the step-by-step breakdown you can implement right away.\n\n👉 Swipe through to see the entire guide!\n\nSave this post so you have it ready when you need it. 📌\n\n#${platform.toLowerCase()} ${cleanTags} #tips #strategy`
    };

    res.json({ details: fallbackDetails });
  });

  app.post("/api/seo-audit", async (req, res) => {
    const { text = "", keywords = "", platform = "Instagram", brandContext } = req.body || {};

    if (text.trim().length > 0) {
      try {
        const prompt = `You are an expert SEO and content readability auditor.
Analyze the following content:
Content: "${text}"
Target Keywords: ${keywords || "None provided"}
Platform: ${platform}

Respond ONLY with a valid JSON object with schema:
{
  "score": 88,
  "readabilityScore": 92,
  "keywordAnalysis": "Analysis of keyword density and search discoverability",
  "readabilityFeedback": "Feedback on reading level, sentence structure, and retention",
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2", "Actionable suggestion 3"]
}` + buildContextString(brandContext);

        const result = await callAI(prompt, "You are a JSON-only SEO and readability analyst. Return ONLY valid JSON.");
        const cleaned = cleanJsonString(result);
        const analysis = JSON.parse(cleaned);
        if (analysis && typeof analysis.score === 'number') {
          return res.json(analysis);
        }
      } catch (error: any) {
        console.warn("[AI] SEO audit fallback triggered:", error.message);
      }
    }

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const keyList = keywords.split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean);
    const keyMatches = keyList.filter((k: string) => text.toLowerCase().includes(k)).length;
    const score = Math.min(95, Math.max(50, 65 + keyMatches * 8 + (words > 25 ? 15 : 5)));
    const readabilityScore = Math.min(96, Math.max(55, 78 + (words < 150 ? 10 : 0)));

    res.json({
      score,
      readabilityScore,
      keywordAnalysis: keyList.length > 0
        ? `Identified ${keyMatches}/${keyList.length} target keywords naturally integrated within the content.`
        : "No specific target keywords supplied. Natural vocabulary provides broad social discoverability.",
      readabilityFeedback: "Pacing is crisp with concise phrasing suitable for fast mobile reading.",
      suggestions: [
        "Strengthen the opening hook to stop users scrolling past.",
        "Include a specific question to encourage engagement in the comments.",
        "Add 3-5 relevant niche hashtags at the end of the post."
      ]
    });
  });

  // ----------------- REAL DATABASE REST ENDPOINTS -----------------
  app.get("/api/initial-data", async (req, res) => {
    try {
      const data = await fetchAllInitialData();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const saved = await dbSaveContent(req.body);
      io.emit("global-content-updated", { documentId: saved.id, updates: saved });
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/content/:id", async (req, res) => {
    try {
      const success = await dbDeleteContent(req.params.id);
      io.emit("global-synced", { type: "content-deleted", id: req.params.id });
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ideas", async (req, res) => {
    try {
      const saved = await dbSaveIdea(req.body);
      io.emit("global-synced", { type: "idea-added", idea: saved });
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/ideas/:id", async (req, res) => {
    try {
      const success = await dbDeleteIdea(req.params.id);
      io.emit("global-synced", { type: "idea-deleted", id: req.params.id });
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const saved = await dbSaveComment(req.body);
      io.to(`doc_${saved.contentId}`).emit("comment-synced", saved);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/comments/:id/resolve", async (req, res) => {
    try {
      const success = await dbToggleComment(req.params.id);
      io.emit("comment-toggled", req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const success = await dbDeleteComment(req.params.id);
      io.emit("comment-deleted", req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const saved = await dbSaveAsset(req.body);
      if (saved.contentId) {
        io.to(`doc_${saved.contentId}`).emit("asset-synced", saved);
      }
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const success = await dbDeleteAsset(req.params.id);
      io.emit("asset-deleted", req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/brand-context", async (req, res) => {
    try {
      const saved = await dbSaveBrandContext(req.body);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/user", async (req, res) => {
    try {
      const updated = await dbUpdateUser(req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pillars", async (req, res) => {
    try {
      const saved = await dbSavePillar(req.body);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/pillars/:id", async (req, res) => {
    try {
      const success = await dbDeletePillar(req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const saved = await dbSaveCampaign(req.body);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const success = await dbDeleteCampaign(req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  await initDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        distPath = __dirname;
      }
    }
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (isNaN(Number(PORT))) {
    httpServer.listen(PORT, () => {
      console.log(`Server running on socket ${PORT}`);
    });
  } else {
    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
