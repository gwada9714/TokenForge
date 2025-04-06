import { ErrorCode } from "../errors/AuthError";
import { AuthStatus } from "../types";

export const messages = {
  fr: {
    errors: {
      AUTH_001: "Wallet non détecté. Veuillez installer MetaMask.",
      AUTH_002: "Réseau incorrect. Veuillez changer de réseau.",
      AUTH_003: "Signature invalide. Veuillez réessayer.",
      AUTH_004: "Session expirée. Veuillez vous reconnecter.",
      AUTH_005: "Erreur d'authentification. Veuillez réessayer.",
      AUTH_006: "Authentification à deux facteurs requise.",
      AUTH_007: "Code 2FA invalide. Veuillez réessayer.",
      AUTH_008: "Wallet déconnecté. Veuillez vous reconnecter.",
      AUTH_009: "Erreur du provider. Veuillez réessayer.",
      AUTH_010: "Email non vérifié. Veuillez vérifier votre email.",
      AUTH_011: "Délai de vérification d'email dépassé.",
      AUTH_012: "Utilisateur non trouvé.",
      AUTH_013: "Erreur de stockage. Veuillez réessayer.",
    } as Record<ErrorCode, string>,

    status: {
      idle: "En attente",
      loading: "Chargement...",
      authenticated: "Connecté",
      unauthenticated: "Non connecté",
      verifying: "Vérification en cours...",
      error: "Une erreur est survenue",
    } as Record<AuthStatus, string>,

    actions: {
      login: "Se connecter",
      logout: "Se déconnecter",
      retry: "Réessayer",
      cancel: "Annuler",
      confirm: "Confirmer",
    },
  },
};
