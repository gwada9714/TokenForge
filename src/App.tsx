import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { Home } from './pages/Home';
import { CreateToken } from './pages/CreateToken';
import { Layout } from './components/Layout';
import { Footer } from './components/Footer/Footer';
import { Web3Provider } from './contexts/Web3Provider';
import { MyTokens } from './pages/MyTokens';

const App = () => {
  return (
    <Web3Provider>
      <ThemeProvider theme={theme}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateToken />} />
              <Route path="/my-tokens" element={<MyTokens />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Web3Provider>
  );
};

export default App;