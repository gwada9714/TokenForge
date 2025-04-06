import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import { testTheme } from "./test-theme";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import tokenCreationReducer from "../store/slices/tokenCreationSlice";
import uiReducer from "../store/slices/uiSlice";
import walletReducer from "../store/slices/walletSlice";
import analyticsReducer from "../store/slices/analyticsSlice";
import userTokensReducer from "../store/slices/userTokensSlice";
import authReducer from "../store/slices/authSlice";
import { vi } from "vitest";

// Mock WagmiProvider
vi.mock("wagmi", () => ({
  WagmiConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAccount: () => ({
    address: "0x123",
    isConnected: true,
  }),
  useNetwork: () => ({
    chain: { id: 11155111, name: "Sepolia" },
  }),
}));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function render(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        tokenCreation: tokenCreationReducer,
        ui: uiReducer,
        wallet: walletReducer,
        analytics: analyticsReducer,
        userTokens: userTokensReducer,
        auth: authReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={testTheme}>
            <CssBaseline />
            <BrowserRouter>
              <Provider store={store}>{children}</Provider>
            </BrowserRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { render };
