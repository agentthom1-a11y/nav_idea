import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  FileText, 
  Lightbulb, 
  BarChart3, 
  Settings,
  Search,
  Plus,
  Bell,
  Command
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { GlobalSearch } from './GlobalSearch';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Planner', path: '/planner', icon: CalendarIcon },
  { name: 'Content', path: '/content', icon: FileText },
  { name: 'Ideas', path: '/ideas', icon: Lightbulb },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

import { useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, loadInitialData } = useStore();
  
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-black shadow-sm shadow-blue-500/20">
              N
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">
              NAVRINE IDEA
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          
          <div className="mt-4 flex items-center gap-3 px-3 py-2">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center flex-1">
            <GlobalSearch />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
            </button>
            <button 
              onClick={() => navigate('/content/new')}
              className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
