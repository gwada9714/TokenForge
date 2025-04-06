import { ConfigService } from "./ConfigService";

// Exporter l'instance singleton du service de configuration
export const configService = ConfigService.getInstance();

// Exporter les types
export * from "./types";

// Exporter le service de configuration
export { ConfigService };
