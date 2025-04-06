import { renderHook, act } from "@testing-library/react";
import { useAuthState } from "../hooks/useAuthState";
import { User } from "firebase/auth";

describe("useAuthState", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAuthState());

    expect(result.current.state).toEqual({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  });

  it("should update state on login", () => {
    const { result } = renderHook(() => useAuthState());
    const mockUser = { email: "test@example.com" } as User;

    act(() => {
      result.current.actions.login(mockUser);
    });

    expect(result.current.state).toEqual({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
      error: null,
    });
  });

  it("should clear state on logout", () => {
    const { result } = renderHook(() => useAuthState());
    const mockUser = { email: "test@example.com" } as User;

    act(() => {
      result.current.actions.login(mockUser);
    });

    act(() => {
      result.current.actions.logout();
    });

    expect(result.current.state).toEqual({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  });

  it("should handle errors", () => {
    const { result } = renderHook(() => useAuthState());
    const mockError = {
      code: "auth/invalid-email",
      message: "Invalid email",
      name: "AuthError",
    };

    act(() => {
      result.current.actions.setError(mockError);
    });

    expect(result.current.state.error).toEqual(mockError);
    expect(result.current.state.isAuthenticated).toBe(false);
  });
});
