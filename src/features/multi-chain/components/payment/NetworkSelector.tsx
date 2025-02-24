import React from 'react';
import {
  Grid,
  Card,
  Typography,
  CardActionArea,
  Box,
} from '@mui/material';
import { PaymentNetwork } from '../../services/payment/types/PaymentSession';

interface NetworkOption {
  network: PaymentNetwork;
  name: string;
  icon: string;
  color: string;
}

const networks: NetworkOption[] = [
  {
    network: PaymentNetwork.ETHEREUM,
    name: 'Ethereum',
    icon: '/assets/networks/ethereum.svg',
    color: '#627EEA',
  },
  {
    network: PaymentNetwork.BINANCE,
    name: 'Binance Smart Chain',
    icon: '/assets/networks/binance.svg',
    color: '#F3BA2F',
  },
  {
    network: PaymentNetwork.POLYGON,
    name: 'Polygon',
    icon: '/assets/networks/polygon.svg',
    color: '#8247E5',
  },
  {
    network: PaymentNetwork.SOLANA,
    name: 'Solana',
    icon: '/assets/networks/solana.svg',
    color: '#14F195',
  },
];

interface NetworkSelectorProps {
  selectedNetwork: PaymentNetwork | null;
  onSelect: (network: PaymentNetwork) => void;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onSelect,
}) => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Select Network
      </Typography>
      
      <Grid container spacing={2}>
        {networks.map((option) => (
          <Grid item xs={6} key={option.network}>
            <Card
              sx={{
                border: selectedNetwork === option.network ? 2 : 0,
                borderColor: option.color,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardActionArea
                onClick={() => onSelect(option.network)}
                sx={{ p: 2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={option.icon}
                    alt={option.name}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: 'contain',
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{
                      color: selectedNetwork === option.network ? option.color : 'text.primary',
                      fontWeight: selectedNetwork === option.network ? 600 : 400,
                    }}
                  >
                    {option.name}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
