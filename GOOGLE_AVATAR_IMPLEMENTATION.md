# Implémentation de la synchronisation des avatars Google

## Problème résolu

Les utilisateurs signalaient que leur avatar Google n'était pas affiché dans l'application. À la place, un emoji (👨 ou 👩) était affiché selon le genre du joueur.

## Solution implémentée

### 1. Synchronisation automatique lors de la connexion

Quand un utilisateur se connecte avec son compte Google :
- La `photoURL` (avatar Google) est automatiquement récupérée
- Elle est synchronisée avec **tous** les joueurs associés à son email dans Firestore
- La synchronisation se fait sur toutes les saisons où l'utilisateur a des joueurs

### 2. Nouvelles fonctions créées

#### `syncGooglePhotoToPlayers(email, photoURL)` 
Dans `src/services/playerAvatars.js`

Cette fonction :
- Trouve tous les joueurs associés à un email (toutes saisons)
- Met à jour leur `photoURL` dans Firestore
- Vide le cache pour forcer le rechargement
- Émet un événement `avatars-synced` pour notifier les composants

#### `resolvePlayerAvatar(playerId, seasonId, playerGender)`
Dans `src/services/playerAvatars.js`

Fonction utilitaire qui résout l'avatar à afficher :
- Retourne la photo Google si disponible
- Sinon retourne l'emoji selon le genre (👨, 👩, 👤)

### 3. Modifications des fichiers

#### `src/services/authState.js`
- Appelle `syncGooglePhotoToPlayers()` lors de la connexion Google
- Log le nombre de joueurs mis à jour

#### `src/components/PlayerAvatar.vue`
- Écoute l'événement `avatars-synced`
- Recharge automatiquement l'avatar quand il est synchronisé

### 4. Documentation technique

Créée dans `docs/technical/GOOGLE_AVATAR_SYNC.md` avec :
- Vue d'ensemble du système
- Description du flux d'authentification
- Documentation des fonctions
- Guide de troubleshooting

### 5. Script de test

`test-google-avatar-sync.js` pour vérifier :
- Quels joueurs sont associés à un email
- Si les avatars sont déjà synchronisés
- Le statut de la synchronisation

## Utilisation

### Pour l'utilisateur final

1. Se connecter avec Google
2. L'avatar Google est automatiquement synchronisé
3. Tous les avatars des joueurs associés s'affichent immédiatement

### Pour tester

```bash
# Vérifier l'état de synchronisation
node test-google-avatar-sync.js user@example.com

# Développement local
npm run dev -- --host

# Build de production
npm run build
```

## Avantages

1. **Automatique** : Pas d'action manuelle requise
2. **Multi-saisons** : Synchronise sur toutes les saisons
3. **Temps réel** : Les composants se mettent à jour automatiquement
4. **Performance** : Cache optimisé pour éviter les requêtes inutiles
5. **Fallback** : Emoji affiché si pas d'avatar Google

## Stockage

Les avatars sont stockés dans Firestore :
```
/seasons/{seasonId}/players/{playerId}
  - photoURL: string (URL de l'avatar Google)
  - updatedAt: timestamp
```

## Événements

### `avatars-synced`

Émis quand les avatars Google sont synchronisés.

**Détail de l'événement :**
```javascript
{
  email: string,
  playerIds: string[],
  photoURL: string
}
```

## Notes techniques

- Les URLs Google sont "sanitizées" (=s96-c → =s96) pour éviter les problèmes CORS
- Utilise `firestoreService` pour tous les accès à la base de données
- Import dynamique pour éviter les dépendances circulaires
- Cache multi-niveaux pour optimiser les performances

## Prochaines étapes possibles

1. Permettre le téléchargement d'avatars personnalisés
2. Recadrage/édition d'avatar
3. Sources alternatives (Gravatar, etc.)
4. Proxy pour éviter les problèmes CORS en développement

