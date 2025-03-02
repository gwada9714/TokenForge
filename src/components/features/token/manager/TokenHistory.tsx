import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";
import { shortenAddress } from "../utils/address";

// Define TokenInfo interface locally
interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  totalSupply: string;
  balance?: string;
  features?: {
    mintable: boolean;
    burnable: boolean;
  };
}

interface TokenHistoryProps {
  token: TokenInfo;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  type: "transfer" | "mint" | "burn";
  timestamp: number;
}

export const TokenHistory: React.FC<TokenHistoryProps> = ({ token }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // TODO: Implement history retrieval from Etherscan API
        // Using mock data for now
        const mockTransactions: Transaction[] = [
          {
            hash: "0x1234...5678",
            from: "0x0000000000000000000000000000000000000000",
            to: token.address,
            amount: "1000",
            type: "mint",
            timestamp: Date.now() - 3600000,
          },
          {
            hash: "0x5678...9012",
            from: token.address,
            to: "0x1234567890123456789012345678901234567890",
            amount: "500",
            type: "transfer",
            timestamp: Date.now() - 7200000,
          },
        ];
        setTransactions(mockTransactions);
      } catch (err) {
        setError("Error loading transaction history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [token.address]);

  const getTransactionTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "mint":
        return "success";
      case "burn":
        return "error";
      default:
        return "primary";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (transactions.length === 0) {
    return (
      <Typography color="textSecondary" align="center">
        No transactions found
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.hash} hover>
              <TableCell>
                <Chip
                  label={tx.type.toUpperCase()}
                  color={getTransactionTypeColor(tx.type)}
                  size="small"
                />
              </TableCell>
              <TableCell>{shortenAddress(tx.from)}</TableCell>
              <TableCell>{shortenAddress(tx.to)}</TableCell>
              <TableCell align="right">{tx.amount}</TableCell>
              <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
