const fs = require('fs');
const file = 'vite.config.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("'react': path.resolve(__dirname, 'node_modules/react')")) {
  content = content.replace(
    "alias: {",
    `alias: {
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),`
  );
  
  if (!content.includes("optimizeDeps")) {
    content = content.replace(
      "server: {",
      `optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    },
    server: {`
    );
  }
  
  fs.writeFileSync(file, content);
  console.log('Patched vite.config.ts');
} else {
  console.log('Already patched');
}
