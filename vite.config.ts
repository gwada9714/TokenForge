import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  css: {
    postcss: './postcss.config.cjs',
  },
  optimizeDeps: {
    include: ['@rainbow-me/rainbowkit']
  }
});