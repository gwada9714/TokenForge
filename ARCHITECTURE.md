# Architecture TokenForge

> **Note**: Cette architecture technique s'inscrit dans le cadre du [Plan de Projet Détaillé](PROJECT_PLAN.md) qui définit la vision globale, les phases de développement et les objectifs du projet. Pour une vision architecturale plus complète et détaillée, consultez le [Plan d'Architecture Détaillé](ARCHITECTURE_PLAN.md).

## Structure du Projet

- `/src/core/` - Services et configurations core
  - `/src/core/auth/` - Service d'authentification centralisé
  - `/src/core/web3/` - Service Web3 centralisé
  - `/src/core/logger/` - Système de logging centralisé
  - `/src/core/monitoring/` - Service de monitoring
- `/src/features/` - Fonctionnalités principales organisées par domaine
- `/src/shared/` - Composants et utilitaires partagés
  - `/src/shared/components/` - Composants UI réutilisables
  - `/src/shared/hooks/` - Hooks React partagés
  - `/src/shared/utils/` - Fonctions utilitaires
  - `/src/shared/types/` - Types TypeScript partagés
- `/src/layouts/` - Layouts de l'application
- `/src/router/` - Configuration du routeur
- `/src/store/` - État global (Redux)

## Patterns & Conventions

- Utiliser les imports absolus avec alias (@/)
- Suivre le pattern Feature-First
- Utiliser le typage strict TypeScript
- Tests unitaires pour chaque feature
- Logging standardisé via BaseLogger
- Gestion centralisée des erreurs Redux
- Persistence des logs dans localStorage
- Monitoring centralisé des métriques

## Organisation du Code

- **Core Services**: Services fondamentaux de l'application (auth, web3, logging)
- **Features**: Modules fonctionnels organisés par domaine métier
- **Shared**: Composants et utilitaires partagés entre les features
- **Hooks**: Logique réutilisable encapsulée dans des hooks React

## Sécurité

- CSP avec nonces pour tous les scripts
- Validation des entrées utilisateur
- Gestion sécurisée des tokens
- Traçabilité complète via le système de logging

## Performance

- Code splitting par feature
- Lazy loading des composants lourds
- Optimisation des renders React
- Gestion optimisée des erreurs
- Logging asynchrone pour les performances
- Optimisation du stockage des logs
- Métriques de performance en temps réel
