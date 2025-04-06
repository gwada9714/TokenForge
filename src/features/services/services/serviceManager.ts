import {
  ServiceType,
  ServiceRequest,
  ServiceQuote,
  Service,
} from "../types/services";
import { NetworkConfig } from "@/features/auth/types/wallet";
import { logger } from "@/core/logger";
import { SERVICES } from "../config/services";
import { paymentService } from "@/features/pricing/services/paymentService";

class ServiceManager {
  private static instance: ServiceManager;

  private constructor() {}

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  public async getServiceQuote(
    serviceType: ServiceType,
    network: NetworkConfig,
    amount?: number
  ): Promise<ServiceQuote> {
    try {
      const service = SERVICES.find((s) => s.id === serviceType);
      if (!service) {
        throw new Error("Service non trouvé");
      }

      // Vérifier si le réseau est supporté
      if (!service.networks.includes(network.name)) {
        throw new Error("Réseau non supporté pour ce service");
      }

      // Calculer le montant total
      const baseAmount = service.price.baseFee;
      const percentageFee = service.price.percentageFee || 0;
      const totalAmount = amount
        ? baseAmount + (amount * percentageFee) / 100
        : baseAmount;

      const quote: ServiceQuote = {
        serviceType,
        baseAmount,
        percentageFee,
        totalAmount,
        currency: service.price.currency,
        validUntil: Date.now() + 30 * 60 * 1000, // Valide 30 minutes
      };

      logger.info("Devis de service généré", {
        serviceType,
        network: network.name,
        totalAmount,
      });

      return quote;
    } catch (error) {
      logger.error("Erreur lors de la génération du devis", { error });
      throw error;
    }
  }

  public async requestService(
    serviceType: ServiceType,
    network: NetworkConfig,
    config: ServiceRequest["config"]
  ): Promise<ServiceRequest> {
    try {
      // Obtenir le devis
      const quote = await this.getServiceQuote(
        serviceType,
        network,
        "budget" in config ? config.budget : undefined
      );

      // Créer la demande de service
      const serviceRequest: ServiceRequest = {
        serviceType,
        network,
        config,
        payment: {
          amount: quote.totalAmount,
          currency: quote.currency,
        },
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Sauvegarder la demande
      await this.saveServiceRequest(serviceRequest);

      logger.info("Demande de service créée", {
        serviceType,
        network: network.name,
      });

      return serviceRequest;
    } catch (error) {
      logger.error("Erreur lors de la création de la demande de service", {
        error,
      });
      throw error;
    }
  }

  public async processServiceRequest(
    request: ServiceRequest,
    transactionHash: string
  ): Promise<ServiceRequest> {
    try {
      // Vérifier le paiement
      const paymentDetails = {
        planId: request.serviceType as any, // TODO: Améliorer le typage
        amount: request.payment.amount,
        currency: request.payment.currency,
        network: request.network,
        timestamp: Date.now(),
        status: "pending" as const,
      };

      await paymentService.confirmPayment(paymentDetails, transactionHash);

      // Mettre à jour le statut
      const updatedRequest: ServiceRequest = {
        ...request,
        status: "processing",
        updatedAt: Date.now(),
      };

      // Sauvegarder la mise à jour
      await this.saveServiceRequest(updatedRequest);

      // Démarrer le traitement spécifique au service
      await this.startServiceProcessing(updatedRequest);

      logger.info("Traitement de la demande de service démarré", {
        serviceType: request.serviceType,
        transactionHash,
      });

      return updatedRequest;
    } catch (error) {
      logger.error("Erreur lors du traitement de la demande de service", {
        error,
      });
      throw error;
    }
  }

  private async startServiceProcessing(request: ServiceRequest): Promise<void> {
    try {
      // TODO: Implémenter le traitement spécifique à chaque type de service
      switch (request.serviceType) {
        case ServiceType.LAUNCHPAD:
          // Démarrer la configuration du launchpad
          break;
        case ServiceType.STAKING:
          // Déployer le contrat de staking
          break;
        case ServiceType.MARKETING:
          // Initier la campagne marketing
          break;
        case ServiceType.KYC:
          // Démarrer le processus de vérification
          break;
      }
    } catch (error) {
      logger.error("Erreur lors du démarrage du traitement", { error });
      throw error;
    }
  }

  private async saveServiceRequest(request: ServiceRequest): Promise<void> {
    try {
      // TODO: Implémenter la sauvegarde dans Firebase
      logger.info("Demande de service sauvegardée", {
        serviceType: request.serviceType,
        status: request.status,
      });
    } catch (error) {
      logger.error("Erreur lors de la sauvegarde de la demande", { error });
      throw error;
    }
  }
}

export const serviceManager = ServiceManager.getInstance();
