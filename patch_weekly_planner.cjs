const fs = require('fs');

let planner = fs.readFileSync('src/pages/Planner.tsx', 'utf8');

planner = planner.replace(
  "import DailyScheduler from '../components/DailyScheduler';",
  "import DailyScheduler from '../components/DailyScheduler';\nimport WeeklyPlannerModal from '../components/WeeklyPlannerModal';"
);

planner = planner.replace(
  "const [showScheduler, setShowScheduler] = useState(false);",
  "const [showScheduler, setShowScheduler] = useState(false);\n  const [showWeeklyModal, setShowWeeklyModal] = useState(false);"
);

planner = planner.replace(
  /<button\s*onClick=\{\(\) => setShowScheduler\(!showScheduler\)\}\s*className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"\s*>\s*<Sparkles className="w-4 h-4" \/>\s*Auto Schedule\s*<\/button>/,
  `<button 
            onClick={() => setShowWeeklyModal(true)}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Magic Weekly Plan
          </button>
          <button 
            onClick={() => setShowScheduler(!showScheduler)}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            Daily Planner
          </button>`
);

planner = planner.replace(
  "      <div className=\"flex-1 overflow-hidden flex\">",
  "      {showWeeklyModal && <WeeklyPlannerModal onClose={() => setShowWeeklyModal(false)} />}\n      <div className=\"flex-1 overflow-hidden flex\">"
);

fs.writeFileSync('src/pages/Planner.tsx', planner);
