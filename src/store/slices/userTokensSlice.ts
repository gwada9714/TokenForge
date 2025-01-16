import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TokenInfo, fetchTokens } from '../../services/tokenService';

interface UserTokensState {
  tokens: TokenInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: UserTokensState = {
  tokens: [],
  loading: false,
  error: null
};

export const fetchUserTokens = createAsyncThunk(
  'userTokens/fetchUserTokens',
  async (address: string) => {
    const tokens = await fetchTokens(address);
    return tokens;
  }
);

const userTokensSlice = createSlice({
  name: 'userTokens',
  initialState,
  reducers: {
    clearTokens: (state) => {
      state.tokens = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTokens.fulfilled, (state, action: PayloadAction<TokenInfo[]>) => {
        state.tokens = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  }
});

export const { clearTokens } = userTokensSlice.actions;
export default userTokensSlice.reducer;
