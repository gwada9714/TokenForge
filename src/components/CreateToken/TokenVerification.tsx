import React from 'react';
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

const TokenVerification: React.FC<TokenVerificationProps> = ({ tokenConfig }) => {
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
            <TableRow>
              <TableCell>Plan</TableCell>
              <TableCell>
                <Chip 
                  label={tokenConfig.plan}
                  color="error"
                  size="small"
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>{tokenConfig.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Symbole</TableCell>
              <TableCell>{tokenConfig.symbol}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Offre Totale</TableCell>
              <TableCell>{tokenConfig.supply}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Décimales</TableCell>
              <TableCell>{tokenConfig.decimals}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fonctionnalités</TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography fontSize="sm" color="gray" sx={{ mt: 2 }}>
        Veuillez vérifier attentivement tous les paramètres avant le déploiement.
        Une fois le token déployé, certains paramètres ne pourront plus être modifiés.
      </Typography>
    </Stack>
  );
};

export default TokenVerification;
