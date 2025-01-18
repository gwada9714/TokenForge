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
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    nodePolyfills(),
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
      '@components': path.resolve(__dirname, './src/components'),
      '@config': path.resolve(__dirname, './src/config'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@reducers': path.resolve(__dirname, './src/reducers'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3005,
    strictPort: true,
    host: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    },
    hmr: {
      overlay: true,
      clientPort: 3005
    },
    fs: {
      strict: false,
      allow: ['..']
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  preview: {
    port: 3005,
    strictPort: true,
    host: true,
    cors: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'wagmi',
      '@rainbow-me/rainbowkit',
      '@tanstack/react-query'
    ],
    exclude: []
  },
  cacheDir: '.vite',
  define: {
    'process.env': {}
  }
});