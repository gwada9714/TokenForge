import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { TokenCard } from '../components/TokenCard/TokenCard';
import { TokenInfo } from '../types/tokens';
import AddIcon from '@mui/icons-material/Add';

export const MyTokens: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTokens = async () => {
      if (!isConnected || !address) return;

      try {
        setLoading(true);
        // TODO: Implémenter la récupération des tokens depuis le smart contract
        // Pour l'instant, utilisons des données de test
        const mockTokens: TokenInfo[] = [
          {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Test Token',
            symbol: 'TEST',
            decimals: 18,
            maxSupply: BigInt('1000000000000000000000000'),
            burnable: true,
            mintable: true,
          },
          {
            address: '0x0987654321098765432109876543210987654321',
            name: 'Sample Token',
            symbol: 'SMPL',
            decimals: 18,
            maxSupply: null,
            burnable: false,
            mintable: true,
          },
        ];
        setTokens(mockTokens);
      } catch (err) {
        setError('Erreur lors du chargement des tokens');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, [address, isConnected]);

  const handleManageToken = (token: TokenInfo) => {
    navigate(`/token/${token.address}`);
  };

  if (!isConnected) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Connectez votre portefeuille pour voir vos tokens
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Mes Tokens
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create')}
          >
            Créer un Token
          </Button>
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
        ) : tokens.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary" gutterBottom>
              Vous n'avez pas encore créé de tokens
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create')}
              sx={{ mt: 2 }}
            >
              Créer mon premier token
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {tokens.map((token) => (
              <Grid item xs={12} sm={6} md={4} key={token.address}>
                <TokenCard
                  token={token}
                  onManage={handleManageToken}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};
