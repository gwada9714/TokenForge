import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { Footer } from "@/components/Footer";
import { THEME, COLORS, SPACING } from "@/config/constants/theme";
import { APP_NAME } from "@/config/constants";

const theme = {
  colors: COLORS,
  spacing: SPACING,
  theme: THEME,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("Footer", () => {
  it("renders copyright with current year", () => {
    renderWithTheme(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} ${APP_NAME}`))
    ).toBeInTheDocument();
  });

  it("renders all footer links", () => {
    renderWithTheme(<Footer />);
    expect(screen.getByText("Confidentialité")).toHaveAttribute(
      "href",
      "/privacy"
    );
    expect(screen.getByText("Conditions d'utilisation")).toHaveAttribute(
      "href",
      "/terms"
    );
    expect(screen.getByText("Contact")).toHaveAttribute("href", "/contact");
  });

  it("applies correct styles", () => {
    const { container } = renderWithTheme(<Footer />);
    const footer = container.firstChild;
    expect(footer).toHaveStyle(`
      background-color: ${COLORS.background.primary};
      border-top: 1px solid ${COLORS.border};
    `);
  });
});
