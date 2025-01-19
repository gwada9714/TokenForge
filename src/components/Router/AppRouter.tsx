import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes, RouteConfig } from '../../config/routes';
import { Layout } from '../Layout';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Box, CircularProgress } from '@mui/material';

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const RouteElement: React.FC<{ route: RouteConfig }> = ({ route }) => {
  const Component = route.component;
  let element = (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

  if (route.protected) {
    element = (
      <ProtectedRoute requireAdmin={route.requireAdmin ?? false}>
        <>{element}</>
      </ProtectedRoute>
    );
  }

  if (route.layout) {
    element = <Layout>{element}</Layout>;
  }

  return element;
};

const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map((route) => (
    <React.Fragment key={route.path}>
      <Route
        path={route.path}
        element={<RouteElement route={route} />}
      />
      {route.children && renderRoutes(route.children)}
    </React.Fragment>
  ));
};

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {renderRoutes(routes)}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
