const fs = require('fs');
const file = 'vite.config.ts';
const content = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        target: 'es2020',
      },
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'zustand']
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
      },
    }
  };
});
`;
fs.writeFileSync(file, content);
console.log('Patched vite.config.ts strictly');
