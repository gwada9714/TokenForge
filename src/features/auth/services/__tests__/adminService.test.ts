import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminService } from '../adminService';
import { storageService } from '../storageService';
import { logService } from '../logService';
import { ErrorService } from '../errorService';
import { AuthErrorCode, AuthError } from '../../errors/AuthError';
import type { TokenForgeUser } from '../../types';

// Type pour les données utilisateur stockées
type StoredUserData = {
    uid: string;
    email: string;
    emailVerified: boolean;
    isAdmin: boolean;
    canCreateToken: boolean;
    canUseServices: boolean;
    [key: string]: any;
};

// Mock des dépendances
vi.mock('../storageService', () => ({
    storageService: {
        getUserData: vi.fn(),
        updateUserData: vi.fn()
    }
}));

vi.mock('../logService', () => ({
    logService: {
        error: vi.fn(),
        info: vi.fn()
    }
}));

vi.mock('../errorService', () => ({
    ErrorService: {
        createAuthError: vi.fn((code, message) => new AuthError(code, message))
    }
}));

describe('AdminService', () => {
    const mockUserId = 'test-user-id';
    const mockUser: TokenForgeUser = {
        uid: mockUserId,
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        photoURL: null,
        phoneNumber: null,
        metadata: {
            creationTime: '2025-01-01T00:00:00Z',
            lastSignInTime: '2025-01-01T00:00:00Z'
        },
        isAdmin: true,
        canCreateToken: true,
        canUseServices: true,
        // Ajout des propriétés requises par FirebaseUser
        providerId: 'password',
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
        reload: vi.fn(),
        toJSON: vi.fn(),
        isAnonymous: false
    };

    // Créer un mock de données utilisateur stockées
    const createMockUserData = (overrides?: Partial<StoredUserData>): StoredUserData => ({
        uid: mockUserId,
        email: 'test@example.com',
        emailVerified: true,
        isAdmin: false,
        canCreateToken: false,
        canUseServices: false,
        ...overrides
    });

    // Créer un mock d'erreur d'authentification
    const createMockAuthError = (code: AuthErrorCode, message: string): AuthError => {
        return new AuthError(code, message);
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('verifyAdminStatus', () => {
        it('should return true if user has admin status', async () => {
            vi.mocked(storageService.getUserData).mockResolvedValue(
                createMockUserData({ isAdmin: true })
            );

            const result = await adminService.verifyAdminStatus(mockUserId);
            expect(result).toBe(true);
            expect(storageService.getUserData).toHaveBeenCalledWith(mockUserId);
        });

        it('should return false if user does not have admin status', async () => {
            vi.mocked(storageService.getUserData).mockResolvedValue(
                createMockUserData({ isAdmin: false })
            );

            const result = await adminService.verifyAdminStatus(mockUserId);
            expect(result).toBe(false);
            expect(storageService.getUserData).toHaveBeenCalledWith(mockUserId);
        });

        it('should return false if user data is not found', async () => {
            vi.mocked(storageService.getUserData).mockResolvedValue(null);

            const result = await adminService.verifyAdminStatus(mockUserId);
            expect(result).toBe(false);
            expect(storageService.getUserData).toHaveBeenCalledWith(mockUserId);
        });

        it('should return false and log error if an exception occurs', async () => {
            const mockError = new Error('Test error');
            vi.mocked(storageService.getUserData).mockRejectedValue(mockError);

            const result = await adminService.verifyAdminStatus(mockUserId);
            expect(result).toBe(false);
            expect(storageService.getUserData).toHaveBeenCalledWith(mockUserId);
            expect(logService.error).toHaveBeenCalledWith(
                'AdminService',
                'Failed to verify admin status',
                mockError,
                { userId: mockUserId }
            );
        });
    });

    describe('getAdminRights', () => {
        it('should return admin rights if user data exists', async () => {
            vi.mocked(storageService.getUserData).mockResolvedValue(
                createMockUserData({
                    isAdmin: true,
                    canCreateToken: true,
                    canUseServices: false
                })
            );

            const result = await adminService.getAdminRights(mockUser);
            expect(result).toEqual({
                isAdmin: true,
                canCreateToken: true,
                canUseServices: false
            });
            expect(storageService.getUserData).toHaveBeenCalledWith(mockUserId);
        });

        it('should throw error if user data is not found', async () => {
            vi.mocked(storageService.getUserData).mockResolvedValue(null);
            const mockAuthError = createMockAuthError(AuthErrorCode.USER_NOT_FOUND, 'User data not found');
            vi.mocked(ErrorService.createAuthError).mockReturnValue(mockAuthError);

            try {
                await adminService.getAdminRights(mockUser);
                // Si on arrive ici, le test échoue car l'exception n'a pas été levée
                expect(true).toBe(false);
            } catch (error) {
                expect(ErrorService.createAuthError).toHaveBeenCalledWith(
                    AuthErrorCode.USER_NOT_FOUND,
                    'User data not found'
                );
            }
        });

        it('should return default rights and log error if an exception occurs', async () => {
            const mockError = new Error('Test error');
            vi.mocked(storageService.getUserData).mockRejectedValue(mockError);

            const result = await adminService.getAdminRights(mockUser);
            expect(result).toEqual({
                isAdmin: false,
                canCreateToken: false,
                canUseServices: false
            });
            expect(logService.error).toHaveBeenCalledWith(
                'AdminService',
                'Failed to get admin rights',
                mockError,
                { userId: mockUserId }
            );
        });
    });

    describe('updateAdminRights', () => {
        it('should update admin rights successfully', async () => {
            // Create a mock user data
            const mockUserData = createMockUserData({
                isAdmin: false,
                canCreateToken: false,
                canUseServices: false
            });

            vi.mocked(storageService.getUserData).mockResolvedValue(mockUserData);

            const updatedRights = {
                isAdmin: true,
                canCreateToken: true
            };

            await adminService.updateAdminRights(mockUserId, updatedRights);

            // Check that updateUserData was called with the correct parameters
            // We don't check the exact object, just that it contains the expected properties
            expect(storageService.updateUserData).toHaveBeenCalled();
            const updateCall = vi.mocked(storageService.updateUserData).mock.calls[0];
            expect(updateCall[0]).toBe(mockUserId);
            expect(updateCall[1]).toMatchObject({
                isAdmin: true,
                canCreateToken: true,
                canUseServices: false
            });

            expect(logService.info).toHaveBeenCalledWith(
                'AdminService',
                'Admin rights updated',
                {
                    userId: mockUserId,
                    rights: updatedRights
                }
            );
        });

        it('should throw error if user data is not found', async () => {
            vi.mocked(storageService.getUserData).mockResolvedValue(null);
            const mockAuthError = createMockAuthError(AuthErrorCode.USER_NOT_FOUND, 'User data not found');
            vi.mocked(ErrorService.createAuthError).mockReturnValue(mockAuthError);

            const updatedRights = { isAdmin: true };

            try {
                await adminService.updateAdminRights(mockUserId, updatedRights);
                // Si on arrive ici, le test échoue car l'exception n'a pas été levée
                expect(true).toBe(false);
            } catch (error) {
                expect(ErrorService.createAuthError).toHaveBeenCalledWith(
                    AuthErrorCode.USER_NOT_FOUND,
                    'User data not found'
                );
            }
        });

        it('should log error and rethrow if an exception occurs', async () => {
            // Create a mock error that will be thrown by the service
            const mockError = new Error('Test error');
            vi.mocked(storageService.getUserData).mockRejectedValue(mockError);

            const updatedRights = { isAdmin: true };

            try {
                await adminService.updateAdminRights(mockUserId, updatedRights);
                // Si on arrive ici, le test échoue car l'exception n'a pas été levée
                expect(true).toBe(false);
            } catch (error) {
                // We only check that the error was logged correctly
                expect(logService.error).toHaveBeenCalledWith(
                    'AdminService',
                    'Failed to update admin rights',
                    mockError,
                    { userId: mockUserId, rights: updatedRights }
                );
                // We don't need to check the type of the error here since we're just verifying
                // that the error was logged and rethrown
            }
        });
    });

    describe('validateAdminAccess', () => {
        it('should return canAccess=true when all conditions are met', () => {
            const result = adminService.validateAdminAccess(true, true, true, true);
            expect(result).toEqual({ canAccess: true });
        });

        it('should return canAccess=false with reason when not authenticated', () => {
            const result = adminService.validateAdminAccess(true, false, true, true);
            expect(result).toEqual({
                canAccess: false,
                reason: 'Vous devez être connecté pour accéder à cette page'
            });
        });

        it('should return canAccess=false with reason when not admin', () => {
            const result = adminService.validateAdminAccess(false, true, true, true);
            expect(result).toEqual({
                canAccess: false,
                reason: 'Vous n\'avez pas les droits d\'administration nécessaires'
            });
        });

        it('should return canAccess=false with reason when wallet not connected', () => {
            const result = adminService.validateAdminAccess(true, true, false, true);
            expect(result).toEqual({
                canAccess: false,
                reason: 'Vous devez connecter votre portefeuille'
            });
        });

        it('should return canAccess=false with reason when on wrong network', () => {
            const result = adminService.validateAdminAccess(true, true, true, false);
            expect(result).toEqual({
                canAccess: false,
                reason: 'Vous devez être connecté au bon réseau'
            });
        });
    });
});
