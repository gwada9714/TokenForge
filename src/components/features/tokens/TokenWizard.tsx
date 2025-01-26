import { Box, Typography, Button } from '@mui/material';

const TokenWizard = () => {
  return (
    <Box>
      <Typography variant="h4" style={{ color: '#182038' }}>
        Token Wizard
      </Typography>
      <Typography variant="body1" style={{ color: '#666' }}>
        Here you can create new tokens!
      </Typography>
      <Button variant="contained" style={{ backgroundColor: '#D97706', color: '#FFFFFF' }}>
        Create Token
      </Button>
    </Box>
  );
};

export default TokenWizard;
