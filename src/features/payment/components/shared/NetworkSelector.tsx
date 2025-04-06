import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
  Tooltip,
  Avatar,
  useTheme,
} from "@mui/material";
import { PaymentNetwork } from "@/features/multi-chain/services/payment/types";
import { CHAIN_CONFIG } from "@/features/multi-chain/config/chains";

interface NetworkSelectorProps {
  value: PaymentNetwork;
  onChange: (network: PaymentNetwork) => void;
  disabled?: boolean;
}

interface NetworkInfo {
  name: string;
  icon: string;
  description: string;
  color: string;
}

const NETWORK_INFO: Record<PaymentNetwork, NetworkInfo> = {
  [PaymentNetwork.ETHEREUM]: {
    name: "Ethereum",
    icon: "🔷",
    description: "Réseau principal Ethereum - Frais élevés mais très sécurisé",
    color: "#627EEA",
  },
  [PaymentNetwork.POLYGON]: {
    name: "Polygon",
    icon: "💜",
    description:
      "Solution de mise à l'échelle - Frais réduits et transactions rapides",
    color: "#8247E5",
  },
  [PaymentNetwork.BINANCE]: {
    name: "BNB Smart Chain",
    icon: "💛",
    description:
      "Réseau Binance - Alternative économique avec écosystème riche",
    color: "#F3BA2F",
  },
  [PaymentNetwork.SOLANA]: {
    name: "Solana",
    icon: "🟣",
    description: "Blockchain haute performance - Transactions ultra rapides",
    color: "#14F195",
  },
};

/**
 * Composant de sélection du réseau blockchain
 * @component
 */
export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<PaymentNetwork>) => {
    onChange(event.target.value as PaymentNetwork);
  };

  const renderNetworkOption = (network: PaymentNetwork) => {
    const info = NETWORK_INFO[network];
    const config = CHAIN_CONFIG[network];

    return (
      <MenuItem
        key={network}
        value={network}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: info.color,
            width: 32,
            height: 32,
          }}
        >
          {info.icon}
        </Avatar>
        <Box>
          <Typography variant="body1">{info.name}</Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: "block" }}
          >
            {config.nativeCurrency.symbol}
          </Typography>
        </Box>
      </MenuItem>
    );
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="network-selector-label">Réseau</InputLabel>
      <Select
        labelId="network-selector-label"
        value={value}
        label="Réseau"
        onChange={handleChange}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>{NETWORK_INFO[selected].icon}</Typography>
            <Typography>{NETWORK_INFO[selected].name}</Typography>
          </Box>
        )}
      >
        {Object.values(PaymentNetwork).map((network) => (
          <Tooltip
            key={network}
            title={NETWORK_INFO[network].description}
            placement="right"
          >
            {renderNetworkOption(network)}
          </Tooltip>
        ))}
      </Select>
    </FormControl>
  );
};
