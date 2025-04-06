import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { TokenStakingPool } from "../components/TokenStakingPool";
import { useAuth } from "@/hooks/useAuth";

// Types
interface StakingPool {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  tokenLogo: string;
  apr: number;
  totalStaked: string;
  lockPeriod: number; // en jours
  minStake: string;
  maxStake: string;
  createdAt: Date;
  endsAt: Date | null;
  status: "active" | "completed" | "upcoming";
}

const TokenStakingPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [userPools, setUserPools] = useState<StakingPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simuler le chargement des pools de staking
  useEffect(() => {
    const fetchPools = async () => {
      setIsLoading(true);

      try {
        // Simuler un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Données simulées
        const mockPools: StakingPool[] = [
          {
            id: "1",
            tokenName: "Community Token",
            tokenSymbol: "COMM",
            tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
            tokenLogo: "/assets/images/tokens/comm.png",
            apr: 12.5,
            totalStaked: "250000",
            lockPeriod: 30,
            minStake: "100",
            maxStake: "10000",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            status: "active",
          },
          {
            id: "2",
            tokenName: "DeFi Token",
            tokenSymbol: "DEFI",
            tokenAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
            tokenLogo: "/assets/images/tokens/defi.png",
            apr: 18.75,
            totalStaked: "500000",
            lockPeriod: 90,
            minStake: "500",
            maxStake: "50000",
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            status: "active",
          },
          {
            id: "3",
            tokenName: "Governance Token",
            tokenSymbol: "GOV",
            tokenAddress: "0x7890abcdef1234567890abcdef1234567890abcd",
            tokenLogo: "/assets/images/tokens/gov.png",
            apr: 8.25,
            totalStaked: "1000000",
            lockPeriod: 180,
            minStake: "1000",
            maxStake: "100000",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            endsAt: null,
            status: "active",
          },
          {
            id: "4",
            tokenName: "Utility Token",
            tokenSymbol: "UTIL",
            tokenAddress: "0xef1234567890abcdef1234567890abcdef123456",
            tokenLogo: "/assets/images/tokens/util.png",
            apr: 15.0,
            totalStaked: "750000",
            lockPeriod: 60,
            minStake: "250",
            maxStake: "25000",
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: "completed",
          },
          {
            id: "5",
            tokenName: "Reward Token",
            tokenSymbol: "RWD",
            tokenAddress: "0x567890abcdef1234567890abcdef1234567890ab",
            tokenLogo: "/assets/images/tokens/rwd.png",
            apr: 20.0,
            totalStaked: "0",
            lockPeriod: 30,
            minStake: "100",
            maxStake: "10000",
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            status: "upcoming",
          },
        ];

        setStakingPools(mockPools);

        // Simuler les pools de l'utilisateur
        if (user) {
          setUserPools([mockPools[0], mockPools[2]]);
        } else {
          setUserPools([]);
        }
      } catch (error) {
        console.error("Error fetching staking pools:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, [user]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filtrer les pools en fonction de la recherche et de l'onglet sélectionné
  const filteredPools = stakingPools.filter((pool) => {
    const matchesSearch =
      pool.tokenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());

    if (tabValue === 0) {
      return matchesSearch;
    } else if (tabValue === 1) {
      return matchesSearch && pool.status === "active";
    } else if (tabValue === 2) {
      return (
        matchesSearch && userPools.some((userPool) => userPool.id === pool.id)
      );
    }

    return false;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/">
          Accueil
        </Link>
        <Link color="inherit" href="/services">
          Services
        </Link>
        <Typography color="text.primary">Staking de Tokens</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h3" component="h1">
            Staking de Tokens
          </Typography>

          {user && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              href="/token-staking/create"
            >
              Créer un Pool
            </Button>
          )}
        </Box>

        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Stakez vos tokens pour gagner des récompenses et participer à la
          gouvernance des projets.
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Alert severity="info" sx={{ mb: 0 }}>
            <Typography variant="body1">
              <strong>Avantages du staking:</strong>
            </Typography>
            <ul>
              <li>
                Générez des revenus passifs grâce aux récompenses de staking
              </li>
              <li>Soutenez les projets que vous appréciez</li>
              <li>Participez à la gouvernance des projets</li>
              <li>
                Contribuez à la sécurité et à la décentralisation des réseaux
              </li>
            </ul>
          </Alert>
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher un token..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Tous" />
              <Tab label="Actifs" />
              <Tab label="Mes Stakes" disabled={!user} />
            </Tabs>
          </Grid>
        </Grid>
      </Box>

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1">
            Chargement des pools de staking...
          </Typography>
        </Box>
      ) : filteredPools.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1">
            {searchTerm
              ? `Aucun pool ne correspond à votre recherche "${searchTerm}"`
              : tabValue === 2
              ? "Vous n'avez pas encore participé à des pools de staking"
              : "Aucun pool de staking disponible actuellement"}
          </Typography>
        </Box>
      ) : (
        <Box>
          {filteredPools.map((pool) => (
            <TokenStakingPool key={pool.id} pool={pool} />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default TokenStakingPage;
