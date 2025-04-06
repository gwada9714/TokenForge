import { Router, Request, Response } from "express";
const PaymentSessionService = require("../services/PaymentSessionService");
const PriceOracleService = require("../services/PriceOracleService");
const { auth } = require("../middleware/auth");
const PricingService = require("../services/PricingService");
const ProductService = require("../services/ProductService");

// Définir une interface pour étendre Request avec la propriété user
interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    subscription: string;
  };
}

const router = Router();
const paymentSessionService = new PaymentSessionService();
const priceOracleService = new PriceOracleService();
const pricingService = new PricingService();
const productService = new ProductService();

/**
 * @route GET /api/payments/networks
 * @desc Récupérer les réseaux blockchain supportés
 * @access Public
 */
router.get("/networks", async (req, res) => {
  try {
    const networks = [
      { id: "ethereum", name: "Ethereum", chainId: 1 },
      { id: "bsc", name: "Binance Smart Chain", chainId: 56 },
      { id: "polygon", name: "Polygon", chainId: 137 },
      { id: "avalanche", name: "Avalanche", chainId: 43114 },
      { id: "solana", name: "Solana", chainId: 0 }, // Pas un EVM
      { id: "arbitrum", name: "Arbitrum", chainId: 42161 },
    ];

    res.json({ networks });
  } catch (error) {
    console.error("Error fetching networks:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des réseaux" });
  }
});

/**
 * @route GET /api/payments/cryptocurrencies
 * @desc Récupérer les cryptomonnaies supportées pour un réseau donné
 * @access Public
 */
router.get("/cryptocurrencies", async (req, res) => {
  try {
    const { network } = req.query;

    if (!network) {
      return res.status(400).json({ message: 'Paramètre "network" requis' });
    }

    const cryptocurrencies =
      await paymentSessionService.getSupportedCryptocurrencies(
        network as string
      );

    res.json({ cryptocurrencies });
  } catch (error) {
    console.error("Error fetching cryptocurrencies:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des cryptomonnaies" });
  }
});

/**
 * @route GET /api/payments/convert
 * @desc Convertir un montant EUR en cryptomonnaie
 * @access Public
 */
router.get("/convert", async (req, res) => {
  try {
    const { amount, currency, network } = req.query;

    if (!amount || !currency || !network) {
      return res.status(400).json({
        message: 'Paramètres "amount", "currency" et "network" requis',
      });
    }

    const paymentService = paymentSessionService.getPaymentService(
      network as string
    );

    const cryptoAmount = await paymentService.convertEURtoCrypto(
      parseFloat(amount as string),
      currency as string
    );

    res.json({ conversion: cryptoAmount });
  } catch (error) {
    console.error("Error converting EUR to crypto:", error);
    res.status(500).json({ message: "Erreur lors de la conversion" });
  }
});

/**
 * @route GET /api/payments/fees
 * @desc Estimer les frais de transaction
 * @access Public
 */
router.get("/fees", async (req, res) => {
  try {
    const { network, amount, currency } = req.query;

    if (!network || !amount || !currency) {
      return res.status(400).json({
        message: 'Paramètres "network", "amount" et "currency" requis',
      });
    }

    const paymentService = paymentSessionService.getPaymentService(
      network as string
    );

    // Obtenir les informations sur la crypto
    const cryptos = await paymentService.getSupportedCryptocurrencies();
    const selectedCrypto = cryptos.find((c: any) => c.symbol === currency);

    if (!selectedCrypto) {
      return res.status(400).json({ message: "Cryptomonnaie non supportée" });
    }

    const fees = await paymentService.estimateTransactionFees(
      parseFloat(amount as string),
      selectedCrypto.address
    );

    res.json({ fees });
  } catch (error) {
    console.error("Error estimating fees:", error);
    res.status(500).json({ message: "Erreur lors de l'estimation des frais" });
  }
});

/**
 * @route POST /api/payments/create-session
 * @desc Créer une session de paiement
 * @access Private
 */
