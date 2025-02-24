import React from 'react';
import { Box, Grid, Paper, Typography, Drawer, List, ListItem as MuiListItem, ListItemIcon, ListItemText, AppBar, Toolbar, IconButton } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Token as TokenIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { AuditLogs } from './AuditLogs';
import { TokenStats } from './TokenStats';
import { UserManagement } from './UserManagement';

const drawerWidth = 240;

const StyledListItem = styled(MuiListItem)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Tokens', icon: <TokenIcon />, path: '/admin/tokens' },
  { text: 'Services', icon: <BuildIcon />, path: '/admin/services' },
  { text: 'Logs', icon: <AssessmentIcon />, path: '/admin/logs' },
];

export const AdminDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <StyledListItem
            key={item.text}
            selected={location.pathname === item.path}
          >
            <Link
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </Link>
          </StyledListItem>
        ))}
      </List>
    </div>
  );

  const MainContent = () => {
    if (location.pathname === '/admin') {
      return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" component="h1" gutterBottom>
                Tableau de bord administrateur
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistiques des tokens
                </Typography>
                <TokenStats />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Gestion des utilisateurs
                </Typography>
                <UserManagement />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Logs d'audit
                </Typography>
                <AuditLogs />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      );
    }
    return <Outlet />;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Administration TokenForge
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <MainContent />
      </Box>
    </Box>
  );
};
