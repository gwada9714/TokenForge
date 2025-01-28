import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Tooltip,
} from '@mui/material';
import { NetworkConfig, getMainnetNetworks, getTestnetNetworks } from '@/config/networks';
import Image from 'next/image';

interface NetworkSelectorProps {
  selectedNetwork?: NetworkConfig;
  onNetworkSelect: (network: NetworkConfig) => void;
  showTestnets?: boolean;
  onShowTestnetsChange?: (show: boolean) => void;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkSelect,
  showTestnets = false,
  onShowTestnetsChange,
}) => {
  const networks = React.useMemo(() => {
    return showTestnets ? [...getMainnetNetworks(), ...getTestnetNetworks()] : getMainnetNetworks();
  }, [showTestnets]);

  const NetworkCard: React.FC<{ network: NetworkConfig }> = React.memo(({ network }) => {
    const isSelected = selectedNetwork?.chain.id === network.chain.id;

    return (
      <Card
        sx={{
          cursor: 'pointer',
          border: theme => isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
        onClick={() => onNetworkSelect(network)}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            {network.icon && (
              <Image
                src={network.icon}
                alt={network.name}
                width={32}
                height={32}
              />
            )}
            <Box>
              <Typography variant="h6" component="div">
                {network.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {network.isTestnet ? '🔧 Testnet' : '🌐 Mainnet'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="div">
          Select Network
        </Typography>
        {onShowTestnetsChange && (
          <FormControlLabel
            control={
              <Switch
                checked={showTestnets}
                onChange={(e) => onShowTestnetsChange(e.target.checked)}
                color="primary"
              />
            }
            label="Show Testnets"
          />
        )}
      </Box>
      <Grid container spacing={2}>
        {networks.map((network) => (
          <Grid item xs={12} sm={6} md={4} key={network.chain.id}>
            <NetworkCard network={network} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
