import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import AlertsManagement from "../AlertsManagement";
import { useContract } from "../../../../hooks/useContract";

// Mock du hook useContract
vi.mock("../../../../hooks/useContract", () => ({
  useContract: vi.fn(),
}));

describe("AlertsManagement", () => {
  const mockContract = {
    addAlert: vi.fn(),
    updateAlert: vi.fn(),
    deleteAlert: vi.fn(),
  };

  beforeEach(() => {
    (useContract as vi.Mock).mockReturnValue({ contract: mockContract });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the alerts management interface", () => {
    render(<AlertsManagement />);

    expect(screen.getByText("Alerts Management")).toBeTruthy();
    expect(screen.getByText("Add Alert")).toBeTruthy();
  });

  it("opens add alert dialog when clicking add button", () => {
    render(<AlertsManagement />);

    fireEvent.click(screen.getByText("Add Alert"));

    expect(screen.getByText("Add New Alert")).toBeTruthy();
    expect(screen.getByLabelText("Type")).toBeTruthy();
    expect(screen.getByLabelText("Message")).toBeTruthy();
  });

  it("validates form inputs", async () => {
    render(<AlertsManagement />);

    // Ouvrir le dialogue
    fireEvent.click(screen.getByText("Add Alert"));

    // Le bouton Add devrait être désactivé initialement
    const addButton = screen.getByText("Add");
    expect(addButton).toBeDisabled();

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Test alert message" },
    });

    // Le bouton devrait être activé maintenant
    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
    });
  });

  it("adds a new alert successfully", async () => {
    mockContract.addAlert.mockResolvedValueOnce({
      wait: vi.fn().mockResolvedValueOnce({}),
    });

    render(<AlertsManagement />);

    // Ouvrir le dialogue
    fireEvent.click(screen.getByText("Add Alert"));

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Test alert message" },
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByText("Add"));

    // Vérifier que le contrat a été appelé
    await waitFor(() => {
      expect(mockContract.addAlert).toHaveBeenCalledWith(
        "info",
        "Test alert message"
      );
    });

    // Vérifier le message de succès
    expect(await screen.findByText("Alert added successfully")).toBeTruthy();
  });

  it("handles add alert error", async () => {
    mockContract.addAlert.mockRejectedValueOnce(
      new Error("Failed to add alert")
    );

    render(<AlertsManagement />);

    // Ouvrir le dialogue
    fireEvent.click(screen.getByText("Add Alert"));

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Test alert message" },
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByText("Add"));

    // Vérifier le message d'erreur
    expect(await screen.findByText("Failed to add alert")).toBeTruthy();
  });

  it("closes dialog on cancel", () => {
    render(<AlertsManagement />);

    // Ouvrir le dialogue
    fireEvent.click(screen.getByText("Add Alert"));

    // Fermer le dialogue
    fireEvent.click(screen.getByText("Cancel"));

    // Vérifier que le dialogue est fermé
    expect(screen.queryByText("Add New Alert")).toBeFalsy();
  });
});
