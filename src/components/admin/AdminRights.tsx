import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

export interface AdminRightsProps {
  rights: string[];
  lastActivity: Date | null;
}

export const AdminRights: React.FC<AdminRightsProps> = ({ rights, lastActivity }) => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Droits d'administration
        </Typography>
        <Box>
          <Typography variant="body1">
            Rôles : {rights.length > 0 ? rights.join(', ') : 'Aucun droit'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dernière activité : {lastActivity ? lastActivity.toLocaleString() : 'Jamais'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
