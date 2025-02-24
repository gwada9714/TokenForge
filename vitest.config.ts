/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**'
      ]
    },
    deps: {
      inline: [
        'viem',
        'firebase/app',
        'firebase/auth',
        '@testing-library/jest-dom'
      ]
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
    pool: 'forks',
    isolate: true,
    mockReset: true
  }
});
