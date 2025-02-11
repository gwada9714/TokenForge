import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import dts from 'vite-plugin-dts';
import { securityMiddleware } from './src/security/middleware';

const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.firebaseio.com", "https://*.firebase.com"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://*.firebase.app',
    'https://*.firebaseio.com',
    'https://*.cloudfunctions.net',
    'wss://*.firebaseio.com'
  ],
  'frame-src': ["'self'", 'https://*.firebaseapp.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"]
};

const cspString = Object.entries(cspConfig)
  .map(([key, values]) => `${key} ${values.join(' ')}`)
  .join('; ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    define: {
      // Injection des variables d'environnement
      'process.env': env,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __FIREBASE_CONFIG__: {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID
      }
    },
    server: {
      port: 3002,
      strictPort: true,
      host: true,
      hmr: {
        port: 3002
      },
      open: true,
      headers: {
        "Cache-Control": "no-store",
        "Content-Security-Policy": cspString,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    plugins: [
      // Middleware de sécurité désactivé en développement
      !isDev && securityMiddleware(),
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
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      sourcemap: mode !== 'production',
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            vendor: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@firebase/auth']
    }
  };
});