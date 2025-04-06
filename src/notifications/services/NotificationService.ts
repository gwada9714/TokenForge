import { logger } from '@/core/logger';

/**
 * Types de notifications
 */
export enum NotificationType {
  // Notifications système
  SYSTEM = 'system',
  MAINTENANCE = 'maintenance',
  
  // Notifications utilisateur
  ACCOUNT = 'account',
  SECURITY = 'security',
  
  // Notifications de token
  TOKEN_CREATED = 'token_created',
  TOKEN_DEPLOYED = 'token_deployed',
  TOKEN_TRANSACTION = 'token_transaction',
  
  // Notifications de paiement
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_FAILED = 'payment_failed',
  
  // Notifications marketing
  PROMOTION = 'promotion',
  FEATURE_ANNOUNCEMENT = 'feature_announcement'
}

/**
 * Niveaux de priorité des notifications
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Canaux de notification
 */
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook'
}

/**
 * Interface pour les notifications
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: number;
  read?: boolean;
  data?: Record<string, any>;
  userId?: string;
  expiresAt?: number;
}

/**
 * Interface pour les options de notification
 */
export interface NotificationOptions {
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  data?: Record<string, any>;
  expiresIn?: number; // Durée en millisecondes
  groupId?: string; // Pour regrouper les notifications similaires
}

/**
 * Interface pour les préférences de notification d'un utilisateur
 */
export interface NotificationPreferences {
  userId: string;
  channels: {
    [key in NotificationChannel]?: boolean;
  };
  types: {
    [key in NotificationType]?: boolean;
  };
  doNotDisturb?: {
    enabled: boolean;
    startTime?: string; // Format HH:MM
    endTime?: string; // Format HH:MM
    timezone?: string;
  };
}

/**
 * Service de notification pour informer les utilisateurs des événements importants
 */
