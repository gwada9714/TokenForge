# Système de Paiement Multi-Blockchain de TokenForge

Ce module implémente un système de paiement multi-blockchain permettant aux utilisateurs de payer avec les cryptomonnaies natives de chaque blockchain supportée (ETH, BNB, MATIC, AVAX, SOL, etc.) ainsi qu'avec des stablecoins (USDT, USDC, DAI, BUSD, etc.).

## Architecture

Le système est organisé selon une architecture modulaire avec les composants suivants :

### Services de Paiement Blockchain

Chaque blockchain supportée dispose de son propre service de paiement qui implémente l'interface `IPaymentService` :

- `EthereumPaymentService` : Service de paiement pour Ethereum
- `BSCPaymentService` : Service de paiement pour Binance Smart Chain
- `PolygonPaymentService` : Service de paiement pour Polygon
- `AvalanchePaymentService` : Service de paiement pour Avalanche
- `SolanaPaymentService` : Service de paiement pour Solana
- `ArbitrumPaymentService` : Service de paiement pour Arbitrum

Tous ces services héritent de la classe abstraite `BasePaymentService` qui implémente les fonctionnalités communes.

### Services Centraux

- `PaymentSessionService` : Gère les sessions de paiement et coordonne les interactions avec les services blockchain
- `BlockchainMonitoringService` : Surveille les transactions entrantes sur toutes les blockchains
- `PriceOracleService` : Fournit les taux de change entre cryptomonnaies et EUR
- `PricingService` : Gère les tarifs des services de TokenForge
- `ProductService` : Gère les produits de TokenForge (abonnements, services premium, marketplace)

## Flux de Paiement

1. L'utilisateur sélectionne un produit/service à acheter
2. L'utilisateur choisit la blockchain et la cryptomonnaie pour le paiement
3. Le système crée une session de paiement avec un montant converti en crypto
4. L'utilisateur effectue le paiement vers l'adresse du wallet TokenForge
5. Le système confirme la transaction et active le produit/service

## Wallet Centralisé

Tous les paiements sont dirigés vers un unique wallet MetaMask (adresse : `0x92e92b2705edc3d4c7204f961cc659c0`) qui centralise la gestion des fonds.

## Cryptomonnaies Supportées

### Ethereum

- ETH (natif)
- USDT, USDC, DAI (stablecoins)

### Binance Smart Chain

- BNB (natif)
- BUSD, USDT, USDC (stablecoins)

### Polygon

- MATIC (natif)
- USDT, USDC, DAI (stablecoins)

### Avalanche

- AVAX (natif)
- USDT, USDC, DAI.e (stablecoins)

### Solana

- SOL (natif)
- USDT, USDC (stablecoins)

### Arbitrum

- ETH (natif)
- USDT, USDC, DAI (stablecoins)

## Monitoring des Transactions

Le système surveille en continu les transactions entrantes sur toutes les blockchains supportées pour détecter automatiquement les paiements et mettre à jour les sessions correspondantes.

## Conversion de Prix

Pour assurer une tarification cohérente, le système :

- Maintient tous les prix en EUR dans le backend
- Convertit en temps réel les prix en crypto selon le taux de change actuel
- Ajoute une marge de sécurité (2-5%) pour tenir compte de la volatilité

## Utilisation

```typescript
// Exemple d'utilisation du système de paiement
import { paymentSessionService } from "../services";

// Créer une session de paiement
const session = await paymentSessionService.createPaymentSession("ethereum", {
  userId: "user123",
  productId: "token-creation",
  productType: "token_creation",
  amount: 299, // EUR
  currency: "ETH",
  payerAddress: "0x1234...",
});

// Vérifier le statut d'un paiement
const status = await paymentSessionService.checkPaymentStatus(
  session.sessionId
);

// Confirmer un paiement
const confirmed = await paymentSessionService.confirmPayment(
  session.sessionId,
  "0xabcd..."
);
```

## Implémentation Future

Pour une implémentation complète, il faudrait :

1. Intégrer avec Firebase pour la persistance des données
2. Implémenter la vérification réelle des transactions sur chaque blockchain
3. Ajouter des webhooks pour les notifications de paiement
4. Mettre en place un système de réconciliation des paiements
