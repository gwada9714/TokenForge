import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaymentDetails, PlanType } from "@/features/pricing/types/plans";

interface PricingState {
  selectedPlan: PlanType | null;
  currentPayment: PaymentDetails | null;
  paymentHistory: PaymentDetails[];
  isProcessing: boolean;
  error: string | null;
}

const initialState: PricingState = {
  selectedPlan: null,
  currentPayment: null,
  paymentHistory: [],
  isProcessing: false,
  error: null,
};

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    setSelectedPlan: (state, action: PayloadAction<PlanType>) => {
      state.selectedPlan = action.payload;
      state.error = null;
    },
    setCurrentPayment: (state, action: PayloadAction<PaymentDetails>) => {
      state.currentPayment = action.payload;
      state.error = null;
    },
    addPaymentToHistory: (state, action: PayloadAction<PaymentDetails>) => {
      state.paymentHistory.push(action.payload);
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
    },
    clearPayment: (state) => {
      state.currentPayment = null;
      state.error = null;
      state.isProcessing = false;
    },
    resetState: () => initialState,
  },
});

export const {
  setSelectedPlan,
  setCurrentPayment,
  addPaymentToHistory,
  setProcessing,
  setError,
  clearPayment,
  resetState,
} = pricingSlice.actions;

export default pricingSlice.reducer;
