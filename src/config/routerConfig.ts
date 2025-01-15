import React from 'react';
import { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';
import CreateToken from '../pages/CreateToken';
import TokenDetails from '../pages/TokenDetails';
import { TokenList } from '../pages/TokenList';
import Plans from '../pages/Plans';
import Launchpad from '../pages/Launchpad';
import Staking from '../pages/Staking';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: React.createElement(Home),
  },
  {
    path: '/create',
    element: React.createElement(CreateToken),
  },
  {
    path: '/tokens',
    element: React.createElement(TokenList),
  },
  {
    path: '/token/:address',
    element: React.createElement(TokenDetails),
  },
  {
    path: '/plans',
    element: React.createElement(Plans),
  },
  {
    path: '/launchpad',
    element: React.createElement(Launchpad),
  },
  {
    path: '/staking',
    element: React.createElement(Staking),
  },
];
