import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { TokenList, TokenDetails } from '../pages';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import CreateTokenWizard from '../pages/CreateToken/CreateTokenWizard';
import ProfitDashboardPage from '../pages/Dashboard/ProfitDashboardPage';
import Plans from '../pages/Plans';
import LaunchpadPage from '../pages/Launchpad';
import AdminDashboard from '../pages/admin/AdminDashboard';

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
        path: 'plans',
        element: <Plans />
      },
      {
        path: 'launchpad',
        element: <LaunchpadPage />
      },
      {
        path: 'create-token',
        element: <CreateTokenWizard />
      },
      {
        path: 'profit-dashboard',
        element: <ProfitDashboardPage />
      },
      {
        path: 'admin',
        element: <AdminDashboard />
      }
    ]
  }
];

export const router = createBrowserRouter(routes);