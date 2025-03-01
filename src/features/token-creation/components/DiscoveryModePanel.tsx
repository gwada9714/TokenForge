import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Divider,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { TokenConfig } from '../../../types/deployment';

interface TokenTemplate {
  id: string;
  name: string;
  description: string;
  config: TokenConfig;
  tags: string[];
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
}

interface DiscoveryModePanelProps {
  onSelectTemplate: (template: TokenConfig) => void;
}

export const DiscoveryModePanel: React.FC<DiscoveryModePanelProps> = ({
  onSelectTemplate
}) => {
  const tokenTemplates: TokenTemplate[] = [
    {
      id: 'basic-token',
      name: 'Token Standard',
      description: 'Un token ERC-20 simple avec les fonctionnalités de base. Idéal pour les débutants.',
      config: {
        name: 'Mon Token',
        symbol: 'MTK',
        decimals: 18,
        initialSupply: BigInt('1000000000000000000000000'), // 1 million tokens
        mintable: false,
        burnable: false,
        blacklist: false,
        customTaxPercentage: 0,
        antiWhale: {
          enabled: false,
          maxTransactionPercentage: 1,
          maxWalletPercentage: 3
        }
      },
      tags: ['simple', 'standard', 'erc20'],
      difficulty: 'débutant'
    },
    {
      id: 'community-token',
      name: 'Token Communautaire',
      description: 'Un token conçu pour les projets communautaires avec protection anti-whale et taxe de redistribution.',
      config: {
        name: 'Community Token',
        symbol: 'COMM',
        decimals: 18,
        initialSupply: BigInt('100000000000000000000000000'), // 100 million tokens
        mintable: false,
        burnable: true,
        blacklist: true,
        customTaxPercentage: 1.0,
        antiWhale: {
          enabled: true,
          maxTransactionPercentage: 1,
          maxWalletPercentage: 2
        }
      },
      tags: ['communauté', 'redistribution', 'anti-whale'],
      difficulty: 'intermédiaire'
    },
    {
      id: 'defi-token',
      name: 'Token DeFi',
      description: 'Un token optimisé pour les applications DeFi avec fonctionnalités de mint/burn pour les mécanismes de prêt et d\'emprunt.',
      config: {
        name: 'DeFi Token',
        symbol: 'DEFI',
        decimals: 18,
        initialSupply: BigInt('10000000000000000000000000'), // 10 million tokens
        mintable: true,
        burnable: true,
        blacklist: false,
        customTaxPercentage: 0,
        antiWhale: {
          enabled: false,
          maxTransactionPercentage: 5,
          maxWalletPercentage: 10
        }
      },
      tags: ['defi', 'finance', 'yield'],
      difficulty: 'avancé'
    }
  ];

  const handleSelectTemplate = (template: TokenTemplate) => {
    onSelectTemplate(template.config);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'débutant':
        return 'success';
      case 'intermédiaire':
        return 'warning';
      case 'avancé':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Mode Découverte</Typography>
        <Tooltip title="Explorez des modèles de tokens prédéfinis pour vous aider à démarrer rapidement. Sélectionnez un modèle pour pré-remplir le formulaire de configuration.">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Choisissez parmi nos modèles de tokens prédéfinis pour démarrer rapidement votre projet. 
        Chaque modèle peut être personnalisé selon vos besoins spécifiques.
      </Typography>

      <Grid container spacing={3}>
        {tokenTemplates.map((template) => (
          <Grid item xs={12} md={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Chip 
                    label={template.difficulty} 
                    size="small" 
                    color={getDifficultyColor(template.difficulty) as any}
                    sx={{ mr: 1 }}
                  />
                  {template.tags.slice(0, 2).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mr: 1 }} />
                  ))}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2">
                  <strong>Supply:</strong> {Number(template.config.initialSupply) / 10**18} tokens
                </Typography>
                <Typography variant="body2">
                  <strong>Fonctionnalités:</strong> {[
                    template.config.mintable ? 'Mintable' : null,
                    template.config.burnable ? 'Burnable' : null,
                    template.config.blacklist ? 'Blacklist' : null,
                    template.config.customTaxPercentage && template.config.customTaxPercentage > 0 ? 
                      `Taxe ${template.config.customTaxPercentage}%` : null,
                    template.config.antiWhale?.enabled ? 'Anti-Whale' : null
                  ].filter(Boolean).join(', ') || 'Standard'}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={() => handleSelectTemplate(template)}
                  fullWidth
                >
                  Utiliser ce modèle
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
