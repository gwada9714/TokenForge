import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Typography, Paper } from '@mui/material';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6">Create New Token</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/tokens/create')}
            >
              Create Token
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;