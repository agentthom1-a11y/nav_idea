const fs = require('fs');
const file = 'src/pages/ContentEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace("import { ArrowLeft, Save, MessageSquare, MoreHorizontal, CheckCircle2, AlertCircle, Play, LayoutGrid, Sparkles, Loader2 } from 'lucide-react';", 
"import { ArrowLeft, Save, MessageSquare, MoreHorizontal, CheckCircle2, AlertCircle, Play, LayoutGrid, Sparkles, Loader2, Activity, Target } from 'lucide-react';\nimport { aiService, SeoAnalysis } from '../services/ai';");

// Tabs
content = content.replace("const TABS = ['Overview', 'Brief', 'Script', 'Assets', 'Caption', 'Review'];",
"const TABS = ['Overview', 'Brief', 'Script', 'Assets', 'Caption', 'Review', 'SEO'];");

// State
const stateTarget = "const [isGenerating, setIsGenerating] = useState(false);";
const stateReplacement = `const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);

  const handleSeoAudit = async () => {
    const textToAnalyze = item.script || item.caption;
    if (!textToAnalyze) {
      alert("Please provide some script or caption content first.");
      return;
    }
    setIsAuditing(true);
    try {
      const result = await aiService.auditSEO(textToAnalyze, seoKeywords, item.platform || 'General');
      setSeoAnalysis(result);
    } catch (error) {
      console.error("Failed to run SEO audit", error);
      alert("Failed to run SEO audit. Please try again.");
    } finally {
      setIsAuditing(false);
    }
  };
`;
content = content.replace(stateTarget, stateReplacement);

// SEO Tab UI
const reviewTabTarget = `{(activeTab === 'Brief' || activeTab === 'Assets' || activeTab === 'Review') && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <LayoutGrid className="w-12 h-12 text-slate-300" />
                <p className="text-lg font-medium">{activeTab} panel placeholder</p>
                <p className="text-sm">This section would contain the structured forms and tools for {activeTab.toLowerCase()}.</p>
              </div>
            )}`;

const seoTabUi = `
            {activeTab === 'SEO' && (
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
                </div>

                {seoAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/50">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-700 dark:text-slate-300">SEO Score</h4>
                          <span className={cn(
                            "text-xl font-bold px-3 py-1 rounded-full",
                            seoAnalysis.score >= 80 ? "bg-emerald-100 text-emerald-700" :
                            seoAnalysis.score >= 60 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
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
                            seoAnalysis.readabilityScore >= 80 ? "bg-emerald-100 text-emerald-700" :
                            seoAnalysis.readabilityScore >= 60 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          )}>{seoAnalysis.readabilityScore}/100</span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-1">Readability Feedback</h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{seoAnalysis.readabilityFeedback}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm md:col-span-2">
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
                      <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Enter target keywords above and click 'Run Audit' to get actionable SEO and readability insights.</p>
                   </div>
                )}
              </div>
            )}
`;

content = content.replace(reviewTabTarget, seoTabUi + '\n' + reviewTabTarget);

fs.writeFileSync(file, content);
console.log('ContentEditor patched');
