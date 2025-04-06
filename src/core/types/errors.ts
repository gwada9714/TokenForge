export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class FirebaseServiceError extends Error {
  constructor(public service: string, public originalError: unknown) {
    super(
      `Service ${service} error: ${
        originalError instanceof Error
          ? originalError.message
          : String(originalError)
      }`
    );
    this.name = "FirebaseServiceError";
  }
}
