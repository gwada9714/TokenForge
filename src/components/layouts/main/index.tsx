import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Container,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { CustomConnectButton } from "../ConnectWallet/CustomConnectButton";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import { GlobalFeedback } from "../Feedback/GlobalFeedback";
import { useGlobalLoading } from "../../hooks/useGlobalLoading";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { navigateTo, canAccess } = useAppNavigation();
  const { isLoading, message } = useGlobalLoading();

  const menuItems = [
    { label: "Créer", path: "/create" },
    { label: "Staking", path: "/staking" },
    { label: "Profit", path: "/profit" },
    { label: "Launchpad", path: "/launchpad" },
    { label: "Mes Tokens", path: "/my-tokens" },
    { label: "Tarifs", path: "/pricing" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: "pointer" }}
            onClick={() => navigateTo("/")}
          >
            TokenForge
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, ml: 4 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigateTo(item.path)}
                disabled={!canAccess(item.path)}
                sx={{ mx: 1 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ ml: 2 }}>
            <CustomConnectButton />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {children}
        <Outlet />
      </Container>

      <GlobalFeedback loading={isLoading} loadingMessage={message} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </Box>
  );
};
