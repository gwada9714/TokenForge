import React, { memo, useCallback, useEffect } from 'react';
import { Box, Typography, Alert, Chip, Stack, Button, CircularProgress, Divider } from '@mui/material';
import { useTokenForgeAdmin } from '../../hooks/useTokenForgeAdmin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

// Composants memoizés pour éviter les re-renders inutiles
const StatusIcon = memo(({ isValid, hasError }: { isValid: boolean; hasError?: boolean }) => {
  if (isValid) return <CheckCircleIcon color="success" />;
  if (hasError) return <ErrorIcon color="error" />;
  return <WarningIcon color="warning" />;
});

const ContractStatus = memo(({ contractCheck }: { contractCheck: any }) => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      État du contrat :
    </Typography>
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatusIcon isValid={contractCheck.isValid} hasError={!!contractCheck.error} />
        <Typography>
          Contrat {contractCheck.isDeployed ? 'déployé' : 'non déployé'}
          {contractCheck.version && ` (version ${contractCheck.version})`}
        </Typography>
      </Box>
      {contractCheck.address && (
        <Typography variant="body2" color="textSecondary">
          Adresse : {contractCheck.address}
        </Typography>
      )}
      {contractCheck.error && (
        <Typography color="error" variant="body2">
          {contractCheck.error}
        </Typography>
      )}
    </Stack>
  </Box>
));

const NetworkStatus = memo(({ networkCheck }: { networkCheck: any }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <StatusIcon isValid={networkCheck.isCorrectNetwork} />
    <Typography>
      Connexion au réseau {networkCheck.requiredNetwork}
      {networkCheck.networkName && ` (actuellement sur ${networkCheck.networkName})`}
    </Typography>
  </Box>
));

const WalletStatus = memo(({ walletCheck }: { walletCheck: any }) => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <StatusIcon isValid={walletCheck.isConnected} />
      <Typography>
        Wallet connecté
      </Typography>
    </Box>
    {walletCheck.currentAddress && (
      <Typography variant="body2" color="textSecondary" sx={{ pl: 4 }}>
        {walletCheck.currentAddress}
      </Typography>
    )}
  </>
));

const AdminRights = memo(({ rights, lastActivity }: { rights: string[]; lastActivity: Date | null }) => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      Droits accordés :
    </Typography>
    <Stack direction="row" spacing={1}>
      {rights.map((right) => (
        <Chip 
          key={right}
          label={right}
          color="primary"
          variant="outlined"
        />
      ))}
    </Stack>
    {lastActivity && (
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Dernière vérification : {new Date(lastActivity).toLocaleString()}
      </Typography>
    )}
  </Box>
));

export const AdminCheck = memo(() => {
  const { 
    isOwner,
    isLoading,
    error,
    owner,
    checkAdminRights,
    adminRights,
    lastActivity,
    networkCheck,
    walletCheck,
    contractCheck,
    checkConfiguration,
    verifyContract
  } = useTokenForgeAdmin();

  const handleRetryCheck = useCallback(async () => {
    await verifyContract();
    await checkConfiguration();
  }, [verifyContract, checkConfiguration]);

  useEffect(() => {
    const checkRights = async () => {
      try {
        await checkAdminRights();
      } catch (err) {
        console.error('Erreur lors de la vérification des droits:', err);
      }
    };
    checkRights();
  }, [checkAdminRights]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1, my: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" gutterBottom>
          Vérification de l'accès administrateur
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography>
            Propriétaire du contrat: {owner || 'Non disponible'}
          </Typography>
          <Typography>
            Droits d'administration: {isOwner ? 'Oui' : 'Non'}
          </Typography>
          {adminRights && (
            <Typography>
              Dernière activité: {lastActivity ? new Date(lastActivity).toLocaleString() : 'Aucune'}
            </Typography>
          )}
        </Box>

        <ContractStatus contractCheck={contractCheck} />
        
        <Divider />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Prérequis :
          </Typography>
          <Stack spacing={1}>
            <NetworkStatus networkCheck={networkCheck} />
            <WalletStatus walletCheck={walletCheck} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusIcon isValid={walletCheck.isContractOwner} />
              <Typography>
                Propriétaire du contrat
              </Typography>
            </Box>
          </Stack>
        </Box>

        {walletCheck.isContractOwner && networkCheck.isCorrectNetwork && contractCheck.isValid && (
          <>
            <Divider />
            <AdminRights rights={adminRights} lastActivity={lastActivity} />
          </>
        )}

        {!isOwner && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Vous n'avez pas les droits d'administration nécessaires.
          </Alert>
        )}

        <Button 
          variant="outlined" 
          onClick={handleRetryCheck}
          sx={{ mt: 2 }}
        >
          Revérifier l'accès
        </Button>
      </Stack>
    </Box>
  );
});
