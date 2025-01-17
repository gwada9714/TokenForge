import React from 'react';
import AdminDashboard from '../components/Admin/AdminDashboard';
import { useAccount } from 'wagmi';
import { Alert, Container } from '@mui/material';

const AdminPage: React.FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Veuillez connecter votre wallet pour accéder à l'interface d'administration.
        </Alert>
      </Container>
    );
  }

  return <AdminDashboard />;
};

export default AdminPage;
