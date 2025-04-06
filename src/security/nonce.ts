import crypto from "crypto";

export const generateNonce = () => {
  return crypto.randomBytes(16).toString("base64");
};

export function validateNonce(nonce: string): boolean {
  // Vérifie que le nonce est une chaîne base64 valide de 24 caractères
  const base64Regex = /^[A-Za-z0-9+/]{22}==$/;
  return base64Regex.test(nonce);
}
