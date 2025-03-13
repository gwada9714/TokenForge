import { vi } from 'vitest';

const router = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  reload: vi.fn(),
  forward: vi.fn(),
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  isReady: true,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
};

export const useRouter = vi.fn(() => router);

// Export par défaut pour les mocks ESM
export default {
  useRouter
};
