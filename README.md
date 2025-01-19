# TokenForge App

Application de création et de gestion de tokens sur la blockchain, avec interface d'administration et fonctionnalités avancées.

## 🚀 Fonctionnalités

- Création de tokens personnalisés
- Interface d'administration sécurisée
- Gestion des alertes et audit logs
- Tableau de bord de staking
- Système de profit sharing
- Launchpad intégré

## 🛠️ Technologies

- React 18+ avec TypeScript
- Redux pour la gestion d'état
- Material-UI pour l'interface utilisateur
- Web3.js pour l'interaction blockchain
- React Router pour la navigation
- Jest & Testing Library pour les tests

## 📁 Structure du Projet

```
src/
├── components/
│   ├── common/              # Composants réutilisables
│   │   ├── Layout/         # Layouts de l'application
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingFallback.tsx
│   └── features/           # Composants spécifiques aux fonctionnalités
│       └── admin/          # Interface d'administration
│           ├── alerts/     # Gestion des alertes
│           ├── audit/      # Logs d'audit
│           ├── contract/   # Contrôles du contrat
│           └── ownership/  # Gestion des droits
├── router/
│   ├── routes.tsx          # Configuration des routes principales
│   └── adminRoutes.tsx     # Routes d'administration
├── store/
│   └── slices/            # Slices Redux
├── hooks/                  # Hooks personnalisés
├── contexts/              # Contextes React
└── types/                 # Types TypeScript
```

## 🔒 Sécurité

- Protection des routes avec guards d'authentification
- Vérification des droits administrateur
- Validation des transactions blockchain
- Gestion sécurisée des clés privées

## 🧪 Tests

Les tests sont organisés en plusieurs catégories :
- Tests unitaires pour les composants
- Tests d'intégration pour les routes
- Tests des guards d'authentification
- Tests des fonctionnalités blockchain

Pour lancer les tests :
```bash
npm test            # Lance tous les tests
npm test:watch     # Mode watch
npm test:coverage  # Rapport de couverture
```

## 🔄 Lazy Loading

L'application utilise le lazy loading pour optimiser les performances :
- Chargement différé des composants
- Suspense boundaries pour le feedback utilisateur
- Error boundaries pour la gestion des erreurs
- Fallback UI pendant le chargement

## 🚦 Routes

### Routes Principales
- `/` - Page d'accueil
- `/login` - Connexion
- `/signup` - Inscription
- `/create` - Création de token
- `/staking` - Dashboard de staking
- `/profit` - Gestion des profits
- `/launchpad` - Page du launchpad
- `/my-tokens` - Tokens de l'utilisateur
- `/pricing` - Tarification

### Routes Admin
- `/admin` - Dashboard administrateur
- `/admin/contract` - Contrôle du contrat
- `/admin/ownership` - Gestion des droits
- `/admin/alerts` - Configuration des alertes
- `/admin/audit` - Logs d'audit

## 🛠️ Installation

1. Cloner le repository
```bash
git clone [URL_DU_REPO]
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```

4. Lancer l'application
```bash
npm start
```

## 🤝 Contribution

1. Créer une branche pour votre fonctionnalité
2. Commiter vos changements
3. Pousser vers la branche
4. Créer une Pull Request

## 📝 License

MIT License - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.
