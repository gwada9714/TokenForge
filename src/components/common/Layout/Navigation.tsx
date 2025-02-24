import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Token as TokenIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Assessment as AuditIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

export const Navigation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAdminToggle = () => {
    setAdminOpen(!adminOpen);
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Token Manager', icon: <TokenIcon />, path: '/tokens' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const adminItems = [
    { text: 'Contract Controls', path: '/admin/contracts' },
    { text: 'Alerts Management', path: '/admin/alerts' },
    { text: 'Audit Logs', icon: <AuditIcon />, path: '/admin/audit' },
  ];

  const drawer = (
    <Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isCurrentPath(item.path)}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItemButton onClick={handleAdminToggle}>
          <ListItemIcon>
            <AdminIcon />
          </ListItemIcon>
          <ListItemText primary="Administration" />
          {adminOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={adminOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {adminItems.map((item) => (
              <ListItemButton
                key={item.text}
                sx={{ pl: 4 }}
                selected={isCurrentPath(item.path)}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
              >
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
    >
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              mt: '64px',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Navigation;
