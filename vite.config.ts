import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@babel/plugin-syntax-import-meta']
      }
    })
  ],
  css: {
    postcss: './postcss.config.cjs'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3002,
    strictPort: true,
    host: true
  },
  define: {
    'process.env': {},
    global: {},
  },
}); 