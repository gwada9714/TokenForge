// src/components/features/token/components/TokenCard/TokenCard.tsx
import { memo } from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import { truncateAddress } from "../../../../../utils";

interface TokenCardProps {
  token: {
    address: string;
    symbol: string;
    balance: string;
  };
  onAction: (address: string) => void;
}

const TokenCard = memo(({ token, onAction }: TokenCardProps) => {
  return (
    <Card
      sx={{
        minWidth: 275,
        backgroundColor: "background.paper",
        transition: "all 0.3s ease-in-out",
        borderRadius: 2,
        boxShadow: "forge-card",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "forge-hover",
        },
      }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-forge opacity-5" />
      <CardContent className="relative">
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          className="font-heading font-bold text-primary-main"
        >
          {token.symbol}
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" className="text-text-secondary">
            Address: {truncateAddress(token.address)}
          </Typography>
          <Typography
            variant="body1"
            className="font-semibold text-text-primary"
          >
            Balance: {token.balance}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onAction(token.address)}
          className="mt-4 bg-gradient-secondary hover:bg-gradient-secondary-hover shadow-forge"
          sx={{
            fontFamily: "heading",
            fontWeight: "bold",
          }}
        >
          Manage Token
        </Button>
      </CardContent>
    </Card>
  );
});

TokenCard.displayName = "TokenCard";

export { TokenCard };
