import { vi } from "vitest";
import { providers, BigNumber } from "ethers";
import { ChainId } from "../../../../types/Chain";

export function getMockChainConfig() {
  return {
    id: 137,
    chainId: 137,
    networkId: 137,
    name: "Polygon",
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    testnet: false,
  };
}

export function getMockProvider() {
  const mockProviderImpl = {
    getBalance: vi
      .fn()
      .mockResolvedValue(BigNumber.from("1000000000000000000")),
    getGasPrice: vi.fn().mockResolvedValue(BigNumber.from("20000000000")),
    estimateGas: vi.fn().mockResolvedValue(BigNumber.from("21000")),
    getNetwork: vi.fn().mockResolvedValue({ chainId: 137, name: "matic" }),
    getBlockNumber: vi.fn().mockResolvedValue(1000000),
    getSigner: vi.fn(),
    _isProvider: true,
    connection: {
      url: "https://polygon-rpc.com",
    },
    getTransaction: vi.fn().mockResolvedValue(null),
    getTransactionReceipt: vi.fn().mockResolvedValue(null),
    getLogs: vi.fn().mockResolvedValue([]),
    listAccounts: vi.fn().mockResolvedValue([]),
    getBlock: vi.fn().mockResolvedValue(null),
    getBlockWithTransactions: vi.fn().mockResolvedValue(null),
    getCode: vi.fn().mockResolvedValue("0x"),
    getStorageAt: vi.fn().mockResolvedValue("0x"),
    resolveName: vi.fn().mockResolvedValue(null),
    lookupAddress: vi.fn().mockResolvedValue(null),
    waitForTransaction: vi.fn().mockResolvedValue({ status: 1 }),
    call: vi.fn().mockResolvedValue("0x"),
    send: vi.fn().mockResolvedValue({ jsonrpc: "2.0", id: 1, result: "0x" }),
    _addEventListener: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    listeners: vi.fn().mockReturnValue([]),
    once: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
    addListener: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    _network: { chainId: 137, name: "matic" },
    detectNetwork: vi.fn().mockResolvedValue({ chainId: 137, name: "matic" }),
    perform: vi.fn().mockResolvedValue("0x"),
    prepareRequest: vi.fn().mockReturnValue(["", []]),
    _startEvent: vi.fn(),
    _stopEvent: vi.fn(),
    _wrapTransaction: vi.fn(),
    _getAddress: vi.fn(),
    _getBlock: vi.fn(),
    _getFilter: vi.fn(),
    _getTransactionRequest: vi.fn(),
    _checkProvider: vi.fn(),
    ccipReadFetch: vi.fn(),
    formatter: {
      formats: {},
      address: vi.fn((value: any) => value),
      bigNumber: vi.fn((value: any) => BigNumber.from(value)),
      blockTag: vi.fn((value: any) => value),
      data: vi.fn((value: any) => value),
      hash: vi.fn((value: any) => value),
      number: vi.fn((value: any) => value),
      type: vi.fn((value: any) => value),
    },
  };

  // Create mock signer
  const mockSignerImpl = {
    getAddress: vi
      .fn()
      .mockResolvedValue("0x742d35Cc6634C0532925a3b844Bc454e4438f44e"),
    signMessage: vi.fn().mockResolvedValue("0x1234567890abcdef"),
    signTransaction: vi.fn().mockResolvedValue("0x1234567890abcdef"),
    connect: vi.fn().mockReturnThis(),
    sendTransaction: vi.fn().mockResolvedValue({
      hash: "0x123",
      wait: vi.fn().mockResolvedValue({ status: 1 }),
    }),
    _isSigner: true,
    provider: null as any,
  };

  // Create the provider with correct type
  const realProvider = new providers.JsonRpcProvider(
    "https://polygon-rpc.com",
    { name: "matic", chainId: 137 }
  );
  Object.setPrototypeOf(mockProviderImpl, Object.getPrototypeOf(realProvider));

  // Create the final provider with correct type
  const mockProvider = mockProviderImpl as unknown as providers.JsonRpcProvider;

  // Create the final signer with correct type
  mockSignerImpl.provider = mockProvider;
  const mockSigner = mockSignerImpl as unknown as providers.JsonRpcSigner;

  // Set circular references
  mockProvider.getSigner = vi.fn().mockReturnValue(mockSigner);

  return mockProvider;
}

export function getMockEthereum(mockProvider: providers.JsonRpcProvider) {
  return {
    isMetaMask: true,
    request: vi.fn().mockImplementation(async ({ method }) => {
      switch (method) {
        case "eth_chainId":
          return "0x89"; // Polygon mainnet
        case "eth_accounts":
          return ["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"];
        case "eth_requestAccounts":
          return ["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"];
        case "eth_getBalance":
          return "0xde0b6b3a7640000"; // 1 ETH in wei
        case "eth_gasPrice":
          return "0x4a817c800"; // 20 Gwei
        default:
          return null;
      }
    }),
    on: vi.fn(),
    removeListener: vi.fn(),
    providers: [mockProvider],
    selectedAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    networkVersion: "137",
    chainId: "0x89",
  };
}

export function setupMocks() {
  const mockProvider = getMockProvider();
  const mockChainConfig = getMockChainConfig();
  const mockEthereum = getMockEthereum(mockProvider);

  // Mock ethers
  vi.mock("ethers", async () => {
    const actual = await vi.importActual<typeof import("ethers")>("ethers");
    return {
      ...actual,
      providers: {
        JsonRpcProvider: vi.fn().mockImplementation(() => mockProvider),
        Web3Provider: vi.fn().mockImplementation(() => mockProvider),
        FallbackProvider: vi.fn().mockImplementation(() => mockProvider),
      },
      Contract: vi.fn().mockImplementation(() => ({
        deployed: vi.fn().mockResolvedValue({
          address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        }),
      })),
      ContractFactory: vi.fn().mockImplementation(() => ({
        deploy: vi.fn().mockResolvedValue({
          deployed: vi.fn().mockResolvedValue({
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          }),
        }),
      })),
    };
  });

  // Mock BaseProviderService
  vi.mock("../../../../BaseProviderService", () => ({
    BaseProviderService: {
      getProvider: vi.fn().mockImplementation(async (chainId: ChainId) => {
        if (chainId === ChainId.POLYGON) {
          return Promise.resolve(mockProvider);
        }
        return Promise.resolve(undefined);
      }),
      clearProviders: vi.fn(),
    },
  }));

  // Mock config/chains
  vi.mock("../../../../config/chains", () => ({
    polygonConfig: mockChainConfig,
    getChainConfig: vi.fn().mockImplementation((chainId: ChainId) => {
      if (chainId === ChainId.POLYGON) {
        return mockChainConfig;
      }
      return undefined;
    }),
  }));

  // Mock config/dependencies
  vi.mock("../../../../config/dependencies", () => ({
    PROVIDERS: {
      ALCHEMY_KEY: "test-alchemy-key",
      INFURA_KEY: "test-infura-key",
      BSC_NODE_KEY: "test-bsc-key",
      POLYGON_NODE_KEY: "test-polygon-key",
    },
    NETWORK_CONFIG: {
      defaultChainId: ChainId.POLYGON,
      supportedChainIds: [ChainId.POLYGON],
    },
  }));

  // Mock window.ethereum
  Object.defineProperty(window, "ethereum", {
    value: mockEthereum,
    writable: true,
  });

  return { mockProvider, mockChainConfig, mockEthereum };
}
