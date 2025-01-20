import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RetryService, DEFAULT_RETRYABLE_ERRORS } from '../retryService';
import { AuthError } from '../../errors/AuthError';

describe('RetryService', () => {
  const retryConfig = {
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 1000,
    backoffFactor: 2
  };

  let service: RetryService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    service = RetryService.getInstance();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait réussir au premier essai', async () => {
    const operation = vi.fn().mockResolvedValueOnce('success');
    const result = await service.withRetry(() => operation(), retryConfig);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('devrait réessayer en cas d\'échec', async () => {
    const error = new AuthError(AuthError.CODES.PROVIDER_ERROR, 'Test error');
    const operation = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const result = await service.withRetry(
      () => operation(),
      retryConfig,
      DEFAULT_RETRYABLE_ERRORS
    );
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('devrait échouer après tous les essais', async () => {
    const originalError = new AuthError(AuthError.CODES.PROVIDER_ERROR, 'Test error');
    const operation = vi.fn().mockRejectedValue(originalError);

    await expect(service.withRetry(
      () => operation(),
      retryConfig,
      DEFAULT_RETRYABLE_ERRORS
    )).rejects.toEqual(
      new AuthError(
        AuthError.CODES.PROVIDER_ERROR,
        'Operation failed after 3 attempts',
        { originalError }
      )
    );

    expect(operation).toHaveBeenCalledTimes(retryConfig.maxAttempts);
  });

  it('devrait utiliser un délai exponentiel', async () => {
    const error = new AuthError(AuthError.CODES.PROVIDER_ERROR, 'Test error');
    const operation = vi.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    const retryPromise = service.withRetry(
      () => operation(),
      retryConfig,
      DEFAULT_RETRYABLE_ERRORS
    );
    
    // Premier échec
    await vi.advanceTimersByTimeAsync(retryConfig.initialDelay);
    expect(operation).toHaveBeenCalledTimes(2);

    // Deuxième échec
    await vi.advanceTimersByTimeAsync(retryConfig.initialDelay * retryConfig.backoffFactor);
    expect(operation).toHaveBeenCalledTimes(3);

    const result = await retryPromise;
    expect(result).toBe('success');
  });

  it('devrait échouer immédiatement pour les erreurs non retryables', async () => {
    const error = new AuthError(AuthError.CODES.SESSION_EXPIRED, 'Non retryable error');
    const operation = vi.fn().mockRejectedValue(error);

    await expect(service.withRetry(
      () => operation(),
      retryConfig,
      DEFAULT_RETRYABLE_ERRORS
    )).rejects.toThrow(error);

    expect(operation).toHaveBeenCalledTimes(1);
  });
});
