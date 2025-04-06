import { Box, Typography, Button } from "@mui/material";

const StakingDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" style={{ color: "#182038" }}>
        Staking Dashboard
      </Typography>
      <Typography variant="body1" style={{ color: "#666" }}>
        Here you can stake your tokens and earn rewards!
      </Typography>
      <Button
        variant="contained"
        style={{ backgroundColor: "#D97706", color: "#FFFFFF" }}
      >
        Start Staking
      </Button>
    </Box>
  );
};

export default StakingDashboard;
