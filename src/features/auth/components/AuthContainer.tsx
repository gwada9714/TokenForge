import React, { useState, useEffect } from 'react';
import { Box, Stack, Divider, Typography } from '@mui/material';
import { useAuthManager } from '../hooks/useAuthManager';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { AuthButton } from './AuthButton';
import { GoogleAuthButton } from './GoogleAuthButton';
import { NetworkSelector } from './NetworkSelector';
import { AuthFeedback } from './AuthFeedback';
import { EmailVerification } from './EmailVerification';
import { SupportedChainId } from '../hooks/useNetworkManagement';

interface AuthContainerProps {
  requiredChainId?: SupportedChainId;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  showNetworkSelector?: boolean;
  requireEmailVerification?: boolean;
  showGoogleAuth?: boolean;
  spacing?: number;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  requiredChainId,
  variant = 'contained',
  size = 'medium',
  showNetworkSelector = true,
  requireEmailVerification = true,
  showGoogleAuth = true,
  spacing = 2,
}) => {
  const { error: walletError, resetError: resetWalletError } = useAuthManager(requiredChainId);
  const { session, error: firebaseError } = useFirebaseAuth();
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Gérer l'affichage de la vérification d'email
  useEffect(() => {
    if (session) {
      setShowEmailVerification(requireEmailVerification && !session.emailVerified);
    }
  }, [session, requireEmailVerification]);

  const handleErrorClose = () => {
    resetWalletError();
  };

  const handleEmailVerificationClose = () => {
    setShowEmailVerification(false);
  };

  const error = walletError || firebaseError;

  // Ne pas afficher le bouton Google si l'utilisateur est déjà connecté
  const showGoogleButton = showGoogleAuth && !session?.provider;

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <Stack spacing={3}>
        {/* Section Wallet */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Connect with Wallet
          </Typography>
          <Stack direction="row" spacing={spacing} alignItems="center">
            <AuthButton
              requiredChainId={requiredChainId}
              variant={variant}
              size={size}
              fullWidth
            />
            {showNetworkSelector && (
              <NetworkSelector
                variant={variant === 'contained' ? 'outlined' : variant}
                size={size}
              />
            )}
          </Stack>
        </Box>

        {/* Section Google */}
        {showGoogleButton && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 1 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                or continue with
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Stack>

            <GoogleAuthButton
              variant={variant}
              size={size}
              fullWidth
            />
          </Box>
        )}
      </Stack>

      {/* Feedback et Vérification */}
      <Box sx={{ mt: 2 }}>
        <AuthFeedback
          error={error}
          onClose={handleErrorClose}
        />
        <EmailVerification
          open={showEmailVerification}
          onClose={handleEmailVerificationClose}
        />
      </Box>
    </Box>
  );
};
