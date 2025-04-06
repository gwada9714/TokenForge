import { TokenEvent } from "./eventMonitorService";
import { formatEther } from "viem";
import ErrorService from "./ErrorService";
import toast from "./toast";

export interface NotificationConfig {
  minTaxAmount?: bigint;
  minTransferAmount?: bigint;
  enableDesktopNotifications?: boolean;
  enableSoundAlerts?: boolean;
}

export class NotificationService {
  private audioContext?: AudioContext;
  private notificationSound?: AudioBuffer;
  private hasPermission: boolean = false;

  constructor(private config: NotificationConfig) {
    this.initializeService();
  }

  private async initializeService() {
    const errorService = ErrorService.getInstance();

    try {
      if (this.config.enableDesktopNotifications) {
        // Vérifier et demander la permission pour les notifications
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          this.hasPermission = permission === "granted";
        }
      }

      if (this.config.enableSoundAlerts) {
        // Initialiser le contexte audio
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Charger le son de notification
        const response = await fetch("/sounds/notification.mp3");
        const arrayBuffer = await response.arrayBuffer();
        this.notificationSound = await this.audioContext.decodeAudioData(
          arrayBuffer
        );
      }
    } catch (error) {
      errorService.handleError(error, {
        context: "NotificationService initialization",
        config: this.config,
      });
    }
  }

  async notify(event: TokenEvent) {
    const errorService = ErrorService.getInstance();

    try {
      // Vérifier si l'événement dépasse le seuil minimum
      if (event.amount < (this.config.minTaxAmount || 0n)) {
        return;
      }

      // Notification desktop
      if (this.config.enableDesktopNotifications && this.hasPermission) {
        const notification = new Notification("TokenForge - Nouvel Événement", {
          body: this.formatNotificationMessage(event),
          icon: "/images/logo.png",
          tag: "tokenforge-event",
          requireInteraction: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Alerte sonore
      if (
        this.config.enableSoundAlerts &&
        this.audioContext &&
        this.notificationSound
      ) {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.notificationSound;
        source.connect(this.audioContext.destination);
        source.start();
      }

      // Notification in-app (fallback)
      toast({
        title: "Nouvel Événement",
        description: this.formatNotificationMessage(event),
        variant: "default",
      });
    } catch (error) {
      errorService.handleError(error, {
        context: "Notification delivery",
        event,
      });
    }
  }

  private formatNotificationMessage(event: TokenEvent): string {
    const amount = formatEther(event.amount);
    switch (event.type) {
      case "TaxCollected":
        return `${amount} tokens collectés en taxe`;
      case "Transfer":
        return `${amount} tokens transférés`;
      case "Mint":
        return `${amount} tokens créés`;
      case "Burn":
        return `${amount} tokens brûlés`;
      default:
        return `Nouvel événement : ${amount} tokens`;
    }
  }

  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeService();
  }
}
