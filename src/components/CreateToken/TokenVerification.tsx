import React, { useMemo } from 'react';
import {
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Paper,
  TableContainer
} from '@mui/material';
import { TokenConfig } from '@/types/token';

interface TokenVerificationProps {
  tokenConfig: TokenConfig;
}

const TokenVerification: React.FC<TokenVerificationProps> = React.memo(({ tokenConfig }) => {
  const tableRows = useMemo(() => [
    { label: 'Plan', value: <Chip label={tokenConfig.plan} color="error" size="small" /> },
    { label: 'Nom', value: tokenConfig.name },
    { label: 'Symbole', value: tokenConfig.symbol },
    { label: 'Offre Totale', value: tokenConfig.supply },
    { label: 'Décimales', value: tokenConfig.decimals },
    {
      label: 'Fonctionnalités',
      value: (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {tokenConfig.features?.map((feature) => (
            <Chip
              key={feature}
              label={feature}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      ),
    },
  ], [tokenConfig]);

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ mb: 2 }}>Vérification du Token</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paramètre</TableCell>
              <TableCell>Valeur</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.label}</TableCell>
                <TableCell>{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Veuillez vérifier attentivement tous les paramètres avant le déploiement.
        Une fois le token déployé, certains paramètres ne pourront plus être modifiés.
      </Typography>
    </Stack>
  );
});

export default TokenVerification;
