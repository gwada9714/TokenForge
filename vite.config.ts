import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { optimize: true }]
        ]
      }
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
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
      },
      manifest: {
        name: 'TokenForge',
        short_name: 'TokenForge',
        description: 'Create and manage your own tokens',
        theme_color: '#7b3fe4',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
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
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'process': 'process/browser',
      'stream': 'stream-browserify',
      'zlib': 'browserify-zlib',
      'util': 'util',
      'buffer': 'buffer'
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'web3-vendor': ['wagmi', '@rainbow-me/rainbowkit'],
          'rainbow': ['@rainbow-me/rainbowkit'],
          'wagmi': ['wagmi']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      supported: { 
        bigint: true 
      },
      define: {
        global: 'globalThis'
      }
    },
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'wagmi',
      '@rainbow-me/rainbowkit',
      '@rainbow-me/rainbowkit/wallets',
      'wagmi/providers/alchemy',
      'wagmi/providers/public'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  server: {
    port: 3000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization'],
    },
    proxy: {
      '^/api/.*': {
        target: 'https://rpc.sepolia.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    host: true,
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: false
    },
    fs: {
      strict: false,
      allow: ['.']
    }
  }
});