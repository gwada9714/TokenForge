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
import { useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TokenForgeFactoryABI } from '../../abi/TokenForgeFactory';
import { TOKEN_FORGE_ADDRESS } from '../../constants/addresses';
import { AlertRule } from '../../types/contracts';

export const AlertsManagement: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const { contract } = useTokenForgeAdmin();
  const { writeContract } = useWriteContract();
  const { waitForTransactionReceipt } = useWaitForTransactionReceipt();
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  // Lecture des règles
  const { data: rules, refetch: refetchRules } = useContractRead({
    address: TOKEN_FORGE_ADDRESS,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'getAlertRules',
    watch: true,
  }) as { data: AlertRule[] | undefined, refetch: () => void };

  // Attente des transactions
  useEffect(() => {
    if (pendingTx) {
      waitForTransactionReceipt({ hash: pendingTx })
        .then(() => {
          refetchRules();
          setPendingTx(undefined);
        })
        .catch((error) => {
          console.error('Error waiting for transaction receipt:', error);
        });
    }
  }, [pendingTx, refetchRules, waitForTransactionReceipt]);

  // Mise à jour des règles quand les données changent
  useEffect(() => {
    if (rules) {
      setAlertRules(rules);
      monitor.info('AlertsManagement', 'Alert rules updated', { count: rules.length });
    }
  }, [rules]);

  const handleAddRule = useCallback(async () => {
    if (!newRuleName || !newRuleCondition || !contract) return;

    try {
      setIsLoading(true);
      monitor.info('AlertsManagement', 'Adding new alert rule', { name: newRuleName });
      
      const { hash } = await writeContract({
        ...contract,
        functionName: 'addAlertRule',
        args: [newRuleName, newRuleCondition],
      });
      
      setPendingTx(hash);
      setNewRuleName('');
      setNewRuleCondition('');
      
      monitor.info('AlertsManagement', 'Alert rule addition initiated');
    } catch (error) {
      monitor.error('AlertsManagement', 'Error adding alert rule', { error, rule: { name: newRuleName, condition: newRuleCondition } });
      console.error('Erreur lors de l\'ajout de la règle:', error);
    } finally {
      setIsLoading(false);
    }
  }, [newRuleName, newRuleCondition, contract]);

  const handleToggleRule = useCallback(async (id: number) => {
    if (!contract) return;

    try {
      setIsLoading(true);
      monitor.info('AlertsManagement', 'Toggling alert rule', { id: id.toString() });
      
      const { hash } = await writeContract({
        ...contract,
        functionName: 'toggleAlertRule',
        args: [BigInt(id)],
      });
      
      setPendingTx(hash);
      monitor.info('AlertsManagement', 'Alert rule toggle initiated', { id: id.toString() });
    } catch (error) {
      monitor.error('AlertsManagement', 'Error toggling alert rule', { error, id: id.toString() });
      console.error('Erreur lors de la modification de la règle:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  const handleDeleteRule = useCallback(async (id: number) => {
    if (!contract) return;

    try {
      setIsLoading(true);
      monitor.info('AlertsManagement', 'Deleting alert rule', { id: id.toString() });
      
      const { hash } = await writeContract({
        ...contract,
        functionName: 'deleteAlertRule',
        args: [BigInt(id)],
      });
      
      setPendingTx(hash);
      monitor.info('AlertsManagement', 'Alert rule deletion initiated', { id: id.toString() });
    } catch (error) {
      monitor.error('AlertsManagement', 'Error deleting alert rule', { error, id: id.toString() });
      console.error('Erreur lors de la suppression de la règle:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

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
                  onChange={() => handleToggleRule(index)}
                  checked={rule.enabled}
                  disabled={isActionDisabled}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteRule(index)}
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
