import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cspPlugin } from './vite-plugin-csp';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
  define: {
    'process.env': process.env,
  },
});