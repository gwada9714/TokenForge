import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface TokenCardProps {
  name: string;
  symbol: string;
  address: string;
  balance?: string;
}

export const TokenCard: React.FC<TokenCardProps> = ({
  name,
  symbol,
  address,
  balance,
}) => {
  return (
    <Card className="w-full shadow-lg">
      <CardContent>
        <Box className="flex justify-between items-center">
          <div>
            <Typography variant="h6" component="div">
              {name} ({symbol})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {address}
            </Typography>
          </div>
          {balance && (
            <Typography variant="h6" component="div">
              {balance}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenCard;
