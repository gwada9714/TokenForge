import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  setSelectedPlan,
  setCurrentPayment,
  addPaymentToHistory,
  setProcessing,
  setError,
  clearPayment,
} from "@/store/slices/pricing";
import { PaymentDetails, PlanType } from "../types/plans";

export const usePricingState = () => {
  const dispatch = useDispatch();
  const { selectedPlan, currentPayment, paymentHistory, isProcessing, error } =
    useSelector((state: RootState) => state.pricing);

  const selectPlan = (plan: PlanType) => {
    dispatch(setSelectedPlan(plan));
  };

  const updateCurrentPayment = (payment: PaymentDetails) => {
    dispatch(setCurrentPayment(payment));
  };

  const addToHistory = (payment: PaymentDetails) => {
    dispatch(addPaymentToHistory(payment));
  };

  const setPaymentProcessing = (processing: boolean) => {
    dispatch(setProcessing(processing));
  };

  const setPaymentError = (errorMessage: string) => {
    dispatch(setError(errorMessage));
  };

  const clearCurrentPayment = () => {
    dispatch(clearPayment());
  };

  return {
    // State
    selectedPlan,
    currentPayment,
    paymentHistory,
    isProcessing,
    error,

    // Actions
    selectPlan,
    updateCurrentPayment,
    addToHistory,
    setPaymentProcessing,
    setPaymentError,
    clearCurrentPayment,
  };
};
