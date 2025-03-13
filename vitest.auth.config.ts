/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths({
    projects: ['./tsconfig.test.json']
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'next/router': resolve(__dirname, './src/__mocks__/next/router.ts')
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: [
      'src/hooks/__tests__/useAuth.test.tsx',
      'src/contexts/__tests__/AuthContext.test.tsx',
      'src/components/__tests__/AuthGuard.test.tsx'
    ],
    exclude: [],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/types/**/*.ts']
    },
    deps: {
      optimizer: {
        web: {
          include: [
            'viem',
            'firebase/app',
            'firebase/auth',
            '@testing-library/jest-dom',
            '@rainbow-me/rainbowkit',
            'wagmi',
            '@mui/material',
            '@mui/system'
          ]
        }
      }
    },
    typecheck: {
      tsconfig: './tsconfig.json',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      ignoreSourceErrors: true
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    },
    pool: 'threads',
    isolate: false,
    mockReset: false,
    sequence: {
      hooks: 'list'
    }
  }
});
