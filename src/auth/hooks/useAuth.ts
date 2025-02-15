import { useState, useEffect } from 'react';
import { authService } from '../services/AuthService';
import { AuthState } from '../types/auth.types';

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>(initialState);

  // ...existing code...

  return {
    ...state,
    login,
    logout
  };
};
