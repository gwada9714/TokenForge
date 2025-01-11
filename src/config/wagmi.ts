import { http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

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

export const chains = [sepolia] as const;

export const config = getDefaultConfig({
  appName: "TokenForge",
  projectId: projectId as string,
  chains,
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`),
  },
});

export { sepolia };
