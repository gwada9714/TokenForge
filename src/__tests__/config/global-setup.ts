import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  // Configuration globale avant les tests
  process.env.NODE_ENV = "test";
  process.env.VITE_TEST_MODE = "true";

  // Autres configurations globales si nécessaire
}

export default globalSetup;
