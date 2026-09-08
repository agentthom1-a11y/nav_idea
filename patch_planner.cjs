const fs = require('fs');
const path = require('path');

const plannerPath = path.join(__dirname, 'src', 'pages', 'Planner.tsx');
let content = fs.readFileSync(plannerPath, 'utf8');

// 1. Header style
content = content.replace(
  /<div className="h-16 border-b border-white\/10 bg-transparent px-6 flex items-center justify-between flex-shrink-0 z-10">/,
  '<div className="h-16 glass-card px-6 flex items-center justify-between flex-shrink-0 z-10 mb-6">'
);

// 2. Buttons
content = content.replace(
  /"text-white bg-blue-600 hover:bg-blue-700"/g,
  '"btn-primary text-white"'
);
content = content.replace(
  /className="flex items-center gap-2 px-3 py-1\.5 text-sm font-medium rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"/g,
  'className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm text-white"'
);

// 3. View Switcher
content = content.replace(
  /<div className="flex bg-transparent\/10 p-1 rounded-lg">/,
  '<div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shadow-sm">'
);

// 4. Board columns
content = content.replace(
  /className="flex flex-col w-80 shrink-0 h-full max-h-full bg-transparent\/10\/50 rounded-xl"/g,
  'className="flex flex-col w-80 shrink-0 h-full max-h-full glass-card rounded-2xl overflow-hidden"'
);
content = content.replace(
  /<div className="p-4 flex items-center justify-between">/g,
  '<div className="p-4 flex items-center justify-between border-b border-white/5">'
);
content = content.replace(
  /bg-transparent\/20 text-white\/70/g,
  'bg-white/10 text-white px-2.5 py-1 rounded-full shadow-inner'
);
content = content.replace(
  /bg-transparent\/20\/50 rounded-b-xl/g,
  'bg-white/5'
);

// 5. Table styles
content = content.replace(
  /<thead className="bg-transparent\/5 text-white\/60 border-b border-white\/10 ">/,
  '<thead className="bg-white/5 text-white/70 border-b border-white/10">'
);
content = content.replace(
  /<th className="px-4 py-3 font-medium">/g,
  '<th className="px-6 py-4 font-semibold tracking-wide text-xs uppercase">'
);
content = content.replace(
  /<td className="px-4 py-3 font-medium truncate max-w-\[300px\]">/g,
  '<td className="px-6 py-4 font-medium truncate max-w-[300px] text-white">'
);
content = content.replace(
  /<td className="px-4 py-3">/g,
  '<td className="px-6 py-4">'
);
content = content.replace(
  /<td className="px-4 py-3 text-xs uppercase tracking-wide">/g,
  '<td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/80">'
);
content = content.replace(
  /<td className="px-4 py-3 text-white\/60">/g,
  '<td className="px-6 py-4 text-white/60 font-medium">'
);

fs.writeFileSync(plannerPath, content, 'utf8');
console.log('Planner.tsx updated for Glassmorphism.');
