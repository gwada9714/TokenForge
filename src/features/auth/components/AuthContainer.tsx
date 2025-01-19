import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import { useAuthManager } from '../hooks/useAuthManager';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { AuthButton } from './AuthButton';
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
  spacing?: number;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  requiredChainId,
  variant = 'contained',
  size = 'medium',
  showNetworkSelector = true,
  requireEmailVerification = true,
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

  return (
    <Box>
      <Stack direction="row" spacing={spacing} alignItems="center">
        <AuthButton
          requiredChainId={requiredChainId}
          variant={variant}
          size={size}
        />
        {showNetworkSelector && (
          <NetworkSelector
            variant={variant === 'contained' ? 'outlined' : variant}
            size={size}
          />
        )}
      </Stack>
      <AuthFeedback
        error={error}
        onClose={handleErrorClose}
      />
      <EmailVerification
        open={showEmailVerification}
        onClose={handleEmailVerificationClose}
      />
    </Box>
  );
};
