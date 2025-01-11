// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

import React from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Web3Modal
jest.mock('@web3modal/wagmi/react', () => ({
  createWeb3Modal: jest.fn(),
  useWeb3Modal: () => ({
    open: jest.fn(),
    close: jest.fn(),
    isOpen: false,
  }),
}));

// Mock wagmi
const MockProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

jest.mock('wagmi', () => ({
  WagmiProvider: MockProvider,
  useAccount: () => ({
    address: null,
    isConnecting: false,
    isDisconnected: true,
  }),
}));

// Mock ethers
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  JsonRpcProvider: jest.fn(),
}));
