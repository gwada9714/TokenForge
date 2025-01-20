import { useReducer, useCallback, useEffect } from 'react';
import { TokenForgeUser } from '../types';
import { errorService } from '../services/errorService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { sessionService } from '../services/sessionService';
import { emailVerificationService } from '../services/emailVerificationService';
import { tokenRefreshService } from '../services/tokenRefreshService';
import { auth } from '../../../config/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { authReducer, initialState } from '../reducers/authReducer';
import { authActions } from '../actions/authActions';

export function useAuthState() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const handleLogin = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      dispatch(authActions.loginStart());
      
      const storedData = await storageService.getUserData(firebaseUser.uid);
      const user = convertToTokenForgeUser(firebaseUser, storedData || undefined);
      
      dispatch(authActions.loginSuccess(user));
      
      if (!user.emailVerified) {
        notificationService.warning('Please verify your email address');
      }
    } catch (error) {
      const authError = errorService.handleError(error);
      dispatch(authActions.loginFailure(authError));
      notificationService.error(authError.message);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      await storageService.clearUserData();
      dispatch(authActions.logout());
      notificationService.info('Logged out successfully');
    } catch (error) {
      const authError = errorService.handleError(error);
      dispatch(authActions.setError(authError));
      notificationService.error(authError.message);
    }
  }, []);

  const verifyEmail = useCallback(async () => {
    if (!state.user) return;
    
    try {
      dispatch(authActions.startEmailVerification());
      const result = await emailVerificationService.sendVerificationEmail(state.user);
      if (result) {
        dispatch(authActions.emailVerificationSuccess());
        notificationService.success('Verification email sent');
      }
    } catch (error) {
      const authError = errorService.handleError(error);
      dispatch(authActions.emailVerificationFailure(authError));
      notificationService.error(authError.message);
    }
  }, [state.user]);

  const refreshSession = useCallback(async () => {
    if (!state.user) return;
    
    try {
      const newToken = await tokenRefreshService.refreshToken();
      dispatch(authActions.setStatus('authenticated'));
      sessionService.updateSession(newToken);
    } catch (error) {
      const authError = errorService.handleError(error);
      dispatch(authActions.setError(authError));
      sessionService.clearSession();
    }
  }, [state.user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await handleLogin(firebaseUser);
      } else {
        dispatch(authActions.logout());
      }
    });

    return () => unsubscribe();
  }, [handleLogin]);

  useEffect(() => {
    if (!state.user) return;

    const sessionTimeout = sessionService.startSessionTimeout(() => {
      dispatch(authActions.setStatus('unauthenticated'));
      notificationService.warning('Session expired. Please login again.');
    });

    return () => sessionTimeout.clear();
  }, [state.user]);

  return {
    ...state,
    login: handleLogin,
    logout: handleLogout,
    verifyEmail,
    refreshSession,
  };
}

function convertToTokenForgeUser(
  firebaseUser: FirebaseUser,
  storedData?: { isAdmin?: boolean; customMetadata?: Record<string, unknown> }
): TokenForgeUser {
  return {
    ...firebaseUser,
    isAdmin: storedData?.isAdmin || false,
    customMetadata: storedData?.customMetadata || {},
  } as TokenForgeUser;
}
