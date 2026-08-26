const fs = require('fs');
const path = 'src/pages/ContentEditor.tsx';
let data = fs.readFileSync(path, 'utf8');

const target = `{/* Approval Flow */}`;
const replacement = `<ReadabilityRing text={(item.script || '') + ' ' + (item.caption || '') + ' ' + (item.description || '')} />\n            \n            {/* Approval Flow */}`;

data = data.replace(target, replacement);
fs.writeFileSync(path, data);
