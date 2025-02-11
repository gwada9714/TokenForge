import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import dts from 'vite-plugin-dts';
import { securityMiddleware } from './src/security/middleware';
import { generateNonce } from './src/security/nonce';

const nonce = generateNonce();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    plugins: [
      securityMiddleware(),
      react({
        babel: {
          plugins: [
            ['@emotion/babel-plugin', { sourceMap: true }],
            '@babel/plugin-syntax-import-meta'
          ],
          parserOpts: {
            plugins: ['jsx', 'importMeta']
          }
        },
        jsxRuntime: 'classic'
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
      }),
      dts({
        insertTypesEntry: true,
        exclude: ['**/*.test.ts']
      })
    ],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `[name]~${nonce}.js`,
          chunkFileNames: `[name]~${nonce}.js`,
          assetFileNames: `[name]~${nonce}.[ext]`
        },
        external: [/^@\//]
      }
    },
    server: {
      open: true,
      port: 3002
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});