# Résultat du Diagnostic - Notifications Push

**Date**: 8 novembre 2025  
**Branche**: staging  
**Projet Firebase**: impro-selector (production)

---

## ✅ Ce qui fonctionne

### 1. Cloud Function processPushQueue
- **Status**: ✅ Déployée et active sur production
- **Version**: v1, Node.js 20
- **Trigger**: `onCreate` sur `pushQueue/{pushId}`
- **Région**: us-central1
- **Dernière mise à jour**: 8 novembre 2025 à 16:25

La fonction est bien configurée et contient tout le code nécessaire pour:
- Récupérer les tokens FCM de l'utilisateur
- Envoyer via Firebase Cloud Messaging
- Nettoyer les tokens invalides
- Supprimer les documents traités

### 2. Code client
- **Status**: ✅ Le code d'envoi de notifications est présent et correct
- Les fichiers `pushService.js`, `notificationsService.js` et `notificationTemplates.js` sont bien configurés
- La chaîne d'appel depuis `GridBoard.vue` est correcte

### 3. Service Worker
- **Status**: ✅ Configuré correctement
- Firebase Messaging intégré
- Gestion des notifications en arrière-plan
- Actions interactives (oui/non, confirmer/décliner)

---

## ❌ Problème Identifié

### Aucune exécution récente de la Cloud Function

Les logs ne montrent **AUCUNE exécution** de `processPushQueue`:
- Pas de message `📱 Traitement notification push`
- Pas de message `✅ Push envoyée`
- Seulement des logs de déploiement

**Cela signifie que:**
1. Soit aucun document n'est ajouté à la collection `pushQueue`
2. Soit les documents sont ajoutés mais la fonction ne se déclenche pas

---

## 🔍 Causes Possibles

### Hypothèse 1: Pas de tokens FCM enregistrés ⚠️ (PROBABLE)
Si l'utilisateur n'a jamais activé les notifications ou si les tokens ont expiré:
- Aucun token dans `userPushTokens/{email}`
- Les notifications ne peuvent pas être envoyées

### Hypothèse 2: Clé VAPID invalide ou changée ⚠️
Si la clé VAPID dans Firebase Console ne correspond pas à celle du code:
- Clé actuelle dans le code: `BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0`
- À vérifier dans Firebase Console > Project Settings > Cloud Messaging > Web Push certificates

### Hypothèse 3: Notifications push désactivées par l'utilisateur
Dans `userPreferences/{email}`, le champ `pushNotifications` est `false`

### Hypothèse 4: API Cloud Messaging désactivée ou quota dépassé
L'API Firebase Cloud Messaging n'est pas activée ou a atteint ses limites

### Hypothèse 5: Problème de nomenclature des préférences ⚠️
Le code a un décalage entre:
- Les préférences stockées: `pushNotifications`, `availabilityReminders`, etc.
- Les préférences utilisées dans les templates: `notifyAvailabilityPush`, `notifySelectionPush`, etc.

Cependant, avec `!== false`, les notifications devraient quand même être envoyées.

---

## 📋 Actions à Effectuer (par ordre de priorité)

### Action 1: Vérifier les tokens FCM dans Firestore 🔥 CRITIQUE

