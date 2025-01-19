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
import { Web3Provider } from "./contexts/Web3Context";
import { ContractProvider } from "./contexts/ContractContext";

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
      bgcolor: 'background.default' 
    }}
  >
    <CircularProgress />
  </Box>
);

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Provider store={store}>
        <ThemeProvider theme={forgeTheme}>
          <GlobalStyle />
          <Web3Provider>
            <ContractProvider>
              <Routes>
                {/* Routes publiques sans Layout */}
                <Route path="/login" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <LoginForm />
                  </Suspense>
                } />
                <Route path="/signup" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SignUpForm />
                  </Suspense>
                } />

                {/* Routes avec Layout */}
                <Route element={<Layout />}>
                  {/* Routes publiques */}
                  <Route index element={
                    <Suspense fallback={<LoadingFallback />}>
                      <HomePage />
                    </Suspense>
                  } />
                  <Route path="pricing" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Pricing />
                    </Suspense>
                  } />
                  <Route path="launchpad" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LaunchpadPage />
                    </Suspense>
                  } />

                  {/* Routes protégées nécessitant Web3 */}
                  <Route
                    path="create"
                    element={
                      <ProtectedRoute requireWeb3>
                        <Suspense fallback={<LoadingFallback />}>
                          <TokenWizard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="staking"
                    element={
                      <ProtectedRoute requireWeb3>
                        <Suspense fallback={<LoadingFallback />}>
                          <StakingDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profit"
                    element={
                      <ProtectedRoute requireWeb3>
                        <Suspense fallback={<LoadingFallback />}>
                          <ProfitDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="my-tokens"
                    element={
                      <ProtectedRoute requireWeb3>
                        <Suspense fallback={<LoadingFallback />}>
                          <MyTokens />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute requireWeb3 requireAdmin>
                        <Suspense fallback={<LoadingFallback />}>
                          <AdminDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </ContractProvider>
          </Web3Provider>
        </ThemeProvider>
      </Provider>
    </Suspense>
  );
};

export default App;
