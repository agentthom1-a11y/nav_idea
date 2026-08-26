import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  FileText, 
  Lightbulb, 
  BarChart3, 
  LayoutDashboard, 
  Calendar,
  Search,
  Command as CommandIcon
} from 'lucide-react';
import { useStore } from '../store';
import { cn, STATUS_COLORS, PLATFORM_COLORS } from '../lib/utils';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { content, ideas, pillars } = useStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors w-64 border border-transparent focus:border-slate-300 dark:focus:border-slate-600 outline-none"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="truncate">Search content, ideas...</span>
        <kbd className="ml-auto flex shrink-0 items-center gap-1 text-[10px] font-medium opacity-50">
          <CommandIcon className="w-3 h-3" /> K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4" onClick={() => setOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[60vh]" 
            onClick={e => e.stopPropagation()}
          >
            <Command className="flex flex-col w-full h-full overflow-hidden" label="Global Command Menu">
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3 shrink-0">
                <Search className="w-5 h-5 text-slate-500 shrink-0" />
                <Command.Input 
                  autoFocus
                  placeholder="Search across your workspace..." 
                  className="w-full px-3 py-4 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
                />
                <button 
                  onClick={() => setOpen(false)}
                  className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 ml-2 shrink-0"
                >
                  ESC
                </button>
              </div>
              <Command.List className="overflow-y-auto p-2 custom-scrollbar">
                <Command.Empty className="py-12 text-center text-sm text-slate-500">No results found.</Command.Empty>
                
                <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1">
                  <Command.Item onSelect={() => runCommand(() => navigate('/dashboard'))} className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-slate-900 dark:data-[selected=true]:text-white transition-colors">
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    Dashboard
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/planner'))} className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-slate-900 dark:data-[selected=true]:text-white transition-colors">
                    <Calendar className="w-4 h-4 shrink-0" />
                    Planner
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/analytics'))} className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-slate-900 dark:data-[selected=true]:text-white transition-colors">
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    Analytics
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Content & Drafts" className="mt-4 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1">
                  {content.map((item) => (
                    <Command.Item 
                      key={item.id} 
                      onSelect={() => runCommand(() => navigate(`/content/${item.id}`))}
                      className="flex flex-col px-2 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-slate-900 dark:data-[selected=true]:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 shrink-0 text-blue-500" />
                        <span className="truncate font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 ml-6">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wide uppercase", PLATFORM_COLORS[item.platform] || "bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400")}>{item.platform}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wide uppercase", STATUS_COLORS[item.status] || "bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400")}>{item.status.replace(/_/g, ' ')}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Ideas Inbox" className="mt-4 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1">
                  {ideas.map((idea) => (
                    <Command.Item 
                      key={idea.id} 
                      onSelect={() => runCommand(() => navigate('/ideas'))}
                      className="flex flex-col px-2 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 cursor-pointer data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-slate-900 dark:data-[selected=true]:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 shrink-0 text-amber-500" />
                        <span className="truncate">{idea.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 ml-6">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 font-medium tracking-wide uppercase">{pillars.find(p => p.id === idea.pillarId)?.name || 'Idea'}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
