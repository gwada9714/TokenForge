import { Typography, Button, Stack, Container } from '@mui/material'
import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <Container maxWidth="md">
      <Stack 
        spacing={4} 
        sx={{ 
          py: 10,
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Créez votre Token en quelques clics
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          TokenForge vous permet de créer et déployer vos propres tokens sur la blockchain 
          rapidement et en toute sécurité.
        </Typography>
        <Button
          component={Link}
          to="/tokens/create"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          Commencer
        </Button>
      </Stack>
    </Container>
  )
}

export default Home;