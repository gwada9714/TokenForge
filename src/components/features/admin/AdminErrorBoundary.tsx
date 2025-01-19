import React from 'react';
import { useAdminErrorHandler } from '../../../hooks/useAdminErrorHandler';
import { AdminComponentProps } from './types';

interface AdminErrorBoundaryProps {
  children: React.ReactElement;
}

export const AdminErrorBoundary: React.FC<AdminErrorBoundaryProps> = ({ children }) => {
  const handleError = useAdminErrorHandler();

  // Clone l'élément enfant et injecte la prop onError
  const childWithErrorHandler = React.cloneElement(children, {
    onError: handleError
  } as AdminComponentProps);

  return childWithErrorHandler;
};
