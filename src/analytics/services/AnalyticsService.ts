import { logger } from "@/core/logger";

/**
 * Types d'événements pour l'analytique
 */
export enum AnalyticsEventType {
  // Événements utilisateur
  USER_SIGNUP = "user_signup",
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  USER_PROFILE_UPDATE = "user_profile_update",

  // Événements de token
  TOKEN_CREATION_STARTED = "token_creation_started",
  TOKEN_CREATION_COMPLETED = "token_creation_completed",
  TOKEN_CREATION_FAILED = "token_creation_failed",
  TOKEN_TRANSFER = "token_transfer",
  TOKEN_BURN = "token_burn",
  TOKEN_MINT = "token_mint",

  // Événements de paiement
  PAYMENT_INITIATED = "payment_initiated",
  PAYMENT_COMPLETED = "payment_completed",
  PAYMENT_FAILED = "payment_failed",

  // Événements de navigation
  PAGE_VIEW = "page_view",
  FEATURE_USAGE = "feature_usage",

  // Événements système
  SYSTEM_ERROR = "system_error",
  PERFORMANCE_METRIC = "performance_metric",
}

/**
 * Interface pour les événements d'analytique
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    locale?: string;
    [key: string]: any;
  };
}

/**
 * Interface pour les métriques d'analytique
 */
export interface AnalyticsMetric {
  name: string;
  value: number;
  timestamp: number;
  dimensions?: Record<string, string>;
  userId?: string;
}

/**
 * Interface pour les filtres de requête d'analytique
 */
export interface AnalyticsQueryFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AnalyticsEventType[];
  userId?: string;
  properties?: Record<string, any>;
  limit?: number;
  offset?: number;
}

/**
 * Interface pour les résultats d'agrégation d'analytique
 */
export interface AnalyticsAggregation {
  name: string;
  data: Array<{
    key: string;
    value: number;
    percentage?: number;
  }>;
  total: number;
  period?: {
    start: Date;
    end: Date;
  };
}

