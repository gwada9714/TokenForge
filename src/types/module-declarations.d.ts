declare module "@/theme" {
  import { ReactNode } from "react";

  export interface ThemeProviderProps {
    children: ReactNode;
  }

  export const ThemeProvider: React.FC<ThemeProviderProps>;
}

declare module "@/store" {
  import { QueryClient } from "@tanstack/react-query";
  import { Store } from "@reduxjs/toolkit";

  export const store: Store;
  export const queryClient: QueryClient;
}
