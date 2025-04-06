import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";

interface TokenCreationProps {
  onComplete?: (tokenAddress: string) => void;
}

export const TokenCreation: React.FC<TokenCreationProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = [
    "Configuration de base",
    "Configuration avancée",
    "Aperçu du contrat",
    "Déploiement",
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Simulate token creation completion
      onComplete?.("0x1234567890123456789012345678901234567890");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Création de Token
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, mb: 2 }}>
          {activeStep === 0 && (
            <Typography>
              Configurez les paramètres de base de votre token comme le nom, le
              symbole et l&apos;offre totale.
            </Typography>
          )}

          {activeStep === 1 && (
            <Typography>
              Configurez les paramètres avancés comme les taxes, les limites de
              transaction et les adresses de réception.
            </Typography>
          )}

          {activeStep === 2 && (
            <Typography>
              Vérifiez le code du contrat avant le déploiement.
            </Typography>
          )}

          {activeStep === 3 && (
            <Typography>Déployez votre token sur la blockchain.</Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Retour
          </Button>

          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1 ? "Terminer" : "Suivant"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
