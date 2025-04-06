import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { THEME_CONFIG } from "@/config/constants/theme";
import { Modal } from "@/components/ui/Modal";

const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={THEME_CONFIG}>{component}</ThemeProvider>
  );
};

describe("Modal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders when isOpen is true", () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        Modal Content
      </Modal>
    );

    expect(screen.getByText("Test Modal")).toBeDefined();
    expect(screen.getByText("Modal Content")).toBeDefined();
  });

  it("does not render when isOpen is false", () => {
    renderWithTheme(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        Modal Content
      </Modal>
    );

    expect(screen.queryByText("Test Modal")).toBeNull();
    expect(screen.queryByText("Modal Content")).toBeNull();
  });

  it("calls onClose when clicking the close button", () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        Modal Content
      </Modal>
    );

    fireEvent.click(screen.getByText("×"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the overlay", () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        Modal Content
      </Modal>
    );

    // Cliquer sur l'overlay (le fond)
    const overlay =
      screen.getByText("Modal Content").parentElement?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("does not call onClose when clicking modal content", () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        Modal Content
      </Modal>
    );

    fireEvent.click(screen.getByText("Modal Content"));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("renders custom footer when provided", () => {
    const customFooter = <button>Custom Button</button>;
    renderWithTheme(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        footer={customFooter}
      >
        Modal Content
      </Modal>
    );

    expect(screen.getByText("Custom Button")).toBeDefined();
  });

  it("renders default footer when no custom footer is provided", () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        Modal Content
      </Modal>
    );

    expect(screen.getByText("Annuler")).toBeDefined();
    expect(screen.getByText("Confirmer")).toBeDefined();
  });
});
