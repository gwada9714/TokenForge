import { configureStore } from '@reduxjs/toolkit';
import tokenCreationReducer from './slices/tokenCreationSlice';
import uiReducer from './slices/uiSlice';
import walletReducer from './slices/walletSlice';
import analyticsReducer from './slices/analyticsSlice';
import userTokensReducer from './slices/userTokensSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    tokenCreation: tokenCreationReducer,
    ui: uiReducer,
    wallet: walletReducer,
    analytics: analyticsReducer,
    userTokens: userTokensReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tokenCreation/updateTokenConfig'],
        ignoredPaths: ['tokenCreation.tokenConfig.liquidityLock.unlockDate']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
