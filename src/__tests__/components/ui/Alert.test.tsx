import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { THEME_CONFIG } from "@/config/constants/theme";
import { Alert } from "@/components/ui/Alert";

const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={THEME_CONFIG}>{component}</ThemeProvider>
  );
};

describe("Alert Component", () => {
  it("renders with default type (info)", () => {
    renderWithTheme(<Alert>Info message</Alert>);

    const alert = screen.getByText("Info message");
    expect(alert).toBeDefined();
    expect(alert.parentElement?.parentElement).toHaveStyle(`
      background-color: ${THEME_CONFIG.colors.info}20
    `);
  });

  it("renders with success type", () => {
    renderWithTheme(<Alert type="success">Success message</Alert>);

    const alert = screen.getByText("Success message");
    expect(alert.parentElement?.parentElement).toHaveStyle(`
      background-color: ${THEME_CONFIG.colors.success}20
    `);
  });

  it("renders with warning type", () => {
    renderWithTheme(<Alert type="warning">Warning message</Alert>);

    const alert = screen.getByText("Warning message");
    expect(alert.parentElement?.parentElement).toHaveStyle(`
      background-color: ${THEME_CONFIG.colors.warning}20
    `);
  });

  it("renders with error type", () => {
    renderWithTheme(<Alert type="error">Error message</Alert>);

    const alert = screen.getByText("Error message");
    expect(alert.parentElement?.parentElement).toHaveStyle(`
      background-color: ${THEME_CONFIG.colors.error}20
    `);
  });

  it("renders with title", () => {
    renderWithTheme(<Alert title="Alert Title">Alert message</Alert>);

    expect(screen.getByText("Alert Title")).toBeDefined();
    expect(screen.getByText("Alert message")).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    renderWithTheme(<Alert onClose={handleClose}>Closeable alert</Alert>);

    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not render close button when onClose is not provided", () => {
    renderWithTheme(<Alert>Alert without close button</Alert>);

    const closeButton = screen.queryByText("×");
    expect(closeButton).toBeNull();
  });
});
