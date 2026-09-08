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
import { FeatureTour } from './FeatureTour';

export default function Layout() {
 const location = useLocation();
 const navigate = useNavigate();
 const { currentUser, loadInitialData } = useStore();
 
 useEffect(() => {
 loadInitialData();
 }, [loadInitialData]);
 
 return (
 <div className="flex h-screen font-sans overflow-hidden">
 <aside className="w-64 glass-sidebar flex flex-col flex-shrink-0">
 <div className="h-14 flex items-center px-6 border-b border-white/10">
 <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
 <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-black shadow-sm shadow-blue-500/20">
 N
 </div>
 <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50">
 NAVRINE IDEA
 </span>
 </div>
 </div>

 <div className="p-4 flex-1 overflow-y-auto" id="tour-sidebar-nav">
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
 ? "bg-white/10 text-white shadow-sm border border-white/5" 
 : "text-white/60 hover:bg-white/5 hover:text-white"
 )}
 >
 <item.icon className="w-4 h-4" />
 {item.name}
 </Link>
 )
 })}
 </div>
 </div>

 <div className="p-4 border-t border-white/10" id="tour-user-profile">
 <Link to="/settings" className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-white/60 hover:bg-white/5 transition-colors">
 <Settings className="w-4 h-4" />
 Settings
 </Link>
 
 <div className="mt-4 flex items-center gap-3 px-3 py-2">
 <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate text-white">{currentUser.name}</p>
 <p className="text-xs text-white/50 truncate">{currentUser.role}</p>
 </div>
 </div>
 </div>
 </aside>

  <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
  <header className="h-16 flex items-center justify-between px-6 z-20 flex-shrink-0 glass-header">
  <div className="flex items-center flex-1" id="tour-global-search">
  <GlobalSearch />
  </div>
  
  <div className="flex items-center gap-4">
  <button className="text-white/60 hover:text-white transition-colors relative">
  <Bell className="w-5 h-5" />
  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-transparent"></span>
  </button>
  <button 
  onClick={() => navigate('/content/new')}
  id="tour-create-btn"
  className="btn-primary flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5"
  >
  <Plus className="w-4 h-4" />
  Create
  </button>
  </div>
  </header>

  <div className="flex-1 overflow-auto flex flex-col p-6">
  <FeatureTour />
  <Outlet />
  </div>
  </main>
 </div>
 );
}
