const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components')
];

const replacements = [
  // Cards
  { regex: /bg-white border border-white\/10 rounded-xl overflow-hidden/g, replacement: 'glass-card overflow-hidden' },
  { regex: /bg-white p-4 rounded-lg shadow-sm border border-white\/10/g, replacement: 'glass-card p-4' },
  { regex: /bg-white rounded-xl shadow-xl/g, replacement: 'glass-card shadow-xl' },
  { regex: /border border-white\/10 rounded-lg bg-white/g, replacement: 'glass-card' },
  { regex: /bg-white rounded-lg border border-white\/10/g, replacement: 'glass-card' },
  { regex: /bg-white rounded border border-white\/10/g, replacement: 'glass-card' },
  { regex: /bg-white border-white\/10/g, replacement: 'glass-card' },
  { regex: /bg-white border border-white\/10 rounded px-2 py-1/g, replacement: 'glass-input px-2 py-1' },
  // Buttons
  { regex: /bg-slate-900 dark:bg-white text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 dark:hover:bg-white\/10 transition-colors shadow-sm/g, replacement: 'btn-primary px-4 py-2 rounded-md font-medium transition-colors shadow-sm text-white' },
  { regex: /bg-slate-900 text-white font-medium/g, replacement: 'btn-primary text-white font-medium' },
  { regex: /bg-slate-900 dark:bg-white text-white rounded-md text-sm font-medium hover:bg-slate-800/g, replacement: 'btn-primary text-white rounded-md text-sm font-medium' },
  // Inputs
  { regex: /bg-white border border-white\/10 rounded-md/g, replacement: 'glass-input' },
  { regex: /bg-white/g, replacement: 'bg-transparent' } // any remaining bg-white should be transparent in glass design, except where already replaced
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }
  
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
console.log('Glassmorphism pass 2 applied.');
