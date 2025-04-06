import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { firebaseAuth } from "@/lib/firebase/auth";
import { User } from "firebase/auth";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock du service d'authentification Firebase
vi.mock("@/lib/firebase/auth", () => ({
  firebaseAuth: {
    getAuth: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

// Mock de la fonction onAuthStateChanged de Firebase
vi.mock("firebase/auth", () => {
  const originalModule = vi.importActual("firebase/auth");
  return {
    ...originalModule,
    onAuthStateChanged: vi.fn((_auth, callback) => {
      // Simuler l'appel initial à null (non authentifié)
      callback(null);
      // Retourner une fonction de nettoyage
      return vi.fn();
    }),
  };
});

// Mock du logger
vi.mock("@/core/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock de l'authentification réussie
    (firebaseAuth.getAuth as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  it("devrait initialiser avec un état non authentifié", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("devrait appeler signIn avec les identifiants corrects", async () => {
    // Mock d'un utilisateur retourné par signIn
    const mockUser = {
      uid: "test-uid",
      email: "test@example.com",
      displayName: "Test User",
      photoURL: null,
      isAnonymous: false,
      emailVerified: true,
    } as User;

    (firebaseAuth.signIn as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    // Appeler la méthode signIn
    await act(async () => {
      await result.current.signIn("test@example.com", "password");
    });

    expect(firebaseAuth.signIn).toHaveBeenCalledWith(
      "test@example.com",
      "password"
    );
  });

  it("devrait appeler signUp avec les identifiants corrects", async () => {
    // Mock d'un utilisateur retourné par signUp
    const mockUser = {
      uid: "test-uid",
      email: "newuser@example.com",
      displayName: null,
      photoURL: null,
      isAnonymous: false,
      emailVerified: false,
    } as User;

    (firebaseAuth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    // Appeler la méthode signUp
    await act(async () => {
      await result.current.signUp("newuser@example.com", "password");
    });

    expect(firebaseAuth.signUp).toHaveBeenCalledWith(
      "newuser@example.com",
      "password"
    );
  });

  it("devrait appeler signInAnonymously", async () => {
    // Mock d'un utilisateur anonyme
    const mockUser = {
      uid: "anon-uid",
      email: null,
      displayName: null,
      photoURL: null,
      isAnonymous: true,
      emailVerified: false,
    } as User;

    (
      firebaseAuth.signInAnonymously as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    // Appeler la méthode signInAnonymously
    await act(async () => {
      await result.current.signInAnonymously();
    });

    expect(firebaseAuth.signInAnonymously).toHaveBeenCalled();
  });

  it("devrait appeler signOut", async () => {
    (firebaseAuth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    // Appeler la méthode signOut
    await act(async () => {
      await result.current.signOut();
    });

    expect(firebaseAuth.signOut).toHaveBeenCalled();
  });

  it("devrait appeler resetPassword avec l'email correct", async () => {
    (firebaseAuth.resetPassword as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    // Appeler la méthode resetPassword
    await act(async () => {
      await result.current.resetPassword("test@example.com");
    });

    expect(firebaseAuth.resetPassword).toHaveBeenCalledWith("test@example.com");
  });

  it("devrait appeler updateUserProfile avec les données correctes", async () => {
    (firebaseAuth.updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    const profileData = {
      displayName: "Updated Name",
      photoURL: "https://example.com/photo.jpg",
    };

    // Appeler la méthode updateUserProfile
    await act(async () => {
      await result.current.updateUserProfile(profileData);
    });

    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(profileData);
  });

  it("devrait gérer les erreurs lors de la connexion", async () => {
    const error = new Error("Invalid credentials");
    (firebaseAuth.signIn as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    // Appeler la méthode signIn qui va échouer
    await act(async () => {
      try {
        await result.current.signIn("test@example.com", "wrong-password");
      } catch (e) {
        // L'erreur est attendue
      }
    });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe("Invalid credentials");
    });
  });

  it("devrait appeler le callback onAuthStateChanged", async () => {
    const onAuthStateChangedMock = vi.fn();

    renderHook(() => useAuth({ onAuthStateChanged: onAuthStateChangedMock }));

    await waitFor(() => {
      expect(onAuthStateChangedMock).toHaveBeenCalledWith(null);
    });
  });
});
