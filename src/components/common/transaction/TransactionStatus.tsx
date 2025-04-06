import React from "react";
import {
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Link,
  Typography,
  Paper,
} from "@mui/material";
import { useNetwork } from "../hooks/useNetwork";
import { getNetwork } from "../../config/networks";
import { TransactionReceipt } from "@ethersproject/abstract-provider";

interface TransactionStatusProps {
  isLoading: boolean;
  error: Error | null;
  hash: string | null;
  receipt: TransactionReceipt | null;
  title?: string;
  loadingMessage?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  isLoading,
  error,
  hash,
  receipt,
  title = "État de la transaction",
  loadingMessage = "Transaction en cours...",
}) => {
  const { chain } = useNetwork();
  const network = chain?.id ? getNetwork(chain.id) : undefined;

  if (!isLoading && !error && !hash && !receipt) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mt: 2,
        backgroundColor: (theme) =>
          error
            ? theme.palette.error.light
            : receipt
            ? theme.palette.success.light
            : theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {isLoading && (
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={24} />
          <Typography>{loadingMessage}</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error">
          <AlertTitle>Erreur de transaction</AlertTitle>
          {error.message}
        </Alert>
      )}

      {(hash || receipt) && network?.explorerUrl && (
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Hash de transaction:{" "}
            <Link
              href={`${network.explorerUrl}/tx/${
                hash || receipt?.transactionHash
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hash || receipt?.transactionHash}
            </Link>
          </Typography>

          {receipt && (
            <>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Bloc: {receipt.blockNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Gas utilisé: {receipt.gasUsed.toString()}
              </Typography>
              {receipt.logs && receipt.logs.length > 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2">Événements émis:</Typography>
                  {receipt.logs.map((log, index) => (
                    <Typography
                      key={`${log.transactionHash}-${index}`}
                      variant="body2"
                      color="textSecondary"
                      sx={{ ml: 2 }}
                    >
                      • Log {index + 1}
                      {log.topics && ` (${log.topics.join(", ")})`}
                    </Typography>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};
