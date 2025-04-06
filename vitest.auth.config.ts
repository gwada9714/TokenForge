/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { baseConfig } from "./vitest.base.config";
import { resolve } from "path";

// Étend la configuration de base avec des options spécifiques pour les tests d'authentification
export default defineConfig({
  ...baseConfig,
  resolve: {
    ...baseConfig.resolve,
    alias: {
      ...baseConfig.resolve?.alias,
      "next/router": resolve(__dirname, "./src/__mocks__/next/router.ts"),
    },
  },
  test: {
    ...baseConfig.test,
    include: [
      "src/hooks/__tests__/useAuth.test.tsx",
      "src/contexts/__tests__/AuthContext.test.tsx",
      "src/components/__tests__/AuthGuard.test.tsx",
    ],
    exclude: [],
  },
});
