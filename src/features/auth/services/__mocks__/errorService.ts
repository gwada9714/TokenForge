import { createAuthError } from '../../errors/AuthError';

class MockErrorService {
  private static instance: MockErrorService;

  private constructor() {}

  static getInstance(): MockErrorService {
    if (!MockErrorService.instance) {
      MockErrorService.instance = new MockErrorService();
    }
    return MockErrorService.instance;
  }

  handleAuthError(_error: unknown) {
    return createAuthError('AUTH_016', 'Mock error');
  }

  handleWalletError(_error: unknown) {
    return createAuthError('AUTH_009', 'Mock wallet error');
  }

  createAuthError(code: string, message: string) {
    return createAuthError(code as any, message);
  }
}

export const errorService = MockErrorService.getInstance();
