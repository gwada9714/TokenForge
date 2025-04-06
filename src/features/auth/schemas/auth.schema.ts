import { z } from "zod";
import { AUTH_ERROR_CODES } from "../errors/AuthError";

// Schéma de base pour les timestamps
const timestampSchema = z.number().int().positive();

// Schéma pour les métadonnées personnalisées
const customMetadataSchema = z.record(z.unknown());

// Schéma pour les informations de session
export const sessionInfoSchema = z.object({
  expiresAt: timestampSchema.describe("Timestamp d'expiration de la session"),
  lastActivity: timestampSchema.describe("Dernier timestamp d'activité"),
  refreshToken: z.string().nullable().describe("Token de rafraîchissement"),
  tabId: z.string().optional().describe("ID de l'onglet actif"),
  lastSync: timestampSchema
    .optional()
    .describe("Dernier timestamp de synchronisation"),
});

// Schéma pour l'utilisateur
export const userSchema = z.object({
  uid: z.string().min(1).describe("Identifiant unique de l'utilisateur"),
  email: z.string().email().nullable().describe("Email de l'utilisateur"),
  emailVerified: z.boolean().describe("État de vérification de l'email"),
  isAdmin: z
    .boolean()
    .optional()
    .describe("Indique si l'utilisateur est administrateur"),
  customMetadata: customMetadataSchema
    .optional()
    .describe("Métadonnées personnalisées"),
});

// Schéma pour l'état d'authentification stocké
export const storedAuthStateSchema = z.object({
  version: z.number().int().positive().describe("Version du schéma de données"),
  timestamp: timestampSchema.describe("Timestamp de la dernière modification"),
  account: z.string().nullable().describe("Compte actif"),
  lastProvider: z
    .string()
    .nullable()
    .describe("Dernier fournisseur d'authentification utilisé"),
  trustedDevices: z
    .array(z.string())
    .optional()
    .describe("Liste des appareils de confiance"),
  sessionExpiry: timestampSchema
    .optional()
    .describe("Timestamp d'expiration de la session"),
  sessionInfo: sessionInfoSchema.optional().describe("Informations de session"),
  user: userSchema.nullable().describe("Informations de l'utilisateur"),
  lastLogin: timestampSchema.describe("Timestamp de la dernière connexion"),
});

// Schéma pour l'état d'authentification Redux
export const authStateSchema = z.object({
  isAuthenticated: z.boolean().describe("État d'authentification"),
  isLoading: z.boolean().describe("État de chargement"),
  user: userSchema.nullable().describe("Informations de l'utilisateur"),
  sessionInfo: sessionInfoSchema.nullable().describe("Informations de session"),
  error: z
    .object({
      code: z.nativeEnum(AUTH_ERROR_CODES).optional().describe("Code d'erreur"),
      message: z.string().optional().describe("Message d'erreur"),
    })
    .optional()
    .describe("Dernière erreur survenue"),
});

// Types générés à partir des schémas
export type SessionInfo = z.infer<typeof sessionInfoSchema>;
export type User = z.infer<typeof userSchema>;
export type StoredAuthState = z.infer<typeof storedAuthStateSchema>;
export type AuthState = z.infer<typeof authStateSchema>;

// Validateurs
export const validateSessionInfo = (data: unknown): SessionInfo => {
  return sessionInfoSchema.parse(data);
};

export const validateUser = (data: unknown): User => {
  return userSchema.parse(data);
};

export const validateStoredAuthState = (data: unknown): StoredAuthState => {
  return storedAuthStateSchema.parse(data);
};

export const validateAuthState = (data: unknown): AuthState => {
  return authStateSchema.parse(data);
};

// Fonctions utilitaires de validation partielle
export const validatePartialUser = (data: unknown): Partial<User> => {
  return userSchema.partial().parse(data);
};

export const validatePartialSessionInfo = (
  data: unknown
): Partial<SessionInfo> => {
  return sessionInfoSchema.partial().parse(data);
};
