import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { useWalletClient, usePublicClient } from 'wagmi';
import { TokenBaseConfig, TokenAdvancedConfig, DeploymentStatus } from '../types/tokens';
import { BasicTokenForm } from '../components/CreateTokenForm/BasicTokenForm';
import { AdvancedTokenForm } from '../components/CreateTokenForm/AdvancedTokenForm';
import { TokenTypeSelector, TokenType } from '../components/CreateTokenForm/TokenTypeSelector';
import { ContractPreview } from '../components/CreateTokenForm/ContractPreview';
import { DeploymentStatus as DeploymentStatusComponent } from '../components/CreateTokenForm/DeploymentStatus';
import { deployToken } from '../services/contractDeployment';
import { TokenPreview } from '../components/TokenPreview/TokenPreview';
import { DeploymentCost } from '../components/DeploymentCost/DeploymentCost';

const steps = ['Select Token Type', 'Basic Configuration', 'Advanced Features', 'Review & Deploy'];

const initialBaseConfig: TokenBaseConfig = {
  name: '',
  symbol: '',
  decimals: 18,
  initialSupply: '0',
};

const initialAdvancedConfig: TokenAdvancedConfig = {
  burnable: false,
  mintable: false,
  pausable: false,
  upgradeable: false,
  transparent: false,
  uups: false,
  permit: false,
  votes: false,
  accessControl: 'none',
  baseURI: '',
  asset: '',
  maxSupply: '',
  depositLimit: '',
};

export const CreateToken: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tokenType, setTokenType] = useState<TokenType>('ERC20');
  const [baseConfig, setBaseConfig] = useState<TokenBaseConfig>(initialBaseConfig);
  const [advancedConfig, setAdvancedConfig] = useState<TokenAdvancedConfig>(initialAdvancedConfig);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleDeploy = async () => {
    if (!walletClient || !publicClient.chain) return;

    setIsDeploying(true);
    try {
      const txHash = await deployToken(
        tokenType,
        baseConfig,
        advancedConfig,
        walletClient,
        publicClient.chain.id
      );

      setDeploymentStatus({
        status: 'pending',
        confirmations: 0,
        txHash,
      });
    } catch (error) {
      setDeploymentStatus({
        status: 'failed',
        confirmations: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <TokenTypeSelector
            selectedType={tokenType}
            onTypeSelect={setTokenType}
          />
        );
      case 1:
        return (
          <BasicTokenForm
            config={baseConfig}
            onConfigChange={setBaseConfig}
          />
        );
      case 2:
        return (
          <AdvancedTokenForm
            config={advancedConfig}
            onConfigChange={setAdvancedConfig}
          />
        );
      case 3:
        return (
          <Box>
            <TokenPreview baseConfig={baseConfig} advancedConfig={advancedConfig} />
            <DeploymentCost baseConfig={baseConfig} advancedConfig={advancedConfig} />
            <ContractPreview
              tokenType={tokenType}
              baseConfig={baseConfig}
              advancedConfig={advancedConfig}
            />
            {deploymentStatus && (
              <DeploymentStatusComponent
                status={deploymentStatus}
                publicClient={publicClient}
              />
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, mb: 4 }}>{renderStepContent(activeStep)}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleDeploy}
            disabled={isDeploying || !walletClient}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Token'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};
