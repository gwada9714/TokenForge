import { configureStore } from '@reduxjs/toolkit';
import tokenCreationReducer from './slices/tokenCreationSlice';
import uiReducer from './slices/uiSlice';
import walletReducer from './slices/walletSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from './types';

export const store = configureStore({
  reducer: {
    tokenCreation: tokenCreationReducer,
    ui: uiReducer,
    wallet: walletReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore ces actions pour la vérification de sérialisation
        ignoredActions: ['tokenCreation/updateTokenConfig'],
        // Ignore ces chemins d'état pour la vérification de sérialisation
        ignoredPaths: ['tokenCreation.tokenConfig.liquidityLock.unlockDate']
      }
    })
});

// Types pour useDispatch et useSelector typés
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
