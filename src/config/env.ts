export const ENV = {
  SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
  SEPOLIA_PRIVATE_KEY: process.env.SEPOLIA_PRIVATE_KEY || "",
} as const;

// Vérification des variables d'environnement requises
if (!ENV.SEPOLIA_PRIVATE_KEY) {
  console.warn(
    "⚠️ La clé privée Sepolia n'est pas configurée dans le fichier .env"
  );
}

if (!ENV.SEPOLIA_RPC_URL) {
  console.warn(
    "⚠️ L'URL RPC Sepolia n'est pas configurée dans le fichier .env"
  );
}
