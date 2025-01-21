import { vi } from 'vitest'

// Mock des services
vi.mock('../features/auth/services/notificationService', () => ({
  notificationService: {
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock de window.ethereum
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    isMetaMask: true,
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
})
