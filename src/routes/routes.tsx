import React from 'react';
import { Layout } from '../components/Layout';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // ...existing routes...
    ]
  }
];
