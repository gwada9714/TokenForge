import React, { useState } from "react";
import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Card,
  CardContent,
  Grid,
  styled,
  Theme,
} from "@mui/material";
import { useNetwork } from "../hooks/useNetwork";
import { mainnet, sepolia } from "viem/chains";

interface StyledCardProps {
  selected: boolean;
  theme?: Theme;
}

const StyledNetworkCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selected",
})<StyledCardProps>(({ theme, selected }) => ({
  cursor: "pointer",
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : "1px solid rgba(0, 0, 0, 0.12)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const NetworkConfig = () => {
  const [showTestnets, setShowTestnets] = useState(true);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const networks = [
    {
      ...mainnet,
      name: "Ethereum Mainnet",
      isTestnet: false,
    },
    {
      ...sepolia,
      name: "Sepolia Testnet",
      isTestnet: true,
    },
  ];

  const visibleNetworks = networks.filter(
    (network) => !network.isTestnet || showTestnets
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Sélectionnez un réseau</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showTestnets}
              onChange={(e) => setShowTestnets(e.target.checked)}
            />
          }
          label="Afficher les réseaux de test"
        />
      </Box>
      <Grid container spacing={2}>
        {visibleNetworks.map((network) => (
          <Grid item xs={12} sm={6} key={network.id}>
            <StyledNetworkCard
              selected={chain?.id === network.id}
              onClick={() => switchNetwork?.(network.id)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">{network.name}</Typography>
                  {network.isTestnet && (
                    <Typography variant="caption" color="text.secondary">
                      (Testnet)
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </StyledNetworkCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NetworkConfig;
