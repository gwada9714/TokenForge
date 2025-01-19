import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "@mui/material/styles";
import { forgeTheme } from "./theme/forge-theme";
import { RouterProvider } from "react-router-dom";
import { GlobalStyle } from "./styles/GlobalStyle";
import { ContractProvider } from "./contexts/ContractContext";
import { Web3Providers } from "./providers/Web3Providers";
import { router } from "./routes";
import '@rainbow-me/rainbowkit/styles.css';

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={forgeTheme}>
        <Web3Providers>
          <ContractProvider>
            <GlobalStyle />
            <RouterProvider router={router} />
          </ContractProvider>
        </Web3Providers>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
