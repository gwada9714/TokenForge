import React, { useState, useCallback } from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { AuthStatus } from '../types';
import { AuthError } from '../errors/AuthError';
import { AuthProgress } from './ui/AuthProgress';
import { AuthErrorDisplay } from './ui/AuthError';
import { AuthStatusBar } from './ui/AuthStatusBar';
import { AuthNotification } from './ui/AuthNotification';
import { AuthProgressIndicator } from './ui/AuthProgressIndicator';
import { AuthTransition } from './ui/AuthTransition';
import { LoginForm } from './LoginForm';
import { NetworkSelector } from './NetworkSelector';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';

interface AuthenticationUIProps {
  status: AuthStatus;
  error?: AuthError | null;
  walletAddress?: string | null;
  networkName?: string;
  onRetry?: () => void;
  onDismissError?: () => void;
}

export const AuthenticationUI: React.FC<AuthenticationUIProps> = ({
  status,
  error,
  walletAddress,
  networkName,
  onRetry,
  onDismissError
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { isAuthenticated, walletState, actions } = useTokenForgeAuth();
  const theme = useTheme();

  // Calculer l'étape actuelle en fonction de l'état
  React.useEffect(() => {
    if (!isAuthenticated) {
      setCurrentStep(0);
    } else if (!walletState.isConnected) {
      setCurrentStep(1);
    } else if (!walletState.isCorrectNetwork) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }
  }, [isAuthenticated, walletState]);

  const handleNotificationClose = useCallback(() => {
    setNotificationOpen(false);
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      await actions.login(email, password);
    } catch (err) {
      // Error handling is managed by useTokenForgeAuth
    }
  }, [actions]);

  React.useEffect(() => {
    if (error) {
      setNotificationOpen(true);
    }
  }, [error]);

  return (
    <Box 
      sx={{ 
        maxWidth: { xs: '100%', sm: 600 }, 
        mx: 'auto', 
        p: { xs: 1, sm: 2 },
        minHeight: '100vh'
      }}
      role="main"
      aria-live="polite"
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 0, sm: 1 }
        }}
      >
        <AuthTransition type="fade" in={true}>
          <AuthStatusBar 
            status={status}
            walletAddress={walletAddress}
            networkName={networkName}
          />
        </AuthTransition>
        
        <AuthTransition type="collapse" in={true}>
          <AuthProgressIndicator 
            status={status}
            currentStep={currentStep}
          />
        </AuthTransition>
        
        {error && (
          <AuthTransition type="grow" in={true}>
            <AuthErrorDisplay
              error={error}
              onRetry={onRetry}
              onDismiss={onDismissError}
            />
          </AuthTransition>
        )}
        
        <Box 
          sx={{ 
            my: 2,
            '& > *': { mb: 2 }
          }}
          role="region"
          aria-label="Authentication Form"
        >
          <AuthTransition type="fade" in={status === 'loading'}>
            <div>
              {status === 'loading' && <AuthProgress status={status} />}
            </div>
          </AuthTransition>
          
          <AuthTransition type="fade" in={!isAuthenticated}>
            <div>
              {!isAuthenticated && (
                <LoginForm
                  onSubmit={handleLogin}
                  isLoading={status === 'loading'}
                  error={error}
                />
              )}
            </div>
          </AuthTransition>
          
          <AuthTransition type="fade" in={isAuthenticated && !walletState.isConnected}>
            <div>
              {isAuthenticated && !walletState.isConnected && (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <AuthProgress status="verifying" />
                  <Box sx={{ mt: 2 }}>Connecting to wallet...</Box>
                </Box>
              )}
            </div>
          </AuthTransition>
          
          <AuthTransition type="fade" in={isAuthenticated && walletState.isConnected && !walletState.isCorrectNetwork}>
            <div>
              {isAuthenticated && walletState.isConnected && !walletState.isCorrectNetwork && (
                <NetworkSelector />
              )}
            </div>
          </AuthTransition>
        </Box>
      </Paper>

      <AuthNotification
        status={status}
        isOpen={notificationOpen}
        onClose={handleNotificationClose}
        severity={error ? 'error' : status === 'authenticated' ? 'success' : 'info'}
        autoHideDuration={6000}
      />
    </Box>
  );
};
