import React from "react";
import { Paper, Typography } from "@mui/material";

export const AdminHeader: React.FC = () => {
  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Tableau de bord administrateur
      </Typography>
      <Typography color="textSecondary" paragraph>
        Gérez les paramètres du contrat, les alertes et consultez les logs
        d'audit.
      </Typography>
    </Paper>
  );
};
