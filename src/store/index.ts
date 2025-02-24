import { configureStore } from '@reduxjs/toolkit';
import { QueryClient } from '@tanstack/react-query';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rtkQueryErrorLogger } from './middleware/error';
import authReducer from './slices/auth';
import uiReducer from './slices/ui';
import walletReducer from './slices/wallet';
import pricingReducer from './slices/pricing';

// Configure Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    wallet: walletReducer,
    pricing: pricingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(rtkQueryErrorLogger),
});

// Configure React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (remplace cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Reset store helper for testing
export const resetStore = () => {
  store.dispatch({ type: 'RESET_STORE' });
  queryClient.clear();
};

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
