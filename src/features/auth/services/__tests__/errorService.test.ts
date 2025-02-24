import { errorService } from '../errorService';
import { AUTH_ERROR_CODES } from '../../types';

describe('ErrorService', () => {
  describe('handleError', () => {
    it('should handle Firebase errors', () => {
      const firebaseError = {
        name: 'FirebaseError',
        code: 'auth/user-not-found',
        message: 'User not found',
      };

      const result = errorService.handleError(firebaseError);

      expect(result.code).toBe(AUTH_ERROR_CODES.FIREBASE_ERROR);
      expect(result.details?.originalError).toBe(firebaseError.code);
      expect(result.message).toContain('compte trouvé'); // Message en français par défaut
    });

    it('should handle wallet errors', () => {
      const walletError = new Error('MetaMask wallet not found');
      const result = errorService.handleError(walletError);

      expect(result.code).toBe(AUTH_ERROR_CODES.WALLET_NOT_FOUND);
      expect(result.details?.originalError).toBe(walletError.message);
    });

    it('should handle network errors', () => {
      const networkError = new Error('Wrong network chain');
      const result = errorService.handleError(networkError);

      expect(result.code).toBe(AUTH_ERROR_CODES.NETWORK_MISMATCH);
      expect(result.details?.originalError).toBe(networkError.message);
    });

    it('should handle signature errors', () => {
      const signatureError = new Error('Invalid signature provided');
      const result = errorService.handleError(signatureError);

      expect(result.code).toBe(AUTH_ERROR_CODES.INVALID_SIGNATURE);
      expect(result.details?.originalError).toBe(signatureError.message);
    });

    it('should handle unknown errors', () => {
      const unknownError = 'Something went wrong';
      const result = errorService.handleError(unknownError);

      expect(result.code).toBe(AUTH_ERROR_CODES.PROVIDER_ERROR);
      expect(result.details?.originalError).toBe(String(unknownError));
    });
  });

  describe('Localization', () => {
    it('should handle French locale', () => {
      errorService.setLocale('fr');
      const error = errorService.handleError(new Error('MetaMask wallet not found'));
      expect(error.message).toContain('Portefeuille');
    });

    it('should handle English locale', () => {
      errorService.setLocale('en');
      const error = errorService.handleError(new Error('MetaMask wallet not found'));
      expect(error.message).toContain('Wallet');
    });
  });

  describe('Error Serialization', () => {
    it('should properly serialize errors to JSON', () => {
      const error = errorService.handleError(new Error('test error'));
      const serialized = error.toJSON();

      expect(serialized).toHaveProperty('name', 'AuthError');
      expect(serialized).toHaveProperty('message');
      expect(serialized).toHaveProperty('code');
      expect(serialized).toHaveProperty('details');
    });
  });
});
