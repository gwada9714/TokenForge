import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import { cspPlugin } from './vite-plugin-csp';

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
      'process.env': process.env
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: [
            '@emotion/babel-plugin',
            'babel-plugin-macros'
          ],
        },
      }),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'TokenForge',
          short_name: 'TokenForge',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
      cspPlugin({
        development: mode === 'development'
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        'process': 'process/browser',
        'stream': 'stream-browserify',
        'zlib': 'browserify-zlib',
        'util': 'util',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
        supported: { bigint: true },
        define: {
          global: 'globalThis',
        },
      },
      include: [
        '@wagmi/core',
        'ethers',
        'web3',
        '@emotion/react',
        '@emotion/styled',
      ],
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
            web3: ['ethers', 'web3', '@wagmi/core'],
          },
        },
      },
      sourcemap: !isDev,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      headers: isDev ? {} : {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
      hmr: {
        port: 24678,
        overlay: true,
      },
      watch: {
        usePolling: true,
        interval: 1000,
      },
      fs: {
        strict: false,
        allow: ['..'],
      },
    },
  };
});