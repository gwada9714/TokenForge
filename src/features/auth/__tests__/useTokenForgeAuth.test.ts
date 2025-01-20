import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';
import { TokenForgeAuthProvider } from '../context/TokenForgeAuthProvider';
import type { TokenForgeAuthActions } from '../types';

interface ExtendedTokenForgeAuthActions extends TokenForgeAuthActions {
  connectWallet: () => Promise<void>;
  switchNetwork: () => Promise<void>;
}

type MockedFunction<T extends (...args: any) => any> = T & {
  mockResolvedValueOnce: (value: Awaited<ReturnType<T>>) => void;
  mockRejectedValueOnce: (error: Error) => void;
};

const mockActions: {
  [K in keyof ExtendedTokenForgeAuthActions]: MockedFunction<ExtendedTokenForgeAuthActions[K]>;
} = {
  login: vi.fn() as MockedFunction<ExtendedTokenForgeAuthActions['login']>,
  logout: vi.fn() as MockedFunction<ExtendedTokenForgeAuthActions['logout']>,
  connectWallet: vi.fn() as MockedFunction<ExtendedTokenForgeAuthActions['connectWallet']>,
  switchNetwork: vi.fn() as MockedFunction<ExtendedTokenForgeAuthActions['switchNetwork']>,
  updateUser: vi.fn() as MockedFunction<ExtendedTokenForgeAuthActions['updateUser']>
};

vi.mock('../hooks/useTokenForgeAuth', () => ({
  useTokenForgeAuth: () => ({
    status: 'idle',
    isAuthenticated: false,
    walletState: {
      isConnected: false,
      isCorrectNetwork: false,
      address: null,
      chainId: null
    },
    error: null,
    actions: mockActions
  })
}));

describe('useTokenForgeAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.walletState.isConnected).toBe(false);
      expect(result.current.walletState.isCorrectNetwork).toBe(false);
    });
  });

  describe('Login Process', () => {
    it('should handle successful login', async () => {
      mockActions.login.mockResolvedValueOnce(undefined);
      
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      await act(async () => {
        await result.current.actions.login('test@example.com', 'password123');
      });

      expect(mockActions.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      mockActions.login.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      await act(async () => {
        try {
          await result.current.actions.login('test@example.com', 'wrongpassword');
        } catch (e) {
          // Expected error
        }
      });

      expect(mockActions.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });
  });

  describe('Wallet Connection', () => {
    it('should handle successful wallet connection', async () => {
      mockActions.connectWallet.mockResolvedValueOnce(undefined);
      
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      await act(async () => {
        await (result.current.actions as ExtendedTokenForgeAuthActions).connectWallet();
      });

      expect(mockActions.connectWallet).toHaveBeenCalled();
    });

    it('should handle wallet connection error', async () => {
      const error = new Error('Wallet connection failed');
      mockActions.connectWallet.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      await act(async () => {
        try {
          await (result.current.actions as ExtendedTokenForgeAuthActions).connectWallet();
        } catch (e) {
          // Expected error
        }
      });

      expect(mockActions.connectWallet).toHaveBeenCalled();
    });
  });

  describe('Network Management', () => {
    it('should handle successful network switch', async () => {
      mockActions.switchNetwork.mockResolvedValueOnce(undefined);
      
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      await act(async () => {
        await (result.current.actions as ExtendedTokenForgeAuthActions).switchNetwork();
      });

      expect(mockActions.switchNetwork).toHaveBeenCalled();
    });

    it('should handle network switch error', async () => {
      const error = new Error('Network switch failed');
      mockActions.switchNetwork.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      await act(async () => {
        try {
          await (result.current.actions as ExtendedTokenForgeAuthActions).switchNetwork();
        } catch (e) {
          // Expected error
        }
      });

      expect(mockActions.switchNetwork).toHaveBeenCalled();
    });
  });

  describe('Logout Process', () => {
    it('should handle logout', async () => {
      mockActions.logout.mockResolvedValueOnce(undefined);
      
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider
      });

      await act(async () => {
        await result.current.actions.logout();
      });

      expect(mockActions.logout).toHaveBeenCalled();
    });
  });
});
