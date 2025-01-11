import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi/react";

const projectId = process.env.VITE_WALLET_CONNECT_PROJECT_ID;
const alchemyId = process.env.VITE_ALCHEMY_API_KEY;

if (!projectId) {
  throw new Error("Missing VITE_WALLET_CONNECT_PROJECT_ID");
}

if (!alchemyId) {
  throw new Error("Missing VITE_ALCHEMY_API_KEY");
}

const metadata = {
  name: "TokenForge",
  description: "Create and manage your own tokens",
  url: "https://tokenforge.app",
  icons: ["https://tokenforge.app/logo.png"],
};

export const chains = [mainnet, sepolia] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: false,
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyId}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`),
  },
});

export { mainnet, sepolia };
