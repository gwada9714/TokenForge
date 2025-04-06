import { Box, Typography, Grid, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord TokenForge
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper
            component={Link}
            to="/dashboard/staking"
            sx={{
              p: 3,
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Staking Dashboard
            </Typography>
            <Typography color="text.secondary">
              Gérez vos tokens stakés et suivez vos récompenses
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            component={Link}
            to="/dashboard/profit"
            sx={{
              p: 3,
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Profit Dashboard
            </Typography>
            <Typography color="text.secondary">
              Suivez vos profits et analysez vos performances
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
