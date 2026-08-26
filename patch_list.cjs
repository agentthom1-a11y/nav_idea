const fs = require('fs');
const file = 'src/pages/ContentList.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetState = `  const [search, setSearch] = useState('');`;
const replacementState = `  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const TABS = [
    { id: 'all', label: 'All Content' },
    { id: 'drafts', label: 'Drafts', statuses: ['IDEA', 'RESEARCH', 'BRIEF', 'DRAFT', 'DESIGN', 'EDITING'] },
    { id: 'review', label: 'In Review', statuses: ['REVIEW', 'CHANGES_REQUESTED', 'APPROVED'] },
    { id: 'scheduled', label: 'Scheduled', statuses: ['SCHEDULED', 'PUBLISHING'] },
    { id: 'published', label: 'Published', statuses: ['PUBLISHED'] },
  ];`;

content = content.replace(targetState, replacementState);

const targetFilter = `  const filteredContent = content.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());`;
const replacementFilter = `  const filteredContent = content.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const activeTabObj = TABS.find(t => t.id === activeTab);
    const matchesTab = activeTab === 'all' || (activeTabObj && activeTabObj.statuses.includes(c.status));
    return matchesSearch && matchesTab;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());`;

content = content.replace(targetFilter, replacementFilter);

const targetTabs = `      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">`;
const replacementTabs = `      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
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
                ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {tab.label}
            <span className={cn(
              "ml-2 text-xs py-0.5 px-2 rounded-full",
              activeTab === tab.id 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}>
              {tab.id === 'all' 
                ? content.length 
                : content.filter(c => tab.statuses.includes(c.status)).length}
            </span>
          </button>
        ))}
      </div>`;

content = content.replace(`      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
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
      </div>`, replacementTabs);

fs.writeFileSync(file, content, 'utf8');
