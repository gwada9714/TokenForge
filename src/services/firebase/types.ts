export interface FirebaseError extends Error {
  code: string;
  customData?: {
    [key: string]: any;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: Error | null;
}

export interface FirebaseInitOptions {
  enablePersistence?: boolean;
  useEmulator?: boolean;
}
