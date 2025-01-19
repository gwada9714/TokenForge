import { RouteObject } from 'react-router-dom';
import {
  LoginPage,
  SignUpPage,
  UnauthorizedPage,
  ConnectWalletPage,
  WrongNetworkPage,
} from '../../pages/auth';

export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'signup',
    element: <SignUpPage />,
  },
  {
    path: 'unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: 'connect-wallet',
    element: <ConnectWalletPage />,
  },
  {
    path: 'wrong-network',
    element: <WrongNetworkPage />,
  },
];
