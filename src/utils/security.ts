import crypto from "crypto";

/**
 * Génère un hash SHA-256 pour un contenu donné
 */
export function generateHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("base64");
}

/**
 * Vérifie si une extension de wallet est autorisée
 */
export function isAllowedWalletExtension(extensionId: string): boolean {
  const allowedExtensions = [
    "nkbihfbeogaeaoehlefnkodbefgpgknn", // MetaMask
    "dngmlblcodfobpdpecaadgfbcggfjfnm", // Phantom
    // Ajouter d'autres extensions au besoin
  ];
  return allowedExtensions.includes(extensionId);
}

/**
 * Vérifie si une URL est autorisée pour les connexions wallet
 */
export function isAllowedWalletUrl(url: string): boolean {
  const allowedDomains = ["walletconnect.org", "infura.io", "alchemyapi.io"];
  try {
    const hostname = new URL(url).hostname;
    return allowedDomains.some((domain) => hostname.endsWith(domain));
  } catch {
    return false;
  }
}
