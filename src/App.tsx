import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

// Composants et Pages
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import AboutPage from './pages/About'; // Renommé ici
import Tokens from './pages/Tokens';
import Analyse from './pages/Analyse';

// Thème
import { theme } from './theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} /> {/* Mis à jour ici */}
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/analyse" element={<Analyse />} />
            </Routes>
          </Box>
        </Container>
      </Layout>
    </ThemeProvider>
  );
};

export default App;