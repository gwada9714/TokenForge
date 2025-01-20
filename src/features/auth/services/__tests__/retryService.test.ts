import { retryService } from '../retryService';
import { AuthError } from '../../errors/AuthError';

describe('RetryService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt if operation succeeds', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await retryService.withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed eventually', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new AuthError(AuthError.CODES.PROVIDER_ERROR, 'Failed'))
        .mockRejectedValueOnce(new AuthError(AuthError.CODES.PROVIDER_ERROR, 'Failed'))
        .mockResolvedValue('success');

      const result = await retryService.withRetry(
        operation,
        { maxAttempts: 3, initialDelay: 100 },
        [AuthError.CODES.PROVIDER_ERROR]
      );

      expect(operation).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');
    });

    it('should throw after max attempts', async () => {
      const operation = jest.fn()
        .mockRejectedValue(new AuthError(AuthError.CODES.PROVIDER_ERROR, 'Failed'));

      await expect(retryService.withRetry(
        operation,
        { maxAttempts: 2, initialDelay: 100 },
        [AuthError.CODES.PROVIDER_ERROR]
      )).rejects.toThrow('Operation failed after 2 attempts');

      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValue(new AuthError(AuthError.CODES.SESSION_EXPIRED, 'Not retryable'));

      await expect(retryService.withRetry(
        operation,
        { maxAttempts: 3, initialDelay: 100 },
        [AuthError.CODES.PROVIDER_ERROR]
      )).rejects.toThrow('Not retryable');

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('withTimeout', () => {
    it('should resolve if operation completes within timeout', async () => {
      const operation = Promise.resolve('success');
      
      const result = await retryService.withTimeout(operation, 1000, 'test');
      
      expect(result).toBe('success');
    });

    it('should reject if operation exceeds timeout', async () => {
      const operation = new Promise(resolve => setTimeout(resolve, 2000));
      
      const timeoutPromise = retryService.withTimeout(operation, 1000, 'test');
      
      jest.advanceTimersByTime(1001);
      
      await expect(timeoutPromise).rejects.toThrow('Operation test timed out after 1000ms');
    });
  });

  describe('exponential backoff', () => {
    it('should increase delay exponentially but not exceed maxDelay', async () => {
      const operation = jest.fn()
        .mockRejectedValue(new AuthError(AuthError.CODES.PROVIDER_ERROR, 'Failed'));

      const config = {
        maxAttempts: 4,
        initialDelay: 100,
        maxDelay: 300,
        backoffFactor: 2
      };

      try {
        await retryService.withRetry(
          operation,
          config,
          [AuthError.CODES.PROVIDER_ERROR]
        );
      } catch (error) {
        // Expected to fail
      }

      // Vérifier les délais entre les tentatives
      expect(setTimeout).toHaveBeenCalledTimes(3); // 3 délais pour 4 tentatives
      expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 100);
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 200);
      expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 300); // Plafonné à maxDelay
    });
  });
});
