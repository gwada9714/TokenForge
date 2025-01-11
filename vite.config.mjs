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
    port: 5173,
    strictPort: false,
    open: true,
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com https://binaries.soliditylang.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"
    }
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      path: 'path-browserify',
    },
  },
  optimizeDeps: {
    exclude: ['solc']
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
