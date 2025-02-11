import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { securityMiddleware } from './src/security/middleware';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    plugins: [
      securityMiddleware(),
      react({
        babel: {
          plugins: ['babel-plugin-macros']
        }
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
        }
      })
    ],
    server: {
      open: true,
      port: 3002,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    },
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
        stream: 'stream-browserify',
        crypto: 'crypto-browserify'
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'web3': ['viem', '@wagmi/core', 'wagmi'],
            'ui': ['@mui/material', '@emotion/react', '@emotion/styled']
          }
        }
      }
    }
  };
});