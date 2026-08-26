import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { ContentItem, Idea, Comment, Asset, BrandContext, User, ContentPillar, Campaign } from './types';

dotenv.config();

let pool: mysql.Pool | null = null;
let isConnected = false;

// Fallback in-memory store if DB is offline or in test mode
const inMemoryStore = {
  user: {
    id: 'u1',
    name: 'Navrine User',
    email: 'admin@navrine.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Content Strategist'
  } as User,
  users: [
    {
      id: 'u1',
      name: 'Navrine User',
      email: 'admin@navrine.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Content Strategist'
    }
  ] as User[],
  brandContext: {
    brandName: 'NAVRINE',
    targetAudience: 'Content Creators, Marketers & Growth Teams',
    brandVoice: 'Visionary, Sharp & High-Impact',
    competitors: '',
    additionalContext: ''
  } as BrandContext,
  pillars: [
    { id: 'p1', name: 'Education', color: '#3b82f6' },
    { id: 'p2', name: 'Brand Story', color: '#8b5cf6' },
    { id: 'p3', name: 'Product Growth', color: '#10b981' },
    { id: 'p4', name: 'Community', color: '#ec4899' }
  ] as ContentPillar[],
  campaigns: [] as Campaign[],
  contents: [] as ContentItem[],
  ideas: [] as Idea[],
  comments: [] as Comment[],
  assets: [] as Asset[]
};

export async function getDbPool(): Promise<mysql.Pool | null> {
  if (pool) return pool;

  try {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'u330327941_navidea';
    const password = process.env.DB_PASSWORD || 'Navrinefast123.';
    const database = process.env.DB_NAME || 'u330327941_navidea';
    const port = Number(process.env.DB_PORT) || 3306;

    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000
    });

    const conn = await pool.getConnection();
    conn.release();
    isConnected = true;
    console.log(`[DB] Successfully connected to MySQL database: ${database}@${host}`);
    return pool;
  } catch (err: any) {
    console.warn(`[DB] MySQL connection notice: ${err.message}. Operating in resilient live storage mode.`);
    pool = null;
    isConnected = false;
    return null;
  }
}

export async function initDatabase() {
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
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        shares INT DEFAULT 0,
        comments_count INT DEFAULT 0,
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

    // Insert default user if not exists
    const [userRows]: any = await p.query('SELECT COUNT(*) as cnt FROM users');
    if (userRows[0]?.cnt === 0) {
      await p.query(
        'INSERT INTO users (id, name, email, avatar, role) VALUES (?, ?, ?, ?, ?)',
        [inMemoryStore.user.id, inMemoryStore.user.name, inMemoryStore.user.email, inMemoryStore.user.avatar, inMemoryStore.user.role]
      );
    }

    // Insert default brand context if not exists
    const [bcRows]: any = await p.query('SELECT COUNT(*) as cnt FROM brand_context');
    if (bcRows[0]?.cnt === 0) {
      await p.query(
        'INSERT INTO brand_context (id, brand_name, target_audience, brand_voice, competitors, additional_context) VALUES (?, ?, ?, ?, ?, ?)',
        ['default', inMemoryStore.brandContext.brandName, inMemoryStore.brandContext.targetAudience, inMemoryStore.brandContext.brandVoice, '', '']
      );
    }

    console.log('[DB] Database schema initialized and tables verified.');
  } catch (err: any) {
    console.error('[DB] Schema initialization error:', err.message);
  }
}

// ----------------- CRUD DB OPERATIONS -----------------

export async function fetchAllInitialData() {
  const p = await getDbPool();
  if (!p) {
    return inMemoryStore;
  }

  try {
    const [users]: any = await p.query('SELECT * FROM users');
    const [brandContextRows]: any = await p.query('SELECT * FROM brand_context LIMIT 1');
    const [pillars]: any = await p.query('SELECT * FROM content_pillars');
    const [campaigns]: any = await p.query('SELECT * FROM campaigns');
    const [contents]: any = await p.query('SELECT * FROM contents ORDER BY updated_at DESC');
    const [ideas]: any = await p.query('SELECT * FROM ideas ORDER BY created_at DESC');
    const [comments]: any = await p.query('SELECT * FROM comments ORDER BY created_at ASC');
    const [assets]: any = await p.query('SELECT * FROM assets ORDER BY uploaded_at DESC');

    const brandContext: BrandContext = brandContextRows[0] ? {
      brandName: brandContextRows[0].brand_name || 'NAVRINE',
      targetAudience: brandContextRows[0].target_audience || '',
      brandVoice: brandContextRows[0].brand_voice || '',
      competitors: brandContextRows[0].competitors || '',
      additionalContext: brandContextRows[0].additional_context || ''
    } : inMemoryStore.brandContext;

    const formattedContents: ContentItem[] = contents.map((c: any) => ({
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
      views: c.views,
      likes: c.likes,
      shares: c.shares,
      commentsCount: c.comments_count,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));

    const formattedIdeas: Idea[] = ideas.map((i: any) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      platform: i.platform,
      score: i.score,
      createdBy: i.created_by,
      createdAt: i.created_at
    }));

    const formattedComments: Comment[] = comments.map((cm: any) => ({
      id: cm.id,
      contentId: cm.content_id,
      userId: cm.user_id,
      text: cm.text,
      resolved: Boolean(cm.resolved),
      createdAt: cm.created_at
    }));

    const formattedAssets: Asset[] = assets.map((a: any) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      type: a.type,
      size: a.size,
      uploadedAt: a.uploaded_at
    }));

    return {
      user: users[0] || inMemoryStore.user,
      users: users.length ? users : inMemoryStore.users,
      brandContext,
      pillars: pillars.length ? pillars : inMemoryStore.pillars,
      campaigns: campaigns.length ? campaigns : inMemoryStore.campaigns,
      contents: formattedContents,
      ideas: formattedIdeas,
      comments: formattedComments,
      assets: formattedAssets
    };
  } catch (err: any) {
    console.error('[DB] Fetch initial data error:', err.message);
    return inMemoryStore;
  }
}

