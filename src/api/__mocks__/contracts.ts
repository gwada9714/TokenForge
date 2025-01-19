import { Contract, JsonRpcProvider } from 'ethers';

export const mockProvider = {
  getNetwork: jest.fn(),
  getBlockNumber: jest.fn(),
  destroy: jest.fn(),
} as unknown as JsonRpcProvider;

export const mockTokenContract = {
  name: jest.fn().mockResolvedValue('Test Token'),
  symbol: jest.fn().mockResolvedValue('TEST'),
  decimals: jest.fn().mockResolvedValue(18),
  totalSupply: jest.fn().mockResolvedValue(1000000),
  owner: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  allowance: jest.fn().mockResolvedValue(1000),
  runner: mockProvider,
} as unknown as Contract;

export const mockTokenForgeFactory = {
  getUserTokens: jest.fn().mockResolvedValue([
    '0x1111111111111111111111111111111111111111',
    '0x2222222222222222222222222222222222222222',
  ]),
  runner: mockProvider,
} as unknown as Contract;

export const mockMarketplaceContract = {
  getItemCount: jest.fn().mockResolvedValue(2),
  getItem: jest.fn().mockImplementation(async (id: number) => {
    const items = [
      {
        tokenAddress: '0x1111111111111111111111111111111111111111',
        price: 100,
        amount: 1,
        seller: '0x1234567890123456789012345678901234567890',
        active: true,
      },
      {
        tokenAddress: '0x2222222222222222222222222222222222222222',
        price: 200,
        amount: 2,
        seller: '0x0987654321098765432109876543210987654321',
        active: false,
      },
    ];
    return items[id];
  }),
  listItem: jest.fn().mockImplementation(async () => ({
    wait: jest.fn().mockResolvedValue({
      events: [{
        event: 'ItemListed',
        args: { itemId: 1 },
      }],
    }),
  })),
  runner: mockProvider,
} as unknown as Contract;
