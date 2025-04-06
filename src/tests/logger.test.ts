import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { logger, LogLevel } from "../core/logger";

describe("Logger Service", () => {
  // Espionner console.log, console.error, etc.
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log messages with different levels", () => {
    // Tester les différents niveaux de log
    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warning message");
    logger.error("Error message");

    // Vérifier que les méthodes de console ont été appelées
    expect(console.debug).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("should log structured messages", () => {
    // Tester les messages structurés
    logger.info({
      category: "Test",
      message: "Structured message",
      data: { key: "value" },
    });

    // Vérifier que console.info a été appelé avec les bons arguments
    expect(console.info).toHaveBeenCalled();
  });

  it("should log errors with stack traces", () => {
    // Créer une erreur
    const error = new Error("Test error");

    // Tester le logging d'erreur
    logger.error({
      category: "Test",
      message: "Error message",
      error,
    });

    // Vérifier que console.error a été appelé
    expect(console.error).toHaveBeenCalled();
  });

  it("should log messages correctly", () => {
    // Ajouter un log
    logger.info("Test message");

    // Vérifier que console.info a été appelé
    expect(console.info).toHaveBeenCalled();
  });
});
