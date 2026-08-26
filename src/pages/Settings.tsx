import React, { useState } from 'react';
import { useStore } from '../store';
import { Save, User, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const { brandContext, updateBrandContext, currentUser, updateCurrentUser } = useStore();
  const [localContext, setLocalContext] = useState(brandContext);
  const [localUser, setLocalUser] = useState(currentUser);
  const [saved, setSaved] = useState(false);
  const [userSaved, setUserSaved] = useState(false);

  React.useEffect(() => {
    setLocalContext(brandContext);
  }, [brandContext]);

  React.useEffect(() => {
    setLocalUser(currentUser);
  }, [currentUser]);

  const handleSaveContext = () => {
    updateBrandContext(localContext);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveUser = () => {
    updateCurrentUser(localUser);
    setUserSaved(true);
    setTimeout(() => setUserSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your workspace account, brand context, and AI preferences.</p>
      </div>

      {/* Account / Workspace Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Account Profile
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure your workspace identity and display details.</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Database Synced
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <input 
                type="text" 
                value={localUser.name}
                onChange={e => setLocalUser({...localUser, name: e.target.value})}
                placeholder="e.g. Navrine Lead"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input 
                type="email" 
                value={localUser.email}
                onChange={e => setLocalUser({...localUser, email: e.target.value})}
                placeholder="e.g. admin@navrine.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role / Title</label>
              <input 
                type="text" 
                value={localUser.role}
                onChange={e => setLocalUser({...localUser, role: e.target.value})}
                placeholder="e.g. Content Strategist"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar Image URL</label>
              <input 
                type="text" 
                value={localUser.avatar}
                onChange={e => setLocalUser({...localUser, avatar: e.target.value})}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button 
            onClick={handleSaveUser}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Save className="w-4 h-4" />
            {userSaved ? "Profile Saved!" : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Brand Context Card */}
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
                placeholder="e.g. NAVRINE"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Voice / Tone</label>
              <input 
                type="text" 
                value={localContext.brandVoice}
                onChange={e => setLocalContext({...localContext, brandVoice: e.target.value})}
                placeholder="e.g. Visionary, Sharp & High-Impact"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Target Audience</label>
              <input 
                type="text" 
                value={localContext.targetAudience}
                onChange={e => setLocalContext({...localContext, targetAudience: e.target.value})}
                placeholder="e.g. Content Creators, Marketers & Growth Teams"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Competitors</label>
              <input 
                type="text" 
                value={localContext.competitors}
                onChange={e => setLocalContext({...localContext, competitors: e.target.value})}
                placeholder="e.g. Competitor A, Competitor B"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Additional Context</label>
              <textarea 
                value={localContext.additionalContext}
                onChange={e => setLocalContext({...localContext, additionalContext: e.target.value})}
                placeholder="Any other rules, preferred formats, or key value propositions..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button 
            onClick={handleSaveContext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Brand Context"}
          </button>
        </div>
      </div>
    </div>
  );
}
