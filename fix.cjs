const fs = require('fs');
const file = 'src/pages/ContentList.tsx';
let content = fs.readFileSync(file, 'utf8');

const endPattern = /      \)}\n    <\/div>\n  \);\n}$/;
content = content.replace(endPattern, `      )}\n      </div>\n    </div>\n  );\n}`);

fs.writeFileSync(file, content, 'utf8');
