import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import { FaRocket, FaShieldAlt, FaCog, FaChartLine } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface FeatureProps {
  icon: IconType;
  title: string;
  text: string;
}

const Feature = ({ icon: Icon, title, text }: FeatureProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 2,
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <Icon size={40} style={{ color: theme.palette.primary.main, marginBottom: theme.spacing(2) }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary">{text}</Typography>
    </Paper>
  );
};

const Home = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
    }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={6} alignItems="center" sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h1"
            color="white"
            sx={{ 
              fontWeight: 'bold',
              mb: 2 
            }}
          >
            TokenForge
          </Typography>
          <Typography 
            variant="h5" 
            color="white" 
            sx={{ mb: 4, maxWidth: 'md' }}
          >
            Créez et gérez vos tokens ERC20 en quelques clics sur les principales blockchains
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              component={Link}
              to="/tokens/create"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Créer un Token
            </Button>
            <Button
              component={Link}
              to="/tokens"
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'grey.100',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Voir mes Tokens
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={FaRocket}
              title="Déploiement Rapide"
              text="Créez et déployez vos tokens en quelques minutes sans code"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={FaShieldAlt}
              title="Sécurité Maximale"
              text="Smart contracts audités et sécurisés par OpenZeppelin"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={FaCog}
              title="Personnalisation"
              text="Configurez tous les aspects de votre token selon vos besoins"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Feature
              icon={FaChartLine}
              title="Gestion Simple"
              text="Gérez vos tokens facilement avec une interface intuitive"
            />
          </Grid>
        </Grid>
      </Container>

      <Box py={10} sx={{ background: 'white' }}>
        <Container maxWidth="lg">
          <Flex justify="center">
            <Typography color="text.secondary">
              2025 TokenForge. All rights reserved.
            </Typography>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;