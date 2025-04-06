import { describe, it, expect, vi } from "vitest";
import { FirebaseDiagnosticsService } from "../../utils/firebase-diagnostics";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { Functions } from "firebase/functions";
import { Performance } from "firebase/performance";

describe("FirebaseDiagnosticsService", () => {
  const diagnostics = new FirebaseDiagnosticsService();

  describe("getAuthStatus", () => {
    it("should return INITIALIZED when auth is provided", () => {
      const mockAuth = {} as Auth;
      expect(diagnostics.getAuthStatus(mockAuth)).toBe("INITIALIZED");
    });

    it("should return NOT_INITIALIZED when auth is null", () => {
      expect(diagnostics.getAuthStatus(null)).toBe("NOT_INITIALIZED");
    });
  });

  describe("getFirestoreStatus", () => {
    it("should return INITIALIZED when firestore is provided", () => {
      const mockFirestore = {} as Firestore;
      expect(diagnostics.getFirestoreStatus(mockFirestore)).toBe("INITIALIZED");
    });

    it("should return NOT_INITIALIZED when firestore is null", () => {
      expect(diagnostics.getFirestoreStatus(null)).toBe("NOT_INITIALIZED");
    });
  });

  describe("getFunctionsStatus", () => {
    it("should return INITIALIZED when functions is provided", () => {
      const mockFunctions = {} as Functions;
      expect(diagnostics.getFunctionsStatus(mockFunctions)).toBe("INITIALIZED");
    });

    it("should return NOT_INITIALIZED when functions is null", () => {
      expect(diagnostics.getFunctionsStatus(null)).toBe("NOT_INITIALIZED");
    });
  });

  describe("getPerformanceStatus", () => {
    it("should return INITIALIZED when performance is provided", () => {
      const mockPerformance = {} as Performance;
      expect(diagnostics.getPerformanceStatus(mockPerformance)).toBe(
        "INITIALIZED"
      );
    });

    it("should return NOT_INITIALIZED when performance is null", () => {
      expect(diagnostics.getPerformanceStatus(null)).toBe("NOT_INITIALIZED");
    });
  });

  describe("getEnvironmentInfo", () => {
    it("should return environment information", () => {
      const envInfo = diagnostics.getEnvironmentInfo();
      expect(envInfo).toHaveProperty("environment");
      expect(envInfo).toHaveProperty("apiUrl");
    });
  });

  describe("getConfigurationStatus", () => {
    it("should return configuration status", () => {
      const configStatus = diagnostics.getConfigurationStatus();
      expect(configStatus).toHaveProperty("hasApiKey");
      expect(configStatus).toHaveProperty("hasAuthDomain");
      expect(configStatus).toHaveProperty("hasProjectId");
    });
  });
});
