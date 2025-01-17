import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useTokenForge } from '@/hooks/useTokenForge';
import { useNetwork, useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';

interface DeploymentProps {
  data: {
    name: string;
    symbol: string;
    supply: string;
    blockchain: string;
    decimals: string;
    features: {
      mint: boolean;
      burn: boolean;
      pausable?: boolean;
    };
    serviceTier: string;
  };
  onRetry: () => void;
  onBack: () => void;
}

const DEPLOYMENT_TIMEOUT = 30000; // 30 secondes

const deploymentSteps = [
  'Initializing Deployment',
  'Deploying Token Contract',
  'Verifying Contract',
  'Finalizing Setup',
];

const Deployment: React.FC<DeploymentProps> = ({ data, onRetry, onBack }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { createToken, isCreating, factoryAddress } = useTokenForge();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  const clearDeploymentTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  const handleCancel = () => {
    clearDeploymentTimeout();
    setIsDeploying(false);
    setError('Déploiement annulé');
    onBack();
  };

  useEffect(() => {
    if (!isDeploying) {
      deployToken();
    }
    return () => clearDeploymentTimeout();
  }, []);

  const deployToken = useCallback(async () => {
    try {
      clearDeploymentTimeout();
      setIsDeploying(true);
      setError(null);
      setActiveStep(0);

      // Mettre en place le timeout
      timeoutRef.current = setTimeout(() => {
        setError('Le déploiement a pris trop de temps. Veuillez réessayer.');
        setIsDeploying(false);
      }, DEPLOYMENT_TIMEOUT);

      console.log('Démarrage du déploiement avec les données:', {
        data,
        chain,
        isConnected,
        address,
        factoryAddress
      });

      // Vérifications préalables
      if (!isConnected || !address) {
        throw new Error('Veuillez connecter votre wallet');
      }

      if (!chain) {
        throw new Error('Impossible de détecter le réseau');
      }

      if (chain.id !== sepolia.id) {
        throw new Error(`Veuillez vous connecter au réseau Sepolia. Réseau actuel : ${chain.name}`);
      }

      if (!factoryAddress || factoryAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Adresse du contrat factory invalide');
      }

      // Préparation des données
      const decimals = parseInt(data.decimals);
      const supply = parseFloat(data.supply);
      
      if (isNaN(decimals) || isNaN(supply)) {
        throw new Error('Supply ou décimales invalides');
      }

      console.log('Conversion de la supply:', { supply, decimals });
      const initialSupply = BigInt(Math.floor(supply * Math.pow(10, decimals)));
      console.log('Supply convertie:', initialSupply.toString());

      setActiveStep(1);

      const tokenParams = {
        name: data.name,
        symbol: data.symbol,
        initialSupply: data.supply,
        isMintable: data.features.mint
      };

      console.log('Paramètres du token:', tokenParams);

      const result = await createToken(tokenParams);
      console.log('Résultat du déploiement:', result);

      setActiveStep(2);
      
      // Simuler la vérification du contrat
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setActiveStep(3);
      clearDeploymentTimeout();
      setIsDeploying(false);
    } catch (err) {
      console.error('Erreur lors du déploiement:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du déploiement');
      setActiveStep(0);
      setIsDeploying(false);
      clearDeploymentTimeout();
    }
  }, [data, chain, createToken, isConnected, address, factoryAddress, onBack]);

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      {error ? (
        <Box>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => {
                setError(null);
                setIsDeploying(false);
                onRetry();
              }}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
          <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
            Retour
          </Button>
        </Box>
      ) : (
        <Box>
          <Stepper activeStep={activeStep} alternativeLabel>
            {deploymentSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              {deploymentSteps[activeStep]}...
            </Typography>
            {isDeploying && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleCancel}
                sx={{ mt: 2 }}
              >
                Annuler
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Deployment;
