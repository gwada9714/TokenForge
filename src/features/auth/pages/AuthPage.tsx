import React from "react";
import { Container, Paper, Box, Tabs, Tab } from "@mui/material";
import { LoginForm } from "../components/LoginForm";
import { SignUpForm } from "../components/SignUpForm";

export const AuthPage: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3}>
          <Box p={3}>
            <Tabs value={value} onChange={handleChange} centered>
              <Tab label="Connexion" />
              <Tab label="Inscription" />
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {value === 0 ? <LoginForm /> : <SignUpForm />}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
