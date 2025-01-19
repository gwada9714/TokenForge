import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "@mui/material/styles";
import { forgeTheme } from "./theme/forge-theme";
import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import router from './router/routes';
import { LoadingFallback } from './routes/components/LoadingFallback';
import { GlobalStyle } from "./styles/GlobalStyle";
import { ContractProvider } from "./contexts/ContractContext";
import { Web3Providers } from "./providers/Web3Providers";
import '@rainbow-me/rainbowkit/styles.css';

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={forgeTheme}>
        <Web3Providers>
          <ContractProvider>
            <GlobalStyle />
            <Suspense fallback={<LoadingFallback />}>
              <RouterProvider router={router} />
            </Suspense>
          </ContractProvider>
        </Web3Providers>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
