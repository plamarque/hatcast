# ✅ Rafraîchissement Automatique des Tokens FCM - Implémentation Complète

**Date**: 8 novembre 2025  
**Status**: ✅ Implémenté selon les bonnes pratiques Firebase

---

## 🎯 Objectif

Implémenter le rafraîchissement automatique des tokens FCM **sans intervention manuelle de l'utilisateur**, selon les bonnes pratiques Firebase Cloud Messaging.

---

## ✅ Modifications Implémentées

### 1. `src/services/notifications.js`

#### A. Listener pour messages en foreground ✅
```javascript
export async function setupForegroundMessageListener()
```
- Affiche les notifications même quand l'app est ouverte
- Utilise l'API Notification native du navigateur
- Icon: `/icons/manifest-icon-192.maskable.png`

#### B. Surveillance automatique des tokens ✅
```javascript
export async function monitorTokenChanges()
```
- Vérifie toutes les **heures** si le token a changé
- Compare avec le token stocké dans localStorage
- Met à jour automatiquement Firestore si différent
- Gère le remplacement de l'ancien token par le nouveau

#### C. Support multi-device ✅
```javascript
export async function requestAndGetToken(serviceWorkerRegistration)
```
- Récupère les tokens existants avant d'en ajouter un nouveau
- Utilise un **array de tokens** au lieu d'un seul token
- N'ajoute le nouveau token que s'il n'existe pas déjà
- Log le nombre total d'appareils: `🔍 Sauvegarde token: X device(s) total`

#### D. Fonction d'initialisation centralisée ✅
```javascript
export async function initializePushNotifications()
```
- Initialise tous les listeners au démarrage
- Appelle `setupForegroundMessageListener()`
- Appelle `monitorTokenChanges()`
- Appelle `startPushHealthCheck()` (déjà existant)

### 2. `src/App.vue`

#### Import et appel au démarrage ✅
```javascript
import { initializePushNotifications } from './services/notifications.js'

onMounted(() => {
  initializePushNotifications().catch(error => {
    logger.warn('Erreur lors de l\'initialisation des notifications push:', error)
  })
  
  // Garde aussi l'ancien appel pour les utilisateurs existants
  ensurePushNotificationsActive()
})
```

---

## 🔄 Flow Automatique

### Au démarrage de l'app
1. ✅ `initializePushNotifications()` est appelé
2. ✅ Listener foreground activé → notifications visibles dans l'app ouverte
3. ✅ Monitoring de token démarré → vérification toutes les heures
4. ✅ Health check démarré → vérification toutes les 5 minutes

### Toutes les heures (automatique)
1. ✅ Récupération du token actuel depuis Firebase
2. ✅ Comparaison avec le token stocké localement
3. ✅ Si différent → mise à jour automatique dans Firestore
4. ✅ Log: `🔄 Token FCM rafraîchi automatiquement`
5. ✅ Log: `✅ Token FCM mis à jour automatiquement dans Firestore`

### Multi-device
1. ✅ Utilisateur active les notifications sur le mobile Android → token ajouté
2. ✅ Utilisateur active les notifications sur le desktop Chrome → deuxième token ajouté
3. ✅ Firestore `userPushTokens/{email}.tokens` contient `[token1, token2]`
4. ✅ Cloud Function envoie à **tous les appareils**

---

## 📊 Fréquences de Vérification

| Action | Fréquence | Fonction |
|--------|-----------|----------|
| Vérification token | 1 heure | `monitorTokenChanges()` |
| Health check général | 5 minutes | `startPushHealthCheck()` |
| Nettoyage tokens invalides | À chaque envoi | Cloud Function `processPushQueue` |

---

## 🧪 Comment Tester

### Test 1: Vérifier l'initialisation au démarrage

1. Ouvrir la console du navigateur sur production
2. Chercher les logs au démarrage:
   ```
   🔔 Initialisation des notifications push...
   ✅ Notifications push initialisées
   ```

### Test 2: Vérifier les messages foreground

1. Sur mobile, ouvrir l'app (production)
2. **Garder l'app ouverte**
3. Depuis un autre appareil, envoyer une notification de test via Firestore:
   ```json
   {
     "to": "ton-email@example.com",
     "title": "Test foreground",
     "body": "Cette notification devrait s'afficher même si l'app est ouverte",
     "data": { "url": "/", "reason": "test" },
     "reason": "test",
     "createdAt": [Timestamp now]
   }
   ```
4. ✅ **Résultat attendu**: Notification affichée même avec l'app ouverte
5. Log dans la console: `📱 Message reçu en foreground:`

