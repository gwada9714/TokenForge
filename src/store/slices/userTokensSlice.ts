import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import { getUserTokens } from "../../services/tokenService";

export interface UserToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  chainId: number;
  balance: string;
}

export interface UserTokensState {
  tokens: UserToken[];
  loading: boolean;
  error: string | null;
}

const initialState: UserTokensState = {
  tokens: [],
  loading: false,
  error: null,
};

export const userTokensSlice = createSlice({
  name: "userTokens",
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<UserTokensState["tokens"]>) => {
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
    addToken: (state, action: PayloadAction<UserToken>) => {
      state.tokens.push(action.payload);
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.tokens = state.tokens.filter(
        (token) => token.address !== action.payload
      );
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
  clearTokens,
} = userTokensSlice.actions;

export const fetchUserTokens =
  (address: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const tokens = await getUserTokens(address);
      dispatch(setTokens(tokens));
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to fetch tokens"
        )
      );
    }
  };

export default userTokensSlice.reducer;
