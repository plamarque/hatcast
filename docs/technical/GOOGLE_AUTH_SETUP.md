# Configuration de l'authentification Google

## Vue d'ensemble

L'authentification Google a été ajoutée au projet pour permettre une connexion simplifiée et la création automatique de comptes utilisateurs.

## Configuration Firebase Console

### 1. Activer Google Auth Provider

1. Aller dans Firebase Console → Authentication → Sign-in method
2. Cliquer sur "Google" dans la liste des providers
3. Activer le toggle "Enable"
4. Configurer les domaines autorisés :
   - `localhost` (pour le développement local)
   - `hatcast.app` (pour la production)
   - `staging.hatcast.app` (pour le staging)

### 2. Configuration OAuth

- Le **Web SDK configuration** sera automatiquement générée
- Les **Client ID** et **Client Secret** seront gérés par Firebase
- Aucune variable d'environnement supplémentaire n'est nécessaire

## Implémentation

### Service Firebase (`src/services/firebase.js`)

```javascript
// Nouvelle fonction ajoutée
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  
  const result = await signInWithPopup(auth, provider)
  return {
    user: result.user,
    isNewUser: result.additionalUserInfo?.isNewUser || false,
    providerId: 'google.com'
  }
}
```

### Interface utilisateur (`src/components/AccountLoginModal.vue`)

- Bouton "Continuer avec Google" ajouté avec l'icône officielle Google
- Gestion des erreurs spécifiques (popup bloquée, connexion annulée)
- Intégration avec le système d'audit existant
- Support des sessions de confiance d'appareil

## Fonctionnalités

### Création automatique de comptes

- **Nouveau utilisateur Google** : Firebase Auth crée automatiquement le compte
- **Utilisateur existant** : Connexion directe avec le compte existant
- **Intégration transparente** : Compatible avec le système de playerProtection existant

### Audit et sessions

- Logging d'audit avec type `google_auth`
- Support des sessions de confiance d'appareil
- Gestion des erreurs et retry automatique

### Gestion d'erreur

- `auth/popup-closed-by-user` : "Connexion annulée"
- `auth/popup-blocked` : "Popup bloquée par le navigateur"
- `auth/cancelled-popup-request` : "Connexion annulée"

## Test local

1. Configurer Google Auth dans Firebase Console
2. Démarrer le serveur de développement : `npm run dev -- --host`
3. Ouvrir la modal de connexion
4. Cliquer sur "Continuer avec Google"
5. Vérifier la création automatique du compte dans Firebase Auth

## Sécurité

- **Domaines autorisés** configurés dans Firebase Console
- **Scopes minimaux** : email et profile uniquement
- **Validation côté serveur** : Firebase Auth gère automatiquement la validation des tokens
- **Audit complet** : Toutes les connexions sont loggées

## Compatibilité

- Compatible avec le système d'authentification existant
- Réutilise authState.js pour la gestion d'état
- S'intègre avec playerPasswordSession.js pour les sessions de confiance
- Compatible avec le système de playerProtection existant