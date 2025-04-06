import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  address: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAdmin: false,
  address: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.address = null;
    },
  },
});

export const { setAuthenticated, setAdmin, setAddress, logout } =
  authSlice.actions;

export default authSlice.reducer;
