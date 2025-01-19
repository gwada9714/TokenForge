import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../features/auth';

// Placeholder components until they are implemented
const TokenDashboard: React.FC = () => (
  <div>
    <h1>Token Dashboard</h1>
    <p>View and manage your tokens.</p>
  </div>
);

const TokenDetails: React.FC = () => (
  <div>
    <h1>Token Details</h1>
    <p>View detailed information about your token.</p>
  </div>
);

const CreateToken: React.FC = () => (
  <div>
    <h1>Create Token</h1>
    <p>Create a new token.</p>
  </div>
);

export const tokenRoutes: RouteObject[] = [
  {
    path: 'tokens',
    element: (
      <ProtectedRoute requireWallet requireCorrectNetwork>
        <TokenDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'tokens/:tokenId',
    element: (
      <ProtectedRoute requireWallet requireCorrectNetwork>
        <TokenDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: 'tokens/create',
    element: (
      <ProtectedRoute requireWallet requireCorrectNetwork>
        <CreateToken />
      </ProtectedRoute>
    ),
  },
];
