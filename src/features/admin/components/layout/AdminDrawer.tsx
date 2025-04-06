import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Toolbar,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Token as TokenIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  BarChart as AnalyticsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";

interface AdminDrawerProps {
  open: boolean;
  handleDrawerToggle: () => void;
  onNavigate?: (path: string) => void;
}

/**
 * Tiroir de navigation pour le dashboard administrateur
 * Contient les liens vers les différentes sections du dashboard
 */
export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  open,
  handleDrawerToggle,
  onNavigate = () => {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Définition des éléments du menu
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { text: "Tokens", icon: <TokenIcon />, path: "/admin/tokens" },
    { text: "Utilisateurs", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Paiements", icon: <PaymentIcon />, path: "/admin/payments" },
    { text: "Analytiques", icon: <AnalyticsIcon />, path: "/admin/analytics" },
    { text: "Sécurité", icon: <SecurityIcon />, path: "/admin/security" },
    { text: "Paramètres", icon: <SettingsIcon />, path: "/admin/settings" },
  ];

  // Contenu du drawer
  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.slice(0, 4).map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => onNavigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {menuItems.slice(4).map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => onNavigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: open ? 240 : 0 }, flexShrink: { md: 0 } }}
    >
      {/* Drawer mobile (temporaire) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Meilleure performance sur mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Drawer desktop (permanent) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              position: "relative",
              whiteSpace: "nowrap",
              width: 240,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: "border-box",
              ...(!open && {
                overflowX: "hidden",
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up("sm")]: {
                  width: theme.spacing(9),
                },
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};
