# Architecture TokenForge

## Structure du Projet
- `/src/features/` - Fonctionnalités principales
- `/src/components/` - Composants réutilisables
- `/src/utils/` - Utilitaires et helpers
- `/src/core/` - Services et configurations core
- `/src/core/logger` - Système de logging centralisé
- `/src/core/monitoring` - Service de monitoring
- `/src/hooks` - React Hooks personnalisés

## Patterns & Conventions
- Utiliser les imports absolus avec alias (@/)
- Suivre le pattern Feature-First
- Utiliser le typage strict TypeScript
- Tests unitaires pour chaque feature
- Logging standardisé via BaseLogger
- Gestion centralisée des erreurs Redux
- Persistence des logs dans localStorage
- Monitoring centralisé des métriques

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
