import React, { useState, useEffect } from 'react';
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
import { DeploymentOptions, BlockchainNetwork } from './DeploymentOptions';
import { TokenConfig, DeploymentResult } from '../../../types/deployment';
import { TokenDeploymentService } from '../services/tokenDeploymentService';
import { useWalletStatus } from '@/features/auth/hooks/useWalletStatus';
import { useTokenForgeAuth } from '@/features/auth/hooks/useTokenForgeAuth';
import { logger } from '@/core/logger';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const steps = ['Sélection du niveau', 'Configuration du token', 'Déploiement'];

export const TokenCreationWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [tokenConfig, setTokenConfig] = useState<TokenConfig | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('bsc');
  const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { checkFeature } = useSubscription();
  const { walletClient, address, isConnected } = useWalletStatus();
  const auth = useTokenForgeAuth();
  
  // Créer un client public pour les interactions blockchain
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  });

  // Vérifier si la connexion au wallet est disponible
  useEffect(() => {
    if (activeStep === 2 && !isConnected) {
      setValidationErrors(['Veuillez connecter votre wallet pour déployer un token']);
    } else {
      setValidationErrors([]);
    }
  }, [activeStep, isConnected]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  const handleTokenConfigChange = (config: TokenConfig) => {
    setTokenConfig(config);
  };

  const handleNetworkChange = (network: BlockchainNetwork, testnet: boolean) => {
    setSelectedNetwork(network);
    setIsTestnet(testnet);
  };

  const handleDeploy = async () => {
    if (!tokenConfig || !walletClient || !address) {
      setValidationErrors(['Configuration incomplète ou wallet non connecté']);
      return;
    }
    
    setIsDeploying(true);
    setDeploymentResult(null);
    setValidationErrors([]);
    
    try {
      logger.info({
        category: 'TokenDeploy',
        message: 'Démarrage du déploiement de token',
        data: {
          tokenName: tokenConfig.name,
          network: selectedNetwork,
          isTestnet,
          address
        }
      });
      
      // Création du service de déploiement avec les clients
      const deploymentService = new TokenDeploymentService(
        publicClient,
        walletClient
      );
      
      // Validation de la configuration
      const validation = await deploymentService.validateTokenConfig(tokenConfig);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error('Configuration invalide : ' + validation.errors.join(', '));
      }
      
      // Déploiement du token
      const result = await deploymentService.deployToken(tokenConfig, {
        chain: selectedNetwork,
        verifyContract: !isTestnet
      });
      
      setDeploymentResult(result);
      
      if (result.success) {
        logger.info({
          category: 'TokenDeploy',
          message: 'Token déployé avec succès',
          data: {
            tokenAddress: result.tokenAddress,
            transactionHash: result.transactionHash
          }
        });
      } else {
        logger.error({
          category: 'TokenDeploy',
          message: 'Échec du déploiement du token',
          error: new Error(result.error || 'Erreur inconnue')
        });
      }
    } catch (error) {
      logger.error({
        category: 'TokenDeploy',
        message: 'Erreur lors du déploiement du token',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors du déploiement'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const canDeployMainnet = checkFeature('canDeployMainnet');
  const hasMintBurn = checkFeature('hasMintBurn');
  const hasBlacklist = checkFeature('hasBlacklist');

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
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Configurez votre token
            </Typography>
            <TokenConfigurationForm 
              initialConfig={tokenConfig || undefined}
              onChange={handleTokenConfigChange}
              hasMintBurn={hasMintBurn}
              hasBlacklist={hasBlacklist}
            />
          </Paper>
        );
      case 2:
        return (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Déployez votre token
            </Typography>
            <DeploymentOptions 
              onNetworkChange={handleNetworkChange}
              canDeployMainnet={canDeployMainnet}
              selectedNetwork={selectedNetwork}
              isTestnet={isTestnet}
            />
            
            {!isConnected && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Vous devez connecter votre wallet pour déployer un token.
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ ml: 2 }}
                  onClick={() => auth.connectWallet()}
                >
                  Connecter Wallet
                </Button>
              </Alert>
            )}
            
            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Erreurs de validation:</Typography>
                <ul>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}
            
            {deploymentResult && (
              <Box sx={{ mt: 3 }}>
                {deploymentResult.success ? (
                  <Alert severity="success">
                    <Typography variant="subtitle1">Token déployé avec succès!</Typography>
                    <Typography variant="body2">Adresse: {deploymentResult.tokenAddress}</Typography>
                    {deploymentResult.transactionHash && (
                      <Typography variant="body2">
                        Transaction: {deploymentResult.transactionHash.substring(0, 10)}...
                        {deploymentResult.transactionHash.substring(deploymentResult.transactionHash.length - 8)}
                      </Typography>
                    )}
                  </Alert>
                ) : (
                  <Alert severity="error">
                    <Typography variant="subtitle1">Échec du déploiement</Typography>
                    <Typography variant="body2">{deploymentResult.error}</Typography>
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
                disabled={isDeploying || !isConnected || !tokenConfig}
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
                (activeStep === 0 && !selectedTier) ||
                (activeStep === 1 && !tokenConfig)}
            >
              {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
