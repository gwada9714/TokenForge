import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.VITE_WALLET_CONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLET_CONNECT_PROJECT_ID),
      'process.env.VITE_ALCHEMY_API_KEY': JSON.stringify(env.VITE_ALCHEMY_API_KEY),
      'process.env.VITE_TOKEN_FACTORY_SEPOLIA': JSON.stringify(env.VITE_TOKEN_FACTORY_SEPOLIA),
      'process.env.VITE_DEFAULT_NETWORK': JSON.stringify(env.VITE_DEFAULT_NETWORK),
      global: 'globalThis',
    },
    plugins: [
      react(),
      nodePolyfills({
        include: ['buffer', 'process', 'util', 'stream', 'path', 'http', 'https', 'fs', 'crypto'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
    ],
    resolve: {
      alias: [
        { find: '@', replacement: resolve(__dirname, './src') },
        { find: 'stream', replacement: 'stream-browserify' },
        { find: 'http', replacement: 'stream-http' },
        { find: 'https', replacement: 'https-browserify' },
        { find: 'util', replacement: 'util' },
        { find: 'path', replacement: 'path-browserify' },
        { find: 'zlib', replacement: 'browserify-zlib' },
        { find: 'crypto', replacement: 'crypto-browserify' },
      ],
      dedupe: ['react', 'react-dom'],
      preserveSymlinks: true,
    },
    server: {
      port: 5173,
      strictPort: false,
      open: true,
      headers: {
        'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com https://binaries.soliditylang.org https://*.walletconnect.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.infura.io wss://*.infura.io https://*.alchemy.com wss://*.alchemy.com"
      }
    },
    optimizeDeps: {
      exclude: ['solc'],
      include: [
        'react',
        'react-dom',
        'wagmi',
        'viem',
        '@wagmi/core',
        'ethers',
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        },
        platform: 'browser',
        target: 'esnext',
      }
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
      target: 'esnext',
      sourcemap: true,
    },
  };
});