export async function dbSaveContent(item: ContentItem) {
  const p = await getDbPool();
  if (!p) {
    const idx = inMemoryStore.contents.findIndex(c => c.id === item.id);
    if (idx >= 0) inMemoryStore.contents[idx] = item;
    else inMemoryStore.contents.unshift(item);
    return item;
  }

  try {
    await p.query(`
      INSERT INTO contents (
        id, title, description, platform, content_type, status, priority,
        owner_id, pillar_id, campaign_id, publish_at, caption, script,
        views, likes, shares, comments_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        views = VALUES(views),
        likes = VALUES(likes),
        shares = VALUES(shares),
        comments_count = VALUES(comments_count),
        updated_at = VALUES(updated_at)
    `, [
      item.id,
      item.title || '',
      item.description || '',
      item.platform || 'Instagram',
      item.contentType || 'Post',
      item.status || 'DRAFT',
      item.priority || 'MEDIUM',
      item.ownerId || '',
      item.pillarId || null,
      item.campaignId || null,
      item.publishAt || null,
      item.caption || '',
      item.script || '',
      item.views || 0,
      item.likes || 0,
      item.shares || 0,
      item.commentsCount || 0,
      item.createdAt || new Date().toISOString(),
      item.updatedAt || new Date().toISOString()
    ]);
    return item;
  } catch (err: any) {
    console.error('[DB] Save content error:', err.message);
    return item;
  }
}

export async function dbDeleteContent(id: string) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.contents = inMemoryStore.contents.filter(c => c.id !== id);
    return true;
  }

  try {
    await p.query('DELETE FROM contents WHERE id = ?', [id]);
    await p.query('DELETE FROM comments WHERE content_id = ?', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB] Delete content error:', err.message);
    return false;
  }
}

export async function dbSaveIdea(idea: Idea) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.ideas.unshift(idea);
    return idea;
  }

  try {
    await p.query(`
      INSERT INTO ideas (id, title, description, platform, score, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        platform = VALUES(platform),
        score = VALUES(score)
    `, [
      idea.id,
      idea.title || '',
      idea.description || '',
      idea.platform || 'Instagram',
      idea.score || 75,
      idea.createdBy || '',
      idea.createdAt || new Date().toISOString()
    ]);
    return idea;
  } catch (err: any) {
    console.error('[DB] Save idea error:', err.message);
    return idea;
  }
}

export async function dbDeleteIdea(id: string) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.ideas = inMemoryStore.ideas.filter(i => i.id !== id);
    return true;
  }

  try {
    await p.query('DELETE FROM ideas WHERE id = ?', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB] Delete idea error:', err.message);
    return false;
  }
}

export async function dbSaveComment(comment: Comment) {
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
      comment.createdAt || new Date().toISOString()
    ]);
    return comment;
  } catch (err: any) {
    console.error('[DB] Save comment error:', err.message);
    return comment;
  }
}

export async function dbToggleComment(id: string) {
  const p = await getDbPool();
  if (!p) {
    const c = inMemoryStore.comments.find(cm => cm.id === id);
    if (c) c.resolved = !c.resolved;
    return true;
  }

  try {
    await p.query('UPDATE comments SET resolved = NOT resolved WHERE id = ?', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB] Toggle comment error:', err.message);
    return false;
  }
}

export async function dbDeleteComment(id: string) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.comments = inMemoryStore.comments.filter(c => c.id !== id);
    return true;
  }

  try {
    await p.query('DELETE FROM comments WHERE id = ?', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB] Delete comment error:', err.message);
    return false;
  }
}

export async function dbSaveAsset(asset: Asset) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.assets.unshift(asset);
    return asset;
  }

  try {
    await p.query(`
      INSERT INTO assets (id, name, url, type, size, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        url = VALUES(url),
        type = VALUES(type),
        size = VALUES(size)
    `, [
      asset.id,
      asset.name,
      asset.url,
      asset.type,
      asset.size || 0,
      asset.uploadedAt || new Date().toISOString()
    ]);
    return asset;
  } catch (err: any) {
    console.error('[DB] Save asset error:', err.message);
    return asset;
  }
}

export async function dbDeleteAsset(id: string) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.assets = inMemoryStore.assets.filter(a => a.id !== id);
    return true;
  }

  try {
    await p.query('DELETE FROM assets WHERE id = ?', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB] Delete asset error:', err.message);
    return false;
  }
}

export async function dbSaveBrandContext(context: Partial<BrandContext>) {
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
      'default',
      context.brandName || 'NAVRINE',
      context.targetAudience || '',
      context.brandVoice || '',
      context.competitors || '',
      context.additionalContext || ''
    ]);
    return context;
  } catch (err: any) {
    console.error('[DB] Save brand context error:', err.message);
    return context;
  }
}

export async function dbUpdateUser(updates: Partial<User>) {
  const p = await getDbPool();
  if (!p) {
    inMemoryStore.user = { ...inMemoryStore.user, ...updates };
    return inMemoryStore.user;
  }

  try {
    const id = updates.id || 'u1';
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
  } catch (err: any) {
    console.error('[DB] Update user error:', err.message);
    return updates;
  }
}
