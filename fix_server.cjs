const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  '- Output ONLY the post content, no extra markdown or pleasantries.`;',
  '- Output ONLY the post content, no extra markdown or pleasantries.` + buildContextString(brandContext);'
);

fs.writeFileSync('server.ts', server);