export class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private channelHandlers: Map<NotificationChannel, (notification: Notification, userId: string) => Promise<boolean>> = new Map();
  private notificationCounter: number = 0;

  private constructor() {
    // Initialisation privée pour le singleton
    this.initializeDefaultChannelHandlers();
  }

  /**
   * Obtient l'instance unique du service (Singleton)
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Envoie une notification à un utilisateur
   * @param userId ID de l'utilisateur
   * @param type Type de notification
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param options Options de notification
   * @returns ID de la notification
   */
  public async notify(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options: NotificationOptions = {}
  ): Promise<string> {
    // Vérifier si l'utilisateur a désactivé ce type de notification
    const userPreferences = this.preferences.get(userId);
    if (userPreferences && userPreferences.types[type] === false) {
      logger.debug('NotificationService', `Notification de type ${type} désactivée pour l'utilisateur ${userId}`);
      return '';
    }

    // Vérifier si l'utilisateur est en mode "Ne pas déranger"
    if (this.isInDoNotDisturbMode(userId)) {
      logger.debug('NotificationService', `Utilisateur ${userId} en mode "Ne pas déranger"`);
      // Stocker quand même la notification in-app, mais ne pas envoyer par d'autres canaux
      options.channels = [NotificationChannel.IN_APP];
    }

    // Créer la notification
    const notificationId = this.generateNotificationId();
    const notification: Notification = {
      id: notificationId,
      type,
      title,
      message,
      priority: options.priority || NotificationPriority.MEDIUM,
      timestamp: Date.now(),
      read: false,
      data: options.data,
      userId,
      expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined
    };

    // Stocker la notification
    this.storeNotification(userId, notification);

    // Déterminer les canaux à utiliser
    const channels = options.channels || [NotificationChannel.IN_APP];

    // Envoyer la notification par les canaux appropriés
    const deliveryPromises = channels.map(channel => this.deliverToChannel(channel, notification, userId));
    await Promise.all(deliveryPromises);

    // Journaliser l'envoi
    logger.info('NotificationService', `Notification envoyée à l'utilisateur ${userId}`, {
      notificationId,
      type,
      title,
      channels
    });

    return notificationId;
  }

  /**
   * Envoie une notification système à tous les utilisateurs
   * @param type Type de notification
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param options Options de notification
   * @returns Nombre d'utilisateurs notifiés
   */
  public async notifyAll(
    type: NotificationType,
    title: string,
    message: string,
    options: NotificationOptions = {}
  ): Promise<number> {
    // Dans une implémentation réelle, on récupérerait la liste des utilisateurs depuis une base de données
    // Pour la démo, on utilise les utilisateurs qui ont des préférences
    const userIds = Array.from(this.preferences.keys());
    
    // Si aucun utilisateur n'a de préférences, on ne peut pas envoyer de notification
    if (userIds.length === 0) {
      logger.warn('NotificationService', 'Aucun utilisateur disponible pour l\'envoi de notification système');
      return 0;
    }
    
    // Envoyer la notification à chaque utilisateur
    const notificationPromises = userIds.map(userId => 
      this.notify(userId, type, title, message, options)
    );
    
    // Attendre que toutes les notifications soient envoyées
    const results = await Promise.all(notificationPromises);
    
    // Compter le nombre de notifications envoyées avec succès
    const successCount = results.filter(id => id !== '').length;
    
    // Journaliser l'envoi
    logger.info('NotificationService', `Notification système envoyée à ${successCount} utilisateurs`, {
      type,
      title,
      successCount,
      totalUsers: userIds.length
    });
    
    return successCount;
  }

  /**
   * Marque une notification comme lue
   * @param userId ID de l'utilisateur
   * @param notificationId ID de la notification
   * @returns true si la notification a été marquée comme lue, false sinon
   */
  public markAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) {
      return false;
    }
    
    const notification = userNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return false;
    }
    
    notification.read = true;
    
    // Journaliser l'action
    logger.debug('NotificationService', `Notification ${notificationId} marquée comme lue pour l'utilisateur ${userId}`);
    
    return true;
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications marquées comme lues
   */
  public markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) {
      return 0;
    }
    
    let count = 0;
    userNotifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        count++;
      }
    });
    
    // Journaliser l'action
    logger.debug('NotificationService', `${count} notifications marquées comme lues pour l'utilisateur ${userId}`);
    
    return count;
  }

  /**
   * Supprime une notification
   * @param userId ID de l'utilisateur
   * @param notificationId ID de la notification
   * @returns true si la notification a été supprimée, false sinon
   */
  public deleteNotification(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) {
      return false;
    }
    
    const initialLength = userNotifications.length;
    const filteredNotifications = userNotifications.filter(n => n.id !== notificationId);
    
    if (filteredNotifications.length === initialLength) {
      return false;
    }
    
    this.notifications.set(userId, filteredNotifications);
    
    // Journaliser l'action
    logger.debug('NotificationService', `Notification ${notificationId} supprimée pour l'utilisateur ${userId}`);
    
    return true;
  }

  /**
   * Supprime toutes les notifications d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications supprimées
   */
  public deleteAllNotifications(userId: string): number {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) {
      return 0;
    }
    
    const count = userNotifications.length;
    this.notifications.set(userId, []);
    
    // Journaliser l'action
    logger.debug('NotificationService', `${count} notifications supprimées pour l'utilisateur ${userId}`);
    
    return count;
  }

  /**
   * Récupère les notifications d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param options Options de filtrage
   * @returns Notifications de l'utilisateur
   */
  public getNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      types?: NotificationType[];
      limit?: number;
      offset?: number;
    } = {}
  ): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    
    // Filtrer les notifications expirées
    const now = Date.now();
    let filteredNotifications = userNotifications.filter(n => !n.expiresAt || n.expiresAt > now);
    
    // Filtrer par statut de lecture
    if (options.unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }
    
    // Filtrer par type
    if (options.types && options.types.length > 0) {
      filteredNotifications = filteredNotifications.filter(n => options.types!.includes(n.type));
    }
    
    // Trier par date (plus récentes en premier)
    filteredNotifications.sort((a, b) => b.timestamp - a.timestamp);
    
    // Appliquer la pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || filteredNotifications.length;
      filteredNotifications = filteredNotifications.slice(offset, offset + limit);
    }
    
    return filteredNotifications;
  }

  /**
   * Récupère le nombre de notifications non lues d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications non lues
   */
  public getUnreadCount(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    
    // Filtrer les notifications expirées et non lues
    const now = Date.now();
    const unreadCount = userNotifications.filter(n => 
      (!n.expiresAt || n.expiresAt > now) && !n.read
    ).length;
    
    return unreadCount;
  }

  /**
   * Définit les préférences de notification d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param preferences Préférences de notification
   */
  public setPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    // Récupérer les préférences existantes ou créer des préférences par défaut
    const existingPreferences = this.preferences.get(userId) || {
      userId,
      channels: {
        [NotificationChannel.IN_APP]: true,
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.PUSH]: true,
        [NotificationChannel.SMS]: false,
        [NotificationChannel.WEBHOOK]: false
      },
      types: Object.values(NotificationType).reduce((acc, type) => {
        acc[type] = true;
        return acc;
      }, {} as Record<NotificationType, boolean>),
      doNotDisturb: {
        enabled: false
      }
    };
    
    // Fusionner les préférences
    const updatedPreferences: NotificationPreferences = {
      ...existingPreferences,
      ...preferences,
      channels: {
        ...existingPreferences.channels,
        ...preferences.channels
      },
      types: {
        ...existingPreferences.types,
        ...preferences.types
      },
      doNotDisturb: {
        enabled: preferences.doNotDisturb?.enabled ?? existingPreferences.doNotDisturb?.enabled ?? false,
        startTime: preferences.doNotDisturb?.startTime ?? existingPreferences.doNotDisturb?.startTime,
        endTime: preferences.doNotDisturb?.endTime ?? existingPreferences.doNotDisturb?.endTime,
        timezone: preferences.doNotDisturb?.timezone ?? existingPreferences.doNotDisturb?.timezone
      }
    };
    
    // Enregistrer les préférences
    this.preferences.set(userId, updatedPreferences);
    
    // Journaliser l'action
    logger.info('NotificationService', `Préférences de notification mises à jour pour l'utilisateur ${userId}`);
  }

  /**
   * Récupère les préférences de notification d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Préférences de notification
   */
  public getPreferences(userId: string): NotificationPreferences | null {
    return this.preferences.get(userId) || null;
  }

  /**
   * Enregistre un gestionnaire de canal de notification
   * @param channel Canal de notification
   * @param handler Fonction de gestion du canal
   */
  public registerChannelHandler(
    channel: NotificationChannel,
    handler: (notification: Notification, userId: string) => Promise<boolean>
  ): void {
    this.channelHandlers.set(channel, handler);
    
    // Journaliser l'action
    logger.info('NotificationService', `Gestionnaire enregistré pour le canal ${channel}`);
  }

  // Méthodes privées

  /**
   * Initialise les gestionnaires de canaux par défaut
   */
  private initializeDefaultChannelHandlers(): void {
    // Gestionnaire in-app (stockage local)
    this.registerChannelHandler(NotificationChannel.IN_APP, async (notification, userId) => {
      // Déjà géré par le stockage local
      return true;
    });
    
    // Gestionnaire email (simulation)
    this.registerChannelHandler(NotificationChannel.EMAIL, async (notification, userId) => {
      // Simuler l'envoi d'un email
      logger.debug('NotificationService', `Simulation d'envoi d'email à l'utilisateur ${userId}`, {
        subject: notification.title,
        body: notification.message
      });
      return true;
    });
    
    // Gestionnaire SMS (simulation)
    this.registerChannelHandler(NotificationChannel.SMS, async (notification, userId) => {
      // Simuler l'envoi d'un SMS
      logger.debug('NotificationService', `Simulation d'envoi de SMS à l'utilisateur ${userId}`, {
        message: `${notification.title}: ${notification.message}`
      });
      return true;
    });
    
    // Gestionnaire push (simulation)
    this.registerChannelHandler(NotificationChannel.PUSH, async (notification, userId) => {
      // Simuler l'envoi d'une notification push
      logger.debug('NotificationService', `Simulation d'envoi de notification push à l'utilisateur ${userId}`, {
        title: notification.title,
        body: notification.message
      });
      return true;
    });
    
    // Gestionnaire webhook (simulation)
    this.registerChannelHandler(NotificationChannel.WEBHOOK, async (notification, userId) => {
      // Simuler l'envoi d'un webhook
      logger.debug('NotificationService', `Simulation d'envoi de webhook pour l'utilisateur ${userId}`, {
        payload: {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data
        }
      });
      return true;
    });
  }

  /**
   * Génère un ID de notification unique
   * @returns ID de notification
   */
  private generateNotificationId(): string {
    this.notificationCounter++;
    return `notification_${Date.now()}_${this.notificationCounter}`;
  }

  /**
   * Stocke une notification pour un utilisateur
   * @param userId ID de l'utilisateur
   * @param notification Notification à stocker
   */
  private storeNotification(userId: string, notification: Notification): void {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(notification);
    this.notifications.set(userId, userNotifications);
  }

  /**
   * Délivre une notification via un canal spécifique
   * @param channel Canal de notification
   * @param notification Notification à délivrer
   * @param userId ID de l'utilisateur
   * @returns true si la notification a été délivrée, false sinon
   */
  private async deliverToChannel(
    channel: NotificationChannel,
    notification: Notification,
    userId: string
  ): Promise<boolean> {
    // Vérifier si l'utilisateur a activé ce canal
    const userPreferences = this.preferences.get(userId);
    if (userPreferences && userPreferences.channels[channel] === false) {
      logger.debug('NotificationService', `Canal ${channel} désactivé pour l'utilisateur ${userId}`);
      return false;
    }
    
    // Récupérer le gestionnaire de canal
    const handler = this.channelHandlers.get(channel);
    if (!handler) {
      logger.warn('NotificationService', `Aucun gestionnaire pour le canal ${channel}`);
      return false;
    }
    
    try {
      // Délivrer la notification
      const result = await handler(notification, userId);
      
      // Journaliser le résultat
      if (result) {
        logger.debug('NotificationService', `Notification délivrée via ${channel} à l'utilisateur ${userId}`);
      } else {
        logger.warn('NotificationService', `Échec de livraison via ${channel} à l'utilisateur ${userId}`);
      }
      
      return result;
    } catch (error) {
      logger.error('NotificationService', `Erreur lors de la livraison via ${channel} à l'utilisateur ${userId}`, error);
      return false;
    }
  }

  /**
   * Vérifie si un utilisateur est en mode "Ne pas déranger"
   * @param userId ID de l'utilisateur
   * @returns true si l'utilisateur est en mode "Ne pas déranger", false sinon
   */
  private isInDoNotDisturbMode(userId: string): boolean {
    const userPreferences = this.preferences.get(userId);
    if (!userPreferences || !userPreferences.doNotDisturb || !userPreferences.doNotDisturb.enabled) {
      return false;
    }
    
    const { startTime, endTime, timezone } = userPreferences.doNotDisturb;
    if (!startTime || !endTime) {
      return true; // Si activé mais sans horaires, toujours en mode DND
    }
    
    // Obtenir l'heure actuelle dans le fuseau horaire de l'utilisateur
    const now = new Date();
    let userTime: Date;
    
    if (timezone) {
      // Convertir l'heure actuelle dans le fuseau horaire de l'utilisateur
      const options: Intl.DateTimeFormatOptions = { timeZone: timezone };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(now);
      
      // Reconstruire la date à partir des parties
      const year = parseInt(parts.find(part => part.type === 'year')?.value || '0');
      const month = parseInt(parts.find(part => part.type === 'month')?.value || '0') - 1;
      const day = parseInt(parts.find(part => part.type === 'day')?.value || '0');
      const hour = parseInt(parts.find(part => part.type === 'hour')?.value || '0');
      const minute = parseInt(parts.find(part => part.type === 'minute')?.value || '0');
      
      userTime = new Date(year, month, day, hour, minute);
    } else {
      userTime = now;
    }
    
    // Extraire l'heure et les minutes actuelles
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    // Convertir les heures de début et de fin en minutes
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    // Vérifier si l'heure actuelle est dans la plage DND
    if (startTimeMinutes <= endTimeMinutes) {
      // Plage normale (ex: 22:00 - 07:00)
      return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
    } else {
      // Plage qui traverse minuit (ex: 22:00 - 07:00)
      return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
    }
  }
}

// Exporter l'instance unique
export const notificationService = NotificationService.getInstance();
