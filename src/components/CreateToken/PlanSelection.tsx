import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Paper,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FaHammer, FaGem, FaCrown } from 'react-icons/fa';
import { PlanSelectionProps } from '@/types/components';
import { TokenConfig } from '@/types/token';

const plans = [
  {
    name: 'Apprenti Forgeron',
    price: 'Gratuit',
    icon: FaHammer,
    features: [
      'Création de token simple sur testnet',
      'Fonctionnalités très limitées',
      'Code non audité',
    ],
    buttonText: 'Commencer',
    value: 'apprentice',
  },
  {
    name: 'Forgeron',
    price: '0.3 BNB',
    icon: FaGem,
    features: [
      'Création de token sur mainnet',
      'Fonctionnalités de base',
      'Option de taxe de la forge',
      'Audit de sécurité en option',
      'Support standard',
    ],
    buttonText: 'Choisir ce Plan',
    value: 'smith',
    isPopular: true,
  },
  {
    name: 'Maître Forgeron',
    price: '0.5 BNB',
    icon: FaCrown,
    features: [
      'Toutes les fonctionnalités disponibles',
      'Audit de sécurité inclus',
      'Support prioritaire',
      'Accès aux fonctionnalités avancées',
      'Personnalisation complète',
      'Listing prioritaire',
    ],
    buttonText: 'Devenir Maître',
    value: 'master',
  },
] as const;

const PlanSelection: React.FC<PlanSelectionProps> = React.memo(({ setTokenConfig }) => {
  const theme = useTheme();

  const handlePlanSelection = useCallback((planValue: string) => {
    setTokenConfig((prev: TokenConfig) => ({
      ...prev,
      plan: planValue,
    }));
  }, [setTokenConfig]);

  const planCards = useMemo(() => plans.map((plan) => {
    const Icon = plan.icon;
    return (
      <Grid item xs={12} sm={6} md={4} key={plan.value}>
        <Paper
          elevation={plan.isPopular ? 8 : 1}
          sx={{
            p: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: theme.shadows[plan.isPopular ? 12 : 4],
            },
            ...(plan.isPopular && {
              border: `2px solid ${theme.palette.primary.main}`,
            }),
          }}
        >
          {plan.isPopular && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                px: 2,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              Populaire
            </Box>
          )}

          <Stack spacing={3} sx={{ height: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Icon size={40} color={theme.palette.primary.main} />
              <Typography variant="h5" component="h3" sx={{ mt: 2 }}>
                {plan.name}
              </Typography>
              <Typography variant="h4" component="p" sx={{ mt: 2, fontWeight: 'bold' }}>
                {plan.price}
              </Typography>
            </Box>

            <List sx={{ flexGrow: 1 }}>
              {plan.features.map((feature, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2">{feature}</Typography>
                </ListItem>
              ))}
            </List>

            <Button
              variant={plan.isPopular ? 'contained' : 'outlined'}
              color="primary"
              fullWidth
              onClick={() => handlePlanSelection(plan.value)}
              sx={{ mt: 'auto' }}
            >
              {plan.buttonText}
            </Button>
          </Stack>
        </Paper>
      </Grid>
    );
  }), [theme, handlePlanSelection]);

  return (
    <Box sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h2" 
        align="center"
        gutterBottom
        sx={{ mb: 4 }}
      >
        Choisissez votre Plan
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {planCards}
      </Grid>
    </Box>
  );
});

export default PlanSelection;
