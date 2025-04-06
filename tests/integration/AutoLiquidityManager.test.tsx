import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AutoLiquidityManager } from "../../src/components/features/launchpad/AutoLiquidityManager";
import { useLiquidityManager } from "../../src/hooks/useLiquidityManager";

// Mock du hook useLiquidityManager
vi.mock("../../src/hooks/useLiquidityManager", () => ({
  useLiquidityManager: vi.fn(),
}));

describe("AutoLiquidityManager Component", () => {
  // Configuration par défaut du mock
  const setupMockLiquidityHook = (overrides = {}) => {
    const mockUserTokens = [
      {
        id: "token1",
        name: "Test Token",
        symbol: "TST",
        contractAddress: "0xabc1234567890123456789012345678901234567",
        supply: "1000000",
        deploymentStatus: { status: "success" },
      },
      {
        id: "token2",
        name: "Another Token",
        symbol: "ANT",
        contractAddress: "0xdef1234567890123456789012345678901234567",
        supply: "500000",
        deploymentStatus: { status: "success" },
      },
    ];

    const mockSettings = {
      "0xabc1234567890123456789012345678901234567": {
        enabled: true,
        targetRatio: 50,
        rebalanceThreshold: 5,
        maxSlippage: 2.5,
        rebalanceInterval: 24,
        exchangeFee: 0.3,
        autoCompound: true,
        liquidityPair: "ETH",
      },
    };

    const mockStatus = {
      "0xabc1234567890123456789012345678901234567": {
        tokenAddress: "0xabc1234567890123456789012345678901234567",
        currentRatio: 48.5,
        targetRatio: 50,
        lastRebalance: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        nextScheduledRebalance: new Date(
          Date.now() + 12 * 3600 * 1000
        ).toISOString(),
        needsRebalance: false,
        liquidityPair: "ETH",
        lpTokenBalance: "123.45",
        lpTokenValue: "$12345.67",
      },
    };

    const defaultMock = {
      userTokens: mockUserTokens,
      userLiquiditySettings: mockSettings,
      liquidityStatus: mockStatus,
      isLoading: false,
      setupAutomaticLiquidity: vi.fn(),
      modifyLiquiditySettings: vi.fn(),
      triggerRebalance: vi.fn(),
      refreshLiquidityStatus: vi.fn(),
    };

    return {
      ...defaultMock,
      ...overrides,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with a list of tokens", () => {
    // Configuration du mock
    const mockHook = setupMockLiquidityHook();
    (useLiquidityManager as any).mockReturnValue(mockHook);

    // Rendu du composant
    render(<AutoLiquidityManager />);

    // Vérification que le titre est présent
    expect(
      screen.getByText(/Gestionnaire de Liquidité Automatique/i)
    ).toBeInTheDocument();

    // Vérification que les tokens sont affichés
    expect(screen.getByText(/Test Token/i)).toBeInTheDocument();
    expect(screen.getByText(/Another Token/i)).toBeInTheDocument();
  });

  it("displays loading state correctly", () => {
    // Configuration du mock avec état de chargement
    const mockHook = setupMockLiquidityHook({ isLoading: true });
    (useLiquidityManager as any).mockReturnValue(mockHook);

    // Rendu du composant
    render(<AutoLiquidityManager />);

    // Vérification que l'indicateur de chargement est présent
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows token details when selecting a token", async () => {
    // Configuration du mock
    const mockHook = setupMockLiquidityHook();
    (useLiquidityManager as any).mockReturnValue(mockHook);

    // Rendu du composant
    render(<AutoLiquidityManager />);

    // Cliquer sur un token
    fireEvent.click(screen.getByText(/Test Token/i));

    // Vérifier que les détails sont affichés
    await waitFor(() => {
      expect(screen.getByText(/Ratio cible/i)).toBeInTheDocument();
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Prochaine rebalance prévue/i)
      ).toBeInTheDocument();
    });
  });

  it("can trigger manual rebalance", async () => {
    // Configuration du mock
    const mockHook = setupMockLiquidityHook();
    (useLiquidityManager as any).mockReturnValue(mockHook);

    // Rendu du composant
    render(<AutoLiquidityManager />);

    // Cliquer sur un token
    fireEvent.click(screen.getByText(/Test Token/i));

    // Trouver et cliquer sur le bouton de rebalance
    const rebalanceButton = screen.getByText(/Rééquilibrer maintenant/i);
    fireEvent.click(rebalanceButton);

    // Vérifier que la fonction de rebalance a été appelée
    await waitFor(() => {
      expect(mockHook.triggerRebalance).toHaveBeenCalledWith(
        "0xabc1234567890123456789012345678901234567"
      );
    });
  });

  it("can modify existing settings", async () => {
    // Configuration du mock
    const mockHook = setupMockLiquidityHook();
    (useLiquidityManager as any).mockReturnValue(mockHook);

    // Rendu du composant
    render(<AutoLiquidityManager />);

    // Cliquer sur un token
    fireEvent.click(screen.getByText(/Test Token/i));

    // Cliquer sur le bouton de modification
    const editButton = screen.getByText(/Modifier les paramètres/i);
    fireEvent.click(editButton);

    // Modifier une valeur (ratio cible)
    const ratioInput = screen.getByLabelText(/Ratio cible/i);
    fireEvent.change(ratioInput, { target: { value: "60" } });

    // Soumettre le formulaire
    const saveButton = screen.getByText(/Enregistrer/i);
    fireEvent.click(saveButton);

    // Vérifier que la fonction de modification a été appelée
    await waitFor(() => {
      expect(mockHook.modifyLiquiditySettings).toHaveBeenCalledWith(
        "0xabc1234567890123456789012345678901234567",
        expect.objectContaining({
          targetRatio: 60,
        })
      );
    });
  });

  it("can setup new liquidity settings for a token", async () => {
    // Configuration du mock
    const mockHook = setupMockLiquidityHook();
    (useLiquidityManager as any).mockReturnValue(mockHook);

    // Rendu du composant
    render(<AutoLiquidityManager />);

    // Cliquer sur le second token (qui n'a pas encore de configuration)
    fireEvent.click(screen.getByText(/Another Token/i));

    // Cliquer sur le bouton de configuration
    const setupButton = screen.getByText(
      /Configurer la liquidité automatique/i
    );
    fireEvent.click(setupButton);

    // Remplir le formulaire
    const enabledSwitch = screen.getByLabelText(
      /Activer la gestion automatique/i
    );
    fireEvent.click(enabledSwitch);

    const ratioInput = screen.getByLabelText(/Ratio cible/i);
    fireEvent.change(ratioInput, { target: { value: "70" } });

    const thresholdInput = screen.getByLabelText(/Seuil de rééquilibrage/i);
    fireEvent.change(thresholdInput, { target: { value: "3" } });

    const pairSelect = screen.getByLabelText(/Paire de liquidité/i);
    fireEvent.change(pairSelect, { target: { value: "USDC" } });

    // Soumettre le formulaire
    const saveButton = screen.getByText(/Configurer/i);
    fireEvent.click(saveButton);

    // Vérifier que la fonction de configuration a été appelée
    await waitFor(() => {
      expect(mockHook.setupAutomaticLiquidity).toHaveBeenCalledWith(
        "0xdef1234567890123456789012345678901234567",
        expect.objectContaining({
          enabled: true,
          targetRatio: 70,
          rebalanceThreshold: 3,
          liquidityPair: "USDC",
        })
      );
    });
  });
});
