import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthState } from "../useAuthState";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../store/authSlice";

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

describe("useAuthState", () => {
  let mockAuth: any;
  let mockStore: any;
  let mockUnsubscribe: vi.Mock;

  const mockUser: Partial<User> = {
    uid: "test-uid",
    email: "test@example.com",
    emailVerified: true,
  };

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    mockAuth = {
      currentUser: null,
    };

    vi.mocked(getAuth).mockReturnValue(mockAuth);
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(mockAuth.currentUser);
      return mockUnsubscribe;
    });

    mockStore = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it("initializes with loading state", () => {
    const { result } = renderHook(() => useAuthState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("updates state when user signs in", async () => {
    mockAuth.currentUser = mockUser;

    const { result } = renderHook(() => useAuthState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      const authStateCallback = vi.mocked(onAuthStateChanged).mock.calls[0][1];
      authStateCallback(mockUser as User);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it("updates state when user signs out", async () => {
    const { result } = renderHook(() => useAuthState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      const authStateCallback = vi.mocked(onAuthStateChanged).mock.calls[0][1];
      authStateCallback(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles authentication errors", async () => {
    const mockError = new Error("Auth error");

    const { result } = renderHook(() => useAuthState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      const authStateCallback = vi.mocked(onAuthStateChanged).mock.calls[0][1];
      authStateCallback(null, mockError);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it("unsubscribes from auth state changes on unmount", () => {
    const { unmount } = renderHook(() => useAuthState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
