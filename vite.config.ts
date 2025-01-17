import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Configuration du plugin React
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    hmr: {
      overlay: false // Désactive l'overlay d'erreur qui peut ralentir
    },
    watch: {
      usePolling: false, // Désactive le polling qui peut ralentir
      interval: 100
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      'wagmi',
      'viem',
      '@rainbow-me/rainbowkit'
    ],
    exclude: ['@openzeppelin/contracts'], // Exclure les dépendances non nécessaires au démarrage
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false, // Désactive les sourcemaps en dev pour plus de rapidité
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'web3-vendor': ['wagmi', 'viem', '@rainbow-me/rainbowkit']
        }
      }
    },
    commonjsOptions: {
      include: [],
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});