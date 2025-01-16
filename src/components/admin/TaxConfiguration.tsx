import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  Button,
  Alert,
  Grid,
  CircularProgress,
  Divider
} from '@mui/material';
import { useContractWrite, useContractRead, useNetwork } from 'wagmi';
import { parseEther, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, getContractAddress } from '@/config/contracts';
import TokenForgeTaxManagerABI from '@/abi/TokenForgeTaxManager.json';
import type { TokenForgeConfig } from '@/types/tokenforge';

export const TaxConfiguration: React.FC = () => {
  const { chain } = useNetwork();
  const [config, setConfig] = useState<TokenForgeConfig>({
    taxRate: 1,
    taxDistribution: {
      forge: 40,
      devFund: 20,
      buyback: 20,
      staking: 20
    },
    minTokenAmount: parseEther('100'),
    maxTokenAmount: parseEther('1000000')
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const taxManagerAddress = getContractAddress('TAX_MANAGER', chain?.id || 1);

  const { data: currentConfig, isLoading } = useContractRead({
    address: taxManagerAddress as `0x${string}`,
    abi: TokenForgeTaxManagerABI,
    functionName: 'getConfig',
    watch: true
  });

  const { writeAsync: updateConfig } = useContractWrite({
    address: taxManagerAddress as `0x${string}`,
    abi: TokenForgeTaxManagerABI,
    functionName: 'updateConfig'
  });

  useEffect(() => {
    if (currentConfig) {
      const [taxRate, distribution, min, max] = currentConfig as [number, number[], bigint, bigint];
      setConfig({
        taxRate: taxRate / 100, // Convert from basis points to percentage
        taxDistribution: {
          forge: distribution[0],
          devFund: distribution[1],
          buyback: distribution[2],
          staking: distribution[3]
        },
        minTokenAmount: min,
        maxTokenAmount: max
      });
    }
  }, [currentConfig]);

  const handleDistributionChange = (key: keyof typeof config.taxDistribution) => 
    (event: Event, newValue: number | number[]) => {
      const value = newValue as number;
      const total = Object.entries(config.taxDistribution)
        .reduce((sum, [k, v]) => sum + (k === key ? value : v), 0);

      if (total <= 100) {
        setConfig(prev => ({
          ...prev,
          taxDistribution: {
            ...prev.taxDistribution,
            [key]: value
          }
        }));
      }
    };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      // Vérifier que la distribution totalise 100%
      const total = Object.values(config.taxDistribution).reduce((sum, value) => sum + value, 0);
      if (total !== 100) {
        throw new Error('La distribution des taxes doit totaliser 100%');
      }

      const { hash } = await updateConfig({
        args: [
          Math.round(config.taxRate * 100), // Convert to basis points
          Object.values(config.taxDistribution),
          config.minTokenAmount,
          config.maxTokenAmount
        ]
      });

      setSuccess('Configuration mise à jour avec succès !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Configuration des Taxes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Taux de Taxe Global
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Taux actuel: {config.taxRate}%
                </Typography>
                <Slider
                  value={config.taxRate}
                  onChange={(e, value) => setConfig(prev => ({ ...prev, taxRate: value as number }))}
                  min={0}
                  max={5}
                  step={0.1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 1, label: '1%' },
                    { value: 2.5, label: '2.5%' },
                    { value: 5, label: '5%' }
                  ]}
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                Distribution des Taxes
              </Typography>
              {Object.entries(config.taxDistribution).map(([key, value]) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {value}%
                  </Typography>
                  <Slider
                    value={value}
                    onChange={handleDistributionChange(key as keyof typeof config.taxDistribution)}
                    min={0}
                    max={100}
                    step={5}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Limites des Tokens
              </Typography>
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Montant minimum (ETH)"
                  type="number"
                  value={formatEther(config.minTokenAmount)}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    minTokenAmount: parseEther(e.target.value || '0')
                  }))}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Montant maximum (ETH)"
                  type="number"
                  value={formatEther(config.maxTokenAmount)}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    maxTokenAmount: parseEther(e.target.value || '0')
                  }))}
                  fullWidth
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Résumé
              </Typography>
              <Typography variant="body2" paragraph>
                Taux de taxe: {config.taxRate}%
              </Typography>
              <Typography variant="body2" paragraph>
                Distribution totale: {Object.values(config.taxDistribution).reduce((a, b) => a + b, 0)}%
              </Typography>
              <Typography variant="body2" paragraph>
                Limites: {formatEther(config.minTokenAmount)} - {formatEther(config.maxTokenAmount)} ETH
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleSubmit}
                fullWidth
              >
                Mettre à jour la Configuration
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
