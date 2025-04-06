# Interface d'Administration

Cette section contient tous les composants liés à l'interface d'administration de TokenForge.

## 📁 Structure

```
admin/
├── AdminDashboard.tsx      # Dashboard principal
├── alerts/                # Gestion des alertes
│   ├── AlertForm.tsx      # Formulaire d'ajout d'alerte
│   ├── AlertList.tsx      # Liste des alertes
│   └── AlertsManagement.tsx # Gestion globale des alertes
├── audit/                 # Logs d'audit
│   ├── AuditLogList.tsx   # Liste des logs
│   ├── AuditLogToolbar.tsx # Barre d'outils
│   └── AuditLogs.tsx      # Gestion des logs
├── contract/             # Contrôle du contrat
│   └── ContractControls.tsx
└── ownership/           # Gestion des droits
    └── OwnershipManagement.tsx
```

## 🔒 Contrôle d'Accès

L'accès à l'interface d'administration est protégé par :

- Guard d'authentification (`AdminRoute`)
- Vérification de l'adresse propriétaire
- Validation des droits administrateur

## 📊 Fonctionnalités

### Dashboard Principal

- Vue d'ensemble des statistiques
- Navigation vers les différentes sections
- Statut du contrat

### Gestion des Alertes

- Création de règles d'alerte
- Activation/désactivation des alertes
- Configuration des conditions

### Logs d'Audit

- Historique des actions
- Filtrage et recherche
- Export des données
- Purge des logs anciens

### Contrôle du Contrat

- Pause/reprise du contrat
- Mise à jour des paramètres
- Gestion des fonctionnalités

### Gestion des Droits

- Transfert de propriété
- Gestion des rôles
- Permissions spéciales

## 🧪 Tests

Chaque composant dispose de ses propres tests :

- Tests unitaires des composants
- Tests d'intégration
- Tests des fonctionnalités métier

## 📝 Convention de Nommage

- Composants : PascalCase (ex: `AlertForm.tsx`)
- Fichiers de test : `*.test.tsx`
- Hooks : camelCase avec préfixe "use" (ex: `useAlertRules.ts`)
- Types : PascalCase avec suffixe descriptif (ex: `AlertRule.ts`)

## 🔄 État Global

L'état de l'interface d'administration est géré via :

- Redux pour l'état global
- Context API pour les données partagées
- État local pour les composants isolés

## 🎨 Style et Thème

- Utilisation de Material-UI
- Styled-components pour les styles personnalisés
- Thème cohérent avec l'application principale

## 🚀 Performance

- Lazy loading des composants
- Mise en cache des données
- Optimisation des requêtes blockchain
- Suspense boundaries pour le chargement
