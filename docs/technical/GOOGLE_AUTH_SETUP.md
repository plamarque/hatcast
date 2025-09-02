# Configuration Google Authentication

## Vue d'ensemble

L'authentification Google a été intégrée dans HatCast pour permettre aux utilisateurs de se connecter et créer un compte en 1-click via leur compte Google.

## Architecture

### Services implémentés

1. **`src/services/firebase.js`**
   - `signInWithGoogle()` - Connexion avec Google
   - `signUpWithGoogle()` - Inscription avec Google (même processus que la connexion)
   - Gestion des erreurs spécifiques à Google Auth

2. **`src/components/AccountLoginModal.vue`**
   - Bouton Google en premier (UX prioritaire)
   - Fallback vers email/password
   - Audit logging intégré

3. **`src/components/AccountCreationModal.vue`**
   - Bouton Google en premier
   - Alternative email/password maintenue
   - Gestion de la navigation post-inscription

## Configuration Firebase requise

### Console Firebase

1. **Activer Google Auth Provider**
   ```
   Firebase Console > Authentication > Sign-in method > Google > Enable
   ```

2. **Configurer les domaines autorisés**
   ```
   Authorized domains:
   - localhost (pour développement)
   - hatcast-staging.web.app (pour staging)
   - hatcast.fr (pour production)
   - Autres domaines selon besoin
   ```

3. **Obtenir les clés OAuth**
   - Client ID sera automatiquement configuré
   - Pas de configuration supplémentaire nécessaire côté serveur

### Variables d'environnement

Aucune variable supplémentaire nécessaire. Google Auth utilise la configuration Firebase existante.

## Flux utilisateur

### Connexion
1. User clique "Continue with Google"
2. Popup Google s'ouvre
3. User s'authentifie
4. Firebase crée/connecte le compte automatiquement
5. Redirection vers l'app avec l'utilisateur connecté
6. Audit log créé

### Inscription
1. Même processus que la connexion
2. Firebase détecte automatiquement si c'est un nouvel utilisateur
3. Compte créé instantanément si n'existe pas
4. Navigation state préservée pour redirection

## Gestion des erreurs

- **Popup fermée** : Message user-friendly
- **Popup bloquée** : Instructions pour autoriser
- **Compte existant** : Guidance vers la connexion appropriée
- **Erreurs réseau** : Message générique avec retry

## Audit et logging

Tous les événements Google Auth sont loggés :
- `google_signin_success` / `google_signin_attempt_failed`
- `google_signup_success` / `google_signup_attempt_failed`
- Emails obfusqués selon la politique de confidentialité [[memory:7929229]]

## Tests

Les tests Playwright devront être mis à jour pour supporter :
- Test du bouton Google (mock des popups)
- Test des flux d'erreur
- Test de l'audit logging

## Prochaines étapes

1. **Configuration Firebase Console** (manuel)
2. **Tests en environnement staging**
3. **Tests de production**
4. **Mise à jour des tests automatisés**

## Notes de sécurité

- Google Auth utilise OAuth 2.0 avec PKCE
- Pas de stockage de credentials côté client
- Session gérée par Firebase Auth
- Domaines autorisés strictement contrôlés
