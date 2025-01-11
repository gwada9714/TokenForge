import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { TokenInfo } from "../../types/tokens";
import { shortenAddress } from "../../utils/address";

interface TokenCardProps {
  token: TokenInfo;
  onManage?: (token: TokenInfo) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onManage }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openEtherscan = () => {
    window.open(`https://etherscan.io/token/${token.address}`, "_blank");
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="div">
            {token.name}
          </Typography>
          <Chip label={token.symbol} color="primary" size="small" />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography color="textSecondary" gutterBottom>
            Adresse du contrat
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">
              {shortenAddress(token.address)}
            </Typography>
            <Tooltip title="Copier l'adresse">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(token.address)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Voir sur Etherscan">
              <IconButton size="small" onClick={openEtherscan}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography color="textSecondary" gutterBottom>
            Supply Maximum
          </Typography>
          <Typography variant="body2">
            {token.maxSupply?.toString() || "Illimité"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          {token.burnable && (
            <Chip label="Burnable" size="small" variant="outlined" />
          )}
          {token.mintable && (
            <Chip label="Mintable" size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={() => onManage?.(token)}
        >
          Gérer
        </Button>
      </CardActions>
    </Card>
  );
};
