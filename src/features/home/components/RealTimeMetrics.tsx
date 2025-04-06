import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import CountUp from "react-countup";

const MetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}10, transparent)`,
    opacity: 0.1,
  },
}));

interface Metric {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

const initialMetrics: Metric[] = [
  { label: "Tokens Créés", value: 0, suffix: "+" },
  { label: "Volume Total", value: 0, prefix: "$", suffix: "M" },
  { label: "Utilisateurs Actifs", value: 0, suffix: "K" },
  { label: "Transactions", value: 0, suffix: "K" },
];

export const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);

  useEffect(() => {
    // Simuler des mises à jour en temps réel
    const updateMetrics = () => {
      setMetrics([
        {
          label: "Tokens Créés",
          value: Math.floor(Math.random() * 500 + 1000),
          suffix: "+",
        },
        {
          label: "Volume Total",
          value: Math.floor(Math.random() * 50 + 100),
          prefix: "$",
          suffix: "M",
        },
        {
          label: "Utilisateurs Actifs",
          value: Math.floor(Math.random() * 20 + 50),
          suffix: "K",
        },
        {
          label: "Transactions",
          value: Math.floor(Math.random() * 100 + 200),
          suffix: "K",
        },
      ]);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid item xs={6} md={3} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <MetricCard>
              <Typography
                variant="h4"
                color="primary"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                {metric.prefix}
                <CountUp
                  end={metric.value}
                  separator=" "
                  duration={2.5}
                  useEasing
                />
                {metric.suffix}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {metric.label}
              </Typography>
            </MetricCard>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};
