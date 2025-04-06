import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initializeFirebaseServices,
  getFirebaseServices,
} from "../../config/firebase";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { initializeApp } from "firebase/app";

// Mock Firebase modules
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "test-app" })),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  setPersistence: vi.fn(),
  browserLocalPersistence: "local",
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
}));

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(() => ({})),
}));

vi.mock("firebase/performance", () => ({
  getPerformance: vi.fn(() => ({})),
}));

describe("Firebase Configuration", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset modules after each test
    vi.resetModules();
  });

  it("should initialize Firebase services successfully", async () => {
    const services = await initializeFirebaseServices();

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    });

    expect(getAuth).toHaveBeenCalled();
    expect(getFirestore).toHaveBeenCalled();
    expect(getFunctions).toHaveBeenCalled();
    expect(getPerformance).toHaveBeenCalled();
    expect(setPersistence).toHaveBeenCalledWith(
      expect.anything(),
      browserLocalPersistence
    );

    expect(services).toHaveProperty("app");
    expect(services).toHaveProperty("auth");
    expect(services).toHaveProperty("firestore");
    expect(services).toHaveProperty("functions");
    expect(services).toHaveProperty("performance");
  });

  it("should return the same instance when called multiple times", async () => {
    const services1 = await initializeFirebaseServices();
    const services2 = await initializeFirebaseServices();

    expect(services1).toBe(services2);
    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it("should throw error when getting services before initialization", () => {
    expect(() => getFirebaseServices()).toThrow(
      "Firebase services not initialized"
    );
  });
});
