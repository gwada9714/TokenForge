import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
          }}
        >
          TokenForge
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/" sx={{ ml: 2 }}>
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/create"
            sx={{ ml: 2 }}
          >
            Create Token
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/my-tokens"
            sx={{ ml: 2 }}
          >
            My Tokens
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
