import React from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useTokenForgeAdmin } from "../../hooks/useTokenForgeAdmin";
import { useAccount } from "wagmi";

export const ContractDebugger: React.FC = () => {
  const { address } = useAccount();
  const {
    isOwner,
    isPaused,
    pause,
    unpause,
    isLoading,
    error,
    owner,
    contractCheck,
    checkAdminRights,
  } = useTokenForgeAdmin();

  const [checking, setChecking] = React.useState(false);

  const handleCheckPermissions = async () => {
    try {
      setChecking(true);
      await checkAdminRights();
    } catch (err) {
      console.error("Erreur lors de la vérification:", err);
    } finally {
      setChecking(false);
    }
  };

  const handlePause = async () => {
    try {
      await pause();
    } catch (error: any) {
      console.error("Erreur lors de la pause:", error);
    }
  };

  const handleUnpause = async () => {
    try {
      await unpause();
    } catch (error: any) {
      console.error("Erreur lors de la dépause:", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Débogage du Contrat
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Informations du Contrat
        </Typography>
        <Box sx={{ ml: 2 }}>
          <Typography variant="body2">
            Adresse du contrat: {contractCheck?.address || "Non définie"}
          </Typography>
          <Typography variant="body2">
            Propriétaire: {owner || "Non disponible"}
          </Typography>
          <Typography variant="body2">
            Votre adresse: {address || "Non connecté"}
          </Typography>
          <Typography variant="body2">
            Statut: {isPaused ? "En pause" : "Actif"}
          </Typography>
          <Typography variant="body2">
            Droits d'administration: {isOwner ? "Oui" : "Non"}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={handleCheckPermissions}
          disabled={checking}
        >
          {checking ? "Vérification..." : "Vérifier les permissions"}
        </Button>
      </Box>

      {isOwner && (
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color={isPaused ? "success" : "warning"}
            onClick={isPaused ? handleUnpause : handlePause}
            disabled={isLoading}
          >
            {isLoading
              ? "En cours..."
              : isPaused
              ? "Réactiver"
              : "Mettre en pause"}
          </Button>
        </Box>
      )}
    </Box>
  );
};
