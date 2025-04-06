import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#0A0F1F", // Fond sombre pour correspondre au thème
      }}
    >
      <Navbar />
      <Container
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          mt: { xs: 7, sm: 8 }, // Ajustement responsive pour la Navbar fixe
          px: { xs: 2, sm: 3 }, // Padding responsive
          maxWidth: { xl: "xl" }, // Limite la largeur sur très grands écrans
        }}
      >
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
