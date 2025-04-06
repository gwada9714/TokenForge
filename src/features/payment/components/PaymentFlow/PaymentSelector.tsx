import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
  Tooltip,
  IconButton,
  SelectChangeEvent,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { PaymentNetwork } from "../../../multi-chain/types/PaymentNetwork";
import { PaymentToken } from "../../../multi-chain/types/PaymentToken";
import { EthereumPaymentService } from "../../../multi-chain/services/ethereum/EthereumPaymentService";
import { PolygonPaymentService } from "../../../multi-chain/services/polygon/PolygonPaymentService";
import { BinancePaymentService } from "../../../multi-chain/services/binance/BinancePaymentService";
import { SolanaPaymentService } from "../../../multi-chain/services/solana/SolanaPaymentService";
import { PaymentSession } from "../../../multi-chain/types/PaymentSession";
import { PaymentStatus } from "../../../multi-chain/types/PaymentStatus";
import { AbstractChainService } from "../../../multi-chain/services/AbstractChainService";

interface NetworkInfo {
  name: string;
  description: string;
  icon: string;
}

const NETWORK_INFO: Record<PaymentNetwork, NetworkInfo> = {
  [PaymentNetwork.ETHEREUM]: {
    name: "Ethereum",
    description:
      "Réseau principal Ethereum - Frais de gas élevés mais sécurité maximale",
    icon: "/icons/eth.svg",
  },
  [PaymentNetwork.POLYGON]: {
    name: "Polygon",
    description:
      "Solution de mise à l'échelle L2 - Frais de gas faibles et transactions rapides",
    icon: "/icons/polygon.svg",
  },
  [PaymentNetwork.BSC]: {
    name: "Binance Smart Chain",
    description:
      "Réseau Binance - Compatible EVM avec frais de transaction très bas",
    icon: "/icons/bnb.svg",
  },
  [PaymentNetwork.SOLANA]: {
    name: "Solana",
    description:
      "Blockchain haute performance - Transactions ultra rapides et peu coûteuses",
    icon: "/icons/sol.svg",
  },
};

interface PaymentSelectorProps {
  amount: number;
  onPaymentComplete: (session: PaymentSession) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  amount,
  onPaymentComplete,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<PaymentNetwork | "">(
    ""
  );
  const [selectedToken, setSelectedToken] = useState<PaymentToken | null>(null);
  const [availableTokens, setAvailableTokens] = useState<PaymentToken[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<PaymentSession | null>(null);

  useEffect(() => {
    if (selectedNetwork) {
      const chainService = getChainService(selectedNetwork);
      if (chainService) {
        const tokens = chainService.getSupportedTokens();
        setAvailableTokens(tokens);
        setSelectedToken(null);
      }
    } else {
      setAvailableTokens([]);
      setSelectedToken(null);
    }
  }, [selectedNetwork]);

  const getChainService = (
    network: PaymentNetwork
  ): AbstractChainService | null => {
    switch (network) {
      case PaymentNetwork.ETHEREUM:
        return new EthereumPaymentService();
      case PaymentNetwork.POLYGON:
        return new PolygonPaymentService();
      case PaymentNetwork.BSC:
        return new BinancePaymentService();
      case PaymentNetwork.SOLANA:
        return new SolanaPaymentService();
      default:
        return null;
    }
  };

  const handleNetworkChange = (
    event: SelectChangeEvent<PaymentNetwork | "">
  ) => {
    setSelectedNetwork(event.target.value as PaymentNetwork);
    setError(null);
  };

  const handleTokenChange = (event: SelectChangeEvent<string>) => {
    const token = availableTokens.find(
      (t: PaymentToken) => t.address === event.target.value
    );
    setSelectedToken(token || null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedNetwork || !selectedToken) {
      setError("Veuillez sélectionner un réseau et un token");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const chainService = getChainService(selectedNetwork);
      if (!chainService) {
        throw new Error("Service de paiement non disponible");
      }

      const newSession = await chainService.createPaymentSession(
        amount,
        selectedToken
      );
      setSession(newSession);

      const processedSession = await chainService.processPayment(newSession);

      if (processedSession.status === PaymentStatus.CONFIRMED) {
        onPaymentComplete(processedSession);
      } else {
        setError(
          processedSession.error || "Erreur lors du traitement du paiement"
        );
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sélectionner le mode de paiement
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Réseau</InputLabel>
        <Select
          value={selectedNetwork}
          onChange={handleNetworkChange}
          label="Réseau"
        >
          {Object.entries(NETWORK_INFO).map(([network, info]) => (
            <MenuItem key={network} value={network}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <img
                  src={info.icon}
                  alt={info.name}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
                {info.name}
                <Tooltip title={info.description}>
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedNetwork && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Token</InputLabel>
          <Select
            value={selectedToken?.address || ""}
            onChange={handleTokenChange}
            label="Token"
          >
            {availableTokens.map((token: PaymentToken) => (
              <MenuItem key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {session && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ID de session: {session.id}
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Statut: {session.status}
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={!selectedNetwork || !selectedToken || isProcessing}
      >
        {isProcessing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Payer ${amount} ${selectedToken?.symbol || ""}`
        )}
      </Button>
    </Box>
  );
};
