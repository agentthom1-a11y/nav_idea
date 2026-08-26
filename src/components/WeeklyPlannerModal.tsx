import React, { useState } from 'react';
import { useStore } from '../store';
import { aiService } from '../services/ai';
import { Platform, ContentType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';
import { Calendar, Loader2, Sparkles, X, Check, Plus } from 'lucide-react';

interface WeeklyPlannerModalProps {
  onClose: () => void;
}

const DEFAULT_PLATFORMS: Platform[] = ['Instagram', 'LinkedIn', 'X'];
const DEFAULT_TOPICS = ['Industry Insights', 'Product Tips', 'Community Highlight'];

export default function WeeklyPlannerModal({ onClose }: WeeklyPlannerModalProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  
  const { addContent, currentUser, brandContext } = useStore();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setSuggestions([]);
      setSavedIds(new Set());
      const results = await aiService.generateWeeklyPlan(platforms, topics, startDate, brandContext);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to generate weekly plan', error);
      alert('Error generating weekly plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = (suggestion: any, index: number) => {
    addContent({
      id: uuidv4(),
      title: suggestion.title,
      platform: suggestion.platform as Platform,
      contentType: (suggestion.contentType || 'Post') as ContentType,
      status: 'IDEA',
      priority: 'MEDIUM',
      ownerId: currentUser.id,
      publishAt: suggestion.publishAt || new Date(startDate).toISOString(),
      caption: suggestion.caption,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSavedIds(prev => new Set(prev).add(index));
  };

  const handleSaveAll = () => {
    suggestions.forEach((suggestion, index) => {
      if (!savedIds.has(index)) {
        handleSave(suggestion, index);
      }
    });
  }

  const togglePlatform = (p: Platform) => {
    setPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const availablePlatforms: Platform[] = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'X', 'Facebook', 'Newsletter'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900 dark:text-white">Magic Weekly Plan</h2>
              <p className="text-sm text-slate-500">Auto-generate a full 7-day content schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Content Pillars (Comma separated)</label>
              <input 
                type="text" 
                value={topics.join(', ')}
                onChange={(e) => setTopics(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="e.g. Tips, Industry News..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Platforms</label>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full border transition-all",
                    platforms.includes(p) 
                      ? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800/60 dark:text-indigo-300 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || platforms.length === 0 || topics.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? "Analyzing trends & building plan..." : "Generate Weekly Schedule"}
          </button>
          
          {suggestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Proposed Plan ({suggestions.length} items)</h3>
                <button 
                  onClick={handleSaveAll}
                  disabled={savedIds.size === suggestions.length}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50"
                >
                  Save All to Board
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {suggestions.map((suggestion, index) => {
                  const isSaved = savedIds.has(index);
                  const dateLabel = new Date(suggestion.publishAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <div key={index} className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {dateLabel}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                              {suggestion.platform}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {suggestion.contentType}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">{suggestion.title}</h4>
                        </div>
                        <button
                          onClick={() => !isSaved && handleSave(suggestion, index)}
                          disabled={isSaved}
                          className={cn(
                            "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                            isSaved 
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                          )}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {isSaved ? "Saved" : "Add to Plan"}
                        </button>
                      </div>
                      {suggestion.caption && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-md border border-slate-100 dark:border-slate-800/50">
                          {suggestion.caption}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
