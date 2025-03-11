import React, { useState } from 'react';
import { Alert, Box, Container, Typography, Tabs, Tab } from '@mui/material';
import { useNetwork } from '@/hooks/useNetwork';
import { NetworkNotSupported } from '@/components/shared/NetworkNotSupported';
import { LaunchpadForm } from './LaunchpadForm';
import { AutoLiquidityManager } from './AutoLiquidityManager';

export const LaunchpadPage: React.FC = () => {
  const { chain } = useNetwork();
  const [activeTab, setActiveTab] = useState(0);
  
  const launchpadAddress = chain ? 
    (chain.id === 11155111 ? import.meta.env.VITE_LAUNCHPAD_CONTRACT_SEPOLIA : 
     chain.id === 1 ? import.meta.env.VITE_LAUNCHPAD_CONTRACT_MAINNET :
     chain.id === 31337 ? import.meta.env.VITE_LAUNCHPAD_CONTRACT_LOCAL : null) 
    : null;
  
  if (!chain) {
    return (
      <Container>
        <Alert severity="warning">
          Please connect your wallet to continue
        </Alert>
      </Container>
    );
  }

  if (!launchpadAddress) {
    return (
      <Container>
        <NetworkNotSupported 
          message={`Launchpad is not available on ${chain.name}. Please switch to a supported network.`}
        />
      </Container>
    );
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Plateforme de Lancement et Gestion de Liquidité
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Créez un lancement équitable et transparent pour votre token avec TokenForge
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="launchpad tabs">
            <Tab label="Créer un Lancement" />
            <Tab label="Gestionnaire de Liquidité Automatique" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <LaunchpadForm contractAddress={launchpadAddress} />
        )}

        {activeTab === 1 && (
          <AutoLiquidityManager />
        )}
      </Box>
    </Container>
  );
};
