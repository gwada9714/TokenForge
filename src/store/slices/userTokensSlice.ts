import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserTokensState {
  tokens: Array<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    chainId: number;
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: UserTokensState = {
  tokens: [],
  loading: false,
  error: null,
};

export const userTokensSlice = createSlice({
  name: 'userTokens',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<UserTokensState['tokens']>) => {
      state.tokens = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addToken: (state, action: PayloadAction<UserTokensState['tokens'][0]>) => {
      state.tokens.push(action.payload);
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter(token => token.address !== action.payload);
    },
    clearTokens: (state) => {
      state.tokens = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setTokens, 
  setLoading, 
  setError, 
  addToken, 
  removeToken, 
  clearTokens 
} = userTokensSlice.actions;

export default userTokensSlice.reducer;
