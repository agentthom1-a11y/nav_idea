const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components')
];

const replacements = [
  { regex: /text-slate-500/g, replacement: 'text-white/60' },
  { regex: /text-slate-400/g, replacement: 'text-white/50' },
  { regex: /text-slate-600/g, replacement: 'text-white/70' },
  { regex: /text-slate-700/g, replacement: 'text-white/80' },
  { regex: /text-slate-900/g, replacement: 'text-white' },
  { regex: /bg-slate-50\/50/g, replacement: 'bg-white/5' },
  { regex: /bg-slate-50/g, replacement: 'bg-white/5' },
  { regex: /bg-slate-100/g, replacement: 'bg-white/10' },
  { regex: /bg-slate-200/g, replacement: 'bg-white/20' },
  { regex: /border-slate-100/g, replacement: 'border-white/5' },
  { regex: /border-slate-200/g, replacement: 'border-white/10' },
  { regex: /border-slate-300/g, replacement: 'border-white/20' },
  // Remove dark mode specific classes as the theme is now universally dark/glass
  { regex: /dark:text-slate-[0-9]+/g, replacement: '' },
  { regex: /dark:text-white/g, replacement: '' },
  { regex: /dark:bg-slate-[0-9]+(\/[0-9]+)?/g, replacement: '' },
  { regex: /dark:border-slate-[0-9]+(\/[0-9]+)?/g, replacement: '' },
  { regex: /dark:hover:bg-slate-[0-9]+(\/[0-9]+)?/g, replacement: '' },
  { regex: /dark:hover:text-white/g, replacement: '' },
  { regex: /dark:hover:border-slate-[0-9]+/g, replacement: '' },
  // Fix double spaces
  { regex: / +/g, replacement: ' ' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }
  
  // Clean up any empty classNames like className=" "
  content = content.replace(/className="\s+"/g, 'className=""');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

directories.forEach(processDirectory);
console.log('Glassmorphism CSS classes applied successfully.');
