import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ContentItem, Status, Priority, Platform, ContentType, Comment, Asset } from '../types';
import { PLATFORM_COLORS, STATUS_COLORS, cn, formatFriendlyDate, generateId, formatTimeAgo } from '../lib/utils';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Activity, 
  Target, 
  Plus, 
  Trash2, 
  Video, 
  FileText, 
  ExternalLink, 
  Check, 
  Send
} from 'lucide-react';
import { aiService, SeoAnalysis } from '../services/ai';
import { io } from 'socket.io-client';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ReadabilityRing } from '../components/ReadabilityRing';

const TABS = ['Overview', 'Brief', 'Script', 'Assets', 'Caption', 'Review', 'SEO'];

export default function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    content, 
    updateContent, 
    addContent, 
    currentUser, 
    brandContext,
    pillars,
    campaigns,
    users,
    comments,
    addComment,
    toggleResolveComment,
    deleteComment,
    assets,
    addAsset,
    deleteAsset
  } = useStore();
  
  const isNew = id === 'new';
  const existingItem = content.find(c => c.id === id);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [item, setItem] = useState<Partial<ContentItem>>(
    existingItem || {
      title: '',
      platform: 'Instagram',
      contentType: 'Reel',
      status: 'DRAFT',
      priority: 'MEDIUM',
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // New comment input
  const [commentText, setCommentText] = useState('');

  // New asset form
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetType, setNewAssetType] = useState<'image' | 'video' | 'document'>('image');
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    brandTone: false,
    mediaReady: false,
    linksTested: false,
    proofread: false,
    seoOptimized: false,
  });

  const [activeCollaborators, setActiveCollaborators] = useState<User[]>([]);

  // Filter comments for this content item
  const itemComments = useMemo(() => {
    return comments.filter(c => c.contentId === id);
  }, [comments, id]);

  const realTimeSeo = useMemo(() => {
    const text = ((item.script || '') + ' ' + (item.caption || '') + ' ' + (item.description || '')).trim();
    if (!text) return { readability: 0, words: 0, sentences: 0, keywords: [] };
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let syllables = 0;
    words.forEach(word => {
      const wordLower = word.toLowerCase();
      const match = wordLower.match(/[aeiouy]{1,2}/g);
      let count = match ? match.length : 1;
      if (wordLower.endsWith('e') && count > 1) count--;
      syllables += count;
    });

    const wps = sentences.length ? words.length / sentences.length : 0;
    const spw = words.length ? syllables / words.length : 0;
    const readabilityScore = Math.max(0, Math.min(100, Math.round(206.835 - (1.015 * wps) - (84.6 * spw))));

    let keywordDensities: { keyword: string; count: number; density: number }[] = [];
    if (seoKeywords) {
      const targetKeys = seoKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
      const textLower = text.toLowerCase();
      keywordDensities = targetKeys.map(kw => {
        const escapedKw = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const count = (textLower.match(new RegExp('\\b' + escapedKw + '\\b', 'g')) || []).length;
        const density = words.length ? parseFloat(((count / words.length) * 100).toFixed(1)) : 0;
        return { keyword: kw, count, density };
      });
    }

    return { readability: readabilityScore, words: words.length, sentences: sentences.length, keywords: keywordDensities };
  }, [item.script, item.caption, item.description, seoKeywords]);

  useEffect(() => {
    if (!id || id === 'new') return;

    try {
      const socket = io({ transports: ['websocket', 'polling'], autoConnect: true });

      socket.on('connect', () => {
        socket.emit('join-document', { documentId: id, user: currentUser });
      });

      socket.on('presence-update', (presenceUsers: User[]) => {
        const uniqueUsers = Array.from(new Map(presenceUsers.map(u => [u.id, u])).values());
        setActiveCollaborators(uniqueUsers.filter(u => u.id !== currentUser.id));
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      // Safe fallback when socket.io server is unreachable
    }
  }, [id, currentUser]);

  const handleSeoAudit = async () => {
    const textToAnalyze = ((item.script || '') + ' ' + (item.caption || '')).trim();
    if (!textToAnalyze) {
      alert("Please provide some script or caption content first.");
      return;
    }
    setIsAuditing(true);
    try {
      const result = await aiService.auditSEO(textToAnalyze, seoKeywords, item.platform || 'General', brandContext);
      setSeoAnalysis(result);
    } catch (error: any) {
      console.error("Failed to run SEO audit", error);
      alert(error.message || "Failed to run SEO audit. Please try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSave = () => {
    if (isNew) {
      const newItem = { 
        ...item, 
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ContentItem;
      addContent(newItem);
      navigate(`/content/${newItem.id}`, { replace: true });
    } else {
      updateContent(item.id as string, { ...item, updatedAt: new Date().toISOString() });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }
  };

  const handleStatusChange = (status: Status) => {
    setItem(prev => ({ ...prev, status }));
    if (item.id && !isNew) {
      updateContent(item.id, { status });
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: generateId(),
      contentId: item.id || id || 'new',
      userId: currentUser.id,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
      resolved: false
    };
    addComment(newComment);
    setCommentText('');
  };

  const handleAddAsset = () => {
    if (!newAssetName.trim() || !newAssetUrl.trim()) return;
    const newAsset: Asset = {
      id: generateId(),
      name: newAssetName.trim(),
      url: newAssetUrl.trim(),
      type: newAssetType,
      size: 1024 * 500,
      uploadedAt: new Date().toISOString()
    };
    addAsset(newAsset);
    setNewAssetName('');
    setNewAssetUrl('');
    setShowAssetModal(false);
  };

  const generateAllWithAI = async () => {
    if (!item.title && !item.description) {
      alert("Please provide at least a rough topic, title, or idea in the Title or Overview description.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const topic = `${item.title || ''} ${item.description || ''}`.trim();
      const details = await aiService.generateAllDetails(item.platform, item.contentType, topic, brandContext);
      
      if (details) {
        setItem(prev => ({ 
          ...prev, 
          title: details.title || prev.title,
          description: details.description || prev.description,
          script: details.script || prev.script,
          caption: details.caption || prev.caption
        }));
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 2500);
      }
    } catch (error: any) {
      console.error("Failed to generate all details", error);
      alert(error.message || "Failed to generate details. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithAI = async (field: 'script' | 'caption') => {
    if (!item.title && !item.description) {
      alert("Please provide a title or description first.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const contentText = await aiService.generateContent(
        item.platform || 'Instagram',
        item.description || item.title || '',
        item.title
      );
      if (contentText) {
        setItem(prev => ({ ...prev, [field]: contentText }));
      }
    } catch (error: any) {
      console.error("Failed to generate content", error);
      alert(error.message || "Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleChecklist = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-slate-950 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/content')}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className={cn("text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider", PLATFORM_COLORS[item.platform || 'Instagram'] || "bg-slate-100 text-slate-700")}>
              {item.platform} {item.contentType}
            </span>
            <input 
              type="text" 
              value={item.title || ''}
              onChange={(e) => setItem({...item, title: e.target.value})}
              placeholder="Content Title..."
              className="font-bold text-xl bg-transparent outline-none border-none focus:ring-0 w-64 md:w-96 placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {activeCollaborators.length > 0 && (
            <div className="flex items-center -space-x-2 mr-2">
              {activeCollaborators.map(collaborator => (
                <div 
                  key={collaborator.id} 
                  className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-950 flex items-center justify-center text-indigo-700 font-bold text-xs relative group z-20"
                >
                  {collaborator.avatar ? (
                    <img src={collaborator.avatar} alt={collaborator.name} className="w-full h-full rounded-full" />
                  ) : (
                    collaborator.name.charAt(0)
                  )}
                  <div className="absolute top-10 right-0 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                    {collaborator.name} is here
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-sm text-slate-500 hidden sm:block">
            {saveToast ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved
              </span>
            ) : isNew ? (
              'Not saved'
            ) : (
              `Saved ${formatTimeAgo(item.updatedAt || new Date().toISOString())}`
            )}
          </div>
          
          <button 
            onClick={generateAllWithAI}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-2 rounded-md font-medium hover:bg-blue-600/20 transition-colors border border-blue-600/20 shadow-sm disabled:opacity-50"
            title="Auto-generate complete content details and brief based on title"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : 'Magic Generate'}
          </button>
          
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-md font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-6 px-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pt-2 shrink-0 overflow-x-auto hide-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab 
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" 
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <div className="max-w-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform</label>
                    <select 
                      value={item.platform}
                      onChange={(e) => setItem({...item, platform: e.target.value as Platform})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="X">X (Twitter)</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Newsletter">Newsletter</option>
                      <option value="Blog">Blog</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Format</label>
                    <select 
                      value={item.contentType}
                      onChange={(e) => setItem({...item, contentType: e.target.value as ContentType})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Reel">Reel</option>
                      <option value="Post">Post</option>
                      <option value="Carousel">Carousel</option>
                      <option value="Article">Article</option>
                      <option value="Video">Video</option>
                      <option value="Shorts">Shorts</option>
                      <option value="Story">Story</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                    <select 
                      value={item.priority || 'MEDIUM'}
                      onChange={(e) => setItem({...item, priority: e.target.value as Priority})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Publish Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={item.publishAt ? item.publishAt.substring(0, 16) : ''}
                      onChange={(e) => setItem({...item, publishAt: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content Pillar</label>
                    <select 
                      value={item.pillarId || ''}
                      onChange={(e) => setItem({...item, pillarId: e.target.value || undefined})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None / General</option>
                      {pillars.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Campaign</label>
                    <select 
                      value={item.campaignId || ''}
                      onChange={(e) => setItem({...item, campaignId: e.target.value || undefined})}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Campaign</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Topic / Core Summary</label>
                  <textarea 
                    value={item.description || ''}
                    onChange={(e) => setItem({...item, description: e.target.value})}
                    placeholder="Brief description of this content (e.g. 5 quick tips to boost engagement)..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* BRIEF TAB */}
            {activeTab === 'Brief' && (
              <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Content Creative Brief</h3>
                    <p className="text-sm text-slate-500">Define the objective, target audience, and key messaging pillars.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Audience</label>
                    <input 
                      type="text" 
                      defaultValue={brandContext.targetAudience || 'Creators & Tech Founders'}
                      placeholder="e.g. Founders, Marketers, Gen-Z Creators"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Message & Takeaway</label>
                    <textarea 
                      value={item.description || ''}
                      onChange={(e) => setItem({...item, description: e.target.value})}
                      placeholder="What is the single most important message the audience should remember?"
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Call to Action (CTA)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Follow for more, Link in bio, Comment 'AI' below"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tone of Voice</label>
                      <input 
                        type="text" 
                        defaultValue={brandContext.brandVoice || 'Engaging, Authoritative, Actionable'}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-3 mt-4">
                    <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Need inspiration?</p>
                      <p className="text-xs text-slate-500 mt-1">Use the "Magic Generate" button at the top header to auto-research trending angles and draft this entire piece.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCRIPT TAB */}
            {activeTab === 'Script' && (
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Script & Outline Editor</h3>
                    <p className="text-sm text-slate-500">Draft full video scripts, carousel slide copy, or article text.</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <button 
                      onClick={() => generateWithAI('script')}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Auto-write
                    </button>
                    <span className="text-slate-500 text-xs">
                      {item.script?.split(/\s+/).filter(Boolean).length || 0} words • ~{Math.ceil((item.script?.split(/\s+/).filter(Boolean).length || 0) / 150)} min read
                    </span>
                  </div>
                </div>
                
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardContent className="p-0">
                    <textarea 
                      value={item.script || ''}
                      onChange={(e) => setItem({...item, script: e.target.value})}
                      placeholder="Start writing your script, slides, or long-form body here..."
                      className="w-full p-6 bg-transparent border-none outline-none min-h-[500px] resize-y text-base leading-relaxed text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ASSETS TAB */}
            {activeTab === 'Assets' && (
              <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Media & Creative Assets</h3>
                    <p className="text-sm text-slate-500">Upload and organize images, videos, thumbnails, and reference documents.</p>
                  </div>
                  <button 
                    onClick={() => setShowAssetModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Asset
                  </button>
                </div>

                {showAssetModal && (
                  <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold text-sm">Add New Asset</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input 
                          type="text" 
                          placeholder="Asset name..."
                          value={newAssetName}
                          onChange={e => setNewAssetName(e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Asset URL (image/video link)..."
                          value={newAssetUrl}
                          onChange={e => setNewAssetUrl(e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none"
                        />
                        <select 
                          value={newAssetType}
                          onChange={e => setNewAssetType(e.target.value as any)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => setShowAssetModal(false)}
                          className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleAddAsset}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          Save Asset
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map(asset => (
                    <Card key={asset.id} className="overflow-hidden group border-slate-200 dark:border-slate-800">
                      <div className="h-36 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : asset.type === 'video' ? (
                          <Video className="w-12 h-12 text-slate-400" />
                        ) : (
                          <FileText className="w-12 h-12 text-slate-400" />
                        )}
                        <span className="absolute top-2 left-2 text-[10px] uppercase font-bold bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {asset.type}
                        </span>
                      </div>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="text-sm font-medium truncate">{asset.name}</p>
                          <p className="text-[10px] text-slate-400">{formatTimeAgo(asset.uploadedAt)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <a 
                            href={asset.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-1.5 text-slate-400 hover:text-blue-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => deleteAsset(asset.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* CAPTION TAB */}
            {activeTab === 'Caption' && (
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Social Caption & Hashtags</h3>
                    <p className="text-sm text-slate-500">Craft the post copy, hashtags, and links for publishing.</p>
                  </div>
                  <button 
                    onClick={() => generateWithAI('caption')}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Auto-write
                  </button>
                </div>
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardContent className="p-0">
                    <textarea 
                      value={item.caption || ''}
                      onChange={(e) => setItem({...item, caption: e.target.value})}
                      placeholder="Write your caption here including hashtags (#marketing #growth)..."
                      className="w-full p-6 bg-transparent border-none outline-none min-h-[300px] resize-y leading-relaxed text-slate-800 dark:text-slate-200 text-sm"
                    />
                  </CardContent>
                </Card>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{(item.caption || '').length} characters</span>
                  <span>{(item.caption?.match(/#[a-zA-Z0-9_]+/g) || []).length} hashtags</span>
                </div>
              </div>
            )}

            {/* REVIEW & APPROVAL TAB */}
            {activeTab === 'Review' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">Review & QA Checklist</h3>
                  <p className="text-sm text-slate-500">Ensure content quality and adherence to brand guidelines before approval.</p>
                </div>

                {/* Status selector */}
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-sm font-semibold">Workflow Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {(['DRAFT', 'REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'SCHEDULED', 'PUBLISHED'] as Status[]).map(st => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider",
                            item.status === st 
                              ? "ring-2 ring-blue-500 ring-offset-2 " + (STATUS_COLORS[st] || "bg-blue-600 text-white")
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          )}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pre-flight checklist */}
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pre-Publish Checklist</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { key: 'brandTone', label: 'Tone and voice align with Brand Context' },
                      { key: 'proofread', label: 'Spelling, grammar, and typography checked' },
                      { key: 'mediaReady', label: 'Visual assets formatted and high resolution' },
                      { key: 'linksTested', label: 'All links, hashtags, and tags verified' },
                      { key: 'seoOptimized', label: 'SEO keywords and hook tested' },
                    ].map(check => (
                      <label key={check.key} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-sm">
                        <input 
                          type="checkbox"
                          checked={checklist[check.key]}
                          onChange={() => toggleChecklist(check.key)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className={checklist[check.key] ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}>
                          {check.label}
                        </span>
                      </label>
                    ))}
                  </CardContent>
                </Card>

                {/* Comments Thread */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-base">Reviewer Discussion ({itemComments.length})</h4>
                  
                  <div className="space-y-3">
                    {itemComments.map(c => {
                      const user = users.find(u => u.id === c.userId) || currentUser;
                      return (
                        <div key={c.id} className={cn("p-3 rounded-lg border text-sm transition-all", c.resolved ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/60 opacity-60" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800")}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <img src={user.avatar} alt="" className="w-5 h-5 rounded-full" />
                              <span className="font-semibold text-xs">{user.name}</span>
                              <span className="text-[10px] text-slate-400">{formatTimeAgo(c.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleResolveComment(c.id)}
                                className={cn("text-xs px-2 py-0.5 rounded", c.resolved ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                              >
                                {c.resolved ? 'Resolved' : 'Mark Resolved'}
                              </button>
                              <button 
                                onClick={() => deleteComment(c.id)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 mt-1">{c.text}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a reviewer comment or feedback..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-sm font-medium hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Comment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === 'SEO' && (
              <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-500" /> SEO & Readability Audit
                    </h3>
                    <p className="text-sm text-slate-500">Analyze your script or caption for keyword density, Flesch score, and tone.</p>
                  </div>
                  <button 
                    onClick={handleSeoAudit}
                    disabled={isAuditing || (!item.script && !item.caption && !item.description)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
                  >
                    {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    {isAuditing ? 'Analyzing...' : 'Run Deep AI Audit'}
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Keywords (comma separated)</label>
                  <input 
                    type="text" 
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="e.g. social media marketing, content strategy, viral growth"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div>
                         <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Real-time Readability</h4>
                         <p className="text-xs text-slate-400 mt-1">{realTimeSeo.words} words, {realTimeSeo.sentences} sentences</p>
                       </div>
                       <span className={cn(
                          "text-2xl font-bold px-3 py-1 rounded-md",
                          realTimeSeo.readability >= 80 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" :
                          realTimeSeo.readability >= 60 ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40" :
                          "text-red-600 bg-red-50 dark:bg-red-950/40"
                        )}>{realTimeSeo.readability}</span>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                       <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Real-time Keyword Density</h4>
                       {realTimeSeo.keywords.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">No keywords specified</p>
                       ) : (
                          <div className="space-y-2">
                            {realTimeSeo.keywords.map((kw, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{kw.keyword}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-500">{kw.count} uses</span>
                                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold", kw.density >= 1 && kw.density <= 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400")}>
                                    {kw.density}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                       )}
                    </CardContent>
                  </Card>
                </div>

                {seoAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/50">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-700 dark:text-slate-300">SEO Score</h4>
                          <span className={cn(
                            "text-xl font-bold px-3 py-1 rounded-full",
                            seoAnalysis.score >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                            seoAnalysis.score >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          )}>{seoAnalysis.score}/100</span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-1">Keyword Analysis</h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{seoAnalysis.keywordAnalysis}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-blue-100 dark:border-blue-900/50">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-700 dark:text-slate-300">Readability Score</h4>
                          <span className={cn(
                            "text-xl font-bold px-3 py-1 rounded-full",
                            seoAnalysis.readabilityScore >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                            seoAnalysis.readabilityScore >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          )}>{seoAnalysis.readabilityScore}/100</span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-1">Readability Feedback</h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{seoAnalysis.readabilityFeedback}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm md:col-span-2 border-slate-200 dark:border-slate-800">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-4">Improvement Suggestions</h4>
                        <ul className="space-y-2">
                          {seoAnalysis.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {!seoAnalysis && !isAuditing && (
                   <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 mt-6">
                      <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">Ready to analyze</p>
                      <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Enter target keywords above and click 'Run Deep AI Audit' to get actionable SEO and readability insights.</p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Status & Workflow Quick Actions */}
        <div className="w-80 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-800 dark:text-slate-200">
            Status & Workflow
          </div>
          
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            <ReadabilityRing text={(item.script || '') + ' ' + (item.caption || '') + ' ' + (item.description || '')} />
            
            {/* Approval Flow */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Approval</h4>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange('REVIEW')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors border",
                    item.status === 'REVIEW' 
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  Needs Review
                </button>
                <button 
                  onClick={() => handleStatusChange('APPROVED')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors border flex items-center justify-center gap-1.5",
                    item.status === 'APPROVED' || item.status === 'SCHEDULED' || item.status === 'PUBLISHED'
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
              </div>
            </div>

            {/* Quick Metadata Info */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <h4 className="font-semibold text-slate-500 uppercase tracking-wider">Meta Details</h4>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Current Status</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{item.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform</span>
                  <span className="font-medium text-slate-900 dark:text-white">{item.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled For</span>
                  <span className="font-medium text-slate-900 dark:text-white">{item.publishAt ? formatFriendlyDate(item.publishAt) : 'Unscheduled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Words</span>
                  <span className="font-medium text-slate-900 dark:text-white">{realTimeSeo.words}</span>
                </div>
              </div>
            </div>

            {/* Comments Quick List */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                Comments
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{itemComments.length}</span>
              </h4>
              {itemComments.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 border-dashed">
                  No comments yet
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {itemComments.slice(0, 3).map(c => (
                    <div key={c.id} className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-xs">
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
