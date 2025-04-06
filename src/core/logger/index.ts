import { CentralLogger } from "./CentralLogger";

// Exporter l'instance singleton du logger central
export const logger = CentralLogger.getInstance();

// Ré-exporter les types
export { LogLevel, LogEntry, LoggerOptions, LogAdapter } from "./types";
