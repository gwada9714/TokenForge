import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "../utils/test-utils";
import {
  ServiceType,
  StakingConfig as IStakingConfig,
} from "@/features/services/types/services";
import type { MockServiceHook, MockComponentProps } from "../types/test-types";

const MockStakingConfig: React.FC<MockComponentProps> = () => {
  return (
    <div>
      <label htmlFor="apr">APR</label>
      <input id="apr" type="number" />

      <label htmlFor="stakingPeriod">Période de Staking</label>
      <input id="stakingPeriod" type="number" />

      <label htmlFor="rewardToken">Token de Récompense</label>
      <input id="rewardToken" />

      <label htmlFor="compoundingEnabled">
        <input id="compoundingEnabled" type="checkbox" />
        Activer le Compound
      </label>

      <button>Configurer</button>
    </div>
  );
};

vi.mock("@/features/services/pages/StakingConfig", () => ({
  StakingConfig: MockStakingConfig,
}));

const mockUseService = vi.fn();

vi.mock("@/features/services/hooks/useService", () => ({
  useService: () => mockUseService(),
}));

describe("StakingConfig Component", () => {
  const mockConfigureService = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: null,
      isProcessing: false,
    } as MockServiceHook);
  });

  it("affiche le formulaire de configuration du staking", () => {
    render(<MockStakingConfig />);

    expect(screen.getByLabelText(/APR/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Période de Staking/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Token de Récompense/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Activer le Compound/i)).toBeInTheDocument();
  });

  it("gère la soumission du formulaire correctement", async () => {
    render(<MockStakingConfig />);

    const apr = screen.getByLabelText(/APR/i);
    const stakingPeriod = screen.getByLabelText(/Période de Staking/i);
    const rewardToken = screen.getByLabelText(/Token de Récompense/i);
    const compoundingEnabled = screen.getByLabelText(/Activer le Compound/i);
    const submitButton = screen.getByRole("button", { name: /Configurer/i });

    await fireEvent.change(apr, { target: { value: "12" } });
    await fireEvent.change(stakingPeriod, { target: { value: "30" } });
    await fireEvent.change(rewardToken, { target: { value: "RTK" } });
    await fireEvent.click(compoundingEnabled);

    await fireEvent.click(submitButton);

    expect(mockConfigureService).toHaveBeenCalledWith(ServiceType.STAKING, {
      apr: "12",
      stakingPeriod: "30",
      rewardToken: "RTK",
      compoundingEnabled: true,
    } as IStakingConfig);
  });

  it("affiche les erreurs de validation", async () => {
    render(<MockStakingConfig />);

    const submitButton = screen.getByRole("button", { name: /Configurer/i });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/L'APR est requis/i)).toBeInTheDocument();
    expect(
      screen.getByText(/La période de staking est requise/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Le token de récompense est requis/i)
    ).toBeInTheDocument();
  });

  it("valide les valeurs numériques", async () => {
    render(<MockStakingConfig />);

    const apr = screen.getByLabelText(/APR/i);
    await fireEvent.change(apr, { target: { value: "-5" } });
    await fireEvent.blur(apr);

    expect(
      screen.getByText(/L'APR doit être supérieur à 0/i)
    ).toBeInTheDocument();
  });

  it("affiche une alerte en cas d'erreur du service", () => {
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: "Erreur de configuration",
      isProcessing: false,
    } as MockServiceHook);

    render(<MockStakingConfig />);
    expect(screen.getByText("Erreur de configuration")).toBeInTheDocument();
  });

  it("désactive le bouton de soumission pendant le traitement", () => {
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: null,
      isProcessing: true,
    } as MockServiceHook);

    render(<MockStakingConfig />);
    const submitButton = screen.getByRole("button", { name: /Configurer/i });
    expect(submitButton).toBeDisabled();
  });
});
