import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { theme } from './styles/theme';
import { Home } from './pages/Home';
import { CreateToken } from './pages/CreateToken';
import { MyTokens } from './pages/MyTokens';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Header />
          <main style={{ flex: 1, padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateToken />} />
              <Route path="/my-tokens" element={<MyTokens />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;