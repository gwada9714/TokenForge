import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../services/AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = AuthService.getInstance();
  });

  it('should be a singleton', () => {
    const instance2 = AuthService.getInstance();
    expect(authService).toBe(instance2);
  });

  // Ajoutez d'autres tests selon vos besoins
});
