import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ContractControls from "../ContractControls";
import { useContract } from "../../../../hooks/useContract";

// Mock du hook useContract
vi.mock("../../../../hooks/useContract", () => ({
  useContract: vi.fn(),
}));

describe("ContractControls", () => {
  const mockContract = {
    pause: vi.fn(),
    unpause: vi.fn(),
  };

  beforeEach(() => {
    (useContract as vi.Mock).mockReturnValue({ contract: mockContract });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the contract controls interface", () => {
    render(<ContractControls />);

    expect(screen.getByText("Contract Controls")).toBeTruthy();
    expect(screen.getByText("Contract Status")).toBeTruthy();
    expect(screen.getByText("Emergency Controls")).toBeTruthy();
  });

  it("displays active status by default", () => {
    render(<ContractControls />);

    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("handles pause action successfully", async () => {
    mockContract.pause.mockResolvedValueOnce({
      wait: vi.fn().mockResolvedValueOnce({}),
    });

    render(<ContractControls />);

    fireEvent.click(screen.getByText("Pause Contract"));

    await waitFor(() => {
      expect(mockContract.pause).toHaveBeenCalled();
      expect(screen.getByText("Contract successfully paused")).toBeTruthy();
    });
  });

  it("handles unpause action successfully", async () => {
    mockContract.unpause.mockResolvedValueOnce({
      wait: vi.fn().mockResolvedValueOnce({}),
    });

    render(<ContractControls />);

    // D'abord mettre le contrat en pause
    const pauseButton = screen.getByText("Pause Contract");
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText("Paused")).toBeTruthy();
    });

    // Ensuite réactiver le contrat
    const unpauseButton = screen.getByText("Unpause Contract");
    fireEvent.click(unpauseButton);

    await waitFor(() => {
      expect(mockContract.unpause).toHaveBeenCalled();
      expect(screen.getByText("Contract successfully unpaused")).toBeTruthy();
    });
  });

  it("handles pause action error", async () => {
    mockContract.pause.mockRejectedValueOnce(new Error("Failed to pause"));

    render(<ContractControls />);

    fireEvent.click(screen.getByText("Pause Contract"));

    await waitFor(() => {
      expect(screen.getByText("Failed to pause contract")).toBeTruthy();
    });
  });

  it("disables button during transaction", async () => {
    mockContract.pause.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ContractControls />);

    const pauseButton = screen.getByText("Pause Contract");
    fireEvent.click(pauseButton);

    expect(pauseButton).toBeDisabled();

    await waitFor(() => {
      expect(pauseButton).not.toBeDisabled();
    });
  });

  it("shows loading indicator during transaction", async () => {
    mockContract.pause.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ContractControls />);

    fireEvent.click(screen.getByText("Pause Contract"));

    expect(screen.getByRole("progressbar")).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).toBeFalsy();
    });
  });
});
