import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuthContext } from "../AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock du hook useAuth
vi.mock("@/hooks/useAuth");

// Composant de test qui utilise le contexte d'authentification
const TestComponent = () => {
  const { user, isAuthenticated, signIn, signOut } = useAuthContext();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authentifié" : "Non authentifié"}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button
        data-testid="login-button"
        onClick={() => signIn("test@example.com", "password")}
      >
        Se connecter
      </button>
      <button data-testid="logout-button" onClick={() => signOut()}>
        Se déconnecter
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock par défaut pour useAuth
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      status: "unauthenticated",
      error: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      signUp: vi.fn(),
      signInAnonymously: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
    });
  });

  it("devrait fournir l'état d'authentification initial", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Non authentifié"
    );
    expect(screen.queryByTestId("user-email")).not.toBeInTheDocument();
  });

  it("devrait mettre à jour l'interface utilisateur lorsque l'utilisateur se connecte", async () => {
    // Mock d'un utilisateur authentifié
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { uid: "test-uid", email: "test@example.com" },
      status: "authenticated",
      error: null,
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      signUp: vi.fn(),
      signInAnonymously: vi.fn(),
      resetPassword: vi.fn(),
      updateUserProfile: vi.fn(),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("Authentifié");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "test@example.com"
    );
  });

  it("devrait appeler signIn lorsque le bouton de connexion est cliqué", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId("login-button"));

    expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password");
  });

  it("devrait appeler signOut lorsque le bouton de déconnexion est cliqué", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await user.click(screen.getByTestId("logout-button"));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("devrait passer les callbacks au hook useAuth", () => {
    const onAuthStateChanged = vi.fn();
    const onError = vi.fn();

    render(
      <AuthProvider onAuthStateChanged={onAuthStateChanged} onError={onError}>
        <TestComponent />
      </AuthProvider>
    );

    expect(useAuth).toHaveBeenCalledWith({
      onAuthStateChanged,
      onError,
    });
  });

  it("devrait lever une erreur si useAuthContext est utilisé en dehors d'un AuthProvider", () => {
    // Désactiver temporairement les erreurs de console pour ce test
    const originalError = console.error;
    console.error = vi.fn();

    // Fonction qui tente d'utiliser useAuthContext en dehors d'un AuthProvider
    const TestComponentWithoutProvider = () => {
      expect(() => useAuthContext()).toThrow(
        "useAuthContext doit être utilisé à l'intérieur d'un AuthProvider"
      );
      return null;
    };

    // Rendre le composant
    render(<TestComponentWithoutProvider />);

    // Restaurer console.error
    console.error = originalError;
  });
});
