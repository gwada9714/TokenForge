import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import { useTaxCalculation } from '../../../core/hooks/useTaxCalculation';
import { isAddress } from '@ethersproject/address';

export const TaxConfigurationPanel: React.FC = () => {
  const {
    amount,
    taxConfig,
    taxCalculation,
    error,
    updateAmount,
    updateTaxConfig
  } = useTaxCalculation();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Configuration de la Taxe
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <TextField
            label="Montant de la Transaction"
            type="number"
            value={amount}
            onChange={(e) => updateAmount(Number(e.target.value))}
            fullWidth
          />

          <Divider />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Taxe de Base (0.5%)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Distribution automatique :
            </Typography>
            <ul>
              <li>60% TokenForge</li>
              <li>20% Développement</li>
              <li>15% Rachat et Burn</li>
              <li>5% Stakers</li>
            </ul>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Taxe Additionnelle (max 1.5%)
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={taxConfig.additionalTaxConfig.enabled}
                  onChange={(e) => updateTaxConfig({
                    additionalTaxConfig: {
                      ...taxConfig.additionalTaxConfig,
                      enabled: e.target.checked
                    }
                  })}
                />
              }
              label="Activer la taxe additionnelle"
            />

            {taxConfig.additionalTaxConfig.enabled && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Taux de Taxe Additionnelle (%)"
                  type="number"
                  value={taxConfig.additionalTax * 100}
                  onChange={(e) => updateTaxConfig({
                    additionalTax: Number(e.target.value) / 100
                  })}
                  inputProps={{
                    min: 0,
                    max: 1.5,
                    step: 0.1
                  }}
                  fullWidth
                />

                <TextField
                  label="Adresse du Bénéficiaire"
                  value={taxConfig.additionalTaxConfig.recipient}
                  onChange={(e) => updateTaxConfig({
                    additionalTaxConfig: {
                      ...taxConfig.additionalTaxConfig,
                      recipient: e.target.value
                    }
                  })}
                  error={!isAddress(taxConfig.additionalTaxConfig.recipient)}
                  helperText={!isAddress(taxConfig.additionalTaxConfig.recipient) ? 
                    "Adresse Ethereum invalide" : ""}
                  fullWidth
                />
              </Stack>
            )}
          </Box>

          {taxCalculation && (
            <>
              <Divider />
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Résumé des Taxes
                </Typography>
                
                <Typography variant="body2">
                  Taxe Totale: {(taxCalculation.totalTaxAmount).toFixed(4)}
                </Typography>
                
                <Typography variant="body2">
                  • Taxe de Base: {(taxCalculation.baseTaxAmount).toFixed(4)}
                </Typography>
                
                {taxCalculation.additionalTaxAmount > 0 && (
                  <Typography variant="body2">
                    • Taxe Additionnelle: {(taxCalculation.additionalTaxAmount).toFixed(4)}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
