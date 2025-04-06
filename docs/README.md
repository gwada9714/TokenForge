# TokenForge Documentation

## Introduction

TokenForge est une plateforme décentralisée permettant la création et la gestion de tokens sur la blockchain. Cette documentation fournit toutes les informations nécessaires pour comprendre et utiliser l'application.

## Structure de la Documentation

- 📁 `/guides` - Guides utilisateur et tutoriels

  - Guide de création de token
  - Guide d'utilisation du marketplace
  - Guide d'administration

- 📁 `/api` - Documentation technique de l'API

  - Endpoints
  - Types et interfaces
  - Exemples d'utilisation

- 📁 `/components` - Documentation des composants React
  - Structure des composants
  - Props et configurations
  - Exemples d'utilisation

## Démarrage Rapide

1. Installation

```bash
git clone https://github.com/your-username/tokenforge-app.git
cd tokenforge-app
npm install
```

2. Configuration

```bash
cp .env.example .env
# Configurez vos variables d'environnement
```

3. Lancement

```bash
npm run dev
```

## Architecture

L'application suit une architecture modulaire basée sur les fonctionnalités :

```
src/
├── components/
│   └── features/
│       ├── token/        # Création et gestion des tokens
│       ├── marketplace/  # Place de marché des tokens
│       ├── staking/      # Staking et récompenses
│       └── admin/        # Interface d'administration
├── hooks/               # Hooks React personnalisés
├── router/             # Configuration des routes
└── pages/              # Pages de l'application
```

## Contribution

Pour contribuer au projet, veuillez consulter notre guide de contribution dans `/guides/contributing.md`.
