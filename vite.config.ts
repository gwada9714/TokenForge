import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      }
    }),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      injectRegister: 'auto',
      manifest: {
        name: 'TokenForge',
        short_name: 'TokenForge',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  server: {
    port: 3001,
    strictPort: true,
    headers: {
      'Service-Worker-Allowed': '/',
      'Content-Type': 'application/javascript'
    },
    hmr: {
      overlay: false // Désactive l'overlay d'erreur qui peut ralentir
    },
    watch: {
      usePolling: false, // Désactive le polling qui peut être lent
      interval: 100 // Réduit l'intervalle de vérification
    }
  },
  build: {
    target: ['esnext'],
    minify: 'esbuild', // Plus rapide que terser
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-web3': ['wagmi', 'viem', 'ethers'],
          'vendor-ui': ['@mui/material', '@mui/icons-material'],
          'vendor-utils': ['@reduxjs/toolkit', 'react-redux']
        }
      },
      treeshake: true
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: true,
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'wagmi',
      'viem',
      'ethers',
      '@mui/material',
      '@mui/icons-material',
      '@reduxjs/toolkit',
      'react-redux'
    ],
    exclude: ['@vite/client', '@vite/env'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  cacheDir: '.vite',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});