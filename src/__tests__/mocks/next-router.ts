import { vi } from "vitest";

// Mock pour next/router
export const useRouter = vi.fn().mockReturnValue({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
  isReady: true,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
});

// Export par défaut pour les mocks ESM
export default {
  useRouter,
};
