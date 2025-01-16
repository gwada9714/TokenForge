import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import { useGovernance, ProposalType } from '@/hooks/useGovernance';
import { GOVERNANCE_ADDRESS } from '@/constants/tokenforge';
import { formatValue } from '@/utils/web3Adapters';
import { useNetwork } from 'wagmi';

const ProposalTypeLabels = {
  [ProposalType.ADD_BLOCKCHAIN]: 'Ajouter une blockchain',
  [ProposalType.UI_COLOR_THEME]: 'Thème de couleur UI',
  [ProposalType.ADD_LANGUAGE]: 'Ajouter une langue',
};

const GovernanceDashboard: React.FC = () => {
  const { chain } = useNetwork();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProposalType, setNewProposalType] = useState<ProposalType>(ProposalType.ADD_BLOCKCHAIN);
  const [newProposalDescription, setNewProposalDescription] = useState('');

  // Utiliser l'adresse de gouvernance correspondant au réseau actuel
  const governanceAddress = chain?.id ? GOVERNANCE_ADDRESS[chain.id] : undefined;

  const {
    proposalCount,
    selectedProposal,
    setSelectedProposal,
    currentProposal,
    hasVoted,
    submitProposal,
    submitVote,
    isCreatingProposal,
    isVoting,
    refetchProposal,
  } = useGovernance({
    governanceAddress: governanceAddress!,
  });

  const handleCreateProposal = async () => {
    try {
      await submitProposal(newProposalType, newProposalDescription);
      setCreateDialogOpen(false);
      setNewProposalDescription('');
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const handleVote = async (support: boolean) => {
    if (selectedProposal === null) return;
    try {
      await submitVote(selectedProposal, support);
      await refetchProposal();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Générer la liste des propositions
  const proposalList = Array.from({ length: proposalCount }, (_, i) => i);

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Gouvernance Limitée</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
            >
              Nouvelle Proposition
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Propositions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Total: {proposalCount}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                La gouvernance est limitée aux décisions non critiques pour la plateforme
              </Alert>
              <List>
                {proposalList.map((id) => (
                  <ListItemButton
                    key={id}
                    selected={selectedProposal === id}
                    onClick={() => setSelectedProposal(id)}
                  >
                    <ListItemText primary={`Proposition #${id + 1}`} />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {currentProposal && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {ProposalTypeLabels[currentProposal.proposalType]}
                </Typography>
                <Box mb={2}>
                  <Chip
                    label={currentProposal.executed ? 'Exécutée' : 'En cours'}
                    color={currentProposal.executed ? 'success' : 'primary'}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" component="span">
                    Créée par: {currentProposal.creator}
                  </Typography>
                </Box>
                <Typography paragraph>{currentProposal.description}</Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>
                    Pour: {formatValue(currentProposal.forVotes)} TKN
                  </Typography>
                  <Typography>
                    Contre: {formatValue(currentProposal.againstVotes)} TKN
                  </Typography>
                </Box>
                {!currentProposal.executed && !hasVoted && (
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleVote(true)}
                      disabled={isVoting}
                    >
                      Voter Pour
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleVote(false)}
                      disabled={isVoting}
                    >
                      Voter Contre
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Nouvelle Proposition</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type de Proposition</InputLabel>
            <Select
              value={newProposalType}
              label="Type de Proposition"
              onChange={(e) => setNewProposalType(e.target.value as ProposalType)}
            >
              {Object.entries(ProposalTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={newProposalDescription}
            onChange={(e) => setNewProposalDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleCreateProposal}
            variant="contained"
            disabled={isCreatingProposal || !newProposalDescription.trim()}
          >
            {isCreatingProposal ? <CircularProgress size={24} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernanceDashboard;
