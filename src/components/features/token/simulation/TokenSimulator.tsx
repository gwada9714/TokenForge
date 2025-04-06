import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { formatUnits, parseUnits } from "viem";

interface TokenSimulatorProps {
  tokenParams: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    features: string[];
  };
}

interface SimulationState {
  balance: bigint;
  transactions: {
    type: "transfer" | "mint" | "burn";
    amount: bigint;
    from: string;
    to: string;
    timestamp: number;
  }[];
}

export const TokenSimulator: React.FC<TokenSimulatorProps> = ({
  tokenParams,
}) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    balance: parseUnits(tokenParams.totalSupply, tokenParams.decimals),
    transactions: [],
  });

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleSimulateTransfer = () => {
    try {
      const transferAmount = parseUnits(amount, tokenParams.decimals);

      if (transferAmount > simulationState.balance) {
        throw new Error("Insufficient balance");
      }

      setSimulationState((prev) => ({
        balance: prev.balance - transferAmount,
        transactions: [
          {
            type: "transfer",
            amount: transferAmount,
            from: "Owner",
            to: recipient,
            timestamp: Date.now(),
          },
          ...prev.transactions,
        ],
      }));

      setAmount("");
      setRecipient("");
    } catch (error) {
      console.error("Simulation error:", error);
    }
  };

  const canMint = tokenParams.features.includes("mintable");
  const canBurn = tokenParams.features.includes("burnable");

  const handleSimulateMint = () => {
    if (!canMint) return;

    try {
      const mintAmount = parseUnits(amount, tokenParams.decimals);

      setSimulationState((prev) => ({
        balance: prev.balance + mintAmount,
        transactions: [
          {
            type: "mint",
            amount: mintAmount,
            from: "Minter",
            to: "Supply",
            timestamp: Date.now(),
          },
          ...prev.transactions,
        ],
      }));

      setAmount("");
    } catch (error) {
      console.error("Mint simulation error:", error);
    }
  };

  const handleSimulateBurn = () => {
    if (!canBurn) return;

    try {
      const burnAmount = parseUnits(amount, tokenParams.decimals);

      if (burnAmount > simulationState.balance) {
        throw new Error("Insufficient balance to burn");
      }

      setSimulationState((prev) => ({
        balance: prev.balance - burnAmount,
        transactions: [
          {
            type: "burn",
            amount: burnAmount,
            from: "Supply",
            to: "Burned",
            timestamp: Date.now(),
          },
          ...prev.transactions,
        ],
      }));

      setAmount("");
    } catch (error) {
      console.error("Burn simulation error:", error);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Simulation du Token
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          Supply actuelle :{" "}
          {formatUnits(simulationState.balance, tokenParams.decimals)}{" "}
          {tokenParams.symbol}
        </Typography>

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <TextField
            label="Montant"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            size="small"
          />
          <TextField
            label="Destinataire"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSimulateTransfer}
            disabled={!amount || !recipient}
          >
            Simuler Transfer
          </Button>
          {canMint && (
            <Button
              variant="outlined"
              onClick={handleSimulateMint}
              disabled={!amount}
            >
              Simuler Mint
            </Button>
          )}
          {canBurn && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleSimulateBurn}
              disabled={!amount}
            >
              Simuler Burn
            </Button>
          )}
        </Box>

        <TableContainer sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>De</TableCell>
                <TableCell>Vers</TableCell>
                <TableCell align="right">Montant</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {simulationState.transactions.map((tx, index) => (
                <TableRow key={index}>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.from}</TableCell>
                  <TableCell>{tx.to}</TableCell>
                  <TableCell align="right">
                    {formatUnits(tx.amount, tokenParams.decimals)}{" "}
                    {tokenParams.symbol}
                  </TableCell>
                  <TableCell>
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 2 }}>
          Cette simulation permet de tester le comportement de votre token avant
          le déploiement. Les transactions simulées n'ont aucun impact sur la
          blockchain.
        </Alert>
      </Box>
    </Paper>
  );
};

export default TokenSimulator;
