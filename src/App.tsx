import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { forgeTheme } from "./theme/forge-theme";
import { GlobalStyle } from "./styles/GlobalStyle";
import { AuthProvider } from "./contexts/AuthContext";
import { ContractProvider } from "./contexts/ContractContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoginForm } from "./components/auth/LoginForm";
import { SignUpForm } from "./components/auth/SignUpForm";
import HomePage from "./pages/Home";
import TokenWizard from "./components/TokenWizard/TokenWizard";
import StakingDashboard from "./components/Staking/StakingDashboard";
import ProfitDashboard from "./components/Dashboard/ProfitDashboard";
import LaunchpadPage from "./pages/Launchpad";
import MyTokens from "./pages/MyTokens";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/admin/AdminDashboard";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={forgeTheme}>
        <AuthProvider>
          <ContractProvider>
            <GlobalStyle />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/create" element={<ProtectedRoute><TokenWizard /></ProtectedRoute>} />
              <Route path="/staking" element={<ProtectedRoute><StakingDashboard /></ProtectedRoute>} />
              <Route path="/profit" element={<ProtectedRoute><ProfitDashboard /></ProtectedRoute>} />
              <Route path="/launchpad" element={<LaunchpadPage />} />
              <Route path="/my-tokens" element={<ProtectedRoute><MyTokens /></ProtectedRoute>} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </ContractProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
