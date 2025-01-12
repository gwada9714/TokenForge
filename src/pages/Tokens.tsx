// src/pages/Tokens.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { TokenCard } from "../components/TokenCard/TokenCard";
import { TokenInfo } from "../services/tokenService";
import AddIcon from "@mui/icons-material/Add";

const Tokens: React.FC = () => {
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
        // TODO: Implement token loading from blockchain
        // Using mock data for now
        const mockTokens: TokenInfo[] = [
          {
            address: "0x1234567890123456789012345678901234567890",
            name: "Test Token",
            symbol: "TEST",
            decimals: 18,
            maxSupply: "1000000000000000000000000",
            totalSupply: "0",
            balance: "0",
            burnable: true,
            mintable: true,
            owner: "0x0000000000000000000000000000000000000000",
          },
          {
            address: "0x0987654321098765432109876543210987654321",
            name: "Sample Token",
            symbol: "SMPL",
            decimals: 18,
            maxSupply: "0",
            totalSupply: "0",
            balance: "0",
            burnable: false,
            mintable: true,
            owner: "0x0000000000000000000000000000000000000000",
          },
        ];
        setTokens(mockTokens);
      } catch (err) {
        setError("Error loading tokens");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, [address, isConnected]);

  const handleTokenAction = (address: string) => {
    navigate(`/token/${address}`);
  };

  if (!isConnected) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Connect your wallet to view your tokens
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            My Tokens
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/create")}
          >
            Create a Token
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : tokens.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="textSecondary" gutterBottom>
              You haven't created any tokens yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate("/create")}
              sx={{ mt: 2 }}
            >
              Create my first token
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {tokens.map((token) => (
              <Grid item xs={12} sm={6} md={4} key={token.address}>
                <TokenCard 
                  token={token} 
                  onAction={handleTokenAction}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Tokens;