1. Va sur [Firestore Console](https://console.firebase.google.com/project/impro-selector/firestore)
2. Sélectionne la base `(default)` (production)
3. Cherche la collection `userPushTokens`
4. Cherche ton document: `patrice.lamarque@gmail.com`

**Si le document n'existe pas ou le champ `tokens` est vide:**
- **C'EST LE PROBLÈME !**
- Solution: Réactiver les notifications dans l'app (voir Action 6)

**Si le document existe avec des tokens:**
- Note la date de `updatedAt`
- Si la date est ancienne (> 60 jours), les tokens sont probablement expirés

### Action 2: Vérifier la clé VAPID

1. Va sur [Firebase Console](https://console.firebase.google.com/project/impro-selector/settings/cloudmessaging)
2. Section **Web Push certificates**
3. Compare la clé affichée avec: `BG1NEd8-vnwABAfwt9D7pqO2PfHn_UpX8EqMHPX_TuIjk87KRxuQ66Kojfbe-4f_zBpyJZIH4biEVqt4YGjyAU0`

**Si la clé est différente:**
- **C'EST LE PROBLÈME !**
- Copie la nouvelle clé
- Mets à jour `src/services/configService.js` lignes 259, 270, 295, 306, 331, 342
- Build et déploie

### Action 3: Vérifier que l'API Cloud Messaging est activée

1. Va sur [Google Cloud Console](https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=impro-selector)
2. Vérifie que "Firebase Cloud Messaging API" est **activée**

**Si désactivée:**
- Active l'API
- Attends 5-10 minutes pour la propagation

### Action 4: Tester l'envoi d'une notification manuelle

1. Dans [Firestore Console](https://console.firebase.google.com/project/impro-selector/firestore/databases/-default-/data/~2FpushQueue)
2. Crée manuellement un document dans la collection `pushQueue`:

```json
{
  "to": "patrice.lamarque@gmail.com",
  "title": "Test notification manuelle",
  "body": "Test depuis Firestore Console",
  "data": {
    "url": "/",
    "reason": "test"
  },
  "reason": "test",
  "createdAt": [Timestamp maintenant]
}
```

3. **Observer:**
   - Le document devrait être supprimé en 2-5 secondes (= fonction s'exécute)
   - Vérifie les logs de `processPushQueue` dans Firebase Console > Functions
   - Tu devrais recevoir la notification sur ton mobile

**Si le document reste:**
- La Cloud Function ne se déclenche pas (problème de configuration)

**Si le document est supprimé mais pas de notification:**
- Vérifie les logs pour voir l'erreur (token invalide, API désactivée, etc.)

### Action 5: Vérifier les préférences utilisateur

1. Dans Firestore, collection `userPreferences`
2. Document: `patrice.lamarque@gmail.com`
3. Vérifie que `pushNotifications: true`

**Si `false` ou le document n'existe pas:**
- Réactive dans "Mes préférences"

### Action 6: Réactiver les notifications sur mobile 🔥 ACTION RECOMMANDÉE

Sur ton mobile Android:

1. Va sur [impro-selector.web.app](https://impro-selector.web.app) (production)
2. Connecte-toi
3. Menu > **Mes préférences**
4. **Désactive** "Notifications push"
5. **Réactive** "Notifications push"
6. Accorde les permissions si demandé

**Cela va:**
- Générer un nouveau token FCM
- L'enregistrer dans `userPushTokens/{email}`
- Réinitialiser les préférences

Puis teste immédiatement avec Action 4 (notification manuelle).

---

## 📊 Diagnostic Rapide

| Point de contrôle | Résultat | Action si problème |
|-------------------|----------|-------------------|
| Cloud Function déployée | ✅ OUI | N/A |
| Logs d'exécution récents | ❌ NON | Voir causes ci-dessus |
| Tokens FCM dans Firestore | ❓ À vérifier | Action 1 + 6 |
| Clé VAPID correcte | ❓ À vérifier | Action 2 |
| API FCM activée | ❓ À vérifier | Action 3 |
| Collection pushQueue vide | ❓ À vérifier | Normal si vide |
| Préférences activées | ❓ À vérifier | Action 5 |

---

## 🎯 Recommandation Finale

**Je recommande de commencer par Action 1 et Action 6:**

1. Vérifie dans Firestore si des tokens existent pour ton email
2. Si non, ou si anciens, **réactive les notifications sur mobile** (Action 6)
3. Puis **teste immédiatement avec Action 4** (notification manuelle dans Firestore)
4. Si ça ne fonctionne toujours pas, vérifie la clé VAPID (Action 2)

**9 fois sur 10, le problème est que les tokens ne sont pas enregistrés ou sont expirés.**

---

## 📁 Fichiers de Diagnostic Créés

- `DIAGNOSTIC_PUSH_GUIDE.md` - Guide complet étape par étape
- `RESULTAT_DIAGNOSTIC.md` - Ce fichier (résumé du diagnostic)
- `diagnose-push.js` - Script de diagnostic (nécessite authentification)

---

## 📞 Prochaines Étapes

1. **Effectue Actions 1 et 6** (vérifier tokens + réactiver)
2. **Teste avec Action 4** (notification manuelle)
3. **Rapporte-moi les résultats:**
   - Les tokens existent-ils ?
   - La notification test a-t-elle fonctionné ?
   - Quelles erreurs dans les logs ?

Avec ces informations, je pourrai identifier le problème exact et le corriger.

---

**⚠️ NOTE IMPORTANTE**: Tu es sur la branche `staging` avec 2 commits en avance sur `origin/staging`. Pense à push si besoin, mais les Cloud Functions sont déjà déployées sur production.

---

## ✅ Correctif Appliqué

### Ajout d'un bouton Désactiver/Réactiver dans PreferencesModal

**Problème identifié**: L'UI ne permettait pas de désactiver les notifications push une fois activées. Il n'y avait qu'un bouton "Activer" qui devenait une simple checkbox verte.

**Solution implémentée**:
- Ajout d'un bouton **"Désactiver"** (rouge) visible quand les notifications sont actives
- Le bouton permet de supprimer le token local et de réinitialiser l'état
- Ajout de messages de feedback clairs (succès/erreur)
- Instructions explicites : "Tu peux les désactiver puis réactiver pour rafraîchir le token si besoin"

**Fichier modifié**: `src/components/PreferencesModal.vue`

**Comment tester**:
1. Va dans "Mes préférences" > onglet "Notifications"
2. Clique sur **"Désactiver"** (bouton rouge)
3. Puis clique sur **"Activer"** (bouton vert)
4. Un nouveau token FCM sera généré et enregistré
5. Vérifie dans Firestore `userPushTokens/{email}` que le token est mis à jour
6. Teste avec une notification manuelle (voir Action 4 ci-dessus)

**Résultat attendu**: Les notifications push devraient fonctionner après cette manipulation.

