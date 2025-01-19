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
      'process.env': env
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
            ['@babel/plugin-transform-react-jsx', { optimize: true }]
          ]
        },
        jsxRuntime: 'automatic'
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
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
      exclude: ['@rainbow-me/rainbowkit']
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            web3: ['wagmi', 'viem', '@rainbow-me/rainbowkit']
          }
        }
      }
    }
  };
});