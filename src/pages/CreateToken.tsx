import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokenDeploy } from '../hooks/useTokenDeploy';
import { toast } from 'react-hot-toast';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import { CostEstimator } from '../components/features/token/estimation/CostEstimator';
import { TokenSimulator } from '../components/features/token/simulation/TokenSimulator';
import { useWalletStatus } from '@/features/auth/hooks/useWalletStatus';
import { useTokenForgeAuth } from '@/features/auth/hooks/useTokenForgeAuth';

const steps = ['Configuration', 'Simulation', 'Déploiement'];

const CreateToken = () => {
  const navigate = useNavigate();
  const { deployToken, isDeploying, error, lastDeploymentResult, checkWalletStatus } = useTokenDeploy();
  const { isConnected } = useWalletStatus();
  const { connectWallet } = useTokenForgeAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    initialSupply: '',
    decimals: '18',
    isMintable: false,
    isBurnable: false,
    isPausable: false,
    hasPermit: false,
    hasVotes: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Valider le formulaire à chaque changement
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Le nom du token est obligatoire";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = "Le nom doit contenir au moins 3 caractères";
      isValid = false;
    }

    if (!formData.symbol.trim()) {
      errors.symbol = "Le symbole est obligatoire";
      isValid = false;
    } else if (formData.symbol.trim().length < 2 || formData.symbol.trim().length > 6) {
      errors.symbol = "Le symbole doit contenir entre 2 et 6 caractères";
      isValid = false;
    }

    if (!formData.initialSupply) {
      errors.initialSupply = "La quantité initiale est obligatoire";
      isValid = false;
    } else if (parseFloat(formData.initialSupply) <= 0) {
      errors.initialSupply = "La quantité initiale doit être supérieure à 0";
      isValid = false;
    }

    const decimals = parseInt(formData.decimals);
    if (isNaN(decimals) || decimals < 0 || decimals > 18) {
      errors.decimals = "Les décimales doivent être comprises entre 0 et 18";
      isValid = false;
    }

    setFormErrors(errors);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Vérifier si l'utilisateur est connecté
      const isWalletReady = await checkWalletStatus();
      
      if (!isWalletReady && !isConnected) {
        toast.error('Veuillez connecter votre wallet pour déployer un token');
        return;
      }
      
      // Validation finale
      if (!validateForm()) {
        toast.error('Veuillez corriger les erreurs du formulaire');
        return;
      }

      const result = await deployToken({
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        initialSupply: formData.initialSupply,
        decimals: parseInt(formData.decimals),
        isMintable: formData.isMintable,
        isBurnable: formData.isBurnable
      });

      if (result.success) {
        toast.success('Token déployé avec succès !');
        // Attendre un peu avant de rediriger
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              deploymentSuccess: true,
              tokenAddress: result.contractAddress,
              transactionHash: result.hash
            } 
          });
        }, 2000);
      } else {
        toast.error(`Erreur: ${result.error || 'Échec du déploiement'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="name"
                  label="Nom du Token"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name || "Choisissez un nom mémorable pour votre token"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="symbol"
                  label="Symbole"
                  value={formData.symbol}
                  onChange={handleChange}
                  error={!!formErrors.symbol}
                  helperText={formErrors.symbol || "Ex: BTC, ETH (2-6 caractères)"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="initialSupply"
                  label="Supply Initial"
                  type="number"
                  value={formData.initialSupply}
                  onChange={handleChange}
                  error={!!formErrors.initialSupply}
                  helperText={formErrors.initialSupply || "Quantité totale de tokens à créer"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="decimals"
                  label="Décimales"
                  type="number"
                  value={formData.decimals}
                  onChange={handleChange}
                  error={!!formErrors.decimals}
                  helperText={formErrors.decimals || "Standard: 18 (comme ETH)"}
                  inputProps={{ min: 0, max: 18 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Fonctionnalités avancées</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isMintable"
                      checked={formData.isMintable}
                      onChange={handleChange}
                    />
                  }
                  label="Mintable (création de nouveaux tokens)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isBurnable"
                      checked={formData.isBurnable}
                      onChange={handleChange}
                    />
                  }
                  label="Burnable (destruction de tokens)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isPausable"
                      checked={formData.isPausable}
                      onChange={handleChange}
                    />
                  }
                  label="Pausable (possibilité de geler les transferts)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="hasPermit"
                      checked={formData.hasPermit}
                      onChange={handleChange}
                    />
                  }
                  label="Permit (approbation sans gas)"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="hasVotes"
                      checked={formData.hasVotes}
                      onChange={handleChange}
                    />
                  }
                  label="Votes (gouvernance)"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <CostEstimator
                tokenParams={{
                  name: formData.name,
                  symbol: formData.symbol,
                  decimals: parseInt(formData.decimals) || 18,
                  totalSupply: formData.initialSupply || "0",
                }}
              />
            </Box>
          </Box>
        );
      case 1:
        return (
          <TokenSimulator
            tokenParams={{
              name: formData.name,
              symbol: formData.symbol,
              decimals: parseInt(formData.decimals) || 18,
              totalSupply: formData.initialSupply || "0",
            }}
          />
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prêt pour le déploiement
            </Typography>
            <Typography color="text.secondary" paragraph>
              Vérifiez les détails ci-dessous avant de procéder au déploiement.
            </Typography>
            
            <Paper sx={{ p: 3, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Nom du Token:</Typography>
                  <Typography variant="body1">{formData.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Symbole:</Typography>
                  <Typography variant="body1">{formData.symbol.toUpperCase()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Supply Initial:</Typography>
                  <Typography variant="body1">{formData.initialSupply}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Décimales:</Typography>
                  <Typography variant="body1">{formData.decimals}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Fonctionnalités:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.isMintable && <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>Mintable</Box>}
                    {formData.isBurnable && <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>Burnable</Box>}
                    {formData.isPausable && <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>Pausable</Box>}
                    {formData.hasPermit && <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>Permit</Box>}
                    {formData.hasVotes && <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>Votes</Box>}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            {!isConnected && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                <AlertTitle>Wallet non connecté</AlertTitle>
                Vous devez connecter votre wallet pour déployer votre token.
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={connectWallet} 
                  sx={{ ml: 2, mt: 1 }}
                >
                  Connecter Wallet
                </Button>
              </Alert>
            )}
            
            {lastDeploymentResult && (
              <Alert 
                severity={lastDeploymentResult.success ? "success" : "error"} 
                sx={{ mt: 3 }}
              >
                <AlertTitle>
                  {lastDeploymentResult.success ? "Déploiement réussi!" : "Échec du déploiement"}
                </AlertTitle>
                {lastDeploymentResult.success ? (
                  <>
                    <Typography variant="body2">
                      Adresse du contrat: <strong>{lastDeploymentResult.contractAddress}</strong>
                    </Typography>
                    {lastDeploymentResult.hash && (
                      <Typography variant="body2">
                        Transaction: <strong>{lastDeploymentResult.hash.substring(0, 10)}...{lastDeploymentResult.hash.substring(lastDeploymentResult.hash.length - 6)}</strong>
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2">
                    {lastDeploymentResult.error || "Une erreur s'est produite lors du déploiement"}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Créer un Token
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Retour
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isDeploying || !isFormValid}
              startIcon={isDeploying ? <CircularProgress size={20} /> : null}
            >
              {isDeploying ? 'Déploiement...' : 'Déployer'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 0 && !isFormValid}
            >
              Suivant
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateToken;
