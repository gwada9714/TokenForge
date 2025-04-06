import { configureStore } from "@reduxjs/toolkit";
import tokenCreationReducer from "./slices/tokenCreationSlice";
import uiReducer from "./slices/uiSlice";
import walletReducer from "./slices/walletSlice";
import analyticsReducer from "./slices/analyticsSlice";
import userTokensReducer from "./slices/userTokensSlice";
import authReducer from "./slices/authSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authMiddleware } from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    tokenCreation: tokenCreationReducer,
    ui: uiReducer,
    wallet: walletReducer,
    analytics: analyticsReducer,
    userTokens: userTokensReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "tokenCreation/updateTokenConfig",
          "wagmi/account/connect",
          "wagmi/account/disconnect",
        ],
        ignoredPaths: ["tokenCreation.tokenConfig.liquidityLock.unlockDate"],
      },
    }).concat(authMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {tokenCreation: TokenCreationState, ui: UiState, ...}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
