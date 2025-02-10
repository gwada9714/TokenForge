import { BaseService } from '../../../services/BaseService';
import { SessionService, TokenService, TabSyncService, SyncMessage } from '../../../types/services';
import { TokenForgeUser } from '../../../types/auth';
import { serviceRegistry } from '../../../services/ServiceRegistry';

export class UnifiedSessionService extends BaseService implements SessionService {
  private static instance: UnifiedSessionService;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private tabSyncService: TabSyncService;
  private tokenService: TokenService;
  private currentUser: TokenForgeUser | null = null;
  private readonly SESSION_CHECK_INTERVAL = 60000; // 1 minute
  private readonly SESSION_TIMEOUT = 30 * 60000; // 30 minutes
  private lastActivity: number = Date.now();
  private readonly MAX_FAILED_ATTEMPTS = 3;
  private failedAttempts = new Map<string, number>();
  private blockedUsers = new Set<string>();
  private readonly BLOCK_DURATION = 15 * 60000; // 15 minutes

  private constructor() {
    super();
    this.tabSyncService = serviceRegistry.get<TabSyncService>('tabSync');
    this.tokenService = serviceRegistry.get<TokenService>('token');
    this.setupTabSync();
  }

  static getInstance(): UnifiedSessionService {
    if (!UnifiedSessionService.instance) {
      UnifiedSessionService.instance = new UnifiedSessionService();
    }
    return UnifiedSessionService.instance;
  }

  private setupTabSync(): void {
    this.tabSyncService.subscribe(this.handleSyncMessage.bind(this));
  }

  private handleSyncMessage(message: SyncMessage): void {
    if (message.type === 'SESSION_STATE') {
      this.lastActivity = Math.max(this.lastActivity, message.timestamp);
    }
  }

  private broadcastActivity(): void {
    const message: SyncMessage = {
      type: 'SESSION_STATE',
      payload: { lastActivity: this.lastActivity },
      timestamp: Date.now(),
      tabId: crypto.randomUUID()
    };
    this.tabSyncService.broadcast(message);
  }

  async getUserSession(uid: string): Promise<{
    isAdmin: boolean;
    canCreateToken: boolean;
    canUseServices: boolean;
  } | null> {
    try {
      // Simuler une requête au backend avec l'uid
      const mockUserData = {
        [uid]: {
          isAdmin: false,
          canCreateToken: true,
          canUseServices: true
        }
      };

      return mockUserData[uid] || null;
    } catch (error) {
      throw this.handleError(error, 'Failed to get user session');
    }
  }

  async initSession(): Promise<void> {
    try {
      await this.tokenService.initialize(this.currentUser);
      this.startSessionMonitoring();
      this.notifySuccess('Session initialized');
    } catch (error) {
      throw this.handleError(error, 'Failed to initialize session');
    }
  }

  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      await Promise.all([
        this.checkSession(),
        this.validateSessionHealth()
      ]);
    }, this.SESSION_CHECK_INTERVAL);
  }

  private async checkSession(): Promise<void> {
    const now = Date.now();
    if (now - this.lastActivity > this.SESSION_TIMEOUT) {
      await this.endSession();
      this.notifyWarning('Session expired due to inactivity');
    } else if (this.tokenService.isTokenExpired()) {
      await this.refreshSession();
    }
  }

  async refreshSession(): Promise<void> {
    try {
      await this.tokenService.refreshToken();
      this.notifyInfo('Session refreshed');
    } catch (error) {
      await this.endSession();
      throw this.handleError(error, 'Failed to refresh session');
    }
  }

  async updateActivity(): Promise<void> {
    this.lastActivity = Date.now();
    this.broadcastActivity();
  }

  async endSession(): Promise<void> {
    try {
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      this.tokenService.cleanup();
      this.currentUser = null;
      this.notifyInfo('Session ended');
    } catch (error) {
      throw this.handleError(error, 'Failed to end session');
    }
  }

  private isUserBlocked(uid: string): boolean {
    return this.blockedUsers.has(uid);
  }

  private incrementFailedAttempts(uid: string): void {
    const attempts = (this.failedAttempts.get(uid) || 0) + 1;
    this.failedAttempts.set(uid, attempts);

    if (attempts >= this.MAX_FAILED_ATTEMPTS) {
      this.blockUser(uid);
    }
  }

  private blockUser(uid: string): void {
    this.blockedUsers.add(uid);
    this.notifyWarning(`Account temporarily blocked due to multiple failed attempts`);
    
    setTimeout(() => {
      this.blockedUsers.delete(uid);
      this.failedAttempts.delete(uid);
    }, this.BLOCK_DURATION);
  }

  private resetFailedAttempts(uid: string): void {
    this.failedAttempts.delete(uid);
  }

  async validateSession(uid: string): Promise<boolean> {
    try {
      if (this.isUserBlocked(uid)) {
        throw new Error('Account is temporarily blocked');
      }

      const isValid = await this.tokenService.getToken() !== null;
      
      if (!isValid) {
        this.incrementFailedAttempts(uid);
        return false;
      }

      this.resetFailedAttempts(uid);
      return true;
    } catch (error) {
      throw this.handleError(error, 'Session validation failed');
    }
  }

  private async validateSessionHealth(): Promise<void> {
    if (!this.currentUser) return;

    const isHealthy = await this.validateSession(this.currentUser.uid);
    if (!isHealthy) {
      await this.endSession();
      this.notifyWarning('Session ended due to security concerns');
    }
  }

  cleanup(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    this.tabSyncService.destroy();
  }
}
