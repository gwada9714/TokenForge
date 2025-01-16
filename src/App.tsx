import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import HomePage from './pages/Home';
import TokenWizard from './components/TokenWizard/TokenWizard';
import StakingDashboard from './components/Staking/StakingDashboard';
import ProfitDashboard from './components/Dashboard/ProfitDashboard';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<TokenWizard />} />
          <Route path="/staking" element={<StakingDashboard />} />
          <Route path="/dashboard" element={<ProfitDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;