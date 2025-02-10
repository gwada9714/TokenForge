import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement basées sur le mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      // Rend les variables d'environnement disponibles globalement
      'process.env': env,
      global: 'globalThis',
    },
    base: './',
    server: {
      open: true,
      port: 3001,
      host: true,
      strictPort: false, // Permet de chercher le prochain port disponible
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        "Content-Security-Policy": `
          default-src 'self';
          connect-src 'self' https://*.walletconnect.org https://*.infura.io https://*.alchemyapi.io wss://*.walletconnect.org;
          font-src 'self' data: https://fonts.gstatic.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' data: https: blob:;
        `
      }
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        },
        jsxRuntime: 'automatic'
      }),
      nodePolyfills({
        include: ['buffer', 'process', 'util', 'stream', 'events'],
        globals: {
          Buffer: true,
          global: true,
          process: true
        },
        protocolImports: true
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'TokenForge',
          short_name: 'TokenForge',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
        workbox: {
          cleanupOutdatedCaches: true,
          sourcemap: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
        }
      })
    ],
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
        '@rainbow-me/rainbowkit',
        'eventemitter3',
        'qrcode'
      ]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': './src/components',
        '@features': './src/components/features',
        '@common': './src/components/common',
        '@hooks': './src/hooks',
        '@providers': './src/providers',
        '@utils': './src/utils',
        '@types': './src/types',
        'events': 'events',
        'buffer': 'buffer',
        'process': 'process/browser',
        'util': 'util',
        'stream': 'stream-browserify',
        'zlib': 'browserify-zlib',
        'eventemitter3': path.resolve(__dirname, 'node_modules/eventemitter3/index.js'),
        'qrcode': path.resolve(__dirname, 'node_modules/qrcode/lib/browser.js'),
        'ua-parser-js': './node_modules/ua-parser-js/dist/ua-parser.min.js'
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        external: ['buffer'],
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'mui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
            'web3-vendor': ['viem', 'wagmi', '@rainbow-me/rainbowkit']
          }
        }
      },
      commonjsOptions: {
        transformMixedEsModules: true,
        defaultIsModuleExports: true,
        requireReturnsDefault: 'auto',
        include: [
          /node_modules/,
          /ua-parser-js/,
          /qrcode/,
          /eventemitter3/
        ]
      }
    }
  };
});