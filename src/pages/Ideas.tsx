import { useState } from 'react';
import { useStore } from '../store';
import { Card, CardContent } from '../components/ui/card';
import { PLATFORM_COLORS, formatTimeAgo, cn, generateId } from '../lib/utils';
import { Plus, Search, Filter, MoreHorizontal, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Platform, ContentType } from '../types';

export default function Ideas() {
  const { ideas, addIdea, addContent, deleteIdea, currentUser, brandContext } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New Idea Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPlatform, setNewPlatform] = useState<any>('Instagram');

  const filteredIdeas = ideas.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    i.description.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.score - a.score);

  const handleSaveIdea = () => {
    if (!newTitle.trim()) return;
    addIdea({
      id: generateId(),
      title: newTitle,
      description: newDesc,
      platform: newPlatform,
      score: Math.floor(Math.random() * 40) + 50, // mock score
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    });
    setIsAdding(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-daily-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: ['LinkedIn', 'X', 'Instagram'],
          topics: ['Technology trends', 'AI advancements', 'Startup tips'],
          date: new Date().toISOString(),
          brandContext
        })
      });
      const data = await response.json();
      
      if (data.suggestions && Array.isArray(data.suggestions)) {
        data.suggestions.forEach((suggestion: any) => {
          addIdea({
            id: generateId(),
            title: suggestion.title,
            description: suggestion.caption,
            platform: suggestion.platform,
            score: Math.floor(Math.random() * 30) + 70, // AI gets high score
            createdAt: new Date().toISOString(),
            createdBy: currentUser.id
          });
        });
      }
    } catch (error) {
      console.error("Failed to generate ideas", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ideas Inbox</h1>
          <p className="text-slate-500 mt-1">Capture, score, and develop content ideas with real-time AI research.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateIdeas}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-md font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Scrape & Generate
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-md font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Capture Idea
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search ideas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {isAdding && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-6 space-y-4">
            <input 
              autoFocus
              type="text" 
              placeholder="What's your idea?" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-slate-400"
            />
            <textarea 
              placeholder="Add some details..." 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-transparent outline-none resize-none placeholder:text-slate-400 text-slate-600 dark:text-slate-300"
              rows={2}
            />
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/50">
              <select 
                value={newPlatform} 
                onChange={(e) => setNewPlatform(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-sm outline-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="X">X</option>
              </select>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveIdea}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Save Idea
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredIdeas.map(idea => (
          <Card key={idea.id} className="group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase", idea.platform ? PLATFORM_COLORS[idea.platform] : "bg-slate-100 text-slate-600")}>
                    {idea.platform || 'General'}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                    <Lightbulb className="w-3 h-3" />
                    {idea.score}
                  </div>
                </div>
                <button 
                  onClick={() => deleteIdea(idea.id)}
                  title="Delete idea"
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{idea.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                {idea.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <span>{formatTimeAgo(idea.createdAt)}</span>
                <button onClick={() => {
                  const newId = generateId();
                  addContent({
                    id: newId,
                    title: idea.title,
                    description: idea.description,
                    platform: (idea.platform || 'LinkedIn') as Platform,
                    contentType: 'Post' as ContentType,
                    status: 'DRAFT',
                    priority: 'MEDIUM',
                    ownerId: currentUser.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                  deleteIdea(idea.id);
                  navigate(`/content/${newId}`);
                }} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Create Content →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
