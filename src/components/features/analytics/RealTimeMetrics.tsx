import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import {
  Info as InfoIcon,
} from '@mui/icons-material';

export const RealTimeMetrics: React.FC = () => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'info.main',
        color: 'info.contrastText',
      }}
    >
      <Box sx={{ mr: 2 }}>
        <InfoIcon fontSize="large" />
      </Box>
      <Typography variant="h6">
        Platform statistics are currently being updated. Please check back later.
      </Typography>
    </Paper>
  );
};

export default RealTimeMetrics;
