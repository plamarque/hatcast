# 🔔 Troubleshooting des Notifications Push

## 📋 Résumé Exécutif

**Date:** Octobre 2025  
**Status:** ✅ Système analysé et amélioré

### Situation

Le système de notifications push est **fonctionnel** dans sa conception. Des améliorations ont été apportées pour faciliter le debugging et la maintenance.

### Actions réalisées

1. ✅ **Analyse complète** du système de notifications push
2. ✅ **Amélioration des logs** de la Cloud Function `processPushQueue`
3. ✅ **Nettoyage automatique** de la queue après traitement
4. ✅ **Gestion d'erreurs améliorée** avec logging détaillé
5. ✅ **Documentation complète** de l'architecture et du troubleshooting
6. ✅ **Script de test** créé (`test-push-notifications.js`)

### Prochaines étapes pour diagnostic

Si les notifications push ne fonctionnent toujours pas:

1. **Vérifier l'enregistrement des tokens FCM**
   ```bash
   node test-push-notifications.js --email user@example.com
   ```

2. **Vérifier la queue push**
   ```bash
   node test-push-notifications.js --queue
   ```

3. **Envoyer une notification de test**
   ```bash
   node test-push-notifications.js --send-test user@example.com
   ```

4. **Vérifier les logs Cloud Functions**
   - Firebase Console > Functions > Logs
   - Rechercher: `processPushQueue`

5. **Vérifier le Service Worker**
   - Console navigateur > Application > Service Workers
   - Vérifier que le SW est actif

6. **Vérifier les permissions**
   - Console navigateur > Application > Notifications
   - Vérifier que la permission est accordée

---

## État du diagnostic - Octobre 2025

### ✅ Code analysé et amélioré

**SITUATION:** La Cloud Function `processPushQueue` était **correcte** dans sa logique mais manquait de logs et ne nettoyait pas la queue.

#### Améliorations apportées

