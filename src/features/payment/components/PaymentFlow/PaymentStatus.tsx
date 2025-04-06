import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Paper,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import TimerIcon from "@mui/icons-material/Timer";
import {
  PaymentStatus as Status,
  PaymentSession,
} from "@/features/multi-chain/services/payment/types";

interface PaymentStatusProps {
  session: PaymentSession;
  onComplete?: () => void;
}

/**
 * Composant affichant l'état actuel d'un paiement
 * @component
 */
export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  session,
  onComplete,
}) => {
  const theme = useTheme();

  React.useEffect(() => {
    if (session.status === Status.CONFIRMED && onComplete) {
      onComplete();
    }
  }, [session.status, onComplete]);

  const getStatusConfig = (status: Status) => {
    switch (status) {
      case Status.PENDING:
        return {
          color: "warning",
          icon: <TimerIcon />,
          message: "En attente de confirmation...",
          description: "Veuillez confirmer la transaction dans votre wallet",
        };
      case Status.PROCESSING:
        return {
          color: "info",
          icon: <CircularProgress size={20} />,
          message: "Transaction en cours...",
          description:
            "Veuillez patienter pendant le traitement de votre paiement",
        };
      case Status.CONFIRMED:
        return {
          color: "success",
          icon: <CheckCircleIcon />,
          message: "Paiement confirmé !",
          description: "Votre transaction a été validée avec succès",
        };
      case Status.FAILED:
        return {
          color: "error",
          icon: <ErrorIcon />,
          message: "Échec du paiement",
          description:
            session.error || "Une erreur est survenue lors du traitement",
        };
      case Status.TIMEOUT:
        return {
          color: "error",
          icon: <TimerIcon />,
          message: "Délai dépassé",
          description: "La transaction a pris trop de temps",
        };
      default:
        return {
          color: "default",
          icon: null,
          message: "Statut inconnu",
          description: "Impossible de déterminer l'état du paiement",
        };
    }
  };

  const config = getStatusConfig(session.status);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: theme.palette.background.default,
        borderRadius: 2,
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Chip
          icon={config.icon}
          label={config.message}
          color={config.color as any}
          sx={{ mb: 2 }}
        />

        <Typography variant="body1" color="textSecondary">
          {config.description}
        </Typography>
      </Box>

      {session.txHash && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Hash de transaction</AlertTitle>
          <Typography
            variant="body2"
            sx={{
              wordBreak: "break-all",
              fontFamily: "monospace",
            }}
          >
            {session.txHash}
          </Typography>
        </Alert>
      )}

      {session.status === Status.PROCESSING && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Confirmation en cours...
          </Typography>
        </Box>
      )}

      {session.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Erreur</AlertTitle>
          {session.error}
        </Alert>
      )}
    </Paper>
  );
};
