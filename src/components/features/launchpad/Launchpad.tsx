import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";

const Launchpad: React.FC = () => {
  const theme = useTheme();

  const projects = [
    {
      name: "Project Alpha",
      description: "Une nouvelle plateforme DeFi révolutionnaire",
      progress: 75,
      raised: "150,000",
      goal: "200,000",
      startDate: "2025-02-01",
      endDate: "2025-02-15",
    },
    {
      name: "Beta Chain",
      description: "Solution de scalabilité Layer 2",
      progress: 45,
      raised: "900,000",
      goal: "2,000,000",
      startDate: "2025-02-10",
      endDate: "2025-03-10",
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 6 }}>
        <Typography
          component={motion.h1}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          variant="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Launchpad TokenForge
        </Typography>

        <Grid container spacing={4}>
          {projects.map((project, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    transition: "transform 0.3s ease-in-out",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                  </Typography>

                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(0,0,0,0.1)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {project.raised} USDT
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.goal} USDT
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Début
                      </Typography>
                      <Typography variant="body2">
                        {project.startDate}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Fin
                      </Typography>
                      <Typography variant="body2">{project.endDate}</Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: "auto",
                      textTransform: "none",
                      borderRadius: 2,
                    }}
                  >
                    Participer
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Launchpad;
