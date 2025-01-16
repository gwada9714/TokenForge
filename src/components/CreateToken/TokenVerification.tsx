import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Stack,
  Chip
} from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';
import { useTokenCreation } from '@/store/hooks';
import { TaxConfig } from '@/types/tokenFeatures';
import { isAddress } from '@ethersproject/address';

interface ValidationResult {
  isValid: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning';
}

export const TokenVerification: React.FC = () => {
  const { tokenConfig } = useTokenCreation();

  const validateTaxConfig = (taxConfig: TaxConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];

    if (taxConfig.enabled) {
      // Vérification des taux
      const totalTax = taxConfig.buyTax + taxConfig.sellTax + taxConfig.transferTax;
      if (totalTax > 25) {
        results.push({
          isValid: false,
          message: 'La somme des taxes ne doit pas dépasser 25%',
          severity: 'error'
        });
      }

      // Vérification de la distribution
      const totalDistribution = 
        taxConfig.forgeShare + 
        taxConfig.redistributionShare + 
        taxConfig.liquidityShare + 
        taxConfig.burnShare;
        
      if (totalDistribution !== 100) {
        results.push({
          isValid: false,
          message: 'La distribution des taxes doit totaliser 100%',
          severity: 'error'
        });
      }

      // Vérification de l'adresse du bénéficiaire
      if (!isAddress(taxConfig.recipient)) {
        results.push({
          isValid: false,
          message: 'Adresse du bénéficiaire invalide',
          severity: 'error'
        });
      }
    }

    if (results.length === 0) {
      results.push({
        isValid: true,
        message: 'Configuration des taxes valide',
        severity: 'success'
      });
    }

    return results;
  };

  const validateTokenConfig = (): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Vérification du nom
    if (!tokenConfig.name || tokenConfig.name.length < 3) {
      results.push({
        isValid: false,
        message: 'Le nom du token doit faire au moins 3 caractères',
        severity: 'error'
      });
    }

    // Vérification du symbole
    if (!tokenConfig.symbol || tokenConfig.symbol.length < 2) {
      results.push({
        isValid: false,
        message: 'Le symbole du token doit faire au moins 2 caractères',
        severity: 'error'
      });
    }

    // Vérification de la supply
    if (!tokenConfig.supply || Number(tokenConfig.supply) <= 0) {
      results.push({
        isValid: false,
        message: 'La supply initiale doit être supérieure à 0',
        severity: 'error'
      });
    }

    // Vérification du réseau
    if (!tokenConfig.network) {
      results.push({
        isValid: false,
        message: 'Veuillez sélectionner un réseau',
        severity: 'error'
      });
    }

    // Vérification de la taxe
    if (tokenConfig.taxConfig) {
      results.push(...validateTaxConfig(tokenConfig.taxConfig));
    }

    return results;
  };

  const validationResults = validateTokenConfig();
  const hasErrors = validationResults.some(result => result.severity === 'error');
  const hasWarnings = validationResults.some(result => result.severity === 'warning');

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6" gutterBottom>
            Vérification du Token
            <Chip 
              label={hasErrors ? 'Invalide' : hasWarnings ? 'Avertissements' : 'Valide'} 
              color={hasErrors ? 'error' : hasWarnings ? 'warning' : 'success'}
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>

          {hasErrors && (
            <Alert severity="error">
              <AlertTitle>Erreurs détectées</AlertTitle>
              Veuillez corriger les erreurs avant de déployer le token
            </Alert>
          )}

          <List>
            {validationResults.map((result, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {result.severity === 'success' && <CheckCircle color="success" />}
                  {result.severity === 'error' && <Error color="error" />}
                  {result.severity === 'warning' && <Warning color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary={result.message}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
};
