import { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "@mui/material/styles";
import { forgeTheme } from "./theme/forge-theme";
import { Routes, Route } from "react-router-dom";
import { GlobalStyle } from "./styles/GlobalStyle";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { CircularProgress, Box } from "@mui/material";
import { ContractProvider } from "./contexts/ContractContext";
import { Web3Providers } from "./providers/Web3Providers";
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from "./config/wagmiConfig";
import '@rainbow-me/rainbowkit/styles.css';

// Lazy loading avec preload pour les composants critiques
const HomePage = lazy(() => import("./pages/Home"));
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const SignUpForm = lazy(() => import("./components/auth/SignUpForm"));
const TokenWizard = lazy(() => import("./components/TokenWizard/TokenWizard"));
const StakingDashboard = lazy(() => import("./components/Staking/StakingDashboard"));
const ProfitDashboard = lazy(() => import("./components/Dashboard/ProfitDashboard"));
const LaunchpadPage = lazy(() => import("./pages/Launchpad"));
const MyTokens = lazy(() => import("./pages/MyTokens"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'background.default'
    }}
  >
    <CircularProgress />
  </Box>
);

export function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider>
        <Provider store={store}>
          <ThemeProvider theme={forgeTheme}>
            <Web3Providers>
              <ContractProvider>
                <GlobalStyle />
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginForm />} />
                      <Route path="/signup" element={<SignUpForm />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route
                        path="/create"
                        element={
                          <ProtectedRoute>
                            <TokenWizard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staking"
                        element={
                          <ProtectedRoute>
                            <StakingDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <ProfitDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/launchpad" element={<LaunchpadPage />} />
                      <Route
                        path="/tokens"
                        element={
                          <ProtectedRoute>
                            <MyTokens />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                    </Route>
                  </Routes>
                </Suspense>
              </ContractProvider>
            </Web3Providers>
          </ThemeProvider>
        </Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
