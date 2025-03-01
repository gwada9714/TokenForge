import React, { useState } from 'react';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { SubscriptionTier } from '@/features/subscription/types';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { TokenConfigurationForm } from './TokenConfigurationForm';
import { SubscriptionTierSelector } from './SubscriptionTierSelector';
import { DeploymentOptions } from './DeploymentOptions';
import { TokenConfig } from '../../../types/deployment';
// import { TokenDeploymentService } from '../services/tokenDeploymentService';

const steps = ['Sélection du niveau', 'Configuration du token', 'Déploiement'];

export const TokenCreationWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [tokenConfig /* , setTokenConfig */] = useState<TokenConfig | null>(null);
  // const [selectedNetwork, setSelectedNetwork] = useState<string>('bsc');
  // const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    tokenAddress?: string;
    error?: string;
  } | null>(null);

  const { /* currentSubscription, */ /* checkFeature */ } = useSubscription();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  // const handleTokenConfigChange = (config: TokenConfig) => {
  //   setTokenConfig(config);
  // };

  // const handleNetworkChange = (network: string, testnet: boolean) => {
  //   setSelectedNetwork(network);
  //   setIsTestnet(testnet);
  // };

  const handleDeploy = async () => {
    if (!tokenConfig) return;
    
    setIsDeploying(true);
    setDeploymentResult(null);
    
    try {
      // Simulation de déploiement pour l'exemple
      // Dans une implémentation réelle, vous utiliseriez tokenDeploymentService.deployToken
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeploymentResult({
        success: true,
        tokenAddress: '0x1234567890abcdef1234567890abcdef12345678'
      });
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors du déploiement'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // const canDeployMainnet = checkFeature('canDeployMainnet');
  // const hasMintBurn = checkFeature('hasMintBurn');
  // const hasBlacklist = checkFeature('hasBlacklist');

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Sélectionnez votre niveau de forge
            </Typography>
            <SubscriptionTierSelector 
              selectedTier={selectedTier}
              onSelect={handleTierSelect}
            />
          </Paper>
        );
      case 1:
        return <TokenConfigurationForm />;
      case 2:
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Déployez votre token
            </Typography>
            <DeploymentOptions />
            
            {deploymentResult && (
              <Box sx={{ mt: 3 }}>
                {deploymentResult.success ? (
                  <Alert severity="success">
                    Token déployé avec succès! Adresse: {deploymentResult.tokenAddress}
                  </Alert>
                ) : (
                  <Alert severity="error">
                    Échec du déploiement: {deploymentResult.error}
                  </Alert>
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleDeploy}
                disabled={isDeploying}
                startIcon={isDeploying ? <CircularProgress size={20} /> : null}
              >
                {isDeploying ? 'Déploiement en cours...' : 'Déployer le Token'}
              </Button>
            </Box>
          </Paper>
        );
      default:
        return 'Étape inconnue';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mb: 5 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 5 }}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1 || 
                (activeStep === 0 && !selectedTier)}
            >
              {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
