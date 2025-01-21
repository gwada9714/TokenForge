/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
      ],
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    poolOptions: {
      threads: {
        singleThread: false
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'test': resolve(__dirname, './src/test')
    },
  },
});
