import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { TokenInfo } from "../../types/tokens";
import { shortenAddress } from "../../utils/address";

interface TokenDetailsProps {
  token: TokenInfo;
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography color="textSecondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Paper>
  </Grid>
);

export const TokenDetails: React.FC<TokenDetailsProps> = ({ token }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Grid container spacing={2}>
      <DetailItem
        label="Adresse du Contrat"
        value={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {shortenAddress(token.address)}
            <Tooltip title="Copier l'adresse">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(token.address)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Voir sur Etherscan">
              <IconButton
                size="small"
                onClick={() =>
                  window.open(
                    `https://etherscan.io/token/${token.address}`,
                    "_blank",
                  )
                }
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <DetailItem label="Nom" value={token.name} />
      <DetailItem label="Symbole" value={token.symbol} />
      <DetailItem label="Décimales" value={token.decimals} />
      <DetailItem
        label="Supply Maximum"
        value={token.maxSupply ? token.maxSupply.toString() : "Illimité"}
      />
      <DetailItem
        label="Supply Total"
        value={token.totalSupply ? token.totalSupply.toString() : "N/A"}
      />
      <DetailItem
        label="Fonctionnalités"
        value={
          <Box sx={{ display: "flex", gap: 1 }}>
            {token.burnable && (
              <Chip
                label="Burnable"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {token.mintable && (
              <Chip
                label="Mintable"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        }
      />
      <DetailItem
        label="Propriétaire"
        value={
          token.owner ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {shortenAddress(token.owner)}
              <Tooltip title="Copier l'adresse">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(token.owner!)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            "N/A"
          )
        }
      />
    </Grid>
  );
};
