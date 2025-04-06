# Plan d'Intégration des Blockchains - TokenForge

Ce document détaille le plan d'intégration multi-chain pour le projet TokenForge, en utilisant viem pour l'interaction avec les blockchains et vitest pour les tests.

## 1. Architecture d'intégration multi-chain

### 1.1 Structure fondamentale

```
src/
  blockchain/
    adapters/            # Adaptateurs spécifiques à chaque blockchain
      ethereum.ts        # ✅ Implémenté
      binance.ts         # ✅ Implémenté
      polygon.ts         # ✅ Implémenté
      avalanche.ts       # ✅ Implémenté
      arbitrum.ts        # ✅ Implémenté
      solana.ts          # 🔄 Ébauche implémentée avec @solana/web3.js et @solana/spl-token
    interfaces/          # Interfaces communes
      IBlockchainService.ts  # ✅ Implémenté
      IPaymentService.ts     # ✅ Implémenté
      ITokenService.ts       # ✅ Implémenté
    providers/           # Configuration des providers
      index.ts           # ✅ Implémenté
      config.ts          # ✅ Implémenté
    services/            # Services blockchain indépendants de la chaîne
      BlockchainService.ts   # ✅ Implémenté
      PaymentService.ts      # ⏳ À implémenter
      TokenService.ts        # ⏳ À implémenter
    utils/               # Utilitaires communs
      abi.ts             # ⏳ À implémenter
      formatters.ts      # ⏳ À implémenter
      validators.ts      # ⏳ À implémenter
      gas-estimators.ts  # ⏳ À implémenter
    hooks/               # Hooks React pour l'UI
      useBlockchain.ts       # ✅ Implémenté
      useTokenCreation.ts    # ✅ Implémenté
      useTokenDeployment.ts  # ✅ Implémenté
      usePayment.ts          # ✅ Implémenté
    constants/           # Constantes partagées
      chains.ts          # ✅ Implémenté (via config.ts)
      contracts.ts       # ⏳ À implémenter
      abis/              # ⏳ À implémenter
    types.ts             # ✅ Implémenté
    factory.ts           # ✅ Implémenté
```

### 1.2 Architecture des services

- **Service Abstrait → Adaptateurs Spécifiques → Implémentations par Blockchain**
- Utilisation du pattern adapter pour gérer les différences entre blockchains
- Toutes les interactions via viem pour les EVM chains (Ethereum, BSC, Polygon, Avalanche, Arbitrum)
- Adaptateur spécifique pour Solana (non-EVM) à développer

## 2. État d'avancement par blockchain

### Phase 1: Fondation (Mois 1-3) ✅ Terminé

- Configuration initiale des providers et création des interfaces communes
- Implémentation du service de base BlockchainService
- Définition des types partagés

### Phase 2: Développement Core (Mois 4-6) ✅ En cours

- Ethereum & BSC (Semaines 13-14) ✅ Terminé
- Polygon & Avalanche (Semaines 15-16) ✅ Terminé
- Hooks React pour l'UI ✅ Terminé
  - useBlockchain ✅ Terminé
  - useTokenCreation ✅ Terminé
  - usePayment ✅ Terminé
  - useTokenDeployment ✅ Terminé

### Phase 3: Extension & Services (Mois 7-9) ⏳ À venir

- Arbitrum (Semaines 25-28) ✅ Implémenté
- Services communs ⏳ À implémenter
  - PaymentService
  - TokenService
- Utilitaires communs ⏳ À implémenter
  - abi.ts
  - formatters.ts
  - validators.ts
  - gas-estimators.ts

### Phase 4: Optimisation & Scaling (Mois 10-12) ⏳ À venir

- Solana (Semaines 37-40) 🔄 Ébauche implémentée avec dépendances installées
- Tests d'intégration et E2E ⏳ À implémenter
- Documentation complète ⏳ À implémenter

## 3. Implémentation détaillée

### 3.1 Interfaces de base

Les interfaces de base ont été implémentées et définissent le contrat commun pour tous les services blockchain:

