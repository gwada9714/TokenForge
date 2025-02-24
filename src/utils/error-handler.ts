export class FirebaseError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FirebaseError';
  }

  toLog(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
      timestamp: new Date()
    };
  }
}

export const handleFirebaseError = (error: unknown): FirebaseError => {
  if (error instanceof FirebaseError) {
    return error;
  }

  if (error instanceof Error) {
    return new FirebaseError(
      'UNKNOWN_ERROR',
      error.message,
      { originalError: error.name, stack: error.stack }
    );
  }

  return new FirebaseError(
    'UNEXPECTED_ERROR',
    'Une erreur inattendue est survenue',
    { error }
  );
};
