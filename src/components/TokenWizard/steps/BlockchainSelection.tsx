import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Paper,
} from '@mui/material';

const SUPPORTED_CHAINS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    description: 'Main Ethereum network (Mainnet)',
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    description: 'Binance Smart Chain (BSC)',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    description: 'Polygon (Matic) network',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    description: 'Avalanche C-Chain',
  },
];

interface BlockchainSelectionProps {
  data: {
    blockchain: string;
  };
  onUpdate: (data: { blockchain: string }) => void;
}

const BlockchainSelection: React.FC<BlockchainSelectionProps> = ({
  data,
  onUpdate,
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
        <RadioGroup
          value={data.blockchain}
          onChange={handleChange}
        >
          {SUPPORTED_CHAINS.map((chain) => (
            <Paper
              key={chain.id}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: data.blockchain === chain.id ? 'primary.main' : 'divider',
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
