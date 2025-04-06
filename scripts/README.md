# Scripts de migration pour TokenForge

Ce dossier contient des scripts pour faciliter la migration vers les nouveaux services unifiés.

## Installation

```bash
cd scripts
npm install
```

## Utilisation

### Mettre à jour les imports du logger

```bash
npm run update-logger
```

Ce script met à jour tous les imports qui font référence aux anciens services de logging pour utiliser le nouveau service de logging unifié.

### Mettre à jour les imports de configuration

```bash
npm run update-config
```

Ce script met à jour tous les imports qui font référence aux anciens services de configuration pour utiliser le nouveau service de configuration unifié.

### Mettre à jour les imports d'authentification

```bash
npm run update-auth
```

Ce script met à jour tous les imports qui font référence aux anciens services d'authentification pour utiliser les nouveaux services d'authentification unifiés.

### Mettre à jour tous les imports

```bash
npm run update-all
```

Ce script exécute tous les scripts de mise à jour des imports en séquence.

## Fonctionnement

Les scripts parcourent tous les fichiers TypeScript et TSX du projet et mettent à jour les imports qui font référence aux anciens services pour utiliser les nouveaux services unifiés.

Exemple de mapping pour les imports du logger:

```javascript
const importMappings = {
  "@/utils/logger": "@/core/logger",
  "@/utils/firebase-logger": "@/core/logger",
  // ...
};
```

## Remarques

- Les scripts sont idempotents, c'est-à-dire qu'ils peuvent être exécutés plusieurs fois sans effet secondaire.
- Les scripts ne modifient que les imports, pas le code qui utilise les services.
- Les scripts ne suppriment pas les anciens fichiers, ils ne font que mettre à jour les imports.