router.post("/create-session", auth, async (req: any, res: Response) => {
  try {
    const { productId, productType, network, currency, payerAddress } =
      req.body;

    // Vérifier les paramètres requis
    if (!productId || !productType || !network || !currency || !payerAddress) {
      return res.status(400).json({
        message: "Tous les paramètres sont requis",
      });
    }

    // Récupérer le prix du produit
    let amount = 0;

    switch (productType) {
      case "token_creation":
        // Récupérer le prix de création de token pour le réseau spécifié
        amount = await pricingService.getTokenCreationPrice(network);
        break;

      case "subscription":
        // Récupérer le prix de l'abonnement
        const plan = await productService.getSubscriptionPlan(productId);
        amount =
          req.body.subscriptionPeriod === "annual" ? plan.annual : plan.monthly;
        break;

      case "premium_service":
        // Récupérer le prix du service premium
        const service = await productService.getPremiumService(productId);
        amount = service.price;
        break;

      case "marketplace":
        // Récupérer le prix de l'article sur la marketplace
        const item = await productService.getMarketplaceItem(productId);
        amount = item.price;
        break;

      default:
        return res
          .status(400)
          .json({ message: "Type de produit non supporté" });
    }

    // Vérifier que le montant est valide
    if (amount <= 0) {
      return res.status(400).json({ message: "Prix du produit invalide" });
    }

    // Appliquer les réductions en fonction du type d'abonnement
    if (productType === "token_creation") {
      amount = await pricingService.calculateTokenCreationPrice(
        network,
        req.user.id
      );
    }

    // Appliquer les codes promo si présents
    if (req.body.discountCode) {
      const discountRate = await pricingService.getPromoCodeDiscount(
        req.body.discountCode
      );
      if (discountRate > 0) {
        amount = amount * (1 - discountRate);
      }
    }

    // Créer la session de paiement
    const paymentParams = {
      userId: req.user.id,
      productId,
      productType,
      amount,
      subscriptionPeriod: req.body.subscriptionPeriod || "monthly",
      currency,
      payerAddress,
    };

    const session = await paymentSessionService.createPaymentSession(
      network,
      paymentParams
    );

    res.json({ session });
  } catch (error) {
    console.error("Error creating payment session:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la session de paiement",
      error: (error as Error).message,
    });
  }
});

/**
 * @route GET /api/payments/status
 * @desc Vérifier le statut d'une session de paiement
 * @access Public
 */
router.get("/status", async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: 'Paramètre "sessionId" requis' });
    }

    const status = await paymentSessionService.checkPaymentStatus(
      sessionId as string
    );

    res.json({ status });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification du statut de paiement",
      error: (error as Error).message,
    });
  }
});

/**
 * @route POST /api/payments/confirm
 * @desc Confirmer un paiement avec le hash de transaction
 * @access Public
 */
router.post("/confirm", async (req, res) => {
  try {
    const { sessionId, txHash } = req.body;

    if (!sessionId || !txHash) {
      return res.status(400).json({
        message: 'Paramètres "sessionId" et "txHash" requis',
      });
    }

    const confirmed = await paymentSessionService.confirmPayment(
      sessionId,
      txHash
    );

    if (confirmed) {
      res.json({ success: true, message: "Paiement confirmé avec succès" });
    } else {
      res.status(400).json({
        success: false,
        message: "Échec de la confirmation du paiement",
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      message: "Erreur lors de la confirmation du paiement",
      error: (error as Error).message,
    });
  }
});

/**
 * @route GET /api/payments/history
 * @desc Récupérer l'historique des paiements d'un utilisateur
 * @access Private
 */
router.get("/history", auth, async (req: any, res: Response) => {
  try {
    const transactions = await paymentSessionService.getUserTransactions(
      req.user.id
    );
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'historique des paiements",
      error: (error as Error).message,
    });
  }
});

/**
 * @route GET /api/payments/prices
 * @desc Récupérer les prix actuels des cryptomonnaies en EUR
 * @access Public
 */
router.get("/prices", async (req, res) => {
  try {
    const { currencies } = req.query;

    if (!currencies) {
      return res.status(400).json({ message: 'Paramètre "currencies" requis' });
    }

    const currencyList = (currencies as string).split(",");
    const prices: Record<string, number> = {};

    for (const currency of currencyList) {
      prices[currency] = await priceOracleService.getCryptoPrice(
        currency,
        "EUR"
      );
    }

    res.json({ prices });
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des prix des cryptomonnaies",
      error: (error as Error).message,
    });
  }
});

/**
 * @route GET /api/payments/pricing
 * @desc Récupérer la grille tarifaire
 * @access Public
 */
router.get("/pricing", async (req, res) => {
  try {
    // Récupérer la grille tarifaire complète
    const pricing = await pricingService.getFullPricing();
    res.json({ pricing });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la grille tarifaire",
      error: (error as Error).message,
    });
  }
});

export default router;
