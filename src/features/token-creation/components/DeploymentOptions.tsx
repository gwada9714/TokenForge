import React, { useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Grid,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';

export type BlockchainNetwork = 'ethereum' | 'bsc' | 'polygon' | 'avalanche' | 'solana' | 'arbitrum';

interface NetworkInfo {
  name: string;
  chainId: number;
  currency: string;
  testnet: boolean;
  deploymentFee: string;
}

const NETWORKS: Record<BlockchainNetwork, NetworkInfo> = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    currency: 'ETH',
    testnet: false,
    deploymentFee: '0.1'
  },
  bsc: {
    name: 'BNB Smart Chain',
    chainId: 56,
    currency: 'BNB',
    testnet: false,
    deploymentFee: '0.05'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    currency: 'MATIC',
    testnet: false,
    deploymentFee: '50'
  },
  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    currency: 'AVAX',
    testnet: false,
    deploymentFee: '1'
  },
  solana: {
    name: 'Solana',
    chainId: 1,
    currency: 'SOL',
    testnet: false,
    deploymentFee: '0.5'
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    currency: 'ETH',
    testnet: false,
    deploymentFee: '0.01'
  }
};

interface DeploymentOptionsProps {
  selectedNetwork?: BlockchainNetwork;
  isTestnet?: boolean;
  canDeployMainnet?: boolean;
  onNetworkChange?: (network: BlockchainNetwork, testnet: boolean) => void;
}

export const DeploymentOptions: React.FC<DeploymentOptionsProps> = ({
  selectedNetwork = 'bsc',
  isTestnet = true,
  canDeployMainnet = false,
  onNetworkChange
}) => {
  const { checkFeature } = useSubscription();
  const [network, setNetwork] = React.useState<BlockchainNetwork>(selectedNetwork);
  const [testnet, setTestnet] = React.useState<boolean>(isTestnet);

  // Utilise les valeurs par défaut ou les valeurs de souscription
  const canDeployToMainnet = canDeployMainnet || checkFeature('canDeployMainnet');

  // S'assurer que l'état local est synchronisé avec les props
  useEffect(() => {
    setNetwork(selectedNetwork);
    setTestnet(isTestnet);
  }, [selectedNetwork, isTestnet]);

  const handleNetworkChange = (event: SelectChangeEvent) => {
    const newNetwork = event.target.value as BlockchainNetwork;
    setNetwork(newNetwork);
    
    if (onNetworkChange) {
      onNetworkChange(newNetwork, testnet);
    }
  };

  const handleTestnetChange = (event: SelectChangeEvent) => {
    const isTestnetValue = event.target.value === 'testnet';
    setTestnet(isTestnetValue);
    
    if (onNetworkChange) {
      onNetworkChange(network, isTestnetValue);
    }
  };

  const networkInfo = NETWORKS[network];

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Réseau Blockchain</InputLabel>
            <Select
              value={network}
              label="Réseau Blockchain"
              onChange={handleNetworkChange}
            >
              {Object.entries(NETWORKS).map(([key, network]) => (
                <MenuItem key={key} value={key}>
                  {network.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Type de Réseau</InputLabel>
            <Select
              value={testnet ? 'testnet' : 'mainnet'}
              label="Type de Réseau"
              onChange={handleTestnetChange}
            >
              <MenuItem value="testnet">Testnet</MenuItem>
              <MenuItem value="mainnet" disabled={!canDeployToMainnet}>
                Mainnet
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Détails du Déploiement
            </Typography>
            <Typography variant="body1">
              Réseau: {networkInfo.name} {testnet ? '(Testnet)' : '(Mainnet)'}
            </Typography>
            <Typography variant="body1">
              Chain ID: {networkInfo.chainId}
            </Typography>
            <Typography variant="body1">
              Frais de déploiement: {networkInfo.deploymentFee} {networkInfo.currency}
            </Typography>
          </Paper>
        </Grid>

        {!canDeployToMainnet && !testnet && (
          <Grid item xs={12}>
            <Alert severity="warning">
              Le déploiement sur Mainnet nécessite un abonnement Forgeron ou Maître Forgeron
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Alert severity="info">
            N'oubliez pas d'avoir suffisamment de {networkInfo.currency} pour couvrir les frais de déploiement
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};
