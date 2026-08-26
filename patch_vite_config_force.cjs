const fs = require('fs');
const file = 'vite.config.ts';
let content = fs.readFileSync(file, 'utf8');

// Ensure we have absolute paths for react to prevent duplicate React instances
content = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      force: true,
      include: ['react', 'react-dom', 'react-router-dom']
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
`;

fs.writeFileSync(file, content);
console.log('Patched vite.config.ts to force optimizeDeps and absolute aliases');

