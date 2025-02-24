import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '@/services/auth/AuthService';
import { TokenService } from '@/services/auth/TokenService';
import { SecurityService } from '@/services/security/SecurityService';
import { UserService } from '@/services/user/UserService';
import { AuthError } from '@/types/errors';

describe('Authentication Security', () => {
  let authService: AuthService;
  let tokenService: TokenService;
  let securityService: SecurityService;
  let userService: UserService;

  const mockUser = {
    email: 'test@example.com',
    password: 'StrongP@ssw0rd123!'
  };

  beforeEach(() => {
    authService = new AuthService();
    tokenService = new TokenService();
    securityService = new SecurityService();
    userService = new UserService();

    // Reset des compteurs de tentatives
    securityService.resetAttempts(mockUser.email);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Validation des Tokens JWT', () => {
    it('devrait valider un token JWT valide', async () => {
      const token = await tokenService.generateToken(mockUser);
      const isValid = await tokenService.verifyToken(token);
      
      expect(isValid).toBe(true);
      expect(tokenService.getTokenPayload(token)).toEqual(
        expect.objectContaining({
          email: mockUser.email,
          iat: expect.any(Number),
          exp: expect.any(Number)
        })
      );
    });

    it('devrait rejeter un token JWT expiré', async () => {
      vi.useFakeTimers();
      const token = await tokenService.generateToken(mockUser);
      
      // Avancer le temps de 2h (après expiration)
      vi.advanceTimersByTime(2 * 60 * 60 * 1000);
      
      await expect(tokenService.verifyToken(token))
        .rejects.toThrow('Token expiré');
    });

    it('devrait rejeter un token JWT invalide', async () => {
      const invalidToken = 'invalid.token.here';
      await expect(tokenService.verifyToken(invalidToken))
        .rejects.toThrow('Token invalide');
    });
  });

  describe('Gestion des Sessions', () => {
    it('devrait gérer correctement l\'expiration des sessions', async () => {
      const session = await authService.createSession(mockUser);
      expect(session.isActive()).toBe(true);

      vi.advanceTimersByTime(24 * 60 * 60 * 1000); // 24h
      expect(session.isActive()).toBe(false);
    });

    it('devrait limiter le nombre de sessions actives par utilisateur', async () => {
      const maxSessions = 5;
      const sessions = [];

      // Créer plus que le maximum de sessions autorisées
      for (let i = 0; i < maxSessions + 2; i++) {
        sessions.push(await authService.createSession(mockUser));
      }

      const activeSessions = await authService.getActiveSessions(mockUser.email);
      expect(activeSessions.length).toBeLessThanOrEqual(maxSessions);
    });

    it('devrait révoquer toutes les sessions lors d\'un changement de mot de passe', async () => {
      // Créer plusieurs sessions
      await authService.createSession(mockUser);
      await authService.createSession(mockUser);
      
      // Changer le mot de passe
      await userService.updatePassword(mockUser.email, 'NewStrongP@ssw0rd123!');
      
      const activeSessions = await authService.getActiveSessions(mockUser.email);
      expect(activeSessions.length).toBe(0);
    });
  });

  describe('Limitation des Tentatives', () => {
    it('devrait bloquer après plusieurs tentatives échouées', async () => {
      const maxAttempts = 5;
      
      // Simuler des tentatives échouées
      for (let i = 0; i < maxAttempts; i++) {
        try {
          await authService.login(mockUser.email, 'wrongpassword');
        } catch (error) {
          expect(error).toBeInstanceOf(AuthError);
        }
      }

      // La prochaine tentative devrait être bloquée
      await expect(
        authService.login(mockUser.email, mockUser.password)
      ).rejects.toThrow('Compte temporairement bloqué');
    });

    it('devrait réinitialiser le compteur après un délai', async () => {
      const maxAttempts = 5;
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      
      // Simuler des tentatives échouées
      for (let i = 0; i < maxAttempts; i++) {
        try {
          await authService.login(mockUser.email, 'wrongpassword');
        } catch (error) {
          expect(error).toBeInstanceOf(AuthError);
        }
      }

      // Avancer le temps après la période de blocage
      vi.advanceTimersByTime(lockoutDuration);

      // La connexion devrait maintenant fonctionner
      const result = await authService.login(mockUser.email, mockUser.password);
      expect(result).toBeDefined();
    });

    it('devrait notifier les tentatives suspectes', async () => {
      const notifySpy = vi.spyOn(securityService, 'notifySuspiciousActivity');
      
      // Simuler des tentatives depuis différentes IPs
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
      
      for (const ip of ips) {
        try {
          await authService.login(mockUser.email, 'wrongpassword', { ip });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthError);
        }
      }

      expect(notifySpy).toHaveBeenCalled();
      expect(notifySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'multiple_failed_attempts',
          user: mockUser.email,
          ips: expect.arrayContaining(ips)
        })
      );
    });
  });

  describe('Validation des Mots de Passe', () => {
    it('devrait rejeter les mots de passe faibles', async () => {
      const weakPasswords = [
        'password123',
        '12345678',
        'qwerty',
        mockUser.email, // même que l'email
        'Password' // pas assez complexe
      ];

      for (const password of weakPasswords) {
        await expect(
          authService.register({
            email: mockUser.email,
            password
          })
        ).rejects.toThrow('Mot de passe trop faible');
      }
    });

    it('devrait empêcher la réutilisation des anciens mots de passe', async () => {
      // Créer un compte
      await authService.register(mockUser);

      // Changer le mot de passe plusieurs fois
      const passwords = [
        'StrongP@ssw0rd123!_1',
        'StrongP@ssw0rd123!_2',
        'StrongP@ssw0rd123!_3'
      ];

      for (const password of passwords) {
        await userService.updatePassword(mockUser.email, password);
      }

      // Essayer de réutiliser un ancien mot de passe
      await expect(
        userService.updatePassword(mockUser.email, mockUser.password)
      ).rejects.toThrow('Ce mot de passe a déjà été utilisé');
    });
  });

  describe('Protection contre les Attaques', () => {
    it('devrait détecter les tentatives de force brute', async () => {
      const detectSpy = vi.spyOn(securityService, 'detectBruteForce');
      
      // Simuler des tentatives rapides
      for (let i = 0; i < 10; i++) {
        try {
          await authService.login(mockUser.email, `wrongpassword${i}`);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthError);
        }
      }

      expect(detectSpy).toHaveBeenCalled();
      expect(detectSpy).toHaveReturnedWith(true);
    });

    it('devrait bloquer les IPs suspectes', async () => {
      const suspiciousIP = '192.168.1.100';
      
      // Marquer l'IP comme suspecte
      await securityService.markIPAsSuspicious(suspiciousIP);

      // La tentative de connexion depuis cette IP devrait être bloquée
      await expect(
        authService.login(mockUser.email, mockUser.password, { ip: suspiciousIP })
      ).rejects.toThrow('IP bloquée');
    });

    it('devrait valider les en-têtes CSRF', async () => {
      const csrfToken = await securityService.generateCSRFToken();
      
      // Requête sans token CSRF
      await expect(
        authService.login(mockUser.email, mockUser.password, { csrfToken: undefined })
      ).rejects.toThrow('Token CSRF manquant');

      // Requête avec token CSRF invalide
      await expect(
        authService.login(mockUser.email, mockUser.password, { csrfToken: 'invalid' })
      ).rejects.toThrow('Token CSRF invalide');

      // Requête avec token CSRF valide
      const result = await authService.login(mockUser.email, mockUser.password, { csrfToken });
      expect(result).toBeDefined();
    });
  });
}); 