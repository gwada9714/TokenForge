import React from 'react';
import { Box, Typography } from '@mui/material';
import { AdminDashboard } from '../../components/features/admin/AdminDashboard';
import { AdminErrorBoundary } from '../../components/features/admin/AdminErrorBoundary';
import { useAdminErrorHandler } from '../../hooks/useAdminErrorHandler';

/**
 * Page d'administration principale.
 * Affiche le tableau de bord d'administration avec gestion des erreurs.
 */
const AdminPage: React.FC = () => {
  const { handleError } = useAdminErrorHandler();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Administration
      </Typography>
      <AdminErrorBoundary>
        <AdminDashboard onError={handleError} />
      </AdminErrorBoundary>
    </Box>
  );
};

export default AdminPage;
