/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/test/**/*'
      ]
    },
    deps: {
      inline: [
        'viem',
        '@wagmi/core',
        '@firebase/auth',
        '@firebase/firestore'
      ]
    }
  },
  plugins: [react(), tsconfigPaths()]
})
