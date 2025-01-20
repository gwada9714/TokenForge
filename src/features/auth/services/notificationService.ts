import { toast, ToastOptions } from 'react-toastify';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private getToastOptions(options?: NotificationOptions): ToastOptions {
    return {
      position: options?.position || 'top-right',
      autoClose: options?.duration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };
  }

  // Notifications d'authentification
  notifyLoginSuccess(email: string): void {
    toast.success(`Connecté avec succès : ${email}`, this.getToastOptions());
  }

  notifyLoginError(error: string): void {
    toast.error(`Erreur de connexion : ${error}`, this.getToastOptions());
  }

  notifyLogout(): void {
    toast.info('Déconnexion réussie', this.getToastOptions());
  }

  // Notifications de wallet
  notifyWalletConnected(address: string): void {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    toast.success(`Wallet connecté : ${shortAddress}`, this.getToastOptions());
  }

  notifyWalletDisconnected(): void {
    toast.info('Wallet déconnecté', this.getToastOptions());
  }

  notifyNetworkChanged(networkName: string): void {
    toast.info(`Réseau changé : ${networkName}`, this.getToastOptions());
  }

  notifyWrongNetwork(expected: string, current: string): void {
    toast.warning(
      `Mauvais réseau. Attendu : ${expected}, Actuel : ${current}`,
      this.getToastOptions()
    );
  }

  // Notifications de vérification d'email
  notifyEmailVerificationSent(email: string): void {
    toast.info(
      `Email de vérification envoyé à ${email}`,
      this.getToastOptions({ duration: 10000 })
    );
  }

  notifyEmailVerified(): void {
    toast.success(
      'Email vérifié avec succès',
      this.getToastOptions()
    );
  }

  // Notifications génériques
  notify(message: string, options?: NotificationOptions): void {
    const { type = 'info', ...rest } = options || {};
    toast[type](message, this.getToastOptions(rest));
  }

  success(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.notify(message, { ...options, type: 'success' });
  }

  error(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.notify(message, { ...options, type: 'error' });
  }

  info(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.notify(message, { ...options, type: 'info' });
  }

  warning(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.notify(message, { ...options, type: 'warning' });
  }

  warn(message: string, options?: NotificationOptions): void {
    toast.warning(message, this.getToastOptions(options));
  }
}

export const notificationService = NotificationService.getInstance();
