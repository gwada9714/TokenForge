# Configuration reCAPTCHA - À faire avant la production

## Étapes à suivre

1. **Créer un projet Google Cloud Platform**

   - Aller sur [Google Cloud Console](https://console.cloud.google.com)
   - Créer un nouveau projet ou utiliser un projet existant
   - Noter l'ID du projet

2. **Configurer reCAPTCHA**

   - Aller sur [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Créer un nouveau site
   - Type : reCAPTCHA v3
   - Domaines : Ajouter votre domaine de production
   - Lier au projet Google Cloud Platform créé précédemment

3. **Mettre à jour les variables d'environnement**

   ```env
   VITE_RECAPTCHA_SITE_KEY=votre_cle_site
   ```

4. **Réactiver App Check dans le code**
   - Décommenter la configuration reCAPTCHA dans `src/config/firebase.ts`
   - Retirer le mode debug d'App Check

## Notes importantes

- Ne pas déployer en production sans avoir configuré reCAPTCHA
- Tester la configuration sur un environnement de staging d'abord
- Garder les clés secrètes et ne jamais les commiter
- Mettre à jour la documentation de sécurité après l'activation
