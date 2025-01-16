import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
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
        filename: 'sw.ts',
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module'
        },
        manifest: {
          name: 'TokenForge',
          short_name: 'TokenForge',
          description: 'TokenForge - Your Web3 Token Platform',
          theme_color: '#ffffff',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          icons: [
            {
              src: '/favicon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon'
            }
          ]
        },
      })
    ],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'react-router-dom',
        'react-redux',
        '@rainbow-me/rainbowkit',
        'wagmi',
        '@tanstack/react-query'
      ],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: true,
      hmr: {
        timeout: 120000
      }
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1600,
      target: 'esnext',
      minify: false,
      cssMinify: false,
      rollupOptions: {
        treeshake: false,
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) {
                return 'vendor-react';
              }
              if (id.includes('@mui')) {
                return 'vendor-mui';
              }
              if (id.includes('wagmi') || id.includes('rainbow') || id.includes('viem')) {
                return 'vendor-web3';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    define: {
      'process.env': {}
    }
  };
});