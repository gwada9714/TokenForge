import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
  Avatar,
  Tooltip,
  Chip,
  useTheme,
} from "@mui/material";
import {
  PaymentToken,
  PaymentNetwork,
} from "@/features/multi-chain/services/payment/types";

interface TokenSelectorProps {
  network: PaymentNetwork;
  tokens: PaymentToken[];
  value: string;
  onChange: (tokenAddress: string) => void;
  disabled?: boolean;
  balance?: Record<string, string>;
}

interface TokenInfo {
  icon: string;
  color: string;
}

const TOKEN_INFO: Record<string, TokenInfo> = {
  ETH: {
    icon: "🔷",
    color: "#627EEA",
  },
  MATIC: {
    icon: "💜",
    color: "#8247E5",
  },
  BNB: {
    icon: "💛",
    color: "#F3BA2F",
  },
  SOL: {
    icon: "🟣",
    color: "#14F195",
  },
  USDT: {
    icon: "💵",
    color: "#26A17B",
  },
  USDC: {
    icon: "💵",
    color: "#2775CA",
  },
  DAI: {
    icon: "💵",
    color: "#F5AC37",
  },
  BUSD: {
    icon: "💵",
    color: "#F0B90B",
  },
};

/**
 * Composant de sélection de token
 * @component
 */
export const TokenSelector: React.FC<TokenSelectorProps> = ({
  network,
  tokens,
  value,
  onChange,
  disabled = false,
  balance = {},
}) => {
  const theme = useTheme();

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const getTokenInfo = (symbol: string): TokenInfo => {
    return (
      TOKEN_INFO[symbol] || {
        icon: "🪙",
        color: theme.palette.grey[500],
      }
    );
  };

  const renderTokenOption = (token: PaymentToken) => {
    const info = getTokenInfo(token.symbol);
    const tokenBalance = balance[token.address];

    return (
      <MenuItem
        key={token.address}
        value={token.address}
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
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1">{token.symbol}</Typography>
          {tokenBalance && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block" }}
            >
              Solde: {tokenBalance} {token.symbol}
            </Typography>
          )}
        </Box>
        {token.address === "0x0000000000000000000000000000000000000000" && (
          <Chip label="Natif" size="small" sx={{ ml: 1 }} />
        )}
      </MenuItem>
    );
  };

  const selectedToken = tokens.find((t) => t.address === value);

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="token-selector-label">Token</InputLabel>
      <Select
        labelId="token-selector-label"
        value={value}
        label="Token"
        onChange={handleChange}
        renderValue={(selected) => {
          const token = tokens.find((t) => t.address === selected);
          if (!token) return "";

          const info = getTokenInfo(token.symbol);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>{info.icon}</Typography>
              <Typography>{token.symbol}</Typography>
              {balance[selected] && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ ml: "auto" }}
                >
                  {balance[selected]} {token.symbol}
                </Typography>
              )}
            </Box>
          );
        }}
      >
        {tokens
          .filter((token) => token.network === network)
          .map((token) => (
            <Tooltip
              key={token.address}
              title={`Token ${token.symbol} sur ${network}`}
              placement="right"
            >
              {renderTokenOption(token)}
            </Tooltip>
          ))}
      </Select>
    </FormControl>
  );
};
