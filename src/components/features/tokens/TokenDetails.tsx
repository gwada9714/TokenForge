import { Box, Typography } from '@mui/material';

const TokenDetails = () => {
  return (
    <Box>
      <Typography variant="h4" style={{ color: '#182038' }}>
        Token Details
      </Typography>
      <Typography variant="body1" style={{ color: '#666' }}>
        Here you can view the details of a specific token!
      </Typography>
    </Box>
  );
};

export default TokenDetails;
