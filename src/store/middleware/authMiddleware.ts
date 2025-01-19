import { Middleware } from '@reduxjs/toolkit';
import { setAuthenticated, setAddress } from '../slices/authSlice';

export const authMiddleware: Middleware = store => next => action => {
  // Actions spécifiques à Wagmi que nous voulons intercepter
  if (action.type === 'wagmi/account/connect') {
    store.dispatch(setAuthenticated(true));
    store.dispatch(setAddress(action.payload.address));
  }
  
  if (action.type === 'wagmi/account/disconnect') {
    store.dispatch(setAuthenticated(false));
    store.dispatch(setAddress(null));
  }

  return next(action);
};
