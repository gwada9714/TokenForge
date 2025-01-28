import React, { useState } from 'react';
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
} from '@mui/material';
import { CostEstimator } from '../components/features/token/estimation/CostEstimator';
import { TokenSimulator } from '../components/features/token/simulation/TokenSimulator';

const steps = ['Configuration', 'Simulation', 'Déploiement'];

const CreateToken = () => {
  const navigate = useNavigate();
  const { deployToken, isDeploying } = useTokenDeploy();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation basique
      if (!formData.name || !formData.symbol || !formData.initialSupply) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }

      if (parseFloat(formData.initialSupply) <= 0) {
        toast.error('Le supply initial doit être supérieur à 0');
        return;
      }

      const features = [
        ...(formData.isMintable ? ['mintable'] : []),
        ...(formData.isBurnable ? ['burnable'] : []),
        ...(formData.isPausable ? ['pausable'] : []),
        ...(formData.hasPermit ? ['permit'] : []),
        ...(formData.hasVotes ? ['votes'] : []),
      ];

      const deployPromise = deployToken({
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        initialSupply: formData.initialSupply,
        decimals: parseInt(formData.decimals),
        features,
      });

      await toast.promise(deployPromise, {
        loading: 'Déploiement du token en cours...',
        success: 'Token déployé avec succès !',
        error: 'Erreur lors du déploiement du token',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error deploying token:', error);
      toast.error('Une erreur est survenue lors du déploiement');
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
                />
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
            
            <CostEstimator
              tokenParams={{
                name: formData.name,
                symbol: formData.symbol,
                decimals: parseInt(formData.decimals),
                totalSupply: formData.initialSupply,
                features: [
                  ...(formData.isMintable ? ['mintable'] : []),
                  ...(formData.isBurnable ? ['burnable'] : []),
                  ...(formData.isPausable ? ['pausable'] : []),
                  ...(formData.hasPermit ? ['permit'] : []),
                  ...(formData.hasVotes ? ['votes'] : []),
                ],
              }}
            />
          </Box>
        );
      case 1:
        return (
          <TokenSimulator
            tokenParams={{
              name: formData.name,
              symbol: formData.symbol,
              decimals: parseInt(formData.decimals),
              totalSupply: formData.initialSupply,
              features: [
                ...(formData.isMintable ? ['mintable'] : []),
                ...(formData.isBurnable ? ['burnable'] : []),
                ...(formData.isPausable ? ['pausable'] : []),
                ...(formData.hasPermit ? ['permit'] : []),
                ...(formData.hasVotes ? ['votes'] : []),
              ],
            }}
          />
        );
      case 2:
        return (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Prêt pour le déploiement
            </Typography>
            <Typography color="text.secondary">
              Vérifiez les détails ci-dessus avant de procéder au déploiement.
            </Typography>
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
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
              disabled={isDeploying}
              startIcon={isDeploying && <CircularProgress size={20} />}
            >
              {isDeploying ? 'Déploiement...' : 'Déployer'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
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
