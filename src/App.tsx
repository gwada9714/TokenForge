import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { forgeTheme } from "./theme/forge-theme";
import { GlobalStyle } from "./styles/GlobalStyle";
import HomePage from "./pages/Home";
import TokenWizard from "./components/TokenWizard/TokenWizard";
import StakingDashboard from "./components/Staking/StakingDashboard";
import ProfitDashboard from "./components/Dashboard/ProfitDashboard";
import LaunchpadPage from "./pages/Launchpad";
import MyTokens from "./pages/MyTokens";
import Pricing from "./pages/Pricing";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={forgeTheme}>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<TokenWizard />} />
          <Route path="/staking" element={<StakingDashboard />} />
          <Route path="/dashboard" element={<ProfitDashboard />} />
          <Route path="/launchpad" element={<LaunchpadPage />} />
          <Route path="/my-tokens" element={<MyTokens />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
