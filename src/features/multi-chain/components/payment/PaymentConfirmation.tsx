import React from "react";
import { Box, Typography, Paper, Divider, Avatar, Stack } from "@mui/material";
import { PaymentNetwork } from "../../services/payment/types/PaymentSession";
import { useTokenInfo } from "../../hooks/useTokenInfo";
import { formatCurrency } from "../../utils/currency";

interface PaymentConfirmationProps {
  network: PaymentNetwork;
  token: string;
  amount: number;
  serviceType: string;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  network,
  token,
  amount,
  serviceType,
}) => {
  const { tokenInfo, isLoading, error } = useTokenInfo(network, token);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading payment details...</Typography>
      </Box>
    );
  }

  if (error || !tokenInfo) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Error loading payment details</Typography>
      </Box>
    );
  }

  const formattedAmount = formatCurrency(amount, tokenInfo.decimals);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Confirm Payment
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack spacing={3}>
          {/* Amount */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Amount
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={tokenInfo.icon}
                alt={tokenInfo.symbol}
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="h5">
                {formattedAmount} {tokenInfo.symbol}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          {/* Network */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Network
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={`/assets/networks/${network.toLowerCase()}.svg`}
                alt={network}
                sx={{ width: 24, height: 24 }}
              />
              <Typography>{network}</Typography>
            </Stack>
          </Box>

          <Divider />

          {/* Service */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Service
            </Typography>
            <Typography>{serviceType}</Typography>
          </Box>

          {/* Estimated Gas Fee */}
          {tokenInfo.estimatedGasFee && (
            <>
              <Divider />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Estimated Gas Fee
                </Typography>
                <Typography>
                  {formatCurrency(
                    tokenInfo.estimatedGasFee,
                    tokenInfo.decimals
                  )}{" "}
                  {tokenInfo.symbol}
                </Typography>
              </Box>
            </>
          )}

          {/* Total */}
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Amount
            </Typography>
            <Typography variant="h6">
              {formatCurrency(
                amount + (tokenInfo.estimatedGasFee || 0),
                tokenInfo.decimals
              )}{" "}
              {tokenInfo.symbol}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};
