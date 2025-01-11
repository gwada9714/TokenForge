import { ReactNode } from "react";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../config/wagmi";

interface Web3ProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
};
