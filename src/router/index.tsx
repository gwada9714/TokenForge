import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Dashboard from '@/components/Dashboard/Dashboard';
import CreateToken from '@/components/CreateToken/CreateToken';
import StakingDashboard from '@/components/Staking/StakingDashboard';
import Layout from '@/components/Layout/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Outlet /></Layout>,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/create',
        element: <CreateToken />,
      },
      {
        path: '/staking',
        element: <StakingDashboard />,
      },
    ],
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
