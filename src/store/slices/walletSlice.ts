import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WalletState } from "../types";

const initialState: WalletState = {
  address: null,
  chainId: null,
  isConnected: false,
  balance: "0",
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
      state.isConnected = !!action.payload;
    },
    setChainId: (state, action: PayloadAction<number | null>) => {
      state.chainId = action.payload;
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.chainId = null;
      state.isConnected = false;
      state.balance = "0";
    },
  },
});

export const { setWalletAddress, setChainId, setBalance, disconnectWallet } =
  walletSlice.actions;

export default walletSlice.reducer;
