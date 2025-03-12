import React from 'react';
import { logger } from '../core/logger';

/**
 * Guard diagnostique temporaire qui permet l'affichage des routes 
 * sans vérification d'authentification pour le débogage
 */
export const DiagnosticGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  logger.info({
    category: 'DiagnosticGuard',
    message: 'Guard de diagnostic activé - Autorisation automatique'
  });
  
  return <>{children}</>;
};

/**
 * Remplacement temporaire pour AuthGuard
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DiagnosticGuard>{children}</DiagnosticGuard>;
};

/**
 * Remplacement temporaire pour AdminGuard
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DiagnosticGuard>{children}</DiagnosticGuard>;
};

/**
 * Remplacement temporaire pour PublicGuard
 */
export const PublicGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DiagnosticGuard>{children}</DiagnosticGuard>;
};
