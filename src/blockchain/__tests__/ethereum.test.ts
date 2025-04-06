import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  EthereumBlockchainService,
  EthereumPaymentService,
  EthereumTokenService,
} from "../adapters/ethereum";

// Mock du module viem
vi.mock("viem", async () => {
  const actual = await vi.importActual("viem");
  return {
    ...actual,
    createPublicClient: vi.fn().mockImplementation(() => mockPublicClient),
    createWalletClient: vi.fn().mockImplementation(() => mockWalletClient),
    parseEther: vi
      .fn()
      .mockImplementation((amount) => BigInt(amount) * 10n ** 18n),
  };
});

// Mock du provider factory
vi.mock("../providers/index", () => ({
  createEvmProvider: vi.fn().mockImplementation(() => ({
    publicClient: mockPublicClient,
    walletClient: mockWalletClient,
  })),
}));

// Mocks pour les tests
const mockPublicClient = {
  getChainId: vi.fn().mockResolvedValue(1),
  getBalance: vi.fn().mockResolvedValue(10n * 10n ** 18n),
  getGasPrice: vi.fn().mockResolvedValue(2000000000n), // 2 gwei
  getTransaction: vi.fn().mockImplementation((hash) => {
    if (hash.hash === "0xvalidtransactionhash") {
      return Promise.resolve({
        hash: "0xvalidtransactionhash",
        blockNumber: 1234567n,
        confirmations: 10,
      });
    }
    return Promise.resolve(null);
  }),
  estimateGas: vi.fn().mockResolvedValue(21000n),
};

const mockWalletClient = {
  account: {
    address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  },
  deployContract: vi.fn().mockResolvedValue("0xcontractdeploymenthash"),
  sendTransaction: vi.fn().mockResolvedValue("0xtransactionhash"),
  writeContract: vi.fn().mockResolvedValue("0xcontractcallhash"),
};

describe("EthereumBlockchainService", () => {
  let service: EthereumBlockchainService;

  beforeEach(() => {
    service = new EthereumBlockchainService({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get balance correctly", async () => {
    const balance = await service.getBalance(
      "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
    );
    expect(mockPublicClient.getBalance).toHaveBeenCalledWith({
      address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    });
    expect(balance).toBe(10n * 10n ** 18n);
  });

  it("should get network id correctly", async () => {
    const networkId = await service.getNetworkId();
    expect(mockPublicClient.getChainId).toHaveBeenCalled();
    expect(networkId).toBe(1);
  });

  it("should check connection correctly", async () => {
    const connected = await service.isConnected();
    expect(mockPublicClient.getChainId).toHaveBeenCalled();
    expect(connected).toBe(true);
  });

  it("should estimate gas correctly", async () => {
    const transaction = { to: "0x123", value: 1000n };
    const gas = await service.estimateGas(transaction);
    expect(mockPublicClient.estimateGas).toHaveBeenCalledWith(transaction);
    expect(gas).toBe(21000n);
  });

  it("should get gas price correctly", async () => {
    const gasPrice = await service.getGasPrice();
    expect(mockPublicClient.getGasPrice).toHaveBeenCalled();
    expect(gasPrice).toBe(2000000000n);
  });
});

describe("EthereumPaymentService", () => {
  let service: EthereumPaymentService;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    // Date.now() pour les tests prédictibles
    vi.setSystemTime(new Date("2025-01-01"));

    service = new EthereumPaymentService({});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should create payment session with correct id format", async () => {
    // Mock Math.random pour prédictibilité
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);

    const sessionId = await service.createPaymentSession(
      1000000000000000000n,
      "ETH"
    );
    expect(sessionId).toMatch(/^eth-\d+-\d+$/);
    expect(sessionId).toContain("eth-1704067200000-500");

    randomSpy.mockRestore();
  });

  it("should verify payment correctly for valid transaction", async () => {
    const result = await service.verifyPayment("0xvalidtransactionhash");
    expect(mockPublicClient.getTransaction).toHaveBeenCalledWith({
      hash: "0xvalidtransactionhash",
    });
    expect(result).toBe(true);
  });

  it("should verify payment correctly for invalid transaction", async () => {
    const result = await service.verifyPayment("0xinvalidtransactionhash");
    expect(mockPublicClient.getTransaction).toHaveBeenCalledWith({
      hash: "0xinvalidtransactionhash",
    });
    expect(result).toBe(false);
  });

  it("should calculate fees based on gas price", async () => {
    const fees = await service.calculateFees(1000000000000000000n);
    expect(mockPublicClient.getGasPrice).toHaveBeenCalled();
    // 21000 (gasLimit) * 2000000000 (gasPrice) = 42000000000000
    expect(fees).toBe(42000000000000n);
  });
});
