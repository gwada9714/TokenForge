import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, SessionInfo } from '../schemas/auth.schema';
import { AuthErrorCode } from '../errors/AuthError';

export type AuthError = {
  code: keyof typeof AuthErrorCode;
  message: string;
};

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  sessionInfo: null,
  error: undefined
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = undefined;
    },
    setSessionInfo: (state, action: PayloadAction<SessionInfo | null>) => {
      state.sessionInfo = action.payload;
    },
    setAuthError: (state, action: PayloadAction<AuthError>) => {
      state.error = action.payload;
      if (action.payload.code === 'USER_NOT_FOUND') {
        state.isAuthenticated = false;
        state.user = null;
        state.sessionInfo = null;
      }
    },
    clearAuthError: (state) => {
      state.error = undefined;
    },
    resetAuthState: () => initialState
  }
});

export const {
  setAuthLoading,
  setAuthUser,
  setSessionInfo,
  setAuthError,
  clearAuthError,
  resetAuthState
} = authSlice.actions;

export default authSlice.reducer;
