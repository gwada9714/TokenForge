import { create } from "zustand";

interface GlobalLoadingState {
  isLoading: boolean;
  message: string;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useGlobalLoading = create<GlobalLoadingState>((set) => ({
  isLoading: false,
  message: "",
  setLoading: (loading: boolean, message: string = "Chargement en cours...") =>
    set({ isLoading: loading, message: loading ? message : "" }),
}));
