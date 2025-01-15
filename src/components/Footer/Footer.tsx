import {
  Box,
  Container,
  Stack,
  Typography,
  Link,
  useTheme
} from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? 'grey.900' : 'grey.50',
        color: isDarkMode ? 'grey.200' : 'grey.700',
        mt: 'auto'
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="body2">
          2025 TokenForge. Tous droits rservs
        </Typography>
        <Stack 
          direction="row" 
          spacing={3}
          sx={{
            '& > a': {
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }
          }}
        >
          <Link href="#">Accueil</Link>
          <Link href="#">Documentation</Link>
          <Link href="#">Contact</Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
