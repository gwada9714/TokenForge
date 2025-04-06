import { ReactNode, useEffect } from "react";
import { WagmiConfig } from "wagmi";
import { mainnet, polygon } from "viem/chains";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
  wallet,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { isAllowedWalletExtension } from "../../utils/security";
import { http } from "viem";

const WALLET_CONNECT_PROJECT_ID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID;

if (!WALLET_CONNECT_PROJECT_ID) {
  throw new Error("VITE_WALLET_CONNECT_PROJECT_ID is required");
}

interface Web3ProvidersProps {
  children: ReactNode;
  autoConnect?: boolean;
}

// Configuration des wallets supportés
const connectors = connectorsForWallets([
  {
    groupName: "Recommandés",
    wallets: [
      wallet.metaMask({ projectId: WALLET_CONNECT_PROJECT_ID }),
      wallet.walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }),
      wallet.coinbase(),
      wallet.trust({ projectId: WALLET_CONNECT_PROJECT_ID }),
    ],
  },
]);

// Configuration avec RainbowKit
const config = getDefaultConfig({
  appName: "TokenForge",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, polygon],
  ssr: false,
  connectors,
  transports: {
    [mainnet.id]: http(
      `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`
    ),
    [polygon.id]: http(
      `https://polygon-mainnet.infura.io/v3/${
        import.meta.env.VITE_INFURA_PROJECT_ID
      }`
    ),
  },
});

const initializeProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = window.ethereum;

    provider.on("disconnect", (error: Error) => {
      // Attendre un peu avant de recharger pour laisser le temps aux états de se mettre à jour
      setTimeout(() => window.location.reload(), 3000);
    });

    provider.on("chainChanged", () => {
      window.location.reload();
    });

    provider.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        // Tentative de reconnexion automatique
        if (window.ethereum?.request) {
          window.ethereum
            .request({ method: "eth_requestAccounts" })
            .catch((err) =>
              console.error("Erreur de reconnexion automatique:", err)
            );
        }
      }
    });

    return provider;
  }
  return null;
};

export function Web3Providers({
  children,
  autoConnect = true,
}: Web3ProvidersProps) {
  useEffect(() => {
    // Initialisation du provider
    const provider = initializeProvider();

    // Tentative de connexion automatique si activée
    const attemptAutoConnect = async () => {
      if (autoConnect && window.ethereum?.request) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
          console.warn("Échec de la connexion automatique:", error);
        }
      }
    };

    // Vérification de la sécurité des extensions
    const checkWalletSecurity = () => {
      if (typeof window !== "undefined" && "chrome" in window) {
        const installedExtensions = Object.keys(
          (window as any).chrome?.runtime?.connect || {}
        );
        installedExtensions.forEach((extensionId) => {
          if (!isAllowedWalletExtension(extensionId)) {
            console.warn(
              `Extension wallet non autorisée détectée: ${extensionId}`
            );
          }
        });
      }
    };

    checkWalletSecurity();
    attemptAutoConnect();

    // Cleanup
    return () => {
      if (provider) {
        provider.removeListener("disconnect", () => {});
        provider.removeListener("chainChanged", () => {});
        provider.removeListener("accountsChanged", () => {});
      }
    };
  }, [autoConnect]);

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        theme={darkTheme()}
        modalSize="compact"
        showRecentTransactions={true}
        appInfo={{
          appName: "TokenForge",
          learnMoreUrl: "https://docs.tokenforge.com",
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
