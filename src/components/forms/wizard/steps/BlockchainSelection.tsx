import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Paper,
} from "@mui/material";

const SUPPORTED_CHAINS = [
  {
    id: "ethereum",
    name: "Ethereum",
    description: "Main Ethereum network (Mainnet)",
    isTestnet: false,
  },
  {
    id: "sepolia",
    name: "Sepolia",
    description: "Ethereum Testnet (Sepolia)",
    isTestnet: true,
  },
  {
    id: "bsc",
    name: "Binance Smart Chain",
    description: "Binance Smart Chain (BSC)",
    isTestnet: false,
  },
  {
    id: "polygon",
    name: "Polygon",
    description: "Polygon (Matic) network",
    isTestnet: false,
  },
  {
    id: "avalanche",
    name: "Avalanche",
    description: "Avalanche C-Chain",
    isTestnet: false,
  },
];

interface BlockchainSelectionProps {
  data: {
    blockchain: string;
  };
  onUpdate: (data: { blockchain: string }) => void;
  showTestnets?: boolean;
}

const BlockchainSelection: React.FC<BlockchainSelectionProps> = ({
  data,
  onUpdate,
  showTestnets = true,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ blockchain: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Blockchain Network
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the blockchain network where you want to deploy your token.
      </Typography>

      <FormControl component="fieldset">
        <FormLabel component="legend">Available Networks</FormLabel>
        <RadioGroup value={data.blockchain} onChange={handleChange}>
          {SUPPORTED_CHAINS.filter(
            (chain) => !chain.isTestnet || showTestnets
          ).map((chain) => (
            <Paper
              key={chain.id}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid",
                borderColor:
                  data.blockchain === chain.id ? "primary.main" : "divider",
              }}
            >
              <FormControlLabel
                value={chain.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1">{chain.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {chain.description}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default BlockchainSelection;
