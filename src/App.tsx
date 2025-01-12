import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

const Home = () => <div>Accueil TokenForge</div>;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={{ palette: { mode: 'light' } }}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;