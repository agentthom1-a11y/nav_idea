var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  callAI: () => callAI,
  cleanJsonString: () => cleanJsonString
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_http = __toESM(require("http"), 1);
var import_socket = require("socket.io");
var import_dotenv2 = __toESM(require("dotenv"), 1);

// src/db.ts
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var pool = null;
var isConnected = false;
var inMemoryStore = {
  user: {
    id: "u1",
    name: "Navrine Admin",
    email: "admin@navrine.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Workspace Owner"
  },
  users: [
    {
      id: "u1",
      name: "Navrine Admin",
      email: "admin@navrine.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Workspace Owner"
    },
    {
      id: "u2",
      name: "Editorial Lead",
      email: "editor@navrine.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "Editor"
    }
  ],
  brandContext: {
    brandName: "NAVRINE",
    targetAudience: "Content Creators, Marketers & Growth Teams",
    brandVoice: "Visionary, Sharp & High-Impact",
    competitors: "",
    additionalContext: ""
  },
  pillars: [
    { id: "p1", name: "Education", color: "#3b82f6" },
    { id: "p2", name: "Brand Story", color: "#8b5cf6" },
    { id: "p3", name: "Product Growth", color: "#10b981" },
    { id: "p4", name: "Community", color: "#ec4899" }
  ],
  campaigns: [
    { id: "c1", name: "Q3 Growth Sprint", startDate: (/* @__PURE__ */ new Date()).toISOString(), endDate: new Date(Date.now() + 30 * 864e5).toISOString(), status: "Active", goal: "1M impressions", color: "#6366f1" }
  ],
  contents: [],
  ideas: [],
  comments: [],
  assets: []
};
async function getDbPool() {
  if (pool) return pool;
  try {
    const host = process.env.DB_HOST || "localhost";
    const user = process.env.DB_USER || "u330327941_navidea";
    const password = process.env.DB_PASSWORD || "Navrinefast123.";
    const database = process.env.DB_NAME || "u330327941_navidea";
    const port = Number(process.env.DB_PORT) || 3306;
    pool = import_promise.default.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5e3
    });
    const conn = await pool.getConnection();
    conn.release();
    isConnected = true;
    console.log(`[DB] Successfully connected to MySQL database: ${database}@${host}`);
    return pool;
  } catch (err) {
    console.warn(`[DB] MySQL connection notice: ${err.message}. Operating in resilient live storage mode.`);
    pool = null;
    isConnected = false;
    return null;
  }
}
async function initDatabase() {
  const p = await getDbPool();
  if (!p) return;
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        avatar TEXT,
        role VARCHAR(128),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS brand_context (
        id VARCHAR(32) PRIMARY KEY,
        brand_name VARCHAR(255),
        target_audience TEXT,
        brand_voice TEXT,
        competitors TEXT,
        additional_context TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS content_pillars (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(64)
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date VARCHAR(64),
        end_date VARCHAR(64),
        status VARCHAR(64),
        goal TEXT,
        color VARCHAR(64)
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS contents (
        id VARCHAR(64) PRIMARY KEY,
        title TEXT NOT NULL,
        description LONGTEXT,
        platform VARCHAR(64) NOT NULL,
        content_type VARCHAR(64) NOT NULL,
        status VARCHAR(64) NOT NULL,
        priority VARCHAR(64) NOT NULL,
        owner_id VARCHAR(64),
        pillar_id VARCHAR(64),
        campaign_id VARCHAR(64),
        publish_at VARCHAR(64),
        caption LONGTEXT,
        script LONGTEXT,
        thumbnail TEXT,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        shares INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        engagement INT DEFAULT 0,
        created_at VARCHAR(64),
        updated_at VARCHAR(64)
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS ideas (
        id VARCHAR(64) PRIMARY KEY,
        title TEXT NOT NULL,
        description LONGTEXT,
        platform VARCHAR(64),
        pillar_id VARCHAR(64),
        score INT DEFAULT 75,
        created_by VARCHAR(64),
        created_at VARCHAR(64)
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(64) PRIMARY KEY,
        content_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        text TEXT NOT NULL,
        resolved TINYINT(1) DEFAULT 0,
        created_at VARCHAR(64)
      );
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id VARCHAR(64) PRIMARY KEY,
        content_id VARCHAR(64),
        name VARCHAR(255) NOT NULL,
        url LONGTEXT NOT NULL,
        type VARCHAR(64) NOT NULL,
        size INT DEFAULT 0,
        uploaded_at VARCHAR(64)
      );
    `);
    const [userRows] = await p.query("SELECT COUNT(*) as cnt FROM users");
    if (userRows[0]?.cnt === 0) {
      for (const u of inMemoryStore.users) {
        await p.query(
          "INSERT IGNORE INTO users (id, name, email, avatar, role) VALUES (?, ?, ?, ?, ?)",
          [u.id, u.name, u.email, u.avatar, u.role]
        );
      }
    }
    const [bcRows] = await p.query("SELECT COUNT(*) as cnt FROM brand_context");
    if (bcRows[0]?.cnt === 0) {
      await p.query(
        "INSERT INTO brand_context (id, brand_name, target_audience, brand_voice, competitors, additional_context) VALUES (?, ?, ?, ?, ?, ?)",
        ["default", inMemoryStore.brandContext.brandName, inMemoryStore.brandContext.targetAudience, inMemoryStore.brandContext.brandVoice, "", ""]
      );
    }
    const [pillarRows] = await p.query("SELECT COUNT(*) as cnt FROM content_pillars");
    if (pillarRows[0]?.cnt === 0) {
      for (const pil of inMemoryStore.pillars) {
        await p.query(
          "INSERT IGNORE INTO content_pillars (id, name, color) VALUES (?, ?, ?)",
          [pil.id, pil.name, pil.color]
        );
      }
    }
    const [campRows] = await p.query("SELECT COUNT(*) as cnt FROM campaigns");
    if (campRows[0]?.cnt === 0) {
      for (const cmp of inMemoryStore.campaigns) {
        await p.query(
          "INSERT IGNORE INTO campaigns (id, name, start_date, end_date, status, goal, color) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [cmp.id, cmp.name, cmp.startDate, cmp.endDate, cmp.status, cmp.goal, cmp.color]
        );
      }
    }
    console.log("[DB] Database schema initialized and tables verified.");
  } catch (err) {
    console.error("[DB] Schema initialization error:", err.message);
  }
}
async function fetchAllInitialData() {
  const p = await getDbPool();
  if (!p) {
    return inMemoryStore;
  }
  try {
    const [users] = await p.query("SELECT * FROM users");
    const [brandContextRows] = await p.query("SELECT * FROM brand_context LIMIT 1");
    const [pillars] = await p.query("SELECT * FROM content_pillars");
    const [campaigns] = await p.query("SELECT * FROM campaigns");
    const [contents] = await p.query("SELECT * FROM contents ORDER BY updated_at DESC");
    const [ideas] = await p.query("SELECT * FROM ideas ORDER BY created_at DESC");
    const [comments] = await p.query("SELECT * FROM comments ORDER BY created_at ASC");
    const [assets] = await p.query("SELECT * FROM assets ORDER BY uploaded_at DESC");
    const brandContext = brandContextRows[0] ? {
      brandName: brandContextRows[0].brand_name || "NAVRINE",
      targetAudience: brandContextRows[0].target_audience || "",
      brandVoice: brandContextRows[0].brand_voice || "",
      competitors: brandContextRows[0].competitors || "",
      additionalContext: brandContextRows[0].additional_context || ""
    } : inMemoryStore.brandContext;
    const formattedContents = contents.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      platform: c.platform,
      contentType: c.content_type,
      status: c.status,
      priority: c.priority,
      ownerId: c.owner_id,
      pillarId: c.pillar_id,
      campaignId: c.campaign_id,
      publishAt: c.publish_at,
      caption: c.caption,
      script: c.script,
      thumbnail: c.thumbnail,
      views: c.views || 0,
      likes: c.likes || 0,
      shares: c.shares || 0,
      commentsCount: c.comments_count || 0,
      engagement: c.engagement || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
    const formattedIdeas = ideas.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      platform: i.platform,
      pillarId: i.pillar_id,
      score: i.score,
      createdBy: i.created_by,
      createdAt: i.created_at
    }));
    const formattedComments = comments.map((cm) => ({
      id: cm.id,
      contentId: cm.content_id,
      userId: cm.user_id,
      text: cm.text,
      resolved: Boolean(cm.resolved),
      createdAt: cm.created_at
    }));
    const formattedAssets = assets.map((a) => ({
      id: a.id,
      contentId: a.content_id,
      name: a.name,
      url: a.url,
      type: a.type,
      size: a.size,
      uploadedAt: a.uploaded_at
    }));
    const formattedPillars = pillars.map((pl) => ({
      id: pl.id,
      name: pl.name,
      color: pl.color
    }));
    const formattedCampaigns = campaigns.map((cmp) => ({
      id: cmp.id,
      name: cmp.name,
      startDate: cmp.start_date,
      endDate: cmp.end_date,
      status: cmp.status,
      goal: cmp.goal,
      color: cmp.color
    }));
    return {
      user: users[0] || inMemoryStore.user,
      users: users.length ? users : inMemoryStore.users,
      brandContext,
      pillars: formattedPillars.length ? formattedPillars : inMemoryStore.pillars,
      campaigns: formattedCampaigns.length ? formattedCampaigns : inMemoryStore.campaigns,
      contents: formattedContents,
      ideas: formattedIdeas,
      comments: formattedComments,
      assets: formattedAssets
    };
  } catch (err) {
    console.error("[DB] Fetch initial data error:", err.message);
    return inMemoryStore;
  }
}
async function dbSaveContent(item) {
  const p = await getDbPool();
  if (!p) {
    const idx = inMemoryStore.contents.findIndex((c) => c.id === item.id);
    if (idx >= 0) inMemoryStore.contents[idx] = item;
    else inMemoryStore.contents.unshift(item);
    return item;
  }
  try {
    await p.query(`
      INSERT INTO contents (
        id, title, description, platform, content_type, status, priority,
        owner_id, pillar_id, campaign_id, publish_at, caption, script,
        thumbnail, views, likes, shares, comments_count, engagement, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        platform = VALUES(platform),
        content_type = VALUES(content_type),
        status = VALUES(status),
        priority = VALUES(priority),
        owner_id = VALUES(owner_id),
        pillar_id = VALUES(pillar_id),
        campaign_id = VALUES(campaign_id),
        publish_at = VALUES(publish_at),
        caption = VALUES(caption),
        script = VALUES(script),
        thumbnail = VALUES(thumbnail),
        views = VALUES(views),
        likes = VALUES(likes),
        shares = VALUES(shares),
        comments_count = VALUES(comments_count),
        engagement = VALUES(engagement),
        updated_at = VALUES(updated_at)
    `, [
      item.id,
      item.title || "",
      item.description || "",
      item.platform || "Instagram",
      item.contentType || "Post",
      item.status || "DRAFT",
      item.priority || "MEDIUM",
      item.ownerId || "",
      item.pillarId || null,
      item.campaignId || null,
      item.publishAt || null,
      item.caption || "",
      item.script || "",
      item.thumbnail || null,
      item.views || 0,
      item.likes || 0,
      item.shares || 0,
      item.commentsCount || 0,
      item.engagement || 0,
      item.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      item.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    ]);
    return item;
  } catch (err) {
    console.error("[DB] Save content error:", err.message);
    return item;
  }
}
async function dbDeleteContent(id) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.contents = inMemoryStore.contents.filter((c) => c.id !== id);
    return true;
  }
  try {
    await p.query("DELETE FROM contents WHERE id = ?", [id]);
    await p.query("DELETE FROM comments WHERE content_id = ?", [id]);
    return true;
  } catch (err) {
    console.error("[DB] Delete content error:", err.message);
    return false;
  }
}
async function dbSaveIdea(idea) {
  const p = await getDbPool();
  if (!p) {
    const idx = inMemoryStore.ideas.findIndex((i) => i.id === idea.id);
    if (idx >= 0) inMemoryStore.ideas[idx] = idea;
    else inMemoryStore.ideas.unshift(idea);
    return idea;
  }
  try {
    await p.query(`
      INSERT INTO ideas (id, title, description, platform, pillar_id, score, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        platform = VALUES(platform),
        pillar_id = VALUES(pillar_id),
        score = VALUES(score)
    `, [
      idea.id,
      idea.title || "",
      idea.description || "",
      idea.platform || "Instagram",
      idea.pillarId || null,
      idea.score || 75,
      idea.createdBy || "",
      idea.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    ]);
    return idea;
  } catch (err) {
    console.error("[DB] Save idea error:", err.message);
    return idea;
  }
}
async function dbDeleteIdea(id) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.ideas = inMemoryStore.ideas.filter((i) => i.id !== id);
    return true;
  }
  try {
    await p.query("DELETE FROM ideas WHERE id = ?", [id]);
    return true;
  } catch (err) {
    console.error("[DB] Delete idea error:", err.message);
    return false;
  }
}
async function dbSaveComment(comment) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.comments.push(comment);
    return comment;
  }
  try {
    await p.query(`
      INSERT INTO comments (id, content_id, user_id, text, resolved, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        text = VALUES(text),
        resolved = VALUES(resolved)
    `, [
      comment.id,
      comment.contentId,
      comment.userId,
      comment.text,
      comment.resolved ? 1 : 0,
      comment.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    ]);
    return comment;
  } catch (err) {
    console.error("[DB] Save comment error:", err.message);
    return comment;
  }
}
async function dbToggleComment(id) {
  const p = await getDbPool();
  if (!p) {
    const c = inMemoryStore.comments.find((cm) => cm.id === id);
    if (c) c.resolved = !c.resolved;
    return true;
  }
  try {
    await p.query("UPDATE comments SET resolved = NOT resolved WHERE id = ?", [id]);
    return true;
  } catch (err) {
    console.error("[DB] Toggle comment error:", err.message);
    return false;
  }
}
async function dbDeleteComment(id) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.comments = inMemoryStore.comments.filter((c) => c.id !== id);
    return true;
  }
  try {
    await p.query("DELETE FROM comments WHERE id = ?", [id]);
    return true;
  } catch (err) {
    console.error("[DB] Delete comment error:", err.message);
    return false;
  }
}
async function dbSaveAsset(asset) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.assets.unshift(asset);
    return asset;
  }
  try {
    await p.query(`
      INSERT INTO assets (id, content_id, name, url, type, size, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        content_id = VALUES(content_id),
        name = VALUES(name),
        url = VALUES(url),
        type = VALUES(type),
        size = VALUES(size)
    `, [
      asset.id,
      asset.contentId || null,
      asset.name,
      asset.url,
      asset.type,
      asset.size || 0,
      asset.uploadedAt || (/* @__PURE__ */ new Date()).toISOString()
    ]);
    return asset;
  } catch (err) {
    console.error("[DB] Save asset error:", err.message);
    return asset;
  }
}
async function dbDeleteAsset(id) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.assets = inMemoryStore.assets.filter((a) => a.id !== id);
    return true;
  }
  try {
    await p.query("DELETE FROM assets WHERE id = ?", [id]);
    return true;
  } catch (err) {
    console.error("[DB] Delete asset error:", err.message);
    return false;
  }
}
async function dbSaveBrandContext(context) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.brandContext = { ...inMemoryStore.brandContext, ...context };
    return inMemoryStore.brandContext;
  }
  try {
    await p.query(`
      INSERT INTO brand_context (id, brand_name, target_audience, brand_voice, competitors, additional_context)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        brand_name = VALUES(brand_name),
        target_audience = VALUES(target_audience),
        brand_voice = VALUES(brand_voice),
        competitors = VALUES(competitors),
        additional_context = VALUES(additional_context)
    `, [
      "default",
      context.brandName || "NAVRINE",
      context.targetAudience || "",
      context.brandVoice || "",
      context.competitors || "",
      context.additionalContext || ""
    ]);
    return context;
  } catch (err) {
    console.error("[DB] Save brand context error:", err.message);
    return context;
  }
}
async function dbUpdateUser(updates) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.user = { ...inMemoryStore.user, ...updates };
    return inMemoryStore.user;
  }
  try {
    const id = updates.id || "u1";
    await p.query(`
      INSERT INTO users (id, name, email, avatar, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = COALESCE(VALUES(name), name),
        email = COALESCE(VALUES(email), email),
        avatar = COALESCE(VALUES(avatar), avatar),
        role = COALESCE(VALUES(role), role)
    `, [
      id,
      updates.name || inMemoryStore.user.name,
      updates.email || inMemoryStore.user.email,
      updates.avatar || inMemoryStore.user.avatar,
      updates.role || inMemoryStore.user.role
    ]);
    return updates;
  } catch (err) {
    console.error("[DB] Update user error:", err.message);
    return updates;
  }
}
async function dbSavePillar(pillar) {
  const p = await getDbPool();
  if (!p) {
    const idx = inMemoryStore.pillars.findIndex((pl) => pl.id === pillar.id);
    if (idx >= 0) inMemoryStore.pillars[idx] = pillar;
    else inMemoryStore.pillars.push(pillar);
    return pillar;
  }
  try {
    await p.query(`
      INSERT INTO content_pillars (id, name, color)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        color = VALUES(color)
    `, [pillar.id, pillar.name, pillar.color]);
    return pillar;
  } catch (err) {
    console.error("[DB] Save pillar error:", err.message);
    return pillar;
  }
}
async function dbDeletePillar(id) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.pillars = inMemoryStore.pillars.filter((pl) => pl.id !== id);
    return true;
  }
  try {
    await p.query("DELETE FROM content_pillars WHERE id = ?", [id]);
    return true;
  } catch (err) {
    console.error("[DB] Delete pillar error:", err.message);
    return false;
  }
}
async function dbSaveCampaign(campaign) {
  const p = await getDbPool();
  if (!p) {
    const idx = inMemoryStore.campaigns.findIndex((c) => c.id === campaign.id);
    if (idx >= 0) inMemoryStore.campaigns[idx] = campaign;
    else inMemoryStore.campaigns.push(campaign);
    return campaign;
  }
  try {
    await p.query(`
      INSERT INTO campaigns (id, name, start_date, end_date, status, goal, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date),
        status = VALUES(status),
        goal = VALUES(goal),
        color = VALUES(color)
    `, [campaign.id, campaign.name, campaign.startDate, campaign.endDate, campaign.status, campaign.goal, campaign.color]);
    return campaign;
  } catch (err) {
    console.error("[DB] Save campaign error:", err.message);
    return campaign;
  }
}
async function dbDeleteCampaign(id) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.campaigns = inMemoryStore.campaigns.filter((c) => c.id !== id);
    return true;
  }
  try {
    await p.query("DELETE FROM campaigns WHERE id = ?", [id]);
    return true;
  } catch (err) {
    console.error("[DB] Delete campaign error:", err.message);
    return false;
  }
}

// server.ts
import_dotenv2.default.config();
var DEFAULT_BASE_URL = "https://api.justwoker.icu/v1";
var DEFAULT_API_KEY = "sk-vJ44UylFkTsFwWCN4sHh2TJUjHFEfNPxz248yvMe47dD6hJD";
var DEFAULT_MODEL = "claude-opus-5";
var AI_BASE_URL = process.env.AI_BASE_URL || DEFAULT_BASE_URL;
var AI_API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || DEFAULT_API_KEY;
var AI_MODEL = process.env.AI_MODEL || DEFAULT_MODEL;
function cleanJsonString(raw) {
  if (!raw) return "";
  let clean = raw.trim();
  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    clean = fenceMatch[1].trim();
  }
  try {
    JSON.parse(clean);
    return clean;
  } catch (e) {
    const startObj = clean.indexOf("{");
    const endObj = clean.lastIndexOf("}");
    if (startObj !== -1 && endObj > startObj) {
      const candidate = clean.substring(startObj, endObj + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (err) {
      }
    }
    const startArr = clean.indexOf("[");
    const endArr = clean.lastIndexOf("]");
    if (startArr !== -1 && endArr > startArr) {
      const candidate = clean.substring(startArr, endArr + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch (err) {
      }
    }
  }
  return clean;
}
async function callAI(prompt, systemPrompt) {
  const endpoint = `${AI_BASE_URL.replace(/\/+$/, "")}/chat/completions`;
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });
  const modelsToTry = [AI_MODEL, "claude-opus-5", "claude-opus-5-thinking"].filter(
    (m, idx, self) => self.indexOf(m) === idx
  );
  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1500
        })
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
    } catch (err) {
      lastError = err;
      console.warn(`[AI] Attempt with model ${model} failed: ${err.message}. Trying next candidate...`);
    }
  }
  throw lastError || new Error("All AI models failed to return a response.");
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  const httpServer = import_http.default.createServer(app);
  const io = new import_socket.Server(httpServer, {
    cors: { origin: "*" }
  });
  const activeUsers = /* @__PURE__ */ new Map();
  io.on("connection", (socket) => {
    let currentRoom = null;
    let currentUser = null;
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
        activeUsers.set(currentRoom, /* @__PURE__ */ new Map());
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
  app.use(import_express.default.json());
  app.use(import_express.default.urlencoded({ extended: true }));
  const buildContextString = (brandContext) => {
    if (!brandContext) return "";
    const { brandName, targetAudience, brandVoice, competitors, additionalContext } = brandContext;
    if (!brandName && !targetAudience && !brandVoice && !competitors && !additionalContext) return "";
    let ctx = "\n\n--- BRAND CONTEXT ---\n";
    if (brandName) ctx += `Brand Name: ${brandName}
`;
    if (targetAudience) ctx += `Target Audience: ${targetAudience}
`;
    if (brandVoice) ctx += `Brand Voice/Tone: ${brandVoice}
`;
    if (competitors) ctx += `Competitors: ${competitors}
`;
    if (additionalContext) ctx += `Additional Context: ${additionalContext}
`;
    ctx += "---------------------\n\nPlease ensure all generated content aligns strictly with the Brand Context provided above.";
    return ctx;
  };
  app.post("/api/generate-content", async (req, res) => {
    const { platform = "Instagram", pillar, topic, brandContext, type = "caption", contentType = "Post" } = req.body || {};
    const topicName = topic || pillar || "growth strategy";
    try {
      let prompt = "";
      let systemPrompt = "You are a world-class social media strategist and copywriting expert.";
      if (type === "script") {
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
    } catch (error) {
      console.warn("[AI] Content generation fallback triggered:", error.message);
    }
    const sanitizedTopic = topicName.replace(/[^\w\s-]/g, "").trim();
    const cleanTags = sanitizedTopic.split(/\s+/).filter((w) => w.length > 3).map((w) => `#${w.toLowerCase()}`).join(" ");
    let fallbackContent = "";
    if (type === "script") {
      fallbackContent = `\u{1F3AC} [00:00 - Hook] Here is everything you need to know about ${topicName}.

[00:15 - The Core Problem] Most people struggle with this because of outdated workflows and unnecessary friction.

[00:35 - Step 1] Simplify the experience \u2014 focus on what delivers direct value.
[00:50 - Step 2] Implement instant feedback loops and clear status visibility.
[01:10 - Step 3] Automate routine tasks so users save hours each week.

[01:25 - Call to Action] Tap the link in our bio to get started, or share this with someone who needs it today! \u{1F680}`;
    } else {
      fallbackContent = `\u2728 The game changer for ${topicName} on ${platform}:

1\uFE0F\u20E3 Direct accessibility without the traditional waiting friction.
2\uFE0F\u20E3 Verified expert guidance right when you need it.
3\uFE0F\u20E3 Seamless digital flow from start to finish.

\u{1F4A1} Have you experienced the difference yet? Drop your thoughts below!

\u{1F447} Save this post for your reference.

#${platform.toLowerCase()} ${cleanTags} #innovation #growth #strategy`;
    }
    res.json({ content: fallbackContent });
  });
  app.post("/api/generate-weekly-plan", async (req, res) => {
    const { platforms = ["Instagram", "LinkedIn", "X"], topics = ["Growth", "Strategy"], startDate = (/* @__PURE__ */ new Date()).toISOString(), brandContext } = req.body || {};
    try {
      const prompt = `You are a social media director. Create a 7-day content schedule starting from ${startDate} for: ${platforms.join(", ")}.
Topics/Pillars: ${topics.join(", ")}.

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
    } catch (error) {
      console.warn("[AI] Weekly plan fallback triggered:", error.message);
    }
    const fallbackPlan = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const plat = platforms[i % platforms.length] || "LinkedIn";
      const top = topics[i % topics.length] || "Productivity";
      return {
        title: `Day ${i + 1}: Key Framework for ${top}`,
        platform: plat,
        contentType: i % 2 === 0 ? "Post" : "Carousel",
        publishAt: d.toISOString(),
        caption: `\u{1F525} Day ${i + 1} Deep Dive on ${top}:

Discover the actionable strategies top performers use to master ${top}.

\u{1F4CC} Save this to review later!

#${plat.toLowerCase()} #${top.replace(/\s+/g, "").toLowerCase()} #growth #tips`
      };
    });
    res.json({ plan: fallbackPlan });
  });
  app.post("/api/generate-daily-suggestions", async (req, res) => {
    const { platforms = ["Instagram", "LinkedIn", "X"], topics = ["Industry Insights", "Growth Tips"], date = (/* @__PURE__ */ new Date()).toISOString(), brandContext } = req.body || {};
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
    } catch (error) {
      console.warn("[AI] Daily suggestions fallback triggered:", error.message);
    }
    const fallbackSuggestions = platforms.map((plat, idx) => {
      const top = topics[idx % topics.length] || "Industry Insights";
      return {
        title: `Insights: ${top} on ${plat}`,
        platform: plat,
        contentType: plat === "Instagram" || plat === "TikTok" ? "Reel" : "Post",
        publishAt: new Date(date).toISOString(),
        caption: `\u{1F4A1} How to approach ${top} effectively:

1. Prioritize authentic value and clear communication.
2. Keep your workflow focused and skimmable.
3. Measure real engagement.

Double tap if this resonates! \u2764\uFE0F

#${plat.toLowerCase()} #${top.replace(/\s+/g, "").toLowerCase()} #creators`
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
    } catch (error) {
      console.warn("[AI] Generate all details fallback triggered:", error.message);
    }
    const sanitizedTopic = topic.replace(/[^\w\s-]/g, "").trim();
    const cleanTags = sanitizedTopic.split(/\s+/).filter((w) => w.length > 3).map((w) => `#${w.toLowerCase()}`).join(" ");
    const fallbackDetails = {
      title: `The Comprehensive Guide to ${topic}`,
      description: `A targeted breakdown for modern audiences and teams. Covers key strategies, best practices, and actionable execution for ${topic}.`,
      script: `[Slide 1 / Hook] What you need to know about ${topic}
[Slide 2] The common hurdles and why old methods fall short.
[Slide 3] The 3-part blueprint to get results.
[Slide 4] Real-world implementation checklist.
[Slide 5] Save & share this guide!`,
      caption: `\u{1F4A1} Everything you need to know about ${topic}:

Here is the step-by-step breakdown you can implement right away.

\u{1F449} Swipe through to see the entire guide!

Save this post so you have it ready when you need it. \u{1F4CC}

#${platform.toLowerCase()} ${cleanTags} #tips #strategy`
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
        if (analysis && typeof analysis.score === "number") {
          return res.json(analysis);
        }
      } catch (error) {
        console.warn("[AI] SEO audit fallback triggered:", error.message);
      }
    }
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const keyList = keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
    const keyMatches = keyList.filter((k) => text.toLowerCase().includes(k)).length;
    const score = Math.min(95, Math.max(50, 65 + keyMatches * 8 + (words > 25 ? 15 : 5)));
    const readabilityScore = Math.min(96, Math.max(55, 78 + (words < 150 ? 10 : 0)));
    res.json({
      score,
      readabilityScore,
      keywordAnalysis: keyList.length > 0 ? `Identified ${keyMatches}/${keyList.length} target keywords naturally integrated within the content.` : "No specific target keywords supplied. Natural vocabulary provides broad social discoverability.",
      readabilityFeedback: "Pacing is crisp with concise phrasing suitable for fast mobile reading.",
      suggestions: [
        "Strengthen the opening hook to stop users scrolling past.",
        "Include a specific question to encourage engagement in the comments.",
        "Add 3-5 relevant niche hashtags at the end of the post."
      ]
    });
  });
  app.get("/api/initial-data", async (req, res) => {
    try {
      const data = await fetchAllInitialData();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/content", async (req, res) => {
    try {
      const saved = await dbSaveContent(req.body);
      io.emit("global-content-updated", { documentId: saved.id, updates: saved });
      res.json(saved);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/content/:id", async (req, res) => {
    try {
      const success = await dbDeleteContent(req.params.id);
      io.emit("global-synced", { type: "content-deleted", id: req.params.id });
      res.json({ success });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/ideas", async (req, res) => {
    try {
      const saved = await dbSaveIdea(req.body);
      io.emit("global-synced", { type: "idea-added", idea: saved });
      res.json(saved);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/ideas/:id", async (req, res) => {
    try {
      const success = await dbDeleteIdea(req.params.id);
      io.emit("global-synced", { type: "idea-deleted", id: req.params.id });
      res.json({ success });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/comments", async (req, res) => {
    try {
      const saved = await dbSaveComment(req.body);
      io.to(`doc_${saved.contentId}`).emit("comment-synced", saved);
      res.json(saved);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/comments/:id/resolve", async (req, res) => {
    try {
      const success = await dbToggleComment(req.params.id);
      io.emit("comment-toggled", req.params.id);
      res.json({ success });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const success = await dbDeleteComment(req.params.id);
      io.emit("comment-deleted", req.params.id);
      res.json({ success });
    } catch (e) {
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
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const success = await dbDeleteAsset(req.params.id);
      io.emit("asset-deleted", req.params.id);
      res.json({ success });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/brand-context", async (req, res) => {
    try {
      const saved = await dbSaveBrandContext(req.body);
      res.json(saved);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/user", async (req, res) => {
    try {
      const updated = await dbUpdateUser(req.body);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/pillars", async (req, res) => {
    try {
      const saved = await dbSavePillar(req.body);
      res.json(saved);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/pillars/:id", async (req, res) => {
    try {
      const success = await dbDeletePillar(req.params.id);
      res.json({ success });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/campaigns", async (req, res) => {
    try {
      const saved = await dbSaveCampaign(req.body);
      res.json(saved);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const success = await dbDeleteCampaign(req.params.id);
      res.json({ success });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  await initDatabase();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    let distPath = import_path.default.join(process.cwd(), "dist");
    if (!import_fs.default.existsSync(import_path.default.join(distPath, "index.html"))) {
      if (import_fs.default.existsSync(import_path.default.join(__dirname, "index.html"))) {
        distPath = __dirname;
      }
    }
    app.use(import_express.default.static(distPath));
    app.use((req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  callAI,
  cleanJsonString
});
//# sourceMappingURL=server.cjs.map
