import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, Outlet } from "react-router-dom";

// Import components
import { AdminAppBar } from "./layout/AdminAppBar";
import { AdminDrawer } from "./layout/AdminDrawer";
import { AdminHome } from "./pages/AdminHome";

/**
 * Dashboard administrateur principal
 * Contient la structure globale du dashboard admin avec:
 * - Barre d'application avec titre et toggle mobile
 * - Tiroir de navigation avec menu items
 * - Zone de contenu principal qui affiche soit le dashboard d'accueil, soit les routes enfants
 */
export const AdminDashboard: React.FC = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Fermer automatiquement le drawer sur mobile
  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  // Gérer l'ouverture/fermeture du drawer
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Gérer la navigation
  const handleNavigate = (path: string) => {
    // Dans une implémentation réelle, on utiliserait useNavigate de react-router-dom
    console.log(`Navigation vers: ${path}`);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Barre d'application */}
      <AdminAppBar
        open={open}
        handleDrawerToggle={handleDrawerToggle}
        title="TokenForge Admin"
      />

      {/* Tiroir de navigation */}
      <AdminDrawer
        open={open}
        handleDrawerToggle={handleDrawerToggle}
        onNavigate={handleNavigate}
      />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? 240 : 0}px)` },
          ml: { sm: `${open ? 240 : 0}px` },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Espace pour la barre d'application */}
        {/* Afficher soit la page d'accueil, soit les routes enfants */}
        {location.pathname === "/admin" ? <AdminHome /> : <Outlet />}
      </Box>
    </Box>
  );
};
