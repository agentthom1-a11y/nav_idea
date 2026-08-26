const fs = require('fs');

let planner = fs.readFileSync('src/pages/Planner.tsx', 'utf8');

const listAndCalendarView = `
          {view === 'calendar' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="font-medium text-slate-500 text-center pb-2 border-b border-slate-200 dark:border-slate-800">{day}</div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - d.getDay() + i);
                  const dayContent = content.filter(c => c.publishAt && new Date(c.publishAt).toDateString() === d.toDateString());
                  
                  return (
                    <div key={i} className={cn("min-h-[120px] p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900", d.toDateString() === new Date().toDateString() && "ring-2 ring-blue-500")}>
                      <div className="text-sm font-medium text-slate-500 mb-2">{d.getDate()}</div>
                      <div className="space-y-1">
                        {dayContent.map(item => (
                          <div key={item.id} onClick={() => navigate(\`/content/\${item.id}\`)} className="text-xs p-1.5 rounded bg-slate-100 dark:bg-slate-800 cursor-pointer truncate hover:bg-slate-200 dark:hover:bg-slate-700">
                            <span className={cn("inline-block w-2 h-2 rounded-full mr-1", item.status === 'PUBLISHED' ? "bg-emerald-500" : "bg-blue-500")}></span>
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {view === 'list' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Platform</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Publish Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {content.sort((a,b) => new Date(a.publishAt || 0).getTime() - new Date(b.publishAt || 0).getTime()).map(item => (
                      <tr key={item.id} onClick={() => navigate(\`/content/\${item.id}\`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                        <td className="px-4 py-3 font-medium truncate max-w-[300px]">{item.title}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", PLATFORM_COLORS[item.platform] || "bg-slate-100 text-slate-700")}>{item.platform}</span>
                        </td>
                        <td className="px-4 py-3 text-xs uppercase tracking-wide">{item.status.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-slate-500">{item.publishAt ? new Date(item.publishAt).toLocaleDateString() : 'Unscheduled'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
`;

planner = planner.replace(
  /\{\/\* Placeholder for other views \*\/\}.*?\{\s*view !== 'board' && \(\s*<div className="h-full flex items-center justify-center text-slate-500">\s*\{view === 'calendar' \? 'Calendar View' : 'List View'\}\s*<\/div>\s*\)\s*\}/gs,
  listAndCalendarView
);

fs.writeFileSync('src/pages/Planner.tsx', planner);
