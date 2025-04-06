# TokenForge - Système de Paiement Multi-Chaînes

## Description

TokenForge est un système de paiement multi-chaînes qui permet d'accepter des paiements en cryptomonnaies sur différentes blockchains. Le système supporte actuellement :

- Ethereum (ETH, USDT, USDC)
- Polygon (MATIC, USDT, USDC)
- Binance Smart Chain (BNB, USDT, USDC, BUSD)
- Solana (SOL, USDT, USDC)

## Fonctionnalités

- 🔗 Support multi-chaînes
- 💰 Paiements en tokens natifs et stablecoins
- 🔒 Smart contracts sécurisés et audités
- 📊 Interface utilisateur intuitive
- 🚀 Transactions rapides et fiables
- 📱 Design responsive
- 🔍 Suivi des transactions en temps réel

## Architecture

Le système est composé de plusieurs composants :

- Services de paiement par chaîne (Ethereum, Polygon, BSC, Solana)
- Smart contracts pour chaque réseau
- Interface utilisateur React avec Material-UI
- Configuration centralisée des chaînes
- Gestion des sessions de paiement
- Système de monitoring des transactions

## Prérequis

- Node.js v16+
- npm ou yarn
- Accès aux RPC nodes (Alchemy, Infura, etc.)
- Wallet compatible Web3

## Installation

1. Cloner le repository

```bash
git clone https://github.com/votre-username/tokenforge-app.git
cd tokenforge-app
```

2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir les variables dans le fichier `.env` avec vos valeurs.

4. Démarrer l'application en mode développement

```bash
npm run dev
# ou
yarn dev
```

## Configuration

Le système utilise plusieurs variables d'environnement pour la configuration :

- URLs des RPC nodes
- Adresses des smart contracts
- Adresses des treasuries
- Timeouts et confirmations
- Clés API (Alchemy, Infura)

Voir le fichier `.env.example` pour la liste complète.

## Smart Contracts

Les smart contracts sont déployés sur chaque réseau :

- Ethereum: `EthereumPayment.sol`
- Polygon: `PolygonPayment.sol`
- BSC: `BinancePayment.sol`
- Solana: `solana-payment` (Programme Anchor)

## Tests

Le système inclut des tests unitaires et d'intégration :

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tous les tests
npm run test
```

## Sécurité

- Smart contracts audités
- Gestion sécurisée des clés privées
- Validation des transactions
- Timeouts et retry logic
- Gestion des erreurs robuste

## Monitoring

Le système inclut des fonctionnalités de monitoring :

- Statut des transactions
- Temps de confirmation
- Taux de réussite
- Erreurs et timeouts
- Performance par chaîne

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit les changements (`git commit -am 'Ajout de ma feature'`)
4. Push la branche (`git push origin feature/ma-feature`)
5. Créer une Pull Request

## Licence

MIT

## Support

Pour toute question ou problème :

- Ouvrir une issue sur GitHub
- Contacter l'équipe de support
- Consulter la documentation

## Roadmap

Pour une vision détaillée du plan de projet complet, consultez le [Plan de Projet Détaillé](PROJECT_PLAN.md) et le [Plan d'Architecture Détaillé](ARCHITECTURE_PLAN.md).

- [x] Refactorisation des services fondamentaux (logging, configuration, authentification)
- [ ] Support de nouvelles chaînes
- [ ] Amélioration de l'interface utilisateur
- [ ] Optimisation des smart contracts
- [ ] Intégration de nouveaux tokens
- [ ] Système de récompenses
- [ ] Analytics avancés

## Refactorisation

Le projet a fait l'objet d'une refactorisation majeure pour améliorer la qualité du code, la maintenabilité et la sécurité. Pour plus de détails, consultez le [Résumé de la refactorisation](REFACTORING_SUMMARY.md).

Les principaux changements incluent :

- Unification des services de logging ([LOGGER_UNIFICATION.md](LOGGER_UNIFICATION.md))
- Unification des services de configuration ([CONFIG_UNIFICATION.md](CONFIG_UNIFICATION.md))
- Refactorisation des services d'authentification ([AUTH_REFACTORING.md](AUTH_REFACTORING.md))

Des scripts de migration sont disponibles dans le dossier `scripts` pour faciliter la transition vers les nouveaux services.
