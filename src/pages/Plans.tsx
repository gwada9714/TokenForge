import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { PlanSelector } from "../components/Plans/PlanSelector";
import { UserPlanProvider } from "../contexts/UserPlanContext";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Plans: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Plans TokenForge
        </Typography>

        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
          Choisissez le plan qui correspond à vos besoins
        </Typography>

        {!isConnected ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Connectez votre wallet pour accéder aux plans
            </Typography>
            <ConnectButton />
          </Box>
        ) : (
          <UserPlanProvider>
            <PlanSelector />
          </UserPlanProvider>
        )}
      </Box>
    </Container>
  );
};

export default Plans;
