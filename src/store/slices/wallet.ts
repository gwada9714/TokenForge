import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

const initialState: WalletState = {
  address: null,
  chainId: null,
  balance: null,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWallet: (
      state,
      action: PayloadAction<{ address: string; chainId: number }>
    ) => {
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.isConnecting = false;
      state.error = null;
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    disconnect: (state) => {
      state.address = null;
      state.chainId = null;
      state.balance = null;
      state.isConnecting = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
  },
});

export const { setWallet, setBalance, setConnecting, disconnect, setError } =
  walletSlice.actions;

export default walletSlice.reducer;