- **IBlockchainService**: Méthodes communes à toutes les blockchains
- **IPaymentService**: Méthodes pour la gestion des paiements
- **ITokenService**: Méthodes pour la création et gestion des tokens

### 3.2 Adaptateurs spécifiques

Les adaptateurs suivants ont été implémentés:

- **Ethereum**: EthereumBlockchainService, EthereumPaymentService, EthereumTokenService
- **Binance Smart Chain**: BinanceBlockchainService, BinancePaymentService, BinanceTokenService
- **Polygon**: PolygonBlockchainService, PolygonPaymentService, PolygonTokenService
- **Avalanche**: AvalancheBlockchainService, AvalanchePaymentService, AvalancheTokenService
- **Arbitrum**: ArbitrumBlockchainService, ArbitrumPaymentService, ArbitrumTokenService

Chaque adaptateur implémente les interfaces communes avec des fonctionnalités spécifiques à chaque blockchain.

### 3.3 Hooks React

Les hooks React suivants ont été implémentés pour faciliter l'utilisation dans l'UI:

- **useBlockchain**: Hook de base pour la connexion blockchain
- **useTokenCreation**: Hook pour la création de tokens
- **usePayment**: Hook pour la gestion des paiements
- **useTokenDeployment**: Hook pour le déploiement de tokens et le suivi du statut

### 3.4 Tests

Les tests unitaires ont été mis en place pour les adaptateurs:

- **Ethereum**: Tests unitaires pour EthereumBlockchainService, EthereumPaymentService, EthereumTokenService
- **Polygon**: Tests unitaires pour PolygonBlockchainService, PolygonPaymentService, PolygonTokenService
- **Arbitrum**: Tests unitaires pour ArbitrumBlockchainService, ArbitrumPaymentService, ArbitrumTokenService

## 4. Prochaines étapes

### 4.1 Implémentation des adaptateurs restants

- **Arbitrum**: ✅ Implémenté avec fonctionnalités spécifiques pour L2
- **Solana**: 🔄 Ébauche implémentée avec dépendances installées, à finaliser
  - ✅ Dépendances @solana/web3.js et @solana/spl-token installées
  - ✅ Problèmes de typage TypeScript résolus avec des déclarations de types personnalisées
  - ✅ Adaptateur activé dans la factory
  - Finaliser l'implémentation avec les spécificités de Solana
  - Créer des tests unitaires pour l'adaptateur Solana
  - Tester l'intégration avec un wallet Solana

### 4.2 Développement des services communs

- **PaymentService**: Service commun pour la gestion des paiements
- **TokenService**: Service commun pour la gestion des tokens

### 4.3 Utilitaires communs

- **abi.ts**: Gestion des ABIs pour les différents contrats
- **formatters.ts**: Formatters pour les données blockchain
- **validators.ts**: Validateurs pour les données utilisateur
- **gas-estimators.ts**: Estimateurs de gas pour les différentes blockchains

### 4.4 Tests

- **Tests unitaires**: Compléter les tests unitaires pour tous les adaptateurs
- **Tests d'intégration**: Développer des tests d'intégration pour les services
- **Tests E2E**: Développer des tests E2E pour les parcours utilisateur

### 4.5 Documentation

- **Documentation API**: Documentation complète des APIs
- **Exemples d'utilisation**: Exemples d'utilisation des différents services et hooks
- **Guides d'intégration**: Guides pour intégrer de nouvelles blockchains

## 5. Conclusion

L'intégration blockchain progresse selon le plan établi. Les adaptateurs pour Ethereum, Binance Smart Chain, Polygon, Avalanche et Arbitrum ont été complètement implémentés, et une ébauche d'implémentation pour Solana a été créée avec les dépendances nécessaires installées, les problèmes de typage résolus et l'adaptateur activé dans la factory. Les hooks React pour l'UI ont également été développés. Les prochaines étapes consistent à finaliser l'adaptateur Solana, développer les services communs et les utilitaires, et compléter les tests et la documentation.
