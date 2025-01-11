import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    define: {
      'process.env.VITE_WALLET_CONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLET_CONNECT_PROJECT_ID),
      'process.env.VITE_ALCHEMY_API_KEY': JSON.stringify(env.VITE_ALCHEMY_API_KEY),
      'process.env.VITE_TOKEN_FACTORY_SEPOLIA': JSON.stringify(env.VITE_TOKEN_FACTORY_SEPOLIA),
      'process.env.VITE_DEFAULT_NETWORK': JSON.stringify(env.VITE_DEFAULT_NETWORK),
      'process.env.MODE': JSON.stringify(mode),
      global: 'globalThis',
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
        fastRefresh: true,
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
            '@babel/plugin-transform-class-properties',
          ],
        },
      }),
      nodePolyfills({
        include: ['buffer', 'process', 'util', 'stream', 'path', 'http', 'https', 'fs', 'crypto'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'TokenForge',
          short_name: 'TokenForge',
          description: 'Create your own token in seconds',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
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
        "Content-Security-Policy": [
          "default-src 'self';",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: blob: data:;",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
          "font-src 'self' https://fonts.gstatic.com;",
          "connect-src 'self' https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://*.infura.io wss://*.infura.io https://*.alchemy.com wss://*.alchemy.com wss://*.walletlink.org https://ethereum-api.xyz https://*.ethereum-api.xyz https://binaries.soliditylang.org ws://localhost:* http://localhost:*;",
          "img-src 'self' data: https: blob:;",
          "media-src 'self';",
          "object-src 'none';",
          "worker-src 'self' blob:;",
          "frame-src 'self' https://*.walletconnect.com;"
        ].join(' ')
      },
      hmr: {
        overlay: true,
      },
      watch: {
        usePolling: true,
      },
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
        supported: {
          'top-level-await': true,
        },
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
      minify: !isDev,
    },
  };
});