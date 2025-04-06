import React, { useMemo } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { PaymentNetwork } from "../../services/payment/types/PaymentSession";
import { useTokenList } from "../../hooks/useTokenList";

interface TokenSelectorProps {
  network: PaymentNetwork;
  selectedToken: string | null;
  onSelect: (tokenAddress: string) => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  network,
  selectedToken,
  onSelect,
}) => {
  const { tokens, isLoading, error } = useTokenList(network);

  const networkNativeCoin = useMemo(() => {
    switch (network) {
      case PaymentNetwork.ETHEREUM:
        return {
          symbol: "ETH",
          name: "Ethereum",
          icon: "/assets/tokens/eth.svg",
          address: "0x0000000000000000000000000000000000000000",
        };
      case PaymentNetwork.BINANCE:
        return {
          symbol: "BNB",
          name: "Binance Coin",
          icon: "/assets/tokens/bnb.svg",
          address: "0x0000000000000000000000000000000000000000",
        };
      case PaymentNetwork.POLYGON:
        return {
          symbol: "MATIC",
          name: "Polygon",
          icon: "/assets/tokens/matic.svg",
          address: "0x0000000000000000000000000000000000000000",
        };
      case PaymentNetwork.SOLANA:
        return {
          symbol: "SOL",
          name: "Solana",
          icon: "/assets/tokens/sol.svg",
          address: "11111111111111111111111111111111",
        };
      default:
        return null;
    }
  }, [network]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading tokens...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Error loading tokens</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxHeight: 400, overflow: "auto" }}>
      <Typography variant="h6" sx={{ px: 2, py: 1 }}>
        Select Token
      </Typography>

      <List>
        {/* Native Token */}
        {networkNativeCoin && (
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedToken === networkNativeCoin.address}
              onClick={() => onSelect(networkNativeCoin.address)}
            >
              <ListItemIcon>
                <Avatar
                  src={networkNativeCoin.icon}
                  alt={networkNativeCoin.symbol}
                  sx={{ width: 32, height: 32 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={networkNativeCoin.symbol}
                secondary={networkNativeCoin.name}
                primaryTypographyProps={{
                  fontWeight:
                    selectedToken === networkNativeCoin.address ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        )}

        {/* Separator */}
        <ListItem>
          <Box
            sx={{
              width: "100%",
              borderBottom: "1px solid",
              borderColor: "divider",
              my: 1,
            }}
          />
        </ListItem>

        {/* Token List */}
        {tokens.map((token) => (
          <ListItem key={token.address} disablePadding>
            <ListItemButton
              selected={selectedToken === token.address}
              onClick={() => onSelect(token.address)}
            >
              <ListItemIcon>
                <Avatar
                  src={token.icon}
                  alt={token.symbol}
                  sx={{ width: 32, height: 32 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={token.symbol}
                secondary={token.name}
                primaryTypographyProps={{
                  fontWeight: selectedToken === token.address ? 600 : 400,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {token.balance}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
