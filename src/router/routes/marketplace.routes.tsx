import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../features/auth';

// Placeholder components until they are implemented
const MarketplaceDashboard: React.FC = () => (
  <div>
    <h1>Marketplace Dashboard</h1>
    <p>Browse and trade tokens.</p>
  </div>
);

const ListingDetails: React.FC = () => (
  <div>
    <h1>Listing Details</h1>
    <p>View detailed information about this listing.</p>
  </div>
);

const CreateListing: React.FC = () => (
  <div>
    <h1>Create Listing</h1>
    <p>Create a new marketplace listing.</p>
  </div>
);

export const marketplaceRoutes: RouteObject[] = [
  {
    path: 'marketplace',
    element: (
      <ProtectedRoute requireWallet requireCorrectNetwork>
        <MarketplaceDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'marketplace/:listingId',
    element: (
      <ProtectedRoute requireWallet requireCorrectNetwork>
        <ListingDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: 'marketplace/create',
    element: (
      <ProtectedRoute requireWallet requireCorrectNetwork>
        <CreateListing />
      </ProtectedRoute>
    ),
  },
];
