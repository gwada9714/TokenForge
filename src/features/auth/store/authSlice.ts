import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, SessionInfo } from '../schemas/auth.schema';
import { AUTH_ERROR_CODES } from '../errors/AuthError';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  sessionInfo: null,
  error: null
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
      state.error = null;
    },
    setSessionInfo: (state, action: PayloadAction<SessionInfo | null>) => {
      state.sessionInfo = action.payload;
    },
    setAuthError: (state, action: PayloadAction<{ code: keyof typeof AUTH_ERROR_CODES; message: string }>) => {
      state.error = action.payload;
      if (action.payload.code === AUTH_ERROR_CODES.SESSION_EXPIRED) {
        state.isAuthenticated = false;
        state.user = null;
        state.sessionInfo = null;
      }
    },
    clearAuthError: (state) => {
      state.error = null;
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
