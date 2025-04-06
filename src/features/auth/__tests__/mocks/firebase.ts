import { vi } from "vitest";

export const mockFirebaseAuth = {
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  currentUser: null,
};

export const mockFirebaseUser = {
  uid: "test-uid",
  email: "test@example.com",
  emailVerified: true,
  metadata: {
    creationTime: "2025-01-21T01:42:10Z",
    lastSignInTime: "2025-01-21T01:42:10Z",
  },
};

export const mockAuthError = {
  code: "auth/invalid-credential",
  message: "Invalid credentials",
};
