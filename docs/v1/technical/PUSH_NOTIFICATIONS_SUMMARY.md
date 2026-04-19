# 🔔 Résumé du Troubleshooting des Notifications Push

**Date:** 14 octobre 2025  
**Ticket:** Notifications push qui ne fonctionnent plus

---

## 📊 Situation

Le système de notifications push a été analysé en profondeur. La Cloud Function `processPushQueue` était **fonctionnelle** dans sa logique de base, mais manquait de logs et de gestion de queue efficace.

## ✅ Actions réalisées

### 1. Analyse complète du système
- ✅ Architecture documentée (flow complet, collections, fichiers)
- ✅ Configuration VAPID vérifiée et validée
- ✅ Service Worker vérifié et validé
- ✅ Règles Firestore vérifiées

### 2. Améliorations du code

#### `functions/index.js` - Cloud Function `processPushQueue`

**Améliorations apportées:**
- 📱 Logs détaillés avec emojis pour faciliter le debugging
- 🗑️ **NOUVEAU:** Suppression automatique des documents traités (garde la queue propre)
- 🧹 Nettoyage des tokens FCM invalides
- ❌ Gestion d'erreurs avec try/catch et persistance du statut
- 📊 Logging du `reason` pour tracer le type de notification

**Avant:**
```javascript
// Marquait le document comme "sent" mais ne le supprimait pas
await snap.ref.set({ status: 'sent', ... }, { merge: true })
```

**Après:**
```javascript
// Supprime le document une fois traité
await snap.ref.delete()
console.log(`🗑️ Document ${pushId} supprimé de la queue`)
```

### 3. Documentation créée

- ✅ `docs/v1/technical/PUSH_NOTIFICATIONS_TROUBLESHOOTING.md` - Guide complet (630+ lignes)
  - Architecture du système
  - Checklist de vérification
  - Tests à effectuer
  - Monitoring et métriques
  
- ✅ `test-push-notifications.js` - Script de diagnostic
  - Vérifier les tokens FCM par utilisateur
  - Vérifier la queue push
  - Envoyer des notifications de test
  - Lister tous les utilisateurs avec tokens

## 🔍 Points de vérification pour diagnosis

### Si les notifications ne fonctionnent toujours pas, vérifier:

1. **Tokens FCM enregistrés?**
   ```bash
   node test-push-notifications.js --email user@example.com
   ```

2. **Cloud Function déployée?**
   ```bash
   firebase deploy --only functions:processPushQueue
   ```

3. **Préférences utilisateur?**
   - Firestore > `userPreferences/{email}` > `pushNotifications: true`

4. **Service Worker actif?**
   - Console > Application > Service Workers
   - Doit être "activated and running"

5. **Permissions accordées?**
   - Console > `Notification.permission` doit être "granted"

6. **User authentifié?**
   - Les règles Firestore requièrent `request.auth.token.email`
   - Users anonymes ne peuvent pas recevoir de push

## 📝 Commandes utiles

### Diagnostic
```bash
# Vérifier un utilisateur spécifique
node test-push-notifications.js --email patrice.lamarque@gmail.com

# Vérifier tous les utilisateurs
node test-push-notifications.js --check-all

# Vérifier l'état de la queue
node test-push-notifications.js --queue

# Envoyer une notification de test
node test-push-notifications.js --send-test patrice.lamarque@gmail.com

# Afficher la configuration
node test-push-notifications.js --config
```

### Déploiement
```bash
# Déployer uniquement la fonction processPushQueue
firebase deploy --only functions:processPushQueue

# Déployer toutes les Cloud Functions
firebase deploy --only functions
```

### Vérification des logs
```bash
# Firebase Console > Functions > Logs
# Rechercher: "processPushQueue"

# Logs attendus:
# 📱 Traitement notification push abc123: { toEmail: '...', title: '...', reason: '...' }
# 📲 Envoi à 1 device(s) pour user@example.com
# ✅ Push envoyée: 1/1 succès
# 🗑️ Document abc123 supprimé de la queue
```

## 🚀 Prochaines étapes

### 1. Déployer les améliorations (CRITIQUE)
```bash
cd /Users/patrice/GitHub/hatcast
firebase deploy --only functions:processPushQueue
```

