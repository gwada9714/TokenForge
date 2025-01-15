import { createBrowserRouter, Outlet } from 'react-router-dom';
import Layout from '../components/Layout';
import { TokenList, TokenDetails, CreateToken } from '../pages';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { getRouterOptions } from '../router/config';

const routes = [
  {
    path: '/',
    element: <Layout>
      <Outlet />
    </Layout>,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'tokens',
        element: <TokenList />
      },
      {
        path: 'tokens/:address',
        element: <TokenDetails />
      },
      {
        path: 'create',
        element: <CreateToken />
      }
    ]
  }
];

export const router = createBrowserRouter(routes, getRouterOptions());