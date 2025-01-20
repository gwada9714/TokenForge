import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthState } from '../useAuthState';
import { storageService } from '../../services/storageService';
import { notificationService } from '../../services/notificationService';
import { auth } from '../../../../config/firebase';
import { TokenForgeUser } from '../../types';

// Mocks
jest.mock('../../services/storageService');
jest.mock('../../services/notificationService');
jest.mock('../../../../config/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('useAuthState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthState());
    
    expect(result.current.state).toEqual({
      isAuthenticated: false,
      user: null,
      status: 'idle',
      error: null,
    });
  });

  it('should handle successful authentication', () => {
    const { result } = renderHook(() => useAuthState());
    const mockUser: Partial<TokenForgeUser> = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
    };

    act(() => {
      result.current.actions.handleAuthSuccess(mockUser as TokenForgeUser);
    });

    expect(result.current.state).toEqual({
      isAuthenticated: true,
      user: mockUser,
      status: 'authenticated',
      error: null,
    });
    expect(notificationService.notifyLoginSuccess).toHaveBeenCalledWith('test@example.com');
  });

  it('should handle authentication error', () => {
    const { result } = renderHook(() => useAuthState());
    const mockError = new Error('Auth failed');

    act(() => {
      result.current.actions.handleAuthError(mockError);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.user).toBeNull();
    expect(notificationService.notifyLoginError).toHaveBeenCalled();
  });

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuthState());
    
    // First login
    act(() => {
      result.current.actions.handleAuthSuccess({ uid: 'test' } as TokenForgeUser);
    });

    // Then logout
    act(() => {
      result.current.actions.handleLogout();
    });

    expect(result.current.state).toEqual({
      isAuthenticated: false,
      user: null,
      status: 'idle',
      error: null,
    });
    expect(storageService.clearAuthState).toHaveBeenCalled();
    expect(notificationService.notifyLogout).toHaveBeenCalled();
  });

  it('should handle email verification', () => {
    const { result } = renderHook(() => useAuthState());
    const mockUser: Partial<TokenForgeUser> = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: false,
    };

    // Login first
    act(() => {
      result.current.actions.handleAuthSuccess(mockUser as TokenForgeUser);
    });

    // Start verification
    act(() => {
      result.current.actions.handleEmailVerificationStart();
    });
    expect(result.current.state.status).toBe('verifying');

    // Complete verification
    act(() => {
      result.current.actions.handleEmailVerificationSuccess();
    });
    expect(result.current.state.status).toBe('authenticated');
    expect(result.current.state.user?.emailVerified).toBe(true);
    expect(notificationService.notifyEmailVerified).toHaveBeenCalled();
  });

  it('should handle user updates', () => {
    const { result } = renderHook(() => useAuthState());
    const initialUser: Partial<TokenForgeUser> = {
      uid: 'test-uid',
      email: 'test@example.com',
      isAdmin: false,
    };

    // Login first
    act(() => {
      result.current.actions.handleAuthSuccess(initialUser as TokenForgeUser);
    });

    // Update user
    const update = { isAdmin: true };
    act(() => {
      result.current.actions.handleUpdateUser(update);
    });

    expect(result.current.state.user?.isAdmin).toBe(true);
  });

  it('should restore state from storage on mount', () => {
    const mockStoredUser = {
      uid: 'stored-uid',
      email: 'stored@example.com',
      isAdmin: true,
    };

    // Mock storage and currentUser
    (storageService.getAuthState as jest.Mock).mockReturnValue({
      user: mockStoredUser,
      lastLogin: Date.now(),
    });
    (auth.currentUser as any) = {
      ...mockStoredUser,
      emailVerified: true,
    };

    const { result } = renderHook(() => useAuthState());

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.user?.uid).toBe('stored-uid');
    expect(result.current.state.user?.isAdmin).toBe(true);
  });
});
