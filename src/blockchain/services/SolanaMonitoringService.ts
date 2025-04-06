import { Connection, PublicKey } from "@solana/web3.js";
import { PaymentService } from "./PaymentServiceFixed";

// Adresse du wallet Solana centralisé
const WALLET_ADDRESS = "YourSolanaWalletAddressHere"; // À remplacer par l'adresse réelle

/**
 * Service pour le monitoring des transactions Solana
 * Surveille les paiements entrants et met à jour les sessions de paiement
 */
export class SolanaMonitoringService {
  private connection: Connection;
  private paymentService: PaymentService;
  private isMonitoring: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastSignature: string | null = null;

  constructor(rpcUrl: string = "https://api.mainnet-beta.solana.com") {
    this.connection = new Connection(rpcUrl);
    this.paymentService = new PaymentService("solana");
  }

  /**
   * Démarre le monitoring des transactions Solana
   */
  async startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log("Starting Solana transaction monitoring service");

    try {
      // Récupérer les dernières signatures pour initialiser le monitoring
      const signatures = await this.connection.getSignaturesForAddress(
        new PublicKey(WALLET_ADDRESS),
        { limit: 1 }
      );

      if (signatures.length > 0) {
        this.lastSignature = signatures[0].signature;
      }

      // Démarrer le polling
      this.pollingInterval = setInterval(
        () => this.checkNewTransactions(),
        10000
      ); // Vérifier toutes les 10 secondes
    } catch (error) {
      console.error("Error starting Solana monitoring:", error);
      this.isMonitoring = false;
    }
  }

  /**
   * Arrête le monitoring des transactions Solana
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    console.log("Stopping Solana transaction monitoring service");

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isMonitoring = false;
  }

  /**
   * Vérifie les nouvelles transactions
   */
  private async checkNewTransactions() {
    try {
      // Récupérer les nouvelles signatures depuis la dernière vérification
      // Note: La version de l'API Solana utilisée semble ne pas accepter d'options
      // Nous utilisons donc la méthode sans options
      const pubkey = new PublicKey(WALLET_ADDRESS);
      const signatures = await this.connection.getSignaturesForAddress(pubkey);

      if (signatures.length === 0) {
        return;
      }

      // Filtrer les signatures plus récentes que la dernière signature traitée
      const newSignatures = this.lastSignature
        ? signatures
            .filter((sig) => sig.signature !== this.lastSignature)
            .reverse()
        : signatures.reverse();

      if (newSignatures.length === 0) {
        return;
      }

      // Mettre à jour la dernière signature
      this.lastSignature = newSignatures[0].signature;

      // Traiter les nouvelles transactions
      for (const signatureInfo of newSignatures) {
        await this.processTransaction(signatureInfo.signature);
      }
    } catch (error) {
      console.error("Error checking new Solana transactions:", error);
    }
  }

  /**
   * Traite une transaction Solana
   * @param signature Signature de la transaction
   */
  private async processTransaction(signature: string) {
    try {
      // Dans une implémentation réelle, on récupérerait les détails de la transaction
      // et on vérifierait si c'est un transfert vers notre wallet

      // Pour la démo, on simule un transfert détecté
      console.log(
        `Simulating Solana transfer detection for signature: ${signature}`
      );

      // Simuler un transfert entrant
      const sender = "SenderSolanaAddress123";
      const amount = 1000000000; // 1 SOL en lamports

      // Traiter le paiement
      await this.processIncomingPayment(sender, amount, signature);
    } catch (error) {
      console.error(`Error processing Solana transaction ${signature}:`, error);
    }
  }

  /**
   * Traite un paiement entrant
   * @param from Adresse de l'expéditeur
   * @param amount Montant en lamports
   * @param txHash Hash de la transaction
   */
  private async processIncomingPayment(
    from: string,
    amount: number,
    txHash: string
  ) {
    try {
      // Dans une implémentation réelle, on rechercherait les sessions de paiement
      // en attente dans Firebase pour ce réseau, cette adresse et cette crypto native

      // Pour la démo, on simule une recherche de session
      console.log(`Searching for pending Solana payment sessions for ${from}`);

      // Simuler une session trouvée
      const sessionId = `demo-session-${Date.now()}`;

      // Confirmer le paiement via le service de paiement
      const confirmed = await this.paymentService.confirmPayment(
        sessionId,
        txHash
      );
      console.log(`Solana payment confirmation result: ${confirmed}`);
    } catch (error) {
      console.error("Error processing incoming Solana payment:", error);
    }
  }
}

// Créer et exporter une instance singleton
export const solanaMonitor = new SolanaMonitoringService();
