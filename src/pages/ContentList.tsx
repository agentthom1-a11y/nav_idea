import { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { formatFriendlyDate, PLATFORM_COLORS, STATUS_COLORS, cn } from '../lib/utils';
import { Search, Filter, Plus, ChevronDown, MoreHorizontal, X, ExternalLink } from 'lucide-react';
import { ContentItem } from '../types';

export default function ContentList() {
  const { content, users } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [quickViewItem, setQuickViewItem] = useState<ContentItem | null>(null);

  const TABS = [
    { id: 'all', label: 'All Content' },
    { id: 'drafts', label: 'Drafts', statuses: ['IDEA', 'RESEARCH', 'BRIEF', 'DRAFT', 'DESIGN', 'EDITING'] },
    { id: 'review', label: 'In Review', statuses: ['REVIEW', 'CHANGES_REQUESTED', 'APPROVED'] },
    { id: 'scheduled', label: 'Scheduled', statuses: ['SCHEDULED', 'PUBLISHING'] },
    { id: 'published', label: 'Published', statuses: ['PUBLISHED'] },
  ];

  const filteredContent = content.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const activeTabObj = TABS.find(t => t.id === activeTab);
    const matchesTab = activeTab === 'all' || (activeTabObj && activeTabObj.statuses.includes(c.status));
    return matchesSearch && matchesTab;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content</h1>
          <p className="text-slate-500 mt-1">Manage and organize all your content pieces.</p>
        </div>
        <button 
          onClick={() => navigate('/content/new')}
          className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-md font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Content
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id 
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
              {tab.id === 'all' 
                ? content.length 
                : content.filter(c => tab.statuses?.includes(c.status)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-medium w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-6 py-3 font-medium">Content</th>
                <th className="px-6 py-3 font-medium">Platform</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Publish Date</th>
                <th className="px-6 py-3 font-medium">Performance</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContent.map((item) => {
                const owner = users.find(u => u.id === item.ownerId);
                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => setQuickViewItem(item)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="px-6 py-4 max-w-[300px]">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.contentType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", PLATFORM_COLORS[item.platform] || "bg-slate-100 text-slate-700")}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs font-bold px-2 py-1 rounded uppercase tracking-wider", STATUS_COLORS[item.status] || "bg-slate-100 text-slate-500")}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <img src={owner.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <span className="text-slate-600 dark:text-slate-300">{owner.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatFriendlyDate(item.publishAt || '')}
                    </td>
                    <td className="px-6 py-4">
                      {item.views ? (
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-slate-500">Views</p>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{(item.views / 1000).toFixed(1)}k</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/content/${item.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit content"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                              useStore.getState().deleteContent(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete content"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {quickViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setQuickViewItem(null)}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider", PLATFORM_COLORS[quickViewItem.platform] || "bg-slate-100 text-slate-600")}>
                  {quickViewItem.platform}
                </span>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider", STATUS_COLORS[quickViewItem.status] || "bg-slate-100 text-slate-500")}>
                  {quickViewItem.status.replace('_', ' ')}
                </span>
              </div>
              <button 
                onClick={() => setQuickViewItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{quickViewItem.title}</h2>
              <p className="text-sm text-slate-500 mb-6">Format: {quickViewItem.contentType}</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Publish Date</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {quickViewItem.publishAt ? formatFriendlyDate(quickViewItem.publishAt) : 'Not scheduled'}
                  </p>
                </div>
                
                {quickViewItem.caption && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Caption / Body</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {quickViewItem.caption}
                    </div>
                  </div>
                )}
                
                {quickViewItem.script && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Script</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {quickViewItem.script}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${quickViewItem.title}"?`)) {
                    useStore.getState().deleteContent(quickViewItem.id);
                    setQuickViewItem(null);
                  }
                }}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
              >
                Delete
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuickViewItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => navigate(`/content/${quickViewItem.id}`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Full Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
