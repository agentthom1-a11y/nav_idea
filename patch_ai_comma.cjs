const fs = require('fs');
const file = 'src/services/ai.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("return data.plan || [];\n  }\n  async auditSEO(", "return data.plan || [];\n  },\n  async auditSEO(");
fs.writeFileSync(file, content);
console.log('Fixed comma');
