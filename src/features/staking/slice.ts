import { createSlice } from "@reduxjs/toolkit";

interface StakingState {
  // Ajoutez vos propriétés d'état ici
  isLoading: boolean;
}

const initialState: StakingState = {
  isLoading: false,
};

const stakingSlice = createSlice({
  name: "staking",
  initialState,
  reducers: {
    // Ajoutez vos reducers ici
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = stakingSlice.actions;
export default stakingSlice.reducer;
