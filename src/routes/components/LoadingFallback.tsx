import React from 'react';
import { CircularProgress } from '@mui/material';

export const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <CircularProgress className="text-primary" />
  </div>
);
