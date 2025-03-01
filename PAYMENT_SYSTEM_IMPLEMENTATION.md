# Implémentation du Système de Paiement Multi-Blockchain de TokenForge

Ce document décrit l'implémentation du système de paiement multi-blockchain de TokenForge, qui permet aux utilisateurs de payer avec les cryptomonnaies natives de chaque blockchain supportée (ETH, BNB, MATIC, AVAX, SOL, etc.) ainsi qu'avec des stablecoins (USDT, USDC, DAI, BUSD, etc.).

## Vue d'ensemble

Le système de paiement TokenForge est conçu pour offrir une flexibilité maximale aux utilisateurs en leur permettant de payer avec différentes cryptomonnaies sur plusieurs blockchains. Tous les paiements sont dirigés vers un unique wallet MetaMask (adresse : `0x92e92b2705edc3d4c7204f961cc659c0`) qui centralise la gestion des fonds.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Interface Utilisateur                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                       API Backend (Routes)                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    PaymentSessionService                         │
└─┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────────┘
  │         │         │         │         │         │
┌─▼───────┐ ┌─▼─────┐ ┌─▼─────┐ ┌─▼─────┐ ┌─▼─────┐ ┌─▼───────────┐
│Ethereum │ │ BSC   │ │Polygon│ │Avalanc│ │Solana │ │Arbitrum     │
│Service  │ │Service│ │Service│ │Service│ │Service│ │Service      │
└─────────┘ └───────┘ └───────┘ └───────┘ └───────┘ └─────────────┘
```

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

## Cryptomonnaies Supportées

Le système supporte les cryptomonnaies suivantes sur chaque blockchain :

| Blockchain | Crypto Native | Stablecoins |
|------------|---------------|-------------|
| Ethereum   | ETH           | USDT, USDC, DAI |
| BSC        | BNB           | BUSD, USDT, USDC |
| Polygon    | MATIC         | USDT, USDC, DAI |
| Avalanche  | AVAX          | USDT, USDC, DAI.e |
| Solana     | SOL           | USDT, USDC |
| Arbitrum   | ETH           | USDT, USDC, DAI |

## Monitoring des Transactions

Le système surveille en continu les transactions entrantes sur toutes les blockchains supportées pour détecter automatiquement les paiements et mettre à jour les sessions correspondantes.

## Conversion de Prix

Pour assurer une tarification cohérente, le système :
- Maintient tous les prix en EUR dans le backend
- Convertit en temps réel les prix en crypto selon le taux de change actuel
- Ajoute une marge de sécurité (2-5%) pour tenir compte de la volatilité

## Tarification

Le système de paiement est intégré avec le système de tarification de TokenForge, qui comprend :

- **Création de tokens** : Prix différents selon la blockchain (Ethereum : 299€, BSC : 199€, etc.)
- **Abonnements** : Plans Basic (19.99€/mois), Premium (49.99€/mois), Enterprise (199.99€/mois)
- **Services premium** : Audit de sécurité (499€), Intégration KYC (299€), etc.
- **Marketplace** : Templates de tokens et autres produits

## Implémentation Technique

### Backend

Le backend est implémenté en TypeScript avec Node.js. Les services de paiement sont organisés de manière modulaire pour faciliter l'ajout de nouvelles blockchains.

### Stockage des Données

Dans une implémentation complète, les données seraient stockées dans Firebase :
- Sessions de paiement
- Transactions
- Utilisateurs et leurs abonnements
- Produits achetés

### Sécurité

Le système inclut plusieurs mesures de sécurité :
- Vérification des transactions sur la blockchain
- Validation des montants reçus
- Vérification des adresses d'expéditeur et de destinataire
- Gestion des délais d'expiration des sessions

## Avantages du Système

1. **Flexibilité pour les utilisateurs** : Choix entre cryptos natives et stablecoins sur plusieurs blockchains
2. **Simplicité opérationnelle** : Un seul wallet pour toutes les blockchains
3. **Compétitivité tarifaire** : Maintien de l'avantage de 20-40% par rapport à la concurrence
4. **Robustesse et fiabilité** : Double système de confirmation des transactions

## Implémentation Future

Pour une implémentation complète, il faudrait :
1. Intégrer avec Firebase pour la persistance des données
2. Implémenter la vérification réelle des transactions sur chaque blockchain
3. Ajouter des webhooks pour les notifications de paiement
4. Mettre en place un système de réconciliation des paiements
5. Ajouter des tests unitaires et d'intégration
6. Mettre en place un système de monitoring et d'alertes
