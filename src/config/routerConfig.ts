import { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';
import CreateToken from '../pages/CreateToken';
import TokenDetails from '../pages/TokenDetails';
import TokenList from '../pages/TokenList';
import Plans from '../pages/Plans';
import Launchpad from '../pages/Launchpad';
import Staking from '../pages/Staking';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/create',
    element: <CreateToken />,
  },
  {
    path: '/tokens',
    element: <TokenList />,
  },
  {
    path: '/token/:address',
    element: <TokenDetails />,
  },
  {
    path: '/plans',
    element: <Plans />,
  },
  {
    path: '/launchpad',
    element: <Launchpad />,
  },
  {
    path: '/staking',
    element: <Staking />,
  },
];
