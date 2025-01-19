export const mockConfig = {
  chains: [],
  connectors: [],
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
  state: {
    chainId: 1,
    current: {},
    connections: [],
  },
  subscribe: () => () => {},
  emit: () => {},
  transports: {},
  setState: () => {},
  getClient: () => ({
    account: {
      address: "0x1234567890123456789012345678901234567890",
      status: "connected",
    },
    chain: {
      id: 1,
      name: "Ethereum",
    },
  }),
  _internal: {
    chains: [],
    transports: {},
  },
};
