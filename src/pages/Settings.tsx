import React from 'react';
import { useStore } from '../store';
import { Save } from 'lucide-react';

export default function Settings() {
  const { brandContext, updateBrandContext } = useStore();
  const [localContext, setLocalContext] = React.useState(brandContext);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    updateBrandContext(localContext);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your brand context and AI generation preferences.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold">Brand Context</h2>
          <p className="text-sm text-slate-500 mt-1">This information will be used to guide AI generations to match your brand.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Name</label>
              <input 
                type="text" 
                value={localContext.brandName}
                onChange={e => setLocalContext({...localContext, brandName: e.target.value})}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Voice / Tone</label>
              <input 
                type="text" 
                value={localContext.brandVoice}
                onChange={e => setLocalContext({...localContext, brandVoice: e.target.value})}
                placeholder="e.g. Professional, friendly, witty"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Target Audience</label>
              <input 
                type="text" 
                value={localContext.targetAudience}
                onChange={e => setLocalContext({...localContext, targetAudience: e.target.value})}
                placeholder="e.g. Founders, Marketing Managers aged 25-45"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Competitors</label>
              <input 
                type="text" 
                value={localContext.competitors}
                onChange={e => setLocalContext({...localContext, competitors: e.target.value})}
                placeholder="e.g. Competitor A, Competitor B"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Additional Context</label>
              <textarea 
                value={localContext.additionalContext}
                onChange={e => setLocalContext({...localContext, additionalContext: e.target.value})}
                placeholder="Any other rules, preferred formats, or key value propositions..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
