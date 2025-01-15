import React, { useTransition } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../Header';
import { Container, LinearProgress } from '@mui/material';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (to: string) => {
    startTransition(() => {
      navigate(to);
    });
  };

  return (
    <>
      <Header onNavigate={handleNavigation} />
      {isPending && <LinearProgress />}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </>
  );
};