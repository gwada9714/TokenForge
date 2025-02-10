import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { forgeTheme } from "./theme/forge-theme";
import styledTheme from "./theme/styledTheme";
import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { router } from './router/routes';
import LoadingFallback from './components/common/LoadingFallback';
import { GlobalStyle } from "./styles/GlobalStyle";
import { ContractProvider } from "./contexts/ContractContext";
import { Web3Provider } from "./providers/web3/Web3Providers";
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/common/ErrorBoundary';
import { TokenForgeAuthProvider } from './features/auth/providers/TokenForgeAuthProvider';

export function App() {
  return (
    <Provider store={store}>
      <StyledThemeProvider theme={styledTheme}>
        <MuiThemeProvider theme={forgeTheme}>
          <Web3Provider>
            <ContractProvider>
              <GlobalStyle />
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <TokenForgeAuthProvider>
                    <RouterProvider router={router} />
                  </TokenForgeAuthProvider>
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                  />
                </Suspense>
              </ErrorBoundary>
            </ContractProvider>
          </Web3Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    </Provider>
  );
}

export default App;
