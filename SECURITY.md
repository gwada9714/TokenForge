# Guide de Sécurité TokenForge

## Configuration de la Sécurité

### Variables d'Environnement Requises

```env
# Firebase App Check
VITE_RECAPTCHA_SITE_KEY=<votre_cle_recaptcha>

# Session et Timeout
VITE_SESSION_TIMEOUT=3600
VITE_ENABLE_DEBUG_LOGS=false

# CSP et Sécurité
VITE_CSP_NONCE_LENGTH=32
VITE_STRICT_CSP=true
VITE_CSP_REPORT_URI=/api/csp-report
```

### Vérification de la Configuration

1. Exécutez la vérification de sécurité :

   ```bash
   npm run security-check
   ```

2. Assurez-vous que toutes les variables d'environnement sont configurées correctement.

## Bonnes Pratiques de Sécurité

### Authentication

1. Utilisation de Firebase App Check avec reCAPTCHA v3
2. Session timeout basé sur l'activité
3. Rate limiting exponentiel pour les tentatives de connexion
4. Vérification d'email obligatoire

### Protection des Données

1. Règles Firestore strictes avec validation
2. Chiffrement des données sensibles
3. Nettoyage automatique des sessions expirées
4. Backup automatique des configurations

### Sécurité Frontend

1. Content Security Policy (CSP) strict
2. Protection contre le XSS
3. En-têtes de sécurité complets
4. Monitoring des violations CSP

### Déploiement Sécurisé

1. Utilisez le script de déploiement sécurisé :

   ```bash
   npm run deploy:secure
   ```

2. Le script effectue :
   - Vérifications de sécurité
   - Audit des dépendances
   - Backup des configurations
   - Déploiement progressif

## Monitoring et Rapports

### Violations CSP

Les violations CSP sont :

1. Enregistrées dans Firestore
2. Envoyées à Sentry
3. Accessibles via le dashboard admin

### Audit de Sécurité

Effectuez régulièrement :

1. `npm audit` pour les vulnérabilités
2. Revue des logs de violation CSP
3. Vérification des sessions actives
4. Analyse des tentatives de connexion échouées

## Mise à Jour des Configurations

### CSP

1. Modifiez `src/config/csp.ts`
2. Testez avec `npm run security-check`
3. Surveillez les violations après déploiement

### Règles Firestore

1. Modifiez `firestore.rules`
2. Testez avec les cas d'utilisation
3. Déployez avec `npm run deploy:secure`

## Réponse aux Incidents

1. Monitoring via Sentry
2. Logs détaillés des événements
3. Système de backup automatique
4. Procédure de rollback disponible

## Contact

Pour signaler une vulnérabilité :

1. Ne pas créer d'issue publique
2. Contacter security@tokenforge.com
3. Utiliser la clé PGP fournie
