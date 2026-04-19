# 🎯 Système de rappels automatiques - HatCast

## Vue d'ensemble

Le système de rappels automatiques permet d'envoyer des notifications aux joueurs sélectionnés pour un spectacle, à des moments stratégiques avant l'événement. Cela améliore l'engagement et permet aux joueurs de se désister à temps si nécessaire.

## 🚀 Fonctionnalités

### Rappels automatiques
- **7 jours avant** : Rappel de préparation
- **1 jour avant** : Rappel final de confirmation

### Canaux de notification
- **Email** : Templates HTML personnalisés avec boutons d'action
- **Push** : Notifications mobiles avec actions rapides
- **Préférences utilisateur** : Contrôle granulaire par canal et type

### Gestion intelligente
- Création automatique lors des sélections
- Suppression automatique lors des désistements
- Gestion des erreurs et retry
- Logs détaillés pour le debugging

## 🏗️ Architecture technique

### Composants principaux

#### 1. Service de rappels (`reminderService.js`)
```javascript
// Création automatique des rappels
createRemindersForSelection({
  seasonId,
  eventId,
  playerEmail,
  playerName,
  eventTitle,
  eventDate,
  seasonSlug
})

// Suppression des rappels
removeRemindersForPlayer({ seasonId, eventId, playerEmail })
removeRemindersForEvent({ seasonId, eventId })
```

#### 2. Cloud Function (`functions/index.js`)
- **`processReminders`** : Déclenchée toutes les heures
- Traite les rappels en attente pour la journée
- Envoie les notifications via email et push
- Gère les erreurs et marque les statuts

#### 3. Templates de notification
- **Email** : `buildReminderEmailTemplate()` dans `emailTemplates.js`
- **Push** : Configuration dans `notificationTemplates.js`

### Collections Firestore

#### `reminderQueue`
```javascript
{
  type: '7days' | '1day',
  scheduledFor: Timestamp,
  eventId: string,
  seasonId: string,
  playerEmail: string,
  playerName: string,
  eventTitle: string,
  eventDate: Timestamp,
  seasonSlug: string,
  status: 'pending' | 'processed' | 'error' | 'expired',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  processedAt?: Timestamp,
  result?: object,
  error?: string
}
```

#### `userPreferences` (étendu)
```javascript
{
  // Préférences existantes...
  notifyReminder7Days: boolean,    // Nouveau
  notifyReminder1Day: boolean,     // Nouveau
  notifyReminderPush: boolean      // Nouveau
}
```

## 🔧 Configuration

### 1. Préférences utilisateur
Les utilisateurs peuvent configurer leurs préférences dans la modal de notifications :
- ✅ Rappel 7 jours avant (email)
- ✅ Rappel 1 jour avant (email)
- ✅ Notifications push pour les rappels

### 2. Cloud Scheduler
La fonction `processReminders` est configurée pour s'exécuter toutes les heures :
```javascript
exports.processReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => { ... })
```

### 3. Règles de sécurité
```javascript
// firestore.rules
match /reminderQueue/{reminderId} {
  allow read, write: if false; // Seules les Cloud Functions
}
```

## 📱 Interface utilisateur

### Modal de test (`ReminderTestModal.vue`)
Composant de développement pour tester le système :
- Création de rappels de test
- Vérification des rappels existants
- Suppression des rappels de test
- Logs en temps réel

### Intégration dans les sélections
Les rappels sont créés automatiquement lors de :
- Sélection manuelle d'un joueur
- Tirage automatique
- Modification d'une sélection existante

## 🔄 Flux de fonctionnement

### 1. Création des rappels
```
Joueur sélectionné → saveSelection() → createRemindersForSelection()
→ Ajout dans reminderQueue avec status 'pending'
```

### 2. Traitement des rappels
```
Cloud Scheduler (toutes les heures) → processReminders()
→ Récupération des rappels du jour
→ Envoi des notifications
→ Mise à jour du status
```

### 3. Gestion des désistements
```
Joueur désélectionné → removeRemindersForPlayer()
→ Suppression des rappels en attente
```

## 🧪 Tests et debugging

### Composant de test
```vue
<ReminderTestModal 
  :show="showReminderTest"
  :season-id="seasonId"
  :season-slug="seasonSlug"
  @close="showReminderTest = false"
/>
```

### Logs et monitoring
- Console Firebase Functions
- Collection `reminderQueue` pour l'état
- Logs côté client dans la console

### Scénarios de test
1. **Créer un événement** dans 8+ jours
2. **Sélectionner un joueur** avec email
3. **Vérifier les rappels** créés
4. **Attendre l'heure** ou modifier la date
5. **Vérifier l'envoi** des notifications

## 🚨 Gestion des erreurs

### Types d'erreurs
- **Rappel expiré** : Plus de 24h de retard
- **Email invalide** : Adresse inexistante
- **Push échoué** : Token FCM invalide
- **Préférences désactivées** : Utilisateur opt-out

### Stratégies de retry
- Pas de retry automatique pour éviter le spam
- Logs détaillés pour le debugging
- Statut d'erreur persistant dans Firestore

## 🔮 Évolutions futures

### Fonctionnalités envisagées
- **Rappels personnalisables** : 3 jours, 1 semaine, etc.
- **Templates personnalisés** par saison/compagnie
- **Intégration calendrier** : Ajout automatique aux agendas
- **Analytics** : Taux d'ouverture, clics, désistements

### Optimisations techniques
- **Batch processing** pour les gros volumes
- **Cache Redis** pour les préférences utilisateur
- **Webhooks** pour les intégrations tierces
- **A/B testing** des templates

## 📚 Ressources

### Fichiers clés
- `src/services/reminderService.js` - Service principal
- `functions/index.js` - Cloud Functions
- `src/components/ReminderTestModal.vue` - Interface de test
- `src/services/notificationTemplates.js` - Templates push
- `src/services/emailTemplates.js` - Templates email

### Dépendances
- Firebase Cloud Functions
- Firebase Cloud Scheduler
- Firebase Firestore
- Firebase Cloud Messaging (FCM)

---

*Documentation mise à jour le : {{ new Date().toLocaleDateString('fr-FR') }}*
