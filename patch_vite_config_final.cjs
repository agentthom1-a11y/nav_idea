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
        '@': path.resolve(__dirname, 'src'),
      },
      dedupe: ['react', 'react-dom']
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      host: '0.0.0.0',
      port: 3000
    },
  };
});
`;
fs.writeFileSync(file, content);
