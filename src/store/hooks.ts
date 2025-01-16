import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from './types';
import { AppDispatch } from './store';

// Hooks typés pour utiliser dispatch et selector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Hook personnalisé pour la création de token
export const useTokenCreation = () => {
  const tokenCreation = useAppSelector(state => state.tokenCreation);
  const dispatch = useAppDispatch();

  return {
    ...tokenCreation,
    dispatch
  };
};

// Hook personnalisé pour l'UI
export const useUI = () => {
  const ui = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  return {
    ...ui,
    dispatch
  };
};

// Hook personnalisé pour le wallet
export const useWallet = () => {
  const wallet = useAppSelector(state => state.wallet);
  const dispatch = useAppDispatch();

  return {
    ...wallet,
    dispatch
  };
};
