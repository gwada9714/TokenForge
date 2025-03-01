import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';

// Note: In a real application, you would use a charting library like recharts, chart.js, or visx
// This is a placeholder component that simulates charts with styled boxes

interface ChartContainerProps {
  title: string;
  height?: number;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  title, 
  height = 300, 
  children 
}) => {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height, width: '100%', mt: 2 }}>
        {children}
      </Box>
    </Paper>
  );
};

// Placeholder for a line chart
export const LineChartPlaceholder: React.FC = () => {
  return (
    <Box 
      sx={{ 
        height: '100%', 
        background: 'linear-gradient(45deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%, #e5e7eb 100%)',
        backgroundSize: '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Graphique linéaire (placeholder)
      </Typography>
    </Box>
  );
};

// Placeholder for a bar chart
export const BarChartPlaceholder: React.FC = () => {
  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        px: 2
      }}
    >
      {[40, 65, 30, 80, 55, 45, 70].map((height, index) => (
        <Box 
          key={index}
          sx={{ 
            height: `${height}%`, 
            width: '12%', 
            bgcolor: 'primary.main',
            opacity: 0.7 + (index * 0.05),
            borderRadius: '4px 4px 0 0'
          }}
        />
      ))}
    </Box>
  );
};

// Placeholder for a pie chart
export const PieChartPlaceholder: React.FC = () => {
  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box 
        sx={{ 
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'conic-gradient(#3f51b5 0% 25%, #f50057 25% 55%, #ff9800 55% 85%, #4caf50 85% 100%)'
        }}
      />
    </Box>
  );
};

interface DashboardChartsProps {
  isLoading?: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ isLoading = false }) => {
  if (isLoading) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Chargement des graphiques...
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <ChartContainer title="Activité des Tokens">
          <LineChartPlaceholder />
        </ChartContainer>
      </Grid>
      <Grid item xs={12} md={4}>
        <ChartContainer title="Distribution des Types">
          <PieChartPlaceholder />
        </ChartContainer>
      </Grid>
      <Grid item xs={12}>
        <ChartContainer title="Volume Mensuel">
          <BarChartPlaceholder />
        </ChartContainer>
      </Grid>
    </Grid>
  );
};
