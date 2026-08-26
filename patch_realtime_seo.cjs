const fs = require('fs');
const file = 'src/pages/ContentEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

const importTarget = `import { Card, CardContent } from '../components/ui/card';`;
const useMemoImport = `import { useState, useEffect, useMemo } from 'react';`;
content = content.replace(`import { useState, useEffect } from 'react';`, useMemoImport);

const realtimeLogic = `
  const [activeCollaborators, setActiveCollaborators] = useState<User[]>([]);

  const realTimeSeo = useMemo(() => {
    const text = ((item.script || '') + ' ' + (item.caption || '')).trim();
    if (!text) return { readability: 0, words: 0, sentences: 0, keywords: [] };
    
    const words = text.split(/\\s+/).filter(w => w.length > 0);
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

    let keywordDensities = [];
    if (seoKeywords) {
      const targetKeys = seoKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
      const textLower = text.toLowerCase();
      keywordDensities = targetKeys.map(kw => {
        const count = (textLower.match(new RegExp('\\\\b' + kw.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&') + '\\\\b', 'g')) || []).length;
        const density = words.length ? ((count / words.length) * 100).toFixed(1) : '0.0';
        return { keyword: kw, count, density: parseFloat(density) };
      });
    }

    return { readability: readabilityScore, words: words.length, sentences: sentences.length, keywords: keywordDensities };
  }, [item.script, item.caption, seoKeywords]);
`;

content = content.replace(`  const [activeCollaborators, setActiveCollaborators] = useState<User[]>([]);`, realtimeLogic);

const seoTabTarget = `{activeTab === 'SEO' && (
              <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" /> SEO & Readability Audit</h3>
                    <p className="text-sm text-slate-500">Analyze your script or caption for keyword density and reading level.</p>
                  </div>
                  <button 
                    onClick={handleSeoAudit}
                    disabled={isAuditing || (!item.script && !item.caption)}
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
                    placeholder="e.g. social media marketing, content strategy"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none"
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
                          realTimeSeo.readability >= 80 ? "text-emerald-600 bg-emerald-50" :
                          realTimeSeo.readability >= 60 ? "text-amber-600 bg-amber-50" :
                          "text-red-600 bg-red-50"
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
                                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold", kw.density >= 1 && kw.density <= 3 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                                    {kw.density}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                       )}
                    </CardContent>
                  </Card>
                </div>`;

const searchString = `{activeTab === 'SEO' && (
              <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" /> SEO & Readability Audit</h3>
                    <p className="text-sm text-slate-500">Analyze your script or caption for keyword density and reading level.</p>
                  </div>
                  <button 
                    onClick={handleSeoAudit}
                    disabled={isAuditing || (!item.script && !item.caption)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
                  >
                    {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    {isAuditing ? 'Analyzing...' : 'Run Audit'}
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Keywords (comma separated)</label>
                  <input 
                    type="text" 
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="e.g. social media marketing, content strategy"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none"
                  />
                </div>`;

content = content.replace(searchString, seoTabTarget);

fs.writeFileSync(file, content);
console.log('Patched real-time SEO successfully!');
