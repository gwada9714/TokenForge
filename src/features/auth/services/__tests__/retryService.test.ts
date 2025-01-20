import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RetryService } from '../retryService';

describe('RetryService', () => {
  let retryService: RetryService;

  beforeEach(() => {
    vi.useFakeTimers();
    retryService = RetryService.getInstance();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('devrait réussir au premier essai', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const operation = async () => mockFn();
    const result = await retryService.withRetry(operation, {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2
    });

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('devrait réessayer après une erreur', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');
    const operation = async () => mockFn();

    const retryPromise = retryService.withRetry(operation, {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2
    });

    await vi.advanceTimersByTimeAsync(1000);
    const result = await retryPromise;

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('devrait échouer après tous les essais', async () => {
    const mockError = new Error('fail');
    const mockFn = vi.fn().mockRejectedValue(mockError);
    const operation = async () => mockFn();

    const retryPromise = retryService.withRetry(operation, {
      maxAttempts: 2,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2
    });

    await vi.advanceTimersByTimeAsync(2000);
    await expect(retryPromise).rejects.toThrow(mockError);
    expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('devrait utiliser un délai exponentiel', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValueOnce('success');
    const operation = async () => mockFn();

    const retryPromise = retryService.withRetry(operation, {
      maxAttempts: 2,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2
    });

    // Premier retry après 1000ms
    await vi.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Deuxième retry après 2000ms supplémentaires
    await vi.advanceTimersByTimeAsync(2000);
    const result = await retryPromise;

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
