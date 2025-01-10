import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import { TokenType } from '../types/tokens';
import { BasicTokenForm } from '../components/CreateTokenForm/BasicTokenForm';
import { AdvancedTokenForm } from '../components/CreateTokenForm/AdvancedTokenForm';

const tokenTypes: TokenType[] = [
  {
    id: 'erc20',
    name: 'ERC20 Token',
    description: 'Standard fungible token, perfect for cryptocurrencies and utility tokens',
    difficulty: 'Beginner',
  },
  {
    id: 'erc721',
    name: 'ERC721 NFT',
    description: 'Non-fungible tokens for unique digital assets',
    difficulty: 'Intermediate',
  },
  {
    id: 'erc1155',
    name: 'ERC1155 Multi Token',
    description: 'Multiple token types in a single contract',
    difficulty: 'Advanced',
  },
  {
    id: 'erc777',
    name: 'ERC777 Advanced Token',
    description: 'Enhanced token standard with hooks and improved usability',
    difficulty: 'Advanced',
  },
  {
    id: 'erc4626',
    name: 'ERC4626 Tokenized Vault',
    description: 'Standard for tokenized yield-bearing vaults',
    difficulty: 'Expert',
  },
];

const steps = ['Select Token Type', 'Configure Token', 'Review & Deploy'];

export const CreateToken = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState<TokenType | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            {tokenTypes.map((type) => (
              <Grid item xs={12} sm={6} md={4} key={type.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                    border: selectedType?.id === type.id ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                  onClick={() => setSelectedType(type)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {type.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {type.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: (theme) =>
                          type.difficulty === 'Beginner'
                            ? theme.palette.success.main
                            : type.difficulty === 'Intermediate'
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                      }}
                    >
                      {type.difficulty} Level
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      case 1:
        return isAdvancedMode ? (
          <AdvancedTokenForm tokenType={selectedType!} />
        ) : (
          <BasicTokenForm tokenType={selectedType!} />
        );
      case 2:
        return <div>Review & Deploy</div>;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Your Token
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 1 && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              color="primary"
            >
              Switch to {isAdvancedMode ? 'Basic' : 'Advanced'} Mode
            </Button>
          </Box>
        )}

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && !selectedType}
          >
            {activeStep === steps.length - 1 ? 'Deploy' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