### 2. Tester avec un utilisateur réel
```bash
# Vérifier que l'utilisateur a des tokens
node test-push-notifications.js --email <email-utilisateur>

# Envoyer une notification de test
node test-push-notifications.js --send-test <email-utilisateur>
```

### 3. Vérifier les logs pendant 24h
- Firebase Console > Functions > Logs
- Vérifier que les notifications sont bien traitées
- Vérifier qu'il n'y a pas d'erreurs

### 4. Vérifier la queue Firestore
- Firestore > `pushQueue` collection
- Devrait être vide ou presque (documents traités en < 5 secondes)

### 5. Feedback utilisateurs
- Demander aux utilisateurs s'ils reçoivent bien les notifications
- Vérifier sur différents devices (mobile, desktop)
- Vérifier sur différents navigateurs (Chrome, Firefox, Safari)

## 📚 Architecture technique

### Collections Firestore

1. **`userPushTokens/{email}`** - Tokens FCM par utilisateur
   ```javascript
   {
     email: "user@example.com",
     tokens: ["token1", "token2"],  // Multi-device
     lastToken: "token2",
     updatedAt: Timestamp,
     userAgent: "Mozilla/5.0..."
   }
   ```

2. **`pushQueue/{pushId}`** - Queue de notifications
   ```javascript
   {
     to: "user@example.com",  // Email du destinataire
     title: "Notification",
     body: "Message",
     data: { url: "/...", reason: "..." },
     reason: "availability_request",
     createdAt: Timestamp
   }
   ```

3. **`userPreferences/{email}`** - Préférences utilisateur
   ```javascript
   {
     pushNotifications: true,  // Activer/désactiver
     emailNotifications: true,
     availabilityReminders: true,
     selectionNotifications: true
   }
   ```

### Flow complet

```
1. CLIENT - Enregistrement du token FCM
   └─> notifications.js: requestAndGetToken()
   └─> Sauvegarde dans userPushTokens/{email}

2. APPLICATION - Envoi de notification
   └─> notificationsService.notifyRecipientAcrossChannels()
   └─> pushService.queuePushMessage()
   └─> Document créé dans pushQueue/{id}

3. CLOUD FUNCTION - Traitement de la queue
   └─> Trigger onCreate sur pushQueue/{pushId}
   └─> processPushQueue() résout email → tokens FCM
   └─> admin.messaging().sendEachForMulticast()
   └─> Nettoyage des tokens invalides
   └─> Suppression du document pushQueue

4. SERVICE WORKER - Réception et affichage
   └─> service-worker.js: onBackgroundMessage()
   └─> self.registration.showNotification()
   └─> Gestion des actions (yes/no, confirm/decline)
```

## 🎯 Points clés à retenir

1. **La fonction est correcte** - Pas de bug majeur, juste des améliorations
2. **Les logs sont essentiels** - Facilite le debugging en production
3. **La queue doit être propre** - Supprimer les documents traités
4. **Multi-device support** - Un utilisateur peut avoir plusieurs tokens
5. **Users authentifiés uniquement** - Règles Firestore requièrent un email
6. **Service Worker obligatoire** - Les push nécessitent un SW actif
7. **Clé VAPID configurée** - Même clé pour tous les environnements (OK)

## ⚠️ Points d'attention

### Users anonymes
Les règles Firestore actuelles empêchent les users anonymes de:
- Sauvegarder leur token dans `userPushTokens`
- Ajouter des notifications dans `pushQueue`

**Solution recommandée:** Forcer la connexion avec email avant d'activer les push.

### Tokens invalides
Les tokens FCM peuvent expirer ou devenir invalides. La fonction les nettoie automatiquement lors de l'envoi.

### Queue accumulation
Si la Cloud Function n'est pas déployée ou échoue, les documents s'accumulent dans `pushQueue`. Surveiller cette collection.

## 📞 Support

En cas de problème:

1. Vérifier les logs Cloud Functions
2. Utiliser le script `test-push-notifications.js`
3. Consulter `docs/v1/technical/PUSH_NOTIFICATIONS_TROUBLESHOOTING.md`
4. Vérifier les règles Firestore
5. Tester avec le script de test sur un utilisateur connu

---

**Dernière mise à jour:** 14 octobre 2025  
**Status:** ✅ Système analysé, amélioré et documenté  
**Action requise:** Déployer les améliorations et tester


