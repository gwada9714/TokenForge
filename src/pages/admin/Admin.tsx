import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import { useAccount } from 'wagmi';
import { PauseCircle, SwapHoriz } from '@mui/icons-material';
import { Tabs, Tab } from '@mui/material';
import TransferOwnershipModal from '../../components/Modals/TransferOwnershipModal';

const Admin: React.FC = () => {
  const { address } = useAccount();
  const { 
    isAdmin, 
    owner,
    paused,
    transferOwnership,
    pause,
    unpause,
    isPausing,
    isUnpausing,
    setNewOwnerAddress,
    error 
  } = useTokenForgeAdmin();
  const [activeTab, setActiveTab] = useState(0);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Affichage des erreurs
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Vérification des permissions admin
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Vous n&apos;avez pas les permissions d&apos;administrateur nécessaires pour accéder à cette page.
        </Typography>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePauseToggle = () => {
    if (paused) {
      unpause?.();
    } else {
      pause?.();
    }
  };

  const handleTransferOwnership = async (newAddress: string) => {
    if (!newAddress || !transferOwnership) {
      return;
    }
    
    try {
      setIsTransferring(true);
      await transferOwnership(newAddress);
      setIsTransferModalOpen(false);
    } catch (error) {
      console.error('Erreur lors du transfert:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs de navigation */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 3
        }}
      >
        <Tab label="VUE D'ENSEMBLE" />
        <Tab label="CONTRÔLES ADMIN" />
      </Tabs>

      {/* Vue d'ensemble */}
      {activeTab === 0 && (
        <Box sx={{ p: 2 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statut Administrateur
              </Typography>
              <Typography>
                Vous êtes connecté en tant qu&apos;administrateur avec l&apos;adresse : {address}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Contrôles Admin */}
      {activeTab === 1 && (
        <Box sx={{ p: 2 }}>
          {/* Contrôles du Contrat */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contrôles du Contrat
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {/* Temporairement masqué car la fonction n'existe pas dans le contrat
                <Button
                  variant="contained"
                  color={paused ? "primary" : "primary"}
                  onClick={handlePauseToggle}
                  disabled={isPausing || isUnpausing}
                  startIcon={<PauseCircle />}
                  sx={{ 
                    bgcolor: '#1a237e',
                    '&:hover': {
                      bgcolor: '#0d47a1'
                    }
                  }}
                >
                  Mettre en Pause / Reprendre
                </Button>
                */}
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setIsTransferModalOpen(true)}
                  startIcon={<SwapHoriz />}
                  sx={{
                    bgcolor: '#e65100',
                    '&:hover': {
                      bgcolor: '#ef6c00'
                    }
                  }}
                >
                  Transférer la Propriété
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Informations du Contrat */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du Contrat
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Adresse du Contrat
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Adresse de l&apos;Administrateur : {owner}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Modal de transfert de propriété */}
      <TransferOwnershipModal
        open={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={handleTransferOwnership}
        isLoading={isTransferring}
      />
    </Box>
  );
};

export default Admin;
