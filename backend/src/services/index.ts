import * as BlockchainServices from "./blockchain";
const PaymentSessionService = require("./PaymentSessionService");
const BlockchainMonitoringService = require("./BlockchainMonitoringService");
const PriceOracleService = require("./PriceOracleService");
const PricingService = require("./PricingService");
const ProductService = require("./ProductService");

// Exporter tous les services
module.exports = {
  // Services de paiement blockchain
  BlockchainServices,

  // Services principaux
  PaymentSessionService,
  BlockchainMonitoringService,
  PriceOracleService,
  PricingService,
  ProductService,

  // Instances singleton pour faciliter l'utilisation
  paymentSessionService: new PaymentSessionService(),
  blockchainMonitoringService: new BlockchainMonitoringService(),
  priceOracleService: new PriceOracleService(),
  pricingService: new PricingService(),
  productService: new ProductService(),
};
