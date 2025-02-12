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

## ⚙️ Configuration environnement

1. Copiez `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```

2. Renseignez les valeurs réelles dans `.env` :
   - Firebase : [Firebase Console](https://console.firebase.google.com/)
   - WalletConnect : [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Contrats Sepolia : Déployez vos contrats ou utilisez les adresses de test

3. Variables importantes :
   - `VITE_FIREBASE_*` : Configuration Firebase (Auth, Storage)
   - `VITE_WALLET_CONNECT_PROJECT_ID` : ID projet WalletConnect
   - `VITE_*_SEPOLIA` : Adresses des contrats sur Sepolia

⚠️ **Important** : Ne jamais commiter le fichier `.env` qui contient vos clés privées.

## Variables d'environnement requises

Pour la sécurité de l'application, les variables d'environnement suivantes doivent être configurées :

### Sécurité et Authentication
```env
# Firebase App Check
VITE_RECAPTCHA_SITE_KEY=votre_cle_recaptcha

# Session et Timeout
VITE_SESSION_TIMEOUT=3600 # Durée de session en secondes
VITE_ENABLE_DEBUG_LOGS=false # Activer les logs de debug

# CSP et Sécurité
VITE_CSP_NONCE_LENGTH=32
VITE_STRICT_CSP=true
VITE_CSP_REPORT_URI=/api/csp-report
VITE_CONTENT_TYPE_OPTIONS=nosniff
VITE_XSS_PROTECTION=1; mode=block

# RPC et API
VITE_MAINNET_RPC_URL=https://mainnet.infura.io/v3/votre_cle
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/votre_cle
VITE_API_URL=https://api.votre-domaine.com
```

### Configuration recommandée pour la production

1. Activez Firebase App Check avec reCAPTCHA v3
2. Définissez un timeout de session approprié (3600s = 1h recommandé)
3. Activez les CSP strictes en production
4. Utilisez des URLs HTTPS pour tous les endpoints
5. Configurez les rapports CSP pour monitorer les violations

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
