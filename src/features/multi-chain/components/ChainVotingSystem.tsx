import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
// import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { useAuth } from '@/hooks/useAuth';

interface ChainVote {
  id: string;
  name: string;
  description: string;
  logo: string;
  votes: number;
  status: 'proposed' | 'in-progress' | 'completed' | 'rejected';
  estimatedCompletion?: string;
}

export const ChainVotingSystem: React.FC = () => {
  const { user } = useAuth();
  const [chains, setChains] = useState<ChainVote[]>([
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      description: 'Solution de scaling Layer 2 pour Ethereum avec des frais réduits et une sécurité élevée.',
      logo: '/assets/images/chains/arbitrum.svg',
      votes: 156,
      status: 'in-progress',
      estimatedCompletion: 'Q2 2025'
    },
    {
      id: 'optimism',
      name: 'Optimism',
      description: 'Layer 2 Ethereum utilisant des Optimistic Rollups pour des transactions rapides et économiques.',
      logo: '/assets/images/chains/optimism.svg',
      votes: 124,
      status: 'proposed'
    },
    {
      id: 'base',
      name: 'Base',
      description: 'Layer 2 développé par Coinbase, offrant une expérience utilisateur simplifiée.',
      logo: '/assets/images/chains/base.svg',
      votes: 98,
      status: 'proposed'
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      description: 'Plateforme blockchain rapide et économe en énergie avec une finalité quasi instantanée.',
      logo: '/assets/images/chains/avalanche.svg',
      votes: 87,
      status: 'completed'
    },
    {
      id: 'fantom',
      name: 'Fantom',
      description: 'Plateforme de contrats intelligents avec des transactions rapides et des frais minimes.',
      logo: '/assets/images/chains/fantom.svg',
      votes: 65,
      status: 'proposed'
    }
  ]);
  
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [openProposalDialog, setOpenProposalDialog] = useState(false);
  const [newChainProposal, setNewChainProposal] = useState({
    name: '',
    description: ''
  });
  const [votingEnabled] = useState(true);
  const [remainingVotes, setRemainingVotes] = useState(3);
  
  // Simuler le chargement des votes de l'utilisateur
  useEffect(() => {
    if (user) {
      // Dans une implémentation réelle, ces données viendraient d'une base de données
      setUserVotes({
        'arbitrum': true,
        'optimism': false,
        'base': false,
        'avalanche': false,
        'fantom': false
      });
      
      // Calculer les votes restants
      const usedVotes = Object.values(userVotes).filter(voted => voted).length;
      setRemainingVotes(3 - usedVotes);
    }
  }, [user]);
  
  const handleVote = (chainId: string) => {
    if (!votingEnabled || remainingVotes <= 0 && !userVotes[chainId]) {
      return;
    }
    
    const newUserVotes = { ...userVotes };
    const voted = !newUserVotes[chainId];
    newUserVotes[chainId] = voted;
    
    setUserVotes(newUserVotes);
    
    // Mettre à jour le nombre de votes pour la chaîne
    setChains(chains.map(chain => {
      if (chain.id === chainId) {
        return {
          ...chain,
          votes: chain.votes + (voted ? 1 : -1)
        };
      }
      return chain;
    }));
    
    // Mettre à jour les votes restants
    const usedVotes = Object.values(newUserVotes).filter(v => v).length;
    setRemainingVotes(3 - usedVotes);
  };
  
  const handleOpenProposalDialog = () => {
    setOpenProposalDialog(true);
  };
  
  const handleCloseProposalDialog = () => {
    setOpenProposalDialog(false);
  };
  
  const handleProposalChange = (field: 'name' | 'description') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewChainProposal({
      ...newChainProposal,
      [field]: event.target.value
    });
  };
  
  const handleSubmitProposal = () => {
    // Validation simple
    if (!newChainProposal.name || !newChainProposal.description) {
      return;
    }
    
    // Créer un nouvel ID basé sur le nom
    const id = newChainProposal.name.toLowerCase().replace(/\s+/g, '-');
    
    // Ajouter la nouvelle proposition
    const newChain: ChainVote = {
      id,
      name: newChainProposal.name,
      description: newChainProposal.description,
      logo: '/assets/images/chains/default.svg', // Logo par défaut
      votes: 1, // L'utilisateur qui propose vote automatiquement
      status: 'proposed'
    };
    
    setChains([...chains, newChain]);
    
    // Ajouter le vote de l'utilisateur
    setUserVotes({
      ...userVotes,
      [id]: true
    });
    
    // Mettre à jour les votes restants
    setRemainingVotes(remainingVotes - 1);
    
    // Réinitialiser et fermer le dialogue
    setNewChainProposal({ name: '', description: '' });
    setOpenProposalDialog(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'default';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'Proposé';
      case 'in-progress':
        return 'En cours';
      case 'completed':
        return 'Complété';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };
  
  // Trier les chaînes par nombre de votes (décroissant)
  const sortedChains = [...chains].sort((a, b) => b.votes - a.votes);
  
  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Système de Vote Communautaire
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Votez pour les prochaines blockchains à intégrer à TokenForge
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenProposalDialog}
            disabled={!user || remainingVotes <= 0}
          >
            Proposer une Blockchain
          </Button>
        </Box>
      </Box>
      
      {user && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Vous avez <strong>{remainingVotes}</strong> votes restants. Utilisez-les judicieusement!
        </Alert>
      )}
      
      {!user && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Connectez-vous pour voter et proposer de nouvelles blockchains.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {sortedChains.map((chain) => {
          const totalVotes = chains.reduce((sum, c) => sum + c.votes, 0);
          const votePercentage = totalVotes > 0 ? (chain.votes / totalVotes) * 100 : 0;
          const isVoted = userVotes[chain.id];
          const isCompleted = chain.status === 'completed';
          
          return (
            <Grid item xs={12} md={6} key={chain.id}>
              <Card 
                sx={{ 
                  position: 'relative',
                  border: isVoted ? '1px solid' : 'none',
                  borderColor: 'primary.main'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      component="img"
                      src={chain.logo}
                      alt={chain.name}
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        borderRadius: '50%',
                        background: '#f5f5f5',
                        p: 1
                      }}
                      onError={(e: any) => {
                        e.target.src = '/assets/images/chains/default.svg';
                      }}
                    />
                    <Typography variant="h6">{chain.name}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip 
                      label={getStatusLabel(chain.status)} 
                      color={getStatusColor(chain.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {chain.description}
                  </Typography>
                  
                  {chain.estimatedCompletion && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Achèvement estimé:</strong> {chain.estimatedCompletion}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {chain.votes} votes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({votePercentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={votePercentage} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    startIcon={<HowToVoteIcon />}
                    variant={isVoted ? "contained" : "outlined"}
                    color={isVoted ? "primary" : "inherit"}
                    onClick={() => handleVote(chain.id)}
                    disabled={!user || isCompleted || (!isVoted && remainingVotes <= 0)}
                    fullWidth
                  >
                    {isVoted ? 'Voté' : 'Voter'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      <Dialog open={openProposalDialog} onClose={handleCloseProposalDialog}>
        <DialogTitle>Proposer une nouvelle blockchain</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Proposez une blockchain que vous aimeriez voir intégrée à TokenForge. 
            Votre proposition sera soumise au vote de la communauté.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la blockchain"
            fullWidth
            variant="outlined"
            value={newChainProposal.name}
            onChange={handleProposalChange('name')}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newChainProposal.description}
            onChange={handleProposalChange('description')}
            sx={{ mt: 2 }}
            helperText="Décrivez brièvement la blockchain et pourquoi elle devrait être intégrée"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProposalDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmitProposal}
            variant="contained"
            disabled={!newChainProposal.name || !newChainProposal.description}
          >
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
