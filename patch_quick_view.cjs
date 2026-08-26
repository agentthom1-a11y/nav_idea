const fs = require('fs');
const file = 'src/pages/ContentList.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace(
  `import { Search, Filter, Plus, ChevronDown, MoreHorizontal } from 'lucide-react';`,
  `import { Search, Filter, Plus, ChevronDown, MoreHorizontal, X, ExternalLink } from 'lucide-react';\nimport { ContentItem } from '../types';`
);

// 2. Add State for Quick View
content = content.replace(
  `  const [activeTab, setActiveTab] = useState('all');`,
  `  const [activeTab, setActiveTab] = useState('all');\n  const [quickViewItem, setQuickViewItem] = useState<ContentItem | null>(null);`
);

// 3. Change row click behavior
content = content.replace(
  `onClick={() => navigate(\`/content/\${item.id}\`)}`,
  `onClick={() => setQuickViewItem(item)}`
);

// 4. Add the Modal JSX at the end of the return statement
const modalJSX = `
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
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setQuickViewItem(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => navigate(\`/content/\${quickViewItem.id}\`)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Full Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/, modalJSX);
fs.writeFileSync(file, content, 'utf8');
