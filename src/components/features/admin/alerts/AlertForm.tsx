import React from 'react';
import { Box, TextField, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LoadingButton from '@mui/lab/LoadingButton';

interface AlertFormProps {
  newRuleName: string;
  newRuleCondition: string;
  onNameChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const AlertForm: React.FC<AlertFormProps> = ({
  newRuleName,
  newRuleCondition,
  onNameChange,
  onConditionChange,
  onSubmit,
  isLoading,
}) => {
  const isValid = newRuleName.trim() && newRuleCondition.trim();

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSubmit();
      }}
      noValidate
    >
      <TextField
        label="Nom de la règle"
        value={newRuleName}
        onChange={(e) => onNameChange(e.target.value)}
        size="small"
        required
        error={newRuleName.length > 50}
        helperText={newRuleName.length > 50 ? 'Le nom est trop long (max 50 caractères)' : ''}
        disabled={isLoading}
        sx={{ flex: 1 }}
      />
      <TextField
        label="Condition"
        value={newRuleCondition}
        onChange={(e) => onConditionChange(e.target.value)}
        size="small"
        required
        multiline
        maxRows={3}
        disabled={isLoading}
        sx={{ flex: 2 }}
      />
      <Tooltip title={!isValid ? 'Veuillez remplir tous les champs requis' : ''}>
        <span>
          <LoadingButton
            variant="contained"
            onClick={onSubmit}
            disabled={!isValid}
            loading={isLoading}
            loadingPosition="start"
            startIcon={<AddIcon />}
            sx={{ height: '40px', minWidth: '150px' }}
          >
            Ajouter
          </LoadingButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default AlertForm;
