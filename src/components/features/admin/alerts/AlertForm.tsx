import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AlertFormProps {
  newRuleName: string;
  newRuleCondition: string;
  onNameChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onSubmit: () => void;
}

export const AlertForm: React.FC<AlertFormProps> = ({
  newRuleName,
  newRuleCondition,
  onNameChange,
  onConditionChange,
  onSubmit,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        label="Nom de la règle"
        value={newRuleName}
        onChange={(e) => onNameChange(e.target.value)}
        size="small"
      />
      <TextField
        label="Condition"
        value={newRuleCondition}
        onChange={(e) => onConditionChange(e.target.value)}
        size="small"
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onSubmit}
        disabled={!newRuleName || !newRuleCondition}
      >
        Ajouter
      </Button>
    </Box>
  );
};

export default AlertForm;
