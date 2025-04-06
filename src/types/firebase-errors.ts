import { FirebaseError } from "firebase/app";

export interface FirebaseServiceError extends Error {
  code?: string;
  originalError: FirebaseError | Error;
  service: string;
  timestamp: number;
}

export class ServiceError implements FirebaseServiceError {
  public name: string = "ServiceError";
  public timestamp: number;

  constructor(
    public message: string,
    public service: string,
    public originalError: FirebaseError | Error,
    public code?: string
  ) {
    this.timestamp = Date.now();
  }
}
