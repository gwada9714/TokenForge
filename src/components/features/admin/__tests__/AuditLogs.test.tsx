import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import AuditLogs from "../AuditLogs";
import { useContract } from "../../../../hooks/useContract";

// Mock du hook useContract
vi.mock("../../../../hooks/useContract", () => ({
  useContract: vi.fn(),
}));

describe("AuditLogs", () => {
  const mockLogs = [
    {
      id: "1",
      action: "Contract Paused",
      address: "0x1234...5678",
      timestamp: Date.now(),
      details: "Contract paused by admin",
      status: "success" as const,
      blockNumber: 12345,
      transactionHash: "0xabcd...efgh",
    },
    {
      id: "2",
      action: "Ownership Transferred",
      address: "0x5678...9abc",
      timestamp: Date.now() - 3600000,
      details: "Ownership transferred to new address",
      status: "success" as const,
      blockNumber: 12344,
      transactionHash: "0xijkl...mnop",
    },
  ];

  const mockContract = {
    queryFilter: vi.fn().mockResolvedValue(
      mockLogs.map((log) => ({
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        args: {
          action: log.action,
          account: log.address,
          details: log.details,
          success: log.status === "success",
        },
        getBlock: vi
          .fn()
          .mockResolvedValue({ timestamp: Math.floor(log.timestamp / 1000) }),
      }))
    ),
  };

  beforeEach(() => {
    (useContract as vi.Mock).mockReturnValue({ contract: mockContract });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the audit logs interface", async () => {
    render(<AuditLogs />);

    expect(screen.getByText("Audit Logs")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Contract Paused")).toBeTruthy();
      expect(screen.getByText("Ownership Transferred")).toBeTruthy();
    });
  });

  it("allows searching logs", async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText("Contract Paused")).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText("Search logs...");
    fireEvent.change(searchInput, { target: { value: "Ownership" } });

    expect(screen.queryByText("Contract Paused")).toBeFalsy();
    expect(screen.getByText("Ownership Transferred")).toBeTruthy();
  });

  it("handles pagination correctly", async () => {
    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText("Contract Paused")).toBeTruthy();
    });

    const rowsPerPageSelect = screen.getByLabelText("Rows per page:");
    fireEvent.mouseDown(rowsPerPageSelect);
    fireEvent.click(screen.getByText("25"));

    expect(screen.getByText("1-2 of 2")).toBeTruthy();
  });

  it("exports logs to CSV", async () => {
    // Mock URL.createObjectURL et URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<AuditLogs />);

    await waitFor(() => {
      expect(screen.getByText("Contract Paused")).toBeTruthy();
    });

    const exportButton = screen.getByTitle("Export logs");
    fireEvent.click(exportButton);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("displays error state when contract call fails", async () => {
    const mockError = new Error("Failed to fetch logs");
    mockContract.queryFilter.mockRejectedValueOnce(mockError);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<AuditLogs />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch audit logs:",
        mockError
      );
    });

    consoleSpy.mockRestore();
  });
});
