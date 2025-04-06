import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "../utils/test-utils";
import {
  ServiceType,
  LaunchpadConfig as ILaunchpadConfig,
} from "@/features/services/types/services";
import type { MockServiceHook, MockComponentProps } from "../types/test-types";

const MockLaunchpadConfig: React.FC<MockComponentProps> = () => {
  return (
    <div>
      <label htmlFor="tokenName">Nom du Token</label>
      <input id="tokenName" />

      <label htmlFor="tokenSymbol">Symbole</label>
      <input id="tokenSymbol" />

      <label htmlFor="totalSupply">Supply Totale</label>
      <input id="totalSupply" type="number" />

      <label htmlFor="auditLevel">Niveau d'Audit</label>
      <select id="auditLevel">
        <option value="basic">Basic</option>
        <option value="standard">Standard</option>
        <option value="premium">Premium</option>
      </select>

      <button>Configurer</button>
    </div>
  );
};

vi.mock("@/features/services/pages/LaunchpadConfig", () => ({
  LaunchpadConfig: MockLaunchpadConfig,
}));

const mockUseService = vi.fn();

vi.mock("@/features/services/hooks/useService", () => ({
  useService: () => mockUseService(),
}));

describe("LaunchpadConfig Component", () => {
  const mockConfigureService = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: null,
      isProcessing: false,
    } as MockServiceHook);
  });

  it("affiche le formulaire de configuration du launchpad", () => {
    render(<MockLaunchpadConfig />);

    expect(screen.getByLabelText(/Nom du Token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Symbole/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Supply Totale/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Niveau d'Audit/i)).toBeInTheDocument();
  });

  it("gère la soumission du formulaire correctement", async () => {
    render(<MockLaunchpadConfig />);

    const tokenName = screen.getByLabelText(/Nom du Token/i);
    const tokenSymbol = screen.getByLabelText(/Symbole/i);
    const totalSupply = screen.getByLabelText(/Supply Totale/i);
    const auditLevel = screen.getByLabelText(/Niveau d'Audit/i);
    const submitButton = screen.getByRole("button", { name: /Configurer/i });

    await fireEvent.change(tokenName, { target: { value: "Mon Token" } });
    await fireEvent.change(tokenSymbol, { target: { value: "MTK" } });
    await fireEvent.change(totalSupply, { target: { value: "1000000" } });
    await fireEvent.change(auditLevel, { target: { value: "standard" } });

    await fireEvent.click(submitButton);

    expect(mockConfigureService).toHaveBeenCalledWith(ServiceType.LAUNCHPAD, {
      tokenName: "Mon Token",
      tokenSymbol: "MTK",
      totalSupply: "1000000",
      auditLevel: "standard",
    } as ILaunchpadConfig);
  });

  it("affiche les erreurs de validation", async () => {
    render(<MockLaunchpadConfig />);

    const submitButton = screen.getByRole("button", { name: /Configurer/i });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/Le nom du token est requis/i)).toBeInTheDocument();
    expect(screen.getByText(/Le symbole est requis/i)).toBeInTheDocument();
    expect(
      screen.getByText(/La supply totale est requise/i)
    ).toBeInTheDocument();
  });

  it("valide le format du symbole", async () => {
    render(<MockLaunchpadConfig />);

    const tokenSymbol = screen.getByLabelText(/Symbole/i);
    await fireEvent.change(tokenSymbol, {
      target: { value: "INVALID-SYMBOL" },
    });
    await fireEvent.blur(tokenSymbol);

    expect(
      screen.getByText(
        /Le symbole doit contenir uniquement des lettres majuscules/i
      )
    ).toBeInTheDocument();
  });

  it("affiche une alerte en cas d'erreur du service", () => {
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: "Erreur de configuration",
      isProcessing: false,
    } as MockServiceHook);

    render(<MockLaunchpadConfig />);
    expect(screen.getByText("Erreur de configuration")).toBeInTheDocument();
  });

  it("désactive le bouton de soumission pendant le traitement", () => {
    mockUseService.mockReturnValue({
      configureService: mockConfigureService,
      error: null,
      isProcessing: true,
    } as MockServiceHook);

    render(<MockLaunchpadConfig />);
    const submitButton = screen.getByRole("button", { name: /Configurer/i });
    expect(submitButton).toBeDisabled();
  });
});
