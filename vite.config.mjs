import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  build: {
    chunkSizeWarningLimit: 1000, // Ajustez cette valeur selon vos besoins
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Grouper les dépendances React ensemble
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            // Grouper les dépendances MUI ensemble
            if (id.includes("@mui")) {
              return "mui-vendor";
            }
            // Grouper les dépendances liées à Ethereum/Web3
            if (id.includes("ethers") || id.includes("web3")) {
              return "web3-vendor";
            }
          }
        },
      },
    },
  },
});
