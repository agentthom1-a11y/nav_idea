const fs = require('fs');
const file = 'src/pages/ContentList.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        </div>
        {quickViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setQuickViewItem(null)}>`;

const replacementStr = `        </div>
      </div>
      {quickViewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setQuickViewItem(null)}>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content, 'utf8');
