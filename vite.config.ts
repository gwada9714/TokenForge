import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import dts from 'vite-plugin-dts';
import { securityMiddleware } from './src/security/middleware';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'", "https://*.firebaseio.com", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'data:', 'https:'],
  'connect-src': [
    "'self'",
    'https://*.firebase.app',
    'https://*.firebaseio.com',
    'https://*.cloudfunctions.net',
    'wss://*.firebaseio.com',
    'https://firestore.googleapis.com',
    'ws://localhost:*',
    'https://*.googleapis.com'
  ],
  'frame-src': ["'self'", 'https://*.firebaseapp.com'],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

const cspString = Object.entries(cspConfig)
  .map(([key, values]) => `${key} ${values.join(' ')}`)
  .join('; ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;

  return {
    define: {
      'process.env': Object.entries(env).reduce((prev, [key, val]) => {
        return {
          ...prev,
          [key]: val
        };
      }, {}),
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
      port: PORT,
      strictPort: true,
      host: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: PORT,
        clientPort: PORT
      },
      open: true,
      headers: {
        "Cache-Control": isDev ? "no-store" : "public, max-age=31536000, immutable",
        "Content-Security-Policy": isDev ? '' : cspString,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), bluetooth=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      },
      watch: {
        usePolling: true
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
      sourcemap: isDev,
      outDir: process.env.BUILD_PATH || 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'firebase';
              if (id.includes('react')) return 'react';
              if (id.includes('@emotion')) return 'emotion';
              if (id.includes('@mui')) return 'mui';
              return 'vendor';
            }
          }
        }
      },
      target: ['esnext', 'edge89', 'firefox79', 'chrome87', 'safari14'],
      minify: !isDev,
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
      exclude: ['@firebase/auth', '@firebase/app'],
      esbuildOptions: {
        target: 'esnext'
      }
    }
  };
});