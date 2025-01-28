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
    base: '/',
    server: {
      open: true,
      port: 3001,
      host: true,
      strictPort: false, // Permet de chercher le prochain port disponible
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@features': path.resolve(__dirname, './src/components/features'),
        '@common': path.resolve(__dirname, './src/components/common'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@providers': path.resolve(__dirname, './src/providers'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        'events': 'events',
        'buffer': 'buffer',
        'process': 'process/browser',
        'util': 'util',
        'stream': 'stream-browserify',
        'zlib': 'browserify-zlib',
        'eventemitter3': path.resolve(__dirname, 'node_modules/eventemitter3/index.js'),
        'qrcode': path.resolve(__dirname, 'node_modules/qrcode/lib/browser.js'),
        'ua-parser-js': path.resolve(__dirname, 'node_modules/ua-parser-js/dist/ua-parser.min.js')
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      },
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'broadcast-channel',
        'buffer',
        'process',
        'events',
        'util',
        'stream-browserify',
        'browserify-zlib',
        'eventemitter3',
        'qrcode',
        'ua-parser-js'
      ],
      exclude: ['@rainbow-me/rainbowkit']
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