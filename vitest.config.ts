/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { baseConfig } from "./vitest.base.config";

// Étend la configuration de base avec des options spécifiques
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
