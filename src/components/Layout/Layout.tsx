import React from "react";
import { Box, Container, CssBaseline } from "@mui/material";
import Navigation from "./Navigation";
import { Footer } from "../Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />
      <Navigation />
      <Box
        component="main"
        sx={{
          flex: 1,
          pt: { xs: 8, sm: 9, md: 10 }, 
          pb: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            height: "100%",
          }}
        >
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};