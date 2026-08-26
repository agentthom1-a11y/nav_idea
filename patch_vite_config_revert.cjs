const fs = require('fs');
const file = 'vite.config.ts';
let content = fs.readFileSync(file, 'utf8');

// Revert to a clean config
content = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
`;

fs.writeFileSync(file, content);
console.log('Reverted vite.config.ts');

const indexFile = 'index.html';
let indexContent = fs.readFileSync(indexFile, 'utf8');
indexContent = indexContent.replace('/src/main.tsx?v=4', '/src/main.tsx?v=5');
// In case it was already replaced or didn't have a version
indexContent = indexContent.replace('/src/main.tsx"', '/src/main.tsx?v=5"');
fs.writeFileSync(indexFile, indexContent);
console.log('Updated index.html cache buster');
