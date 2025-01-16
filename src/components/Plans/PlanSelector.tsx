import React from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Badge,
  useTheme,
  Paper,
  Grid
} from '@mui/material';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { UserLevel, DEFAULT_PLANS } from '../../types/plans';
import { useUserPlan } from '../../contexts/UserPlanContext';

const PlanFeatureItem: React.FC<{ feature: string; isAvailable: boolean }> = ({
  feature,
  isAvailable,
}) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {isAvailable ? (
        <FaCheck color={theme.palette.success.main} />
      ) : (
        <FaTimes color={theme.palette.error.main} />
      )}
      <Typography>{feature}</Typography>
    </Stack>
  );
};

interface PlanCardProps {
  level: UserLevel;
  isCurrentPlan: boolean;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ level, isCurrentPlan, onSelect }) => {
  const plan = DEFAULT_PLANS[level];
  const theme = useTheme();

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 6,
        borderRadius: 2,
        border: isCurrentPlan ? `2px solid ${theme.palette.primary.main}` : 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {plan.name}
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            {plan.price.bnb === 0 ? 'Free' : `${plan.price.bnb} BNB`}
            <Typography component="span" variant="h6" color="text.secondary">
              {' '}
              ou {plan.price.tkn} TKN
            </Typography>
          </Typography>
          {isCurrentPlan && (
            <Badge color="primary" sx={{ mt: 2 }}>
              Plan Actuel
            </Badge>
          )}
        </Box>

        <Stack spacing={2}>
          <Typography fontWeight="bold" mb={2}>
            Fonctionnalités incluses :
          </Typography>
          <PlanFeatureItem
            feature="Déploiement Mainnet"
            isAvailable={plan.features.canDeployMainnet}
          />
          <PlanFeatureItem
            feature="Taxes Personnalisées"
            isAvailable={plan.features.tokenFeatures.customTax}
          />
          <PlanFeatureItem
            feature="Audit de Sécurité"
            isAvailable={plan.features.tokenFeatures.audit}
          />
          <PlanFeatureItem
            feature="Support Prioritaire"
            isAvailable={plan.features.prioritySupport}
          />
        </Stack>

        <Button
          variant={isCurrentPlan ? "outlined" : "contained"}
          color="primary"
          onClick={onSelect}
          disabled={isCurrentPlan}
          sx={{ mt: 'auto' }}
        >
          {isCurrentPlan ? 'Plan Actuel' : 'Sélectionner'}
        </Button>
      </Stack>
    </Paper>
  );
};

const PlanSelector: React.FC = () => {
  const { userLevel, upgradePlan } = useUserPlan();

  const handlePlanSelect = async (selectedLevel: UserLevel) => {
    try {
      await upgradePlan(selectedLevel, () => {
        // Callback after successful upgrade
        console.log('Plan upgraded successfully');
      });
    } catch (error) {
      console.error('Erreur lors de la mise à niveau du plan:', error);
    }
  };

  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Choisissez votre Plan
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 8 }}>
        Forgez votre token avec le plan qui correspond à vos besoins
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {Object.values(UserLevel).map((level) => (
          <Grid item xs={12} md={4} key={level}>
            <PlanCard
              level={level}
              isCurrentPlan={level === userLevel}
              onSelect={() => handlePlanSelect(level)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlanSelector;
