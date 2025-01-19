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
const HomePage = lazy(() => import("./pages/Home" /* webpackPrefetch: true */));
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const SignUpForm = lazy(() => import("./components/auth/SignUpForm"));

// Lazy loading pour les composants secondaires
const TokenWizard = lazy(() => import("./components/TokenWizard/TokenWizard"));
const StakingDashboard = lazy(() => import("./components/Staking/StakingDashboard"));
const ProfitDashboard = lazy(() => import("./components/Dashboard/ProfitDashboard"));
const LaunchpadPage = lazy(() => import("./pages/Launchpad"));
const MyTokens = lazy(() => import("./pages/MyTokens"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Composant de chargement optimisé
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
    <Provider store={store}>
      <ThemeProvider theme={forgeTheme}>
        <GlobalStyle />
        <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/" element={<Layout />}>
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
              <Route path="create" element={
                <Web3Provider>
                  <ContractProvider>
                    <ProtectedRoute requireWeb3>
                      <Suspense fallback={<LoadingFallback />}>
                        <TokenWizard />
                      </Suspense>
                    </ProtectedRoute>
                  </ContractProvider>
                </Web3Provider>
              } />
              <Route path="staking" element={
                <Web3Provider>
                  <ContractProvider>
                    <ProtectedRoute requireWeb3>
                      <Suspense fallback={<LoadingFallback />}>
                        <StakingDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  </ContractProvider>
                </Web3Provider>
              } />
              <Route path="profit" element={
                <Web3Provider>
                  <ContractProvider>
                    <ProtectedRoute requireWeb3>
                      <Suspense fallback={<LoadingFallback />}>
                        <ProfitDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  </ContractProvider>
                </Web3Provider>
              } />
              <Route path="my-tokens" element={
                <Web3Provider>
                  <ContractProvider>
                    <ProtectedRoute requireWeb3>
                      <Suspense fallback={<LoadingFallback />}>
                        <MyTokens />
                      </Suspense>
                    </ProtectedRoute>
                  </ContractProvider>
                </Web3Provider>
              } />
              <Route path="admin" element={
                <Web3Provider>
                  <ContractProvider>
                    <ProtectedRoute requireWeb3 requireAdmin>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  </ContractProvider>
                </Web3Provider>
              } />
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
