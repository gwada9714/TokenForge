import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static" style={{ backgroundColor: '#182038' }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1, color: '#FFFFFF' }}>
          TokenForge
        </Typography>
        <Button color="inherit">Créer un Token</Button>
        <Button color="inherit">Services</Button>
        <Button color="inherit">Token $TKN</Button>
        <Button color="inherit">Communauté</Button>
        <Button color="inherit">Connexion/Inscription</Button>
        <Button variant="contained" style={{ backgroundColor: '#D97706', color: '#FFFFFF' }}>
          Forge ton Token
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
