import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { config, chains } from '../config/wagmiConfig';
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProvidersProps {
  children: React.ReactNode;
}

export const Web3Providers: React.FC<Web3ProvidersProps> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider 
        chains={[...chains]} 
        theme={lightTheme({
          accentColor: '#7b3fe4',
          borderRadius: 'medium',
        })}
        showRecentTransactions={true}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
