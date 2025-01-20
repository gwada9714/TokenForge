import { describe, it, expect, vi, beforeEach } from 'vitest';
import { networkRetryService, RetryConfig } from '../networkRetryService';
import { notificationService } from '../notificationService';
import { logService } from '../logService';

vi.mock('../notificationService', () => ({
  notificationService: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('../logService');

describe('NetworkRetryService', () => {
  const mockConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 100,
    maxDelay: 1000,
    timeout: 500
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('devrait réussir au premier essai si l\'opération réussit', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await networkRetryService.retryWithTimeout(
      operation,
      mockConfig,
      'test operation'
    );

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
    expect(result.attempts).toBe(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('devrait réessayer en cas d\'échec et réussir éventuellement', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');

    const resultPromise = networkRetryService.retryWithTimeout(
      operation,
      mockConfig,
      'test operation'
    );

    // Avancer le temps pour les retries
    await vi.runAllTimersAsync();

    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
    expect(result.attempts).toBe(3);
    expect(operation).toHaveBeenCalledTimes(3);
    expect(notificationService.info).toHaveBeenCalledTimes(2);
  });

  it('devrait échouer après le nombre maximum de tentatives', async () => {
    const error = new Error('persistent failure');
    const operation = vi.fn().mockRejectedValue(error);

    const resultPromise = networkRetryService.retryWithTimeout(
      operation,
      mockConfig,
      'test operation'
    );

    // Avancer le temps pour les retries
    await vi.runAllTimersAsync();

    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
    expect(result.attempts).toBe(3);
    expect(operation).toHaveBeenCalledTimes(3);
    expect(logService.warn).toHaveBeenCalledTimes(3);
  });

  it('devrait échouer immédiatement en cas de timeout', async () => {
    const operation = vi.fn().mockImplementation(() => new Promise(resolve => {
      setTimeout(resolve, mockConfig.timeout + 100);
    }));

    const resultPromise = networkRetryService.retryWithTimeout(
      operation,
      mockConfig,
      'test operation'
    );

    // Avancer le temps jusqu'au timeout
    await vi.advanceTimersByTimeAsync(mockConfig.timeout);

    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('timeout');
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
