import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import HomePage from './pages/Home';
import TokenWizard from './components/TokenWizard/TokenWizard';
import StakingDashboard from './components/Staking/StakingDashboard';
import ProfitDashboard from './components/Dashboard/ProfitDashboard';
import LaunchpadPage from './pages/Launchpad';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<TokenWizard />} />
          <Route path="/staking" element={<StakingDashboard />} />
          <Route path="/dashboard" element={<ProfitDashboard />} />
          <Route path="/launchpad" element={<LaunchpadPage />} />
        </Routes>
      </ThemeProvider>
    </Provider>
  );
};

export default App;