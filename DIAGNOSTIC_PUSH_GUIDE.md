# Guide de Diagnostic des Notifications Push - Firebase Console

## Étape 1: Vérifier la configuration Cloud Messaging

### A. Vérifier que Cloud Messaging est activé

1. Va sur [Firebase Console](https://console.firebase.google.com/project/impro-selector)
2. Clique sur l'icône ⚙️ (Settings) en haut à gauche > **Project settings**
3. Va dans l'onglet **Cloud Messaging**
4. Vérifie que tu as une section "Cloud Messaging API (V1)"
5. **IMPORTANT**: Vérifie si l'API est activée en cliquant sur le lien "Manage API in Google Cloud Console"

### B. Vérifier la clé VAPID

1. Dans la même page (Project settings > Cloud Messaging)
2. Descends jusqu'à la section **Web Push certificates**
3. Tu devrais voir une clé qui commence par "BG1NEd8-vnwABAfwt9D..."
4. **Compare cette clé avec celle dans le code:**
   - Code actuel: `BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0`

⚠️ **Si la clé est différente**, c'est probablement LE problème !

---

## Étape 2: Vérifier les données Firestore

### A. Vérifier tes tokens FCM

1. Va dans [Firestore Console](https://console.firebase.google.com/project/impro-selector/firestore)
2. Sélectionne la base de données **"(default)"** (production)
3. Cherche la collection `userPushTokens`
4. Cherche le document avec ton email: `patrice.lamarque@gmail.com`
5. Vérifie:
   - ✅ Le document existe
   - ✅ Le champ `tokens` contient au moins un token
   - ✅ Le champ `updatedAt` est récent

⚠️ **Si le document n'existe pas ou est vide**, tu dois réactiver les notifications dans l'app.

### B. Vérifier tes préférences

1. Dans Firestore, cherche la collection `userPreferences`
2. Cherche le document avec ton email: `patrice.lamarque@gmail.com`
3. Vérifie que `pushNotifications: true`

### C. Vérifier la queue push

1. Dans Firestore, cherche la collection `pushQueue`
2. Cette collection devrait être **vide** ou presque vide (les documents sont supprimés après traitement)
3. **Si tu vois des documents anciens**, ça signifie que la Cloud Function ne les traite pas

---

## Étape 3: Tester l'envoi d'une notification

### Option A: Via l'app en production

1. Va sur [impro-selector.web.app](https://impro-selector.web.app)
2. Connecte-toi avec ton email
3. Crée un événement test ou modifie un événement existant
4. Envoie une notification de disponibilité ou de sélection
5. Vérifie:
   - Dans Firestore > `pushQueue`: un document devrait apparaître brièvement
   - Sur ton mobile: la notification devrait arriver dans les 5 secondes

### Option B: Test direct dans Firestore

1. Dans Firestore, crée manuellement un document dans `pushQueue`:
   ```json
   {
     "to": "patrice.lamarque@gmail.com",
     "title": "Test notification",
     "body": "Test depuis Firestore",
     "data": {
       "url": "/",
       "reason": "test"
     },
     "reason": "test",
     "createdAt": [Timestamp Now]
   }
   ```
2. Le document devrait être supprimé automatiquement en quelques secondes
3. Tu devrais recevoir la notification sur ton mobile

---

## Étape 4: Vérifier les logs Cloud Functions

1. Va dans [Firebase Console > Functions](https://console.firebase.google.com/project/impro-selector/functions)
2. Trouve la fonction `processPushQueue`
3. Clique sur **Logs**
4. Cherche des entrées récentes avec:
   - `📱 Traitement notification push` = la fonction s'exécute
   - `⚠️ Aucun token FCM` = pas de token pour l'utilisateur
   - `✅ Push envoyée` = succès
   - `❌ Erreur` = problème d'envoi

---

## Diagnostic rapide

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Aucun document dans `userPushTokens` | Notifications jamais activées | Réactiver dans "Mes préférences" |
| Token existe mais ancienne date | Token expiré | Réactiver dans "Mes préférences" |
| Documents s'accumulent dans `pushQueue` | Cloud Function ne tourne pas | Vérifier logs, redéployer |
| Logs "⚠️ Aucun token FCM" | Token supprimé ou invalide | Réactiver les notifications |
| Logs avec erreur FCM | Clé VAPID invalide ou API désactivée | Vérifier configuration Cloud Messaging |
| Aucun log dans processPushQueue | Notifications pas déclenchées | Vérifier que les événements créent bien des documents dans pushQueue |

---

## Actions correctives selon le problème

### Problème: Clé VAPID différente

1. Copie la clé VAPID depuis Firebase Console
2. Mets à jour `src/services/configService.js` lignes 259, 270, 295, 306, 331, 342
3. Build et déploie: `npm run build && git push`

### Problème: Cloud Messaging API désactivée

1. Va sur [Google Cloud Console](https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=impro-selector)
2. Active "Firebase Cloud Messaging API"
3. Attends 5 minutes pour la propagation

### Problème: Pas de tokens enregistrés

1. Sur mobile, va sur l'app en production
2. Va dans "Mes préférences"
3. Désactive puis réactive les notifications
4. Vérifie dans Firestore que le token apparaît

### Problème: Cloud Function ne tourne pas

1. Redéploie: `firebase deploy --only functions:processPushQueue`
2. Vérifie les logs après déploiement
3. Teste avec un document manuel dans `pushQueue`

---

## À vérifier maintenant

Pour identifier rapidement le problème, vérifie dans cet ordre:

1. ✅ Cloud Function déployée (FAIT - confirmé)
2. ❓ Clé VAPID dans Firebase Console = clé dans le code ?
3. ❓ Documents dans `userPushTokens/patrice.lamarque@gmail.com` ?
4. ❓ Collection `pushQueue` vide ?
5. ❓ Logs récents dans processPushQueue ?

Réponds avec ce que tu trouves et je pourrai identifier le problème exact !

