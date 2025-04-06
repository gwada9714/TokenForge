import React from "react";
import { render, screen } from "@testing-library/react";
import AuthGuard from "../AuthGuard";
import { useAuthContext } from "@/contexts/AuthContext";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useRouter } from "@/__tests__/mocks/next-router";

// Mock des hooks
vi.mock("@/contexts/AuthContext");
vi.mock("@/__tests__/mocks/next-router", () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    pathname: "/",
    route: "/",
    asPath: "/",
    query: {},
    isReady: true,
  }),
}));

// Mock de next/router
vi.mock("next/router", () => ({
  useRouter: () => useRouter(),
}));

describe("AuthGuard", () => {
  // Mock du router Next.js
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuration par défaut du router
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      pathname: "/",
      route: "/",
      asPath: "/",
      query: {},
      isReady: true,
    });

    // Configuration par défaut du contexte d'authentification (non authentifié)
    (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      status: "unauthenticated",
    });
  });

  it("devrait afficher un indicateur de chargement pendant la vérification de l'authentification", () => {
    // Simuler l'état de chargement
    (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      status: "loading",
    });

    render(
      <AuthGuard>
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    expect(
      screen.getByText("Vérification de l'authentification...")
    ).toBeInTheDocument();
    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
  });

  it("devrait rediriger vers fallbackUrl si l'utilisateur n'est pas authentifié", () => {
    render(
      <AuthGuard requireAuth={true} fallbackUrl="/login">
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    // Vérifier que la redirection a été appelée
    expect(mockPush).toHaveBeenCalledWith("/login");

    // Le contenu ne devrait pas être affiché
    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
  });

  it("devrait afficher le contenu si l'utilisateur est authentifié", () => {
    // Simuler un utilisateur authentifié
    (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { uid: "test-uid", email: "test@example.com" },
      isAuthenticated: true,
      isAdmin: false,
      status: "authenticated",
    });

    render(
      <AuthGuard requireAuth={true}>
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    // Vérifier que la redirection n'a pas été appelée
    expect(mockPush).not.toHaveBeenCalled();

    // Le contenu devrait être affiché
    expect(screen.getByText("Contenu protégé")).toBeInTheDocument();
  });

  it("devrait rediriger si requireAdmin=true et l'utilisateur n'est pas admin", () => {
    // Simuler un utilisateur authentifié mais non admin
    (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { uid: "test-uid", email: "test@example.com" },
      isAuthenticated: true,
      isAdmin: false,
      status: "authenticated",
    });

    render(
      <AuthGuard
        requireAuth={true}
        requireAdmin={true}
        fallbackUrl="/access-denied"
      >
        <div>Contenu admin</div>
      </AuthGuard>
    );

    // Vérifier que la redirection a été appelée
    expect(mockPush).toHaveBeenCalledWith("/access-denied");

    // Le contenu ne devrait pas être affiché
    expect(screen.queryByText("Contenu admin")).not.toBeInTheDocument();
  });

  it("devrait afficher le contenu si requireAdmin=true et l'utilisateur est admin", () => {
    // Simuler un utilisateur admin
    (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { uid: "admin-uid", email: "admin@example.com" },
      isAuthenticated: true,
      isAdmin: true,
      status: "authenticated",
    });

    render(
      <AuthGuard requireAuth={true} requireAdmin={true}>
        <div>Contenu admin</div>
      </AuthGuard>
    );

    // Vérifier que la redirection n'a pas été appelée
    expect(mockPush).not.toHaveBeenCalled();

    // Le contenu devrait être affiché
    expect(screen.getByText("Contenu admin")).toBeInTheDocument();
  });

  it("devrait toujours afficher le contenu si requireAuth=false", () => {
    render(
      <AuthGuard requireAuth={false}>
        <div>Contenu public</div>
      </AuthGuard>
    );

    // Vérifier que la redirection n'a pas été appelée
    expect(mockPush).not.toHaveBeenCalled();

    // Le contenu devrait être affiché
    expect(screen.getByText("Contenu public")).toBeInTheDocument();
  });
});
