# Structure des Tests

Ce dossier contient tous les tests du projet TokenForge, organisés de manière logique par domaine.

## Organisation

- `contracts/` : Tests des contrats intelligents
  - Tests unitaires pour BaseERC20, TaxDistributor, TokenForge, etc.
  - Tests d'intégration des fonctionnalités de contrats

- `security/` : Tests de sécurité
  - Tests de vulnérabilités
  - Tests de conformité CSP
  - Tests de sécurité des contrats

- `firebase/` : Tests Firebase
  - Tests des règles Firestore
  - Tests des fonctions Cloud
  - Tests d'intégration Firebase

- `features/` : Tests des fonctionnalités
  - Tests des composants React
  - Tests des hooks personnalisés
  - Tests d'intégration des features

- `utils/` : Tests des utilitaires
  - Tests des fonctions helpers
  - Tests des utilitaires communs

- `config/` : Configuration des tests
  - Configuration globale
  - Mocks et fixtures communs

- `mocks/` : Mocks réutilisables
  - Mocks des services
  - Données de test

## Scripts disponibles

- `npm test` : Lance tous les tests
- `npm run test:contracts` : Lance les tests des contrats
- `npm run test:contracts:coverage` : Lance les tests des contrats avec couverture
- `npm run test:security` : Lance les tests de sécurité
- `npm run test:firebase` : Lance les tests Firebase
- `npm run test:e2e` : Lance les tests end-to-end
- `npm run test:coverage` : Génère un rapport de couverture complet 