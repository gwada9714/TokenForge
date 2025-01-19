import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { monitor } from '../../utils/monitoring';
import { useContractRead, useWriteContract } from 'wagmi';
import { TokenForgeFactoryABI } from '../../abi/TokenForgeFactory';
import { TOKEN_FORGE_ADDRESS } from '../../constants/addresses';
import { AlertRule } from '../../types/contracts';

export const AlertsManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const { contract } = useTokenForgeAdmin();
  const { writeContractAsync } = useWriteContract();
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Lecture des règles
  const { data: rules, refetch: refetchRules } = useContractRead({
    address: TOKEN_FORGE_ADDRESS,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'getAlertRules',
    query: {
      enabled: true,
    }
  });

  // Mise à jour des règles quand les données changent
  useEffect(() => {
    if (rules) {
      setAlertRules(rules);
    }
  }, [rules]);

  // Ajout d'une règle
  const handleAddRule = async () => {
    if (!contract || !newRuleName || !newRuleCondition) return;

    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        abi: TokenForgeFactoryABI.abi,
        address: TOKEN_FORGE_ADDRESS,
        functionName: 'addAlertRule',
        args: [newRuleName, newRuleCondition],
      });
      
      setPendingTx(hash);
      await refetchRules();
      setNewRuleName('');
      setNewRuleCondition('');
    } catch (error) {
      console.error('Error adding rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Basculement d'une règle
  const handleToggleRule = async (ruleId: number) => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        abi: TokenForgeFactoryABI.abi,
        address: TOKEN_FORGE_ADDRESS,
        functionName: 'toggleAlertRule',
        args: [ruleId],
      });
      
      setPendingTx(hash);
      await refetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression d'une règle
  const handleDeleteRule = async (ruleId: number) => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        abi: TokenForgeFactoryABI.abi,
        address: TOKEN_FORGE_ADDRESS,
        functionName: 'deleteAlertRule',
        args: [ruleId],
      });
      
      setPendingTx(hash);
      await refetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActionDisabled = isLoading;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestion des Alertes
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Nom de la règle"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isActionDisabled}
          />
          <TextField
            label="Condition"
            value={newRuleCondition}
            onChange={(e) => setNewRuleCondition(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isActionDisabled}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={isActionDisabled ? <CircularProgress size={20} /> : <AddIcon />}
            onClick={handleAddRule}
            disabled={!newRuleName || !newRuleCondition || isActionDisabled}
            sx={{ mt: 1 }}
          >
            Ajouter une règle
          </Button>
        </Box>

        <List>
          {alertRules.map((rule, index) => (
            <ListItem key={rule.id.toString()}>
              <ListItemText
                primary={rule.name}
                secondary={rule.condition}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={() => handleToggleRule(rule.id)}
                  checked={rule.enabled}
                  disabled={isActionDisabled}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteRule(rule.id)}
                  disabled={isActionDisabled}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AlertsManagement;
