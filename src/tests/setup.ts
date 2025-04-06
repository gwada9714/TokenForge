import { beforeAll, afterAll, vi } from "vitest";
import { mockPublicClient, mockWalletClient } from "./mocks/blockchain";

// Configuration globale pour les tests
beforeAll(() => {
  // Remplacer les appels à l'horloge pour un contrôle précis des temps
  vi.useFakeTimers();

  // Configurer les mocks globaux
  global.mockPublicClient = mockPublicClient;
  global.mockWalletClient = mockWalletClient;

  // Autres configurations globales
});

afterAll(() => {
  vi.useRealTimers();
  // Nettoyage global
});

// Déclaration pour TypeScript
declare global {
  // eslint-disable-next-line no-var
  var mockPublicClient: any;
  // eslint-disable-next-line no-var
  var mockWalletClient: any;
}
