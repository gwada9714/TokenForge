/// <reference types="vitest" />
import { defineConfig, UserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

/**
 * Configuration de base pour Vitest
 * Cette configuration peut être étendue pour des cas d'utilisation spécifiques
 */
export const baseConfig: UserConfig = {
  plugins: [
    react(),
    tsconfigPaths({
      projects: ["./tsconfig.test.json"],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/types/**/*.ts"],
    },
    deps: {
      optimizer: {
        web: {
          include: [
            "viem",
            "firebase/app",
            "firebase/auth",
            "@testing-library/jest-dom",
            "@rainbow-me/rainbowkit",
            "wagmi",
            "@mui/material",
            "@mui/system",
          ],
        },
      },
    },
    typecheck: {
      tsconfig: "./tsconfig.json",
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      ignoreSourceErrors: true,
    },
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
    pool: "threads",
    isolate: false,
    mockReset: false,
    sequence: {
      hooks: "list",
    },
  },
};

/**
 * Configuration par défaut pour Vitest
 */
export default defineConfig(baseConfig);