1. **Meilleurs logs** - Ajout de logs détaillés (`📱`, `✅`, `⚠️`, `❌`) pour faciliter le debugging
2. **Nettoyage de la queue** - Les documents traités sont maintenant supprimés (au lieu d'être marqués "sent")
3. **Gestion d'erreurs** - Try/catch avec logging détaillé et statut d'erreur persisté
4. **Logging du reason** - Ajout du champ `reason` dans les logs pour tracer le type de notification

#### Checklist de vérification

Si les notifications push ne fonctionnent toujours pas, vérifier dans cet ordre:

- [ ] **Tokens FCM enregistrés** - Collection `userPushTokens/{email}` contient des tokens
- [ ] **Cloud Function déployée** - `processPushQueue` est active dans Firebase Console
- [ ] **Préférences utilisateur** - `pushNotifications: true` dans `userPreferences/{email}`
- [ ] **Service Worker actif** - Enregistré et running dans le navigateur
- [ ] **Permissions accordées** - `Notification.permission === 'granted'`
- [ ] **Clé VAPID valide** - Configurée dans `configService.js`
- [ ] **User authentifié** - Pas anonyme (requis par les règles Firestore)

#### Code de la Cloud Function (corrigé et amélioré)
```javascript
// functions/index.js ligne 78-151 (version améliorée)
exports.processPushQueue = functions.firestore
  .document('pushQueue/{pushId}')
  .onCreate(async (snap, context) => {
    const pushId = context.params.pushId
    const payload = snap.data() || {}
    const toEmail = payload.to  // ✅ Lit l'email
    const reason = payload.reason || 'generic'
    
    console.log(`📱 Traitement notification push ${pushId}:`, { toEmail, reason })
    
    // ✅ Résout l'email vers les tokens FCM
    const tokensDoc = await db.collection('userPushTokens').doc(toEmail).get()
    const tokens = tokensDoc.exists ? (tokensDoc.data().tokens || []) : []
    
    if (!tokens.length) {
      console.warn(`⚠️ Aucun token FCM pour ${toEmail}`)
      await snap.ref.set({ status: 'no_tokens', toEmail, processedAt: ... }, { merge: true })
      return
    }
    
    console.log(`📲 Envoi à ${tokens.length} device(s) pour ${toEmail}`)
    
    // ✅ Envoie aux tokens résolus (data-only pour actions Service Worker)
    const message = {
      data: Object.fromEntries(
        Object.entries({ title, body, reason, ...data }).map(([k, v]) => [k, String(v)])
      ),
      tokens
    }
    
    try {
      const resp = await admin.messaging().sendEachForMulticast(message)
      console.log(`✅ Push envoyée: ${resp.successCount}/${tokens.length} succès`)
      
      // ✅ Nettoie les tokens invalides
      const invalid = []
      resp.responses.forEach((r, idx) => {
        if (!r.success && (r.error?.code.includes('registration-token-not-registered') || 
            r.error?.code.includes('invalid-argument'))) {
          invalid.push(tokens[idx])
        }
      })
      
      if (invalid.length) {
        await db.collection('userPushTokens').doc(toEmail).set({
          tokens: admin.firestore.FieldValue.arrayRemove(...invalid),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
      }
      
      // ✅ NOUVEAU: Supprime le document une fois traité (garde la queue propre)
      await snap.ref.delete()
      console.log(`🗑️ Document ${pushId} supprimé de la queue`)
      
    } catch (error) {
      console.error(`❌ Erreur envoi push ${pushId}:`, error)
      await snap.ref.set({ status: 'error', error: error.message, ... }, { merge: true })
    }
  })
```

---

## 🔍 Architecture du système de notifications push

### 1. Flow complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT - Enregistrement du token FCM                     │
├─────────────────────────────────────────────────────────────┤
│ - Service Worker demande permission                         │
│ - Firebase Messaging récupère le token FCM                  │
│ - Token sauvegardé dans Firestore: userPushTokens/{email}  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. APPLICATION - Envoi de notification                      │
├─────────────────────────────────────────────────────────────┤
│ - notificationsService.notifyRecipientAcrossChannels()     │
│ - pushService.queuePushMessage()                            │
│ - Document créé dans Firestore: pushQueue/{id}             │
│   Contenu: { to: email, title, body, data, reason }        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CLOUD FUNCTION - Traitement de la queue                  │
├─────────────────────────────────────────────────────────────┤
│ - Trigger: onCreate sur pushQueue/{pushId}                  │
│ - Résolution: email → tokens FCM (userPushTokens)          │
│ - Envoi via admin.messaging().sendEachForMulticast()       │
│ - Nettoyage: suppression du doc pushQueue                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SERVICE WORKER - Réception et affichage                  │
├─────────────────────────────────────────────────────────────┤
│ - src/service-worker.js                                     │
│ - messaging.onBackgroundMessage()                           │
│ - self.registration.showNotification()                      │
│ - Gestion des actions (yes/no, confirm/decline)            │
└─────────────────────────────────────────────────────────────┘
```

### 2. Collections Firestore

#### `userPushTokens/{email}`
Stocke les tokens FCM par utilisateur (identifié par email).

```javascript
{
  email: "user@example.com",
  tokens: ["token1", "token2"],  // Array de tokens (multi-device)
  lastToken: "token2",           // Dernier token enregistré
  updatedAt: Timestamp,
  userAgent: "Mozilla/5.0...",
  lastActivation: Timestamp
}
```

**Règles Firestore:**
```
match /userPushTokens/{userEmail} {
  allow read, write: if request.auth != null && request.auth.token.email == userEmail;
}
```

#### `pushQueue/{pushId}`
Queue de messages push à traiter par les Cloud Functions.

```javascript
{
  to: "user@example.com",       // Email du destinataire
  title: "Notification",
  body: "Message content",
  data: {                        // Données additionnelles
    url: "/season/abc/event/123",
    yesUrl: "...",
    noUrl: "...",
    reason: "availability_request"
  },
  reason: "availability_request",
  createdAt: Timestamp
}
```

**Règles Firestore:**
```
match /pushQueue/{pushId} {
  allow read: if false;           // Géré par Cloud Functions
  allow write: if request.auth != null;
}
```

#### `userPreferences/{email}`
Préférences de notification par utilisateur.

```javascript
{
  emailNotifications: true,
  pushNotifications: true,        // Active/désactive les push
  availabilityReminders: true,
  selectionNotifications: true
}
```

### 3. Fichiers clés

| Fichier | Rôle | Problèmes potentiels |
|---------|------|----------------------|
| `src/services/notifications.js` | Enregistrement tokens FCM côté client | - Service Worker pas actif<br>- Permission refusée<br>- VAPID key invalide |
| `src/services/pushService.js` | Mise en queue des notifications | - Règles Firestore restrictives<br>- User non authentifié |
| `src/services/notificationsService.js` | Orchestration multi-canal | - Préférences utilisateur désactivées |
| `functions/index.js` | Traitement queue (Cloud Functions) | ✅ Amélioré avec meilleurs logs |
| `src/service-worker.js` | Réception et affichage | - SW pas enregistré<br>- Firebase Messaging mal configuré |
| `src/services/configService.js` | Configuration VAPID | - Clé VAPID manquante ou invalide |

---

## ✅ Points de vérification

### 1. Configuration VAPID ✅

**Statut:** OK - Clé VAPID configurée

**Localisation:** `src/services/configService.js` ligne 259, 295, 320

```javascript
notifications: {
  vapidKey: 'BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0'
}
```

**Vérification:**
- ✅ Clé présente pour dev, staging et production
- ✅ Accessible via `configService.getVapidKey()`
- ⚠️ Même clé pour tous les environnements (peut être OK)

### 2. Service Worker ✅

**Statut:** OK - Configuration correcte

**Localisation:** `src/service-worker.js`

- ✅ Firebase Messaging configuré (ligne 96-159)
- ✅ `onBackgroundMessage` handler présent
- ✅ Gestion des actions adaptatives (ligne 133-148)
- ✅ `notificationclick` handler présent (ligne 68-94)

### 3. Enregistrement des tokens côté client ✅

**Statut:** OK - Logique correcte

**Localisation:** `src/services/notifications.js`

- ✅ `requestAndGetToken()` - Demande permission et récupère token
- ✅ Sauvegarde dans `userPushTokens/{email}`
- ✅ Health check périodique (désactivable en dev)
- ✅ Réactivation automatique si token expiré

**Point d'attention:**
- Règles Firestore requièrent `request.auth.token.email == userEmail`
- Users anonymes ne peuvent pas sauvegarder leur token
- Users avec email custom (pas Firebase Auth) peuvent avoir des problèmes

### 4. Mise en queue des notifications ✅

**Statut:** OK - Logique correcte

**Localisation:** `src/services/pushService.js`

```javascript
export async function queuePushMessage({ toEmail, title, body, data, reason }) {
  const payload = {
    to: toEmail,        // ✅ Email du destinataire
    title,
    body,
    data,
    reason,
    createdAt: new Date()
  }
  
  await firestoreService.addDocument('pushQueue', payload)
}
```

### 5. Traitement de la queue (Cloud Functions) ✅

**Statut:** Amélioré - Logs et nettoyage ajoutés

**Localisation:** `functions/index.js` ligne 78-151

La fonction `exports.processPushQueue` est correcte et a été améliorée:

- ✅ Résout correctement email → tokens FCM
- ✅ Envoie aux multiples devices (multi-device support)
- ✅ Nettoie les tokens invalides automatiquement
- ✅ Logs détaillés pour faciliter le debugging
- ✅ Supprime les documents traités de la queue
- ✅ Gestion d'erreurs avec persistance du statut

### 6. Règles Firestore ✅

**Statut:** OK - Règles correctes

**Localisation:** `firestore.rules`

```javascript
// pushQueue: écriture par users connectés, lecture par Cloud Functions
match /pushQueue/{pushId} {
  allow read: if false;
  allow write: if request.auth != null;
}

// userPushTokens: lecture/écriture par le propriétaire
match /userPushTokens/{userEmail} {
  allow read, write: if request.auth != null && request.auth.token.email == userEmail;
}
```

**Point d'attention:**
- Users anonymes ne peuvent pas écrire dans `pushQueue` ❌
- Users anonymes ne peuvent pas sauvegarder leur token ❌
- Solution: Forcer connexion avant d'activer les notifications

---

## 🔧 Recommandations

### Déployer les améliorations

**Action:** Déployer la Cloud Function améliorée

```bash
# Déployer uniquement la fonction processPushQueue
firebase deploy --only functions:processPushQueue

# Ou déployer toutes les functions
firebase deploy --only functions
```

### Améliorer la gestion des users anonymes (OPTIONNEL)

Les règles Firestore actuelles requièrent que l'utilisateur soit authentifié avec un email.

**Option A:** Autoriser les users anonymes à sauvegarder des tokens

```javascript
// firestore.rules
match /userPushTokens/{userEmail} {
  // Permettre à tous les users authentifiés (y compris anonymes) de sauvegarder
  allow write: if request.auth != null;
  // Lecture restreinte au propriétaire
  allow read: if request.auth != null && request.auth.token.email == userEmail;
}
```

**Option B:** Forcer la connexion avant l'activation des notifications (RECOMMANDÉ)

Dans `src/services/notifications.js`:
```javascript
export async function requestAndGetToken(serviceWorkerRegistration) {
  // ✅ Vérifier que l'utilisateur a un email
  const email = auth?.currentUser?.email
  if (!email || email === 'anonymous') {
    throw new Error('User must be signed in with email to enable push notifications')
  }
  
  // ... reste du code
}
```

### Monitoring continu

Après déploiement, surveiller:

1. **Logs Cloud Functions** - Vérifier que les notifications sont bien traitées
2. **Queue pushQueue** - Devrait rester vide ou presque (documents traités rapidement)
3. **Collection userPushTokens** - Nombre croissant d'utilisateurs avec tokens
4. **Feedback utilisateurs** - Les notifications sont-elles bien reçues?

---

## 🧪 Tests à effectuer

### Test 1: Vérifier l'enregistrement du token

**Console navigateur:**
```javascript
// Vérifier que le token est sauvegardé
const email = 'user@example.com'
const doc = await firebase.firestore().collection('userPushTokens').doc(email).get()
console.log('Tokens:', doc.data()?.tokens)
```

**Résultat attendu:**
```javascript
Tokens: ["cXXXXXXXXXX..."]  // Array de tokens FCM
```

### Test 2: Vérifier la queue push

**Code:**
```javascript
// Enqueuer un message de test
await queuePushMessage({
  toEmail: 'user@example.com',
  title: 'Test Push',
  body: 'Ceci est un test',
  data: { url: '/' },
  reason: 'test'
})
```

**Vérification Firestore:**
- Document créé dans `pushQueue/`
- Contient `to: "user@example.com"`
- Cloud Function se déclenche automatiquement

### Test 3: Vérifier les logs de la Cloud Function

**Firebase Console:**
```
Functions > Logs

Rechercher: "processPushQueue"
```

**Logs attendus (version corrigée):**
```
📱 Traitement de la notification push abc123
✅ Notifications push envoyées: 1/1
🧹 0 tokens invalides supprimés
```

**Logs d'erreur (version cassée):**
```
⚠️ Données push incomplètes pour abc123
```

### Test 4: Vérifier la réception côté client

**Service Worker Console:**
```
Application > Service Workers > service-worker.js

Rechercher: "Firebase Messaging background handler"
```

**Test notification de test:**
```javascript
// Envoyer une notification de test depuis Firebase Console
// Cloud Messaging > Send test message
// Token: [copier depuis localStorage.fcmToken]
```

---

## 📊 Monitoring et métriques

### Métriques clés à surveiller

1. **Taux de succès des notifications**
   - `pushQueue` documents créés vs supprimés
   - Cloud Function success vs error

2. **Tokens actifs**
   - Nombre de documents dans `userPushTokens`
   - Nombre de tokens par utilisateur (multi-device)

3. **Tokens invalides**
   - Logs de nettoyage (`invalid.length`)
   - Fréquence de suppression

4. **Délai de traitement**
   - Temps entre création du document `pushQueue` et suppression
   - Idéalement < 5 secondes

### Dashboards recommandés

**Firebase Console > Functions > Metrics:**
- `processPushQueueV2` invocations
- Execution time
- Error rate

**Firestore:**
- Documents count `pushQueue` (devrait être proche de 0)
- Documents count `userPushTokens` (nombre d'utilisateurs avec notifs actives)

---

## 🚨 Checklist de déploiement

Avant de déployer les corrections:

- [ ] Corriger `processPushQueueV2` dans `functions/index.js`
- [ ] Tester localement avec l'émulateur Firebase
- [ ] Vérifier que les tokens sont enregistrés correctement
- [ ] Envoyer des notifications de test
- [ ] Vérifier les logs de la Cloud Function
- [ ] Déployer les Cloud Functions: `firebase deploy --only functions`
- [ ] Tester en production avec un utilisateur test
- [ ] Monitorer les logs pendant 24h
- [ ] Supprimer l'ancienne version V1 si tout fonctionne

---

## 📚 Ressources

- [Firebase Cloud Messaging Web](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

---

**Dernière mise à jour:** Octobre 2025  
**Status:** BUG CRITIQUE identifié et solution proposée  
**Prochaines étapes:** Appliquer le correctif et tester