### Test 3: Vérifier le monitoring de token (difficile à tester directement)

Le monitoring se déclenche toutes les heures. Pour forcer un test:

1. Console navigateur, exécuter:
   ```javascript
   // Simuler un changement de token
   localStorage.setItem('fcmToken', 'old-token-simulated')
   ```
2. Attendre 1 heure OU modifier temporairement le code:
   ```javascript
   // Dans monitorTokenChanges(), changer:
   }, 60 * 60 * 1000) // ← De 1h
   // à:
   }, 30 * 1000) // ← À 30 secondes pour tester
   ```
3. Rebuild et redéployer
4. Attendre 30 secondes
5. ✅ **Résultat attendu**: Log `🔄 Token FCM rafraîchi automatiquement`

### Test 4: Vérifier le multi-device

1. Activer les notifications sur mobile Android
2. Vérifier dans Firestore `userPushTokens/{email}`:
   ```json
   {
     "tokens": ["token-android-xxx"],
     "lastToken": "token-android-xxx"
   }
   ```
3. Activer les notifications sur desktop Chrome
4. ✅ **Résultat attendu** dans Firestore:
   ```json
   {
     "tokens": ["token-android-xxx", "token-desktop-yyy"],
     "lastToken": "token-desktop-yyy"
   }
   ```
5. Envoyer une notification de test
6. ✅ **Résultat attendu**: Notification reçue sur **les deux appareils**

### Test 5: Vérifier le health check (5 minutes)

1. Désactiver les notifications (bouton désactiver dans Mes préférences)
2. Attendre 5 minutes
3. Console: `Push notifications inactive, attempting to reactivate...`
4. Le système tente automatiquement de réactiver

---

## 🔍 Logs à Surveiller

### Logs de succès ✅
```
🔔 Initialisation des notifications push...
✅ Notifications push initialisées
🔍 Sauvegarde token: 2 device(s) total
✅ Token push sauvegardé avec succès dans userPushTokens
📱 Message reçu en foreground: { ... }
🔄 Token FCM rafraîchi automatiquement
✅ Token FCM mis à jour automatiquement dans Firestore
```

### Logs d'erreur potentiels ⚠️
```
⚠️ Erreur lors de la vérification du token: { ... }
❌ FirestoreService.db est null lors du refresh du token
❌ Erreur lors de la sauvegarde du token push: { ... }
```

---

## 📝 Bonnes Pratiques Implémentées

| Pratique | Status | Détails |
|----------|--------|---------|
| Listener onMessage | ✅ | Notifications en foreground |
| Monitoring automatique | ✅ | Vérification toutes les heures |
| Multi-device support | ✅ | Array de tokens |
| Nettoyage tokens invalides | ✅ | Dans Cloud Function |
| Health check | ✅ | Vérification toutes les 5 min |
| Logs détaillés | ✅ | Debugging facile |
| Gestion d'erreurs | ✅ | Try/catch partout |

---

## ⚡ Optimisations Futures (Optionnel)

### 1. Détecter le changement de token via événements
Au lieu de vérifier toutes les heures, on pourrait:
- Écouter l'événement `onTokenRefresh` (SDK plus ancien)
- Ou utiliser `messaging.onTokenChange()` si disponible

### 2. Nettoyer les tokens lors de la déconnexion
```javascript
// Dans logout handler
const email = currentUser.email
const currentToken = localStorage.getItem('fcmToken')
// Supprimer le token de Firestore
await firestoreService.setDocument('userPushTokens', email, {
  tokens: arrayRemove(currentToken)
}, true)
```

### 3. Ajouter une métrique de santé
Compter combien de fois les tokens sont rafraîchis automatiquement pour monitoring.

---

## 🎯 Résumé

**Avant**: 
- ❌ Tokens manuels uniquement
- ❌ Un seul token par utilisateur
- ❌ Pas de notifications en foreground
- ❌ Intervention manuelle nécessaire

**Après**:
- ✅ Rafraîchissement automatique toutes les heures
- ✅ Support multi-device (array de tokens)
- ✅ Notifications affichées même en foreground
- ✅ Aucune intervention manuelle requise
- ✅ Bouton désactiver/réactiver pour diagnostic uniquement

---

## 📞 Utilisation du Bouton Désactiver/Réactiver

Le bouton reste utile pour:
- **Diagnostic** quand un utilisateur signale un problème
- **Tests** lors du développement
- **Rafraîchissement forcé** en cas de problème ponctuel

Mais **les utilisateurs normaux n'en auront jamais besoin** car le système gère tout automatiquement ! 🚀