/**
 * Service d'analytique pour suivre les métriques importantes
 * Collecte, stocke et analyse les événements et métriques de la plateforme
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private metrics: AnalyticsMetric[] = [];
  private sessionId: string = "";
  private isInitialized: boolean = false;
  private externalProviders: Array<(event: AnalyticsEvent) => void> = [];

  private constructor() {
    // Initialisation privée pour le singleton
  }

  /**
   * Obtient l'instance unique du service (Singleton)
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialise le service d'analytique
   * @param userId ID de l'utilisateur actuel (si connecté)
   * @param options Options d'initialisation
   */
  public initialize(
    userId?: string,
    options: { enableExternalProviders?: boolean } = {}
  ): void {
    if (this.isInitialized) {
      return;
    }

    // Générer un ID de session unique
    this.sessionId = this.generateSessionId();

    // Initialiser les fournisseurs externes si activés
    if (options.enableExternalProviders) {
      this.initializeExternalProviders();
    }

    // Enregistrer l'événement d'initialisation
    this.trackEvent(AnalyticsEventType.PAGE_VIEW, {
      page: "initialization",
      userId,
    });

    this.isInitialized = true;
    logger.info("AnalyticsService", "Service d'analytique initialisé", {
      sessionId: this.sessionId,
      userId,
    });
  }

  /**
   * Suit un événement d'analytique
   * @param type Type d'événement
   * @param properties Propriétés de l'événement
   * @param userId ID de l'utilisateur (optionnel)
   */
  public trackEvent(
    type: AnalyticsEventType,
    properties: Record<string, any>,
    userId?: string
  ): void {
    if (!this.isInitialized) {
      this.initialize(userId);
    }

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      userId,
      sessionId: this.sessionId,
      properties,
      metadata: this.collectMetadata(),
    };

    // Stocker l'événement localement
    this.events.push(event);

    // Envoyer l'événement aux fournisseurs externes
    this.sendToExternalProviders(event);

    // Journaliser l'événement
    logger.debug("AnalyticsService", `Événement suivi: ${type}`, {
      eventType: type,
      userId,
      properties,
    });
  }

  /**
   * Enregistre une métrique d'analytique
   * @param name Nom de la métrique
   * @param value Valeur de la métrique
   * @param dimensions Dimensions de la métrique (optionnel)
   * @param userId ID de l'utilisateur (optionnel)
   */
  public recordMetric(
    name: string,
    value: number,
    dimensions?: Record<string, string>,
    userId?: string
  ): void {
    if (!this.isInitialized) {
      this.initialize(userId);
    }

    const metric: AnalyticsMetric = {
      name,
      value,
      timestamp: Date.now(),
      dimensions,
      userId,
    };

    // Stocker la métrique localement
    this.metrics.push(metric);

    // Journaliser la métrique
    logger.debug("AnalyticsService", `Métrique enregistrée: ${name}`, {
      metricName: name,
      value,
      dimensions,
      userId,
    });
  }

  /**
   * Récupère les événements d'analytique filtrés
   * @param filter Filtre de requête
   * @returns Événements filtrés
   */
  public getEvents(filter: AnalyticsQueryFilter = {}): AnalyticsEvent[] {
    let filteredEvents = [...this.events];

    // Filtrer par date de début
    if (filter.startDate) {
      const startTimestamp = filter.startDate.getTime();
      filteredEvents = filteredEvents.filter(
        (event) => event.timestamp >= startTimestamp
      );
    }

    // Filtrer par date de fin
    if (filter.endDate) {
      const endTimestamp = filter.endDate.getTime();
      filteredEvents = filteredEvents.filter(
        (event) => event.timestamp <= endTimestamp
      );
    }

    // Filtrer par types d'événements
    if (filter.eventTypes && filter.eventTypes.length > 0) {
      filteredEvents = filteredEvents.filter((event) =>
        filter.eventTypes!.includes(event.type)
      );
    }

    // Filtrer par ID utilisateur
    if (filter.userId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.userId === filter.userId
      );
    }

    // Filtrer par propriétés
    if (filter.properties) {
      filteredEvents = filteredEvents.filter((event) => {
        return Object.entries(filter.properties!).every(([key, value]) => {
          return event.properties[key] === value;
        });
      });
    }

    // Appliquer la pagination
    if (filter.offset !== undefined || filter.limit !== undefined) {
      const offset = filter.offset || 0;
      const limit = filter.limit || filteredEvents.length;
      filteredEvents = filteredEvents.slice(offset, offset + limit);
    }

    return filteredEvents;
  }

  /**
   * Récupère les métriques d'analytique filtrées
   * @param name Nom de la métrique
   * @param filter Filtre de requête
   * @returns Métriques filtrées
   */
  public getMetrics(
    name: string,
    filter: AnalyticsQueryFilter = {}
  ): AnalyticsMetric[] {
    let filteredMetrics = this.metrics.filter((metric) => metric.name === name);

    // Filtrer par date de début
    if (filter.startDate) {
      const startTimestamp = filter.startDate.getTime();
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.timestamp >= startTimestamp
      );
    }

    // Filtrer par date de fin
    if (filter.endDate) {
      const endTimestamp = filter.endDate.getTime();
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.timestamp <= endTimestamp
      );
    }

    // Filtrer par ID utilisateur
    if (filter.userId) {
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.userId === filter.userId
      );
    }

    // Appliquer la pagination
    if (filter.offset !== undefined || filter.limit !== undefined) {
      const offset = filter.offset || 0;
      const limit = filter.limit || filteredMetrics.length;
      filteredMetrics = filteredMetrics.slice(offset, offset + limit);
    }

    return filteredMetrics;
  }

  /**
   * Agrège les événements par une propriété spécifique
   * @param eventType Type d'événement à agréger
   * @param property Propriété sur laquelle agréger
   * @param filter Filtre de requête
   * @returns Résultat d'agrégation
   */
  public aggregateEventsByProperty(
    eventType: AnalyticsEventType,
    property: string,
    filter: AnalyticsQueryFilter = {}
  ): AnalyticsAggregation {
    // Filtrer les événements
    const events = this.getEvents({
      ...filter,
      eventTypes: [eventType],
    });

    // Agréger les événements par propriété
    const aggregation: Record<string, number> = {};
    let total = 0;

    events.forEach((event) => {
      const value = event.properties[property];
      if (value !== undefined) {
        const key = String(value);
        aggregation[key] = (aggregation[key] || 0) + 1;
        total++;
      }
    });

    // Convertir en format de résultat
    const data = Object.entries(aggregation).map(([key, value]) => ({
      key,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));

    // Trier par valeur décroissante
    data.sort((a, b) => b.value - a.value);

    return {
      name: `${eventType}_by_${property}`,
      data,
      total,
      period:
        filter.startDate && filter.endDate
          ? {
              start: filter.startDate,
              end: filter.endDate,
            }
          : undefined,
    };
  }

  /**
   * Calcule la moyenne d'une métrique sur une période
   * @param name Nom de la métrique
   * @param filter Filtre de requête
   * @returns Valeur moyenne
   */
  public calculateMetricAverage(
    name: string,
    filter: AnalyticsQueryFilter = {}
  ): number {
    const metrics = this.getMetrics(name, filter);

    if (metrics.length === 0) {
      return 0;
    }

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Calcule la tendance d'une métrique (pourcentage de changement)
   * @param name Nom de la métrique
   * @param currentPeriodFilter Filtre pour la période actuelle
   * @param previousPeriodFilter Filtre pour la période précédente
   * @returns Pourcentage de changement
   */
  public calculateMetricTrend(
    name: string,
    currentPeriodFilter: AnalyticsQueryFilter,
    previousPeriodFilter: AnalyticsQueryFilter
  ): number {
    const currentAverage = this.calculateMetricAverage(
      name,
      currentPeriodFilter
    );
    const previousAverage = this.calculateMetricAverage(
      name,
      previousPeriodFilter
    );

    if (previousAverage === 0) {
      return currentAverage > 0 ? 100 : 0;
    }

    return ((currentAverage - previousAverage) / previousAverage) * 100;
  }

  /**
   * Efface toutes les données d'analytique
   * Utile pour les tests ou pour respecter les politiques de confidentialité
   */
  public clearData(): void {
    this.events = [];
    this.metrics = [];
    logger.info("AnalyticsService", "Données d'analytique effacées");
  }

  // Méthodes privées

  /**
   * Génère un ID de session unique
   * @returns ID de session
   */
  private generateSessionId(): string {
    return (
      "session_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Collecte les métadonnées pour un événement
   * @returns Métadonnées
   */
  private collectMetadata(): AnalyticsEvent["metadata"] {
    // Dans un environnement navigateur
    if (typeof window !== "undefined") {
      return {
        userAgent: navigator.userAgent,
        locale: navigator.language,
        referrer: document.referrer,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    // Dans un environnement serveur
    return {
      environment: "server",
    };
  }

  /**
   * Initialise les fournisseurs d'analytique externes
   */
  private initializeExternalProviders(): void {
    // Implémentation fictive pour la démo
    // Dans une implémentation réelle, on initialiserait des fournisseurs comme Google Analytics, Mixpanel, etc.
    this.externalProviders.push((event: AnalyticsEvent) => {
      // Simuler l'envoi à un fournisseur externe
      logger.debug(
        "AnalyticsService",
        "Événement envoyé au fournisseur externe",
        {
          event,
        }
      );
    });
  }

  /**
   * Envoie un événement aux fournisseurs externes
   * @param event Événement à envoyer
   */
  private sendToExternalProviders(event: AnalyticsEvent): void {
    this.externalProviders.forEach((provider) => {
      try {
        provider(event);
      } catch (error) {
        logger.error(
          "AnalyticsService",
          "Erreur lors de l'envoi à un fournisseur externe",
          error
        );
      }
    });
  }
}

// Exporter l'instance unique
export const analyticsService = AnalyticsService.getInstance();
