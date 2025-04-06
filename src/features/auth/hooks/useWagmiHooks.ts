import { useWalletClient, useAccount, useChainId, useConnect } from "wagmi";

export function useWagmiHooks() {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { connect } = useConnect();

  return {
    walletClient,
    address,
    isConnected,
    connector,
    chain: chainId ? { id: chainId } : null,
    switchNetwork: async ({ chainId }: { chainId: number }) => {
      // Implémentation de switchNetwork avec wagmi
      console.log("Switching to chain:", chainId);
    },
  };
}
