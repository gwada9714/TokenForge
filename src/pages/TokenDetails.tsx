import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TokenManager } from '../components/TokenManager/TokenManager';
import { TokenInfo } from '../types/tokens';
import { useAccount } from 'wagmi';

export const TokenDetailsPage: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTokenDetails = async () => {
      if (!isConnected || !address || !tokenAddress) return;

      try {
        setLoading(true);
        // TODO: Implémenter la récupération des détails du token depuis le smart contract
        // Pour l'instant, utilisons des données de test
        const mockToken: TokenInfo = {
          address: tokenAddress,
          name: 'Test Token',
          symbol: 'TEST',
          decimals: 18,
          maxSupply: BigInt('1000000000000000000000000'),
          burnable: true,
          mintable: true,
          owner: address,
          totalSupply: BigInt('1000000000000000000000'),
        };
        setToken(mockToken);
      } catch (err) {
        setError('Erreur lors du chargement des détails du token');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTokenDetails();
  }, [tokenAddress, address, isConnected]);

  if (!isConnected) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Connectez votre portefeuille pour voir les détails du token
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/my-tokens')}
            sx={{ mr: 2 }}
            aria-label="retour"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Détails du Token
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : token ? (
          <TokenManager token={token} />
        ) : (
          <Alert severity="error">
            Token non trouvé
          </Alert>
        )}
      </Box>
    </Container>
  );
};
