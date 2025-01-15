import React from 'react';
import { Routes, Route, useRoutes } from 'react-router-dom';
import { routes } from '../../config/routerConfig';

const AppRouter: React.FC = () => {
  return useRoutes(routes);
};

export default AppRouter;
