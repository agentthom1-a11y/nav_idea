import React, { useState } from 'react';
import { Calendar, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { useStore } from '../store';
import { aiService, DailySuggestion } from '../services/ai';
import { Platform, ContentType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';

interface DailySchedulerProps {
 onClose?: () => void;
}

const DEFAULT_PLATFORMS: Platform[] = ['Instagram', 'LinkedIn', 'X'];
const DEFAULT_TOPICS = ['Industry Insights', 'Product Tips', 'Community Highlight'];

export default function DailyScheduler({ onClose }: DailySchedulerProps) {
 const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
 const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
 const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);
 const [isGenerating, setIsGenerating] = useState(false);
 const [suggestions, setSuggestions] = useState<DailySuggestion[]>([]);
 const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

 const { addContent, currentUser, brandContext } = useStore();

 const handleGenerate = async () => {
 try {
 setIsGenerating(true);
 setSuggestions([]);
 setSavedIds(new Set());
 const results = await aiService.generateDailySuggestions(platforms, topics, date, brandContext);
 setSuggestions(results);
 } catch (error) {
 console.error('Failed to generate daily suggestions', error);
 alert('Error generating daily suggestions. Please try again.');
 } finally {
 setIsGenerating(false);
 }
 };

 const handleSave = (suggestion: DailySuggestion, index: number) => {
 addContent({
 id: uuidv4(),
 title: suggestion.title,
 platform: suggestion.platform as Platform,
 contentType: (suggestion.contentType || 'Post') as ContentType,
 status: 'IDEA',
 priority: 'MEDIUM',
 ownerId: currentUser.id,
 publishAt: suggestion.publishAt || new Date(date).toISOString(),
 caption: suggestion.caption,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 });
 setSavedIds(prev => new Set(prev).add(index));
 };

 const togglePlatform = (p: Platform) => {
 setPlatforms(prev => 
 prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
 );
 };

 const availablePlatforms: Platform[] = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'X', 'Facebook', 'Newsletter'];

 return (
 <div className="bg-transparent border border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
 <div className="p-4 border-b border-white/10 flex items-center justify-between bg-transparent/5 ">
 <div className="flex items-center gap-2">
 <Calendar className="w-5 h-5 text-blue-500" />
 <h2 className="font-semibold text-lg">Daily AI Scheduler</h2>
 </div>
 {onClose && (
 <button onClick={onClose} className="text-white/50 hover:text-white/70">
 &times;
 </button>
 )}
 </div>

 <div className="p-4 flex flex-col gap-4 overflow-y-auto">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-white/80 ">Target Date</label>
 <input 
 type="date" 
 value={date}
 onChange={(e) => setDate(e.target.value)}
 className="w-full px-3 py-2 bg-transparent border border-white/20 rounded-md text-sm outline-none focus:border-blue-500"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-white/80 ">Topics / Pillars (Comma separated)</label>
 <input 
 type="text" 
 value={topics.join(', ')}
 onChange={(e) => setTopics(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
 placeholder="e.g. Tips, Industry News..."
 className="w-full px-3 py-2 bg-transparent border border-white/20 rounded-md text-sm outline-none focus:border-blue-500"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium text-white/80 ">Platforms</label>
 <div className="flex flex-wrap gap-2">
 {availablePlatforms.map(p => (
 <button
 key={p}
 onClick={() => togglePlatform(p)}
 className={cn(
 "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
 platforms.includes(p) 
 ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50" 
 : "bg-transparent/10 text-white/70 border-white/10 /50 hover:bg-transparent/20 "
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
 className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-transparent text-white rounded-md text-sm font-semibold hover:bg-slate-800 dark:hover:bg-transparent/10 transition-colors disabled:opacity-50"
 >
 {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
 {isGenerating ? "Generating Content..." : "Generate Daily Content"}
 </button>

 {suggestions.length > 0 && (
 <div className="mt-6 space-y-4">
 <h3 className="font-semibold text-slate-800 border-b border-white/10 pb-2">Generated Suggestions</h3>
 <div className="grid grid-cols-1 gap-4">
 {suggestions.map((suggestion, index) => {
 const isSaved = savedIds.has(index);
 return (
 <div key={index} className="p-4 bg-transparent/5 rounded-lg border border-white/10 ">
 <div className="flex items-start justify-between gap-4 mb-2">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-transparent/20 text-white/80 uppercase tracking-wider">
 {suggestion.platform}
 </span>
 <span className="text-xs text-white/60 /50">
 {suggestion.contentType}
 </span>
 </div>
 <h4 className="font-medium text-sm text-white ">{suggestion.title}</h4>
 </div>
 <button
 onClick={() => !isSaved && handleSave(suggestion, index)}
 disabled={isSaved}
 className={cn(
 "flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
 isSaved 
 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
 : "bg-transparent border border-white/10 hover:bg-transparent/5 "
 )}
 >
 {isSaved ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
 {isSaved ? "Saved" : "Save"}
 </button>
 </div>
 {suggestion.caption && (
 <p className="text-xs text-white/70 /50 mt-2 line-clamp-3 bg-transparent p-2 rounded border border-white/5 ">
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
 );
}
