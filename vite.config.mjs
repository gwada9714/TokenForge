import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'path', 'http', 'https', 'fs'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },
  define: {
    'process.env': {},
  },
  server: {
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"
    }
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      path: 'path-browserify',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'web3-deps': [
            'ethers',
            'viem',
            'wagmi',
            '@wagmi/core',
            '@wagmi/connectors',
          ],
        },
      },
    },
  },
});
