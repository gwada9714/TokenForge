import React, { Suspense } from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "@mui/material/styles";
import { forgeTheme } from "./theme/forge-theme";
import { Routes, Route, Navigate } from "react-router-dom";
import { GlobalStyle } from "./styles/GlobalStyle";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { CircularProgress, Box } from "@mui/material";
import { Web3Provider } from "./contexts/Web3Context";
import { ContractProvider } from "./contexts/ContractContext";

// Lazy loading des composants
const HomePage = React.lazy(() => import("./pages/Home"));
const LoginForm = React.lazy(() => import("./components/auth/LoginForm"));
const SignUpForm = React.lazy(() => import("./components/auth/SignUpForm"));
const TokenWizard = React.lazy(() => import("./components/TokenWizard/TokenWizard"));
const StakingDashboard = React.lazy(() => import("./components/Staking/StakingDashboard"));
const ProfitDashboard = React.lazy(() => import("./components/Dashboard/ProfitDashboard"));
const LaunchpadPage = React.lazy(() => import("./pages/Launchpad"));
const MyTokens = React.lazy(() => import("./pages/MyTokens"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={forgeTheme}>
        <Web3Provider>
          <ContractProvider>
            <GlobalStyle />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Routes publiques sans Layout */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />

                {/* Routes avec Layout */}
                <Route path="/" element={<Layout />}>
                  {/* Routes publiques */}
                  <Route index element={<HomePage />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="launchpad" element={<LaunchpadPage />} />

                  {/* Routes protégées */}
                  <Route path="create" element={
                    <ProtectedRoute>
                      <TokenWizard />
                    </ProtectedRoute>
                  } />
                  <Route path="staking" element={
                    <ProtectedRoute>
                      <StakingDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="profit" element={
                    <ProtectedRoute>
                      <ProfitDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="my-tokens" element={
                    <ProtectedRoute>
                      <MyTokens />
                    </ProtectedRoute>
                  } />
                  <Route path="admin" element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Redirection des routes inconnues */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </ContractProvider>
        </Web3Provider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
