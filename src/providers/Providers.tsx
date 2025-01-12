import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '../config/web3Config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider theme={lightTheme()} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}; 