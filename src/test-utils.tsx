import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const theme = createTheme();

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>{children}</BrowserRouter>
  </ThemeProvider>
);

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: AllProviders, ...options }),
});

export * from "@testing-library/react";
export { customRender as render };
