import { User } from "firebase/auth";

export enum SessionStatus {
  INITIALIZING = "INITIALIZING",
  AUTHENTICATED = "AUTHENTICATED",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  ERROR = "ERROR",
}

export interface SessionState {
  status: SessionStatus;
  user: User | null;
  error?: Error;
  lastUpdated?: number;
}

export interface AuthError extends Error {
  code?: string;
  originalError?: unknown;
}

export interface SessionEventPayload {
  type: "SESSION_CHANGED" | "SESSION_ERROR";
  state: SessionState;
}

export type SessionEventListener = (payload: SessionEventPayload) => void;
