import { vi } from "vitest";

export const TEST_TIMEOUT = 5000;
export const PERFORMANCE_THRESHOLDS = {
  maxResponseTime: 200,
  averageResponseTime: 100,
  minThroughput: 50,
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  maxConnections: 10,
};

export const MOCK_DELAYS = {
  networkLatency: 50,
  blockConfirmation: 100,
  tokenTransfer: 150,
};

export const TEST_NETWORKS = {
  ETHEREUM: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "http://localhost:8545",
    blockTime: 12,
  },
  POLYGON: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "http://localhost:8546",
    blockTime: 2,
  },
};

export const mockBlockchainProvider = () => ({
  getProvider: vi.fn().mockReturnValue({
    getBalance: vi.fn().mockResolvedValue("2000000000000000000"),
    getGasPrice: vi.fn().mockResolvedValue("20000000000"),
    getBlockNumber: vi.fn().mockResolvedValue(1000000),
    getBlock: vi.fn().mockResolvedValue({
      timestamp: Date.now() / 1000,
      number: 1000000,
    }),
  }),
});

export const mockWalletProvider = () => ({
  connect: vi.fn().mockResolvedValue(true),
  disconnect: vi.fn().mockResolvedValue(true),
  getAccounts: vi
    .fn()
    .mockResolvedValue(["0x1234567890123456789012345678901234567890"]),
  signMessage: vi.fn().mockResolvedValue("0xsignature"),
  sendTransaction: vi.fn().mockResolvedValue({ hash: "0xtxhash" }),
});

export const mockNotificationService = () => ({
  notify: vi.fn(),
  getNotifications: vi.fn().mockReturnValue([]),
  clearNotifications: vi.fn(),
});

export const mockSecurityService = () => ({
  validateToken: vi.fn().mockResolvedValue(true),
  checkPermissions: vi.fn().mockResolvedValue(true),
  detectThreats: vi.fn().mockReturnValue(false),
  logSecurityEvent: vi.fn(),
});

export const mockPerformanceMonitor = () => ({
  startMetrics: vi.fn().mockReturnValue({ startTime: Date.now() }),
  endMetrics: vi.fn().mockReturnValue({
    totalTime: 100,
    averageResponseTime: 50,
    maxResponseTime: 150,
    minResponseTime: 20,
    throughput: 100,
  }),
  trackMemoryUsage: vi.fn().mockResolvedValue({
    peak: 50 * 1024 * 1024,
    leaked: 0,
  }),
  trackConnections: vi.fn().mockResolvedValue({
    peak: 5,
    leaked: 0,
  }),
});
