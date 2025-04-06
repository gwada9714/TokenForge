import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminDashboard } from "../AdminDashboard";
import { MemoryRouter } from "react-router-dom";

// Mock the child components
vi.mock("../AdminHeader", () => ({
  AdminHeader: () => <div data-testid="admin-header">Admin Header</div>,
}));

vi.mock("../AdminTabs", () => ({
  AdminTabs: ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (event: any, newValue: number) => void;
  }) => (
    <div data-testid="admin-tabs">
      <span>Current Tab: {value}</span>
      <button onClick={() => onChange({} as React.SyntheticEvent, 0)}>
        Tab 0
      </button>
      <button onClick={() => onChange({} as React.SyntheticEvent, 1)}>
        Tab 1
      </button>
      <button onClick={() => onChange({} as React.SyntheticEvent, 2)}>
        Tab 2
      </button>
      <button onClick={() => onChange({} as React.SyntheticEvent, 3)}>
        Tab 3
      </button>
      <button onClick={() => onChange({} as React.SyntheticEvent, 4)}>
        Tab 4
      </button>
    </div>
  ),
}));

vi.mock("../contract", () => ({
  ContractControls: ({ onError }: { onError: (message: string) => void }) => (
    <div data-testid="contract-controls">
      Contract Controls
      <button onClick={() => onError("Test error")}>Trigger Error</button>
    </div>
  ),
}));

vi.mock("../ownership", () => ({
  OwnershipManagement: () => (
    <div data-testid="ownership-management">Ownership Management</div>
  ),
}));

vi.mock("../alerts", () => ({
  AlertsManagement: () => (
    <div data-testid="alerts-management">Alerts Management</div>
  ),
}));

vi.mock("../audit", () => ({
  AuditLogs: () => <div data-testid="audit-logs">Audit Logs</div>,
}));

vi.mock("../AdminErrorBoundary", () => ({
  AdminErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-error-boundary">{children}</div>
  ),
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render the dashboard with default tab", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check that the main components are rendered
    expect(screen.getByTestId("admin-header")).toBeInTheDocument();
    expect(screen.getByTestId("admin-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("admin-error-boundary")).toBeInTheDocument();

    // Check that the default tab content is rendered
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Bienvenue dans le tableau de bord d'administration de TokenForge/
      )
    ).toBeInTheDocument();
  });

  it("should switch tabs when clicking on tab buttons", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Initially, the overview tab should be shown
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
    expect(screen.queryByTestId("contract-controls")).not.toBeInTheDocument();

    // Click on the Contract Controls tab
    fireEvent.click(screen.getByText("Tab 1"));
    expect(screen.queryByText("Vue d'ensemble")).not.toBeInTheDocument();
    expect(screen.getByTestId("contract-controls")).toBeInTheDocument();

    // Click on the Ownership Management tab
    fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.queryByTestId("contract-controls")).not.toBeInTheDocument();
    expect(screen.getByTestId("ownership-management")).toBeInTheDocument();

    // Click on the Alerts Management tab
    fireEvent.click(screen.getByText("Tab 3"));
    expect(
      screen.queryByTestId("ownership-management")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("alerts-management")).toBeInTheDocument();

    // Click on the Audit Logs tab
    fireEvent.click(screen.getByText("Tab 4"));
    expect(screen.queryByTestId("alerts-management")).not.toBeInTheDocument();
    expect(screen.getByTestId("audit-logs")).toBeInTheDocument();

    // Go back to the overview tab
    fireEvent.click(screen.getByText("Tab 0"));
    expect(screen.queryByTestId("audit-logs")).not.toBeInTheDocument();
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
  });

  it("should show error message when child component triggers an error", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Switch to the Contract Controls tab
    fireEvent.click(screen.getByText("Tab 1"));
    expect(screen.getByTestId("contract-controls")).toBeInTheDocument();

    // Initially, no error should be shown
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // Trigger an error
    fireEvent.click(screen.getByText("Trigger Error"));

    // Error should be shown
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Test error");
  });
});
