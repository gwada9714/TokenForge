import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import {
  OpenInNew as OpenInNewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  from: string;
  to: string;
  network: string;
  status: "success" | "pending" | "failed";
  timestamp: string;
  hash: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <SuccessIcon color="success" />;
      case "pending":
        return <PendingIcon color="warning" />;
      case "failed":
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Montant</TableCell>
            <TableCell>De</TableCell>
            <TableCell>Vers</TableCell>
            <TableCell>Réseau</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} hover>
              <TableCell>
                <Chip label={tx.type} size="small" />
              </TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell>{truncateAddress(tx.from)}</TableCell>
              <TableCell>{truncateAddress(tx.to)}</TableCell>
              <TableCell>
                <Chip label={tx.network} size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  {getStatusIcon(tx.status)}
                  <Chip
                    label={tx.status}
                    size="small"
                    color={getStatusColor(tx.status)}
                  />
                </Box>
              </TableCell>
              <TableCell>{tx.timestamp}</TableCell>
              <TableCell>
                <Tooltip title="Voir sur l'explorateur">
                  <IconButton
                    size="small"
                    onClick={() =>
                      window.open(
                        `https://etherscan.io/tx/${tx.hash}`,
                        "_blank"
                      )
                    }
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
