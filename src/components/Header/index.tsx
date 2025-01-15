import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface HeaderProps {
  onNavigate?: (to: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          onClick={handleClick}
          sx={{ color: 'white', textDecoration: 'none' }}
        >
          TokenForge
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;