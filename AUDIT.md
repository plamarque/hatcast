# 🔍 Audit Trail - HatCast

## 📋 Vue d'ensemble

Système d'audit complet qui capture automatiquement toutes les actions utilisateur et événements système. Utilise Firebase Firestore + Cloud Functions pour une traçabilité sécurisée.

## 🚀 Utilisation Rapide

### **1. Authentification**
```bash
firebase login
```

### **2. Lister les logs**
```bash
cd scripts
node audit-cli.js list --limit=20
```

### **3. Filtres disponibles**
```bash
# Par utilisateur
node audit-cli.js list --user="user@example.com"

# Par joueur
node audit-cli.js list --player="Fiodor"

# Par spectacle
node audit-cli.js list --event="Jam"

# Par saison
node audit-cli.js list --season="test"

# Par type d'action
node audit-cli.js list --type="player_confirmed"
```

## 📊 Exemple d'Output

```
✅ 23 logs trouvés

Timestamp | Action | Changement | User | Saison | Spectacle | Joueur
----------|--------|-----------|------|--------|-----------|--------
21/08 15:57:07 | player_confirmed | ✅ success (Jam) | jgJuKQXuNTgt941pk3ixe572Bu92 | test | Jam | Olivier
21/08 15:57:06 | player_confirmed | ✅ success (Jam) | jgJuKQXuNTgt941pk3ixe572Bu92 | test | Jam | Kevin
21/08 15:56:49 | selection_validated | ✅ success (Jam) | jgJuKQXuNTgt941pk3ixe572Bu92 | test | Jam | -
```

## 🔍 Types d'Actions Traquées

### **Authentification & Compte**
- `user_login` - Connexion utilisateur
- `user_logout` - Déconnexion
- `client_error` - Erreurs de connexion
- `password_changed` - Changement de mot de passe
- `account_deleted` - Suppression de compte

### **Gestion des Spectacles**
- `event_added` - Ajout d'un spectacle
- `event_reset` - Réinitialisation d'un spectacle
- `event_deleted` - Suppression d'un spectacle
- `event_archived` - Archivage d'un spectacle
- `event_unarchived` - Désarchivage d'un spectacle
- `event_modified` - Modification d'un spectacle
- `event_announced` - Annonce d'un spectacle

### **Sélection & Participation**
- `auto_selection_triggered` - Auto-sélection déclenchée
- `selection_validated` - Sélection validée par organisateur
- `pin_entered` - Saisie du code PIN
- `selection_unlocked` - Déverrouillage de sélection
- `player_confirmed` - Joueur confirme participation
- `player_withdrawn` - Joueur se désiste
- `player_deselected` - Joueur désélectionné manuellement
- `player_reselected` - Joueur resélectionné manuellement
- `selection_announced` - Annonce de la sélection
- `team_announced` - Annonce de l'équipe

### **Gestion des Joueurs**
- `player_protected` - Protection d'un joueur
- `player_unprotected` - Déprotection d'un joueur
- `player_renamed` - Renommage d'un joueur
- `player_deleted` - Suppression d'un joueur

### **Disponibilités**
- `availability_changed` - Modification de disponibilité (nouveau !)

### **Application & Interface**
- `modal_opened` - Ouverture de modale
- `navigation` - Navigation utilisateur
- `pwa_installed` - Installation PWA
- `pwa_updated` - Mise à jour PWA
- `notifications_enabled` - Activation des notifications
- `notification_preferences_changed` - Changement préférences notifications

## 🛡️ Sécurité & Robustesse

### **Obfuscation des Emails**
- `user@example.com` → `us••@ex••.com`
- Reconnaissable mais privé

### **Authentification Firebase CLI**
- Seuls les utilisateurs connectés via `firebase login` peuvent accéder
- Basé sur les permissions du projet Firebase

### **🚀 Robustesse Absolue (Nouveau !)**
- **Aucune méthode d'audit ne peut faire planter l'application**
- Protection multi-niveaux avec try/catch et fallbacks
- Désactivation automatique en environnements de test
- Méthodes auxiliaires sécurisées (device info, session, etc.)
- Gestion gracieuse des erreurs Firebase/réseau
- Fallbacks pour navigator/window non disponibles

## 🔧 Dépannage

### **Erreur d'index**
```bash
# Déployer les index Firestore
firebase deploy --only firestore:indexes
```

### **Aucun log trouvé**
```bash
# Vérifier l'authentification
firebase login:list
```

## 📈 Commandes Avancées

### **Recherche textuelle**
```bash
node audit-cli.js search "Jam"
```

### **Statistiques**
```bash
node audit-cli.js stats --days=7
```

### **Historique d'un événement**
```bash
node audit-cli.js event "test" "Jam"
```

### **Historique d'un joueur**
```bash
node audit-cli.js player "test" "Fiodor"
```

## 🧪 Environnements de Test

Le système détecte automatiquement les environnements de test et désactive l'audit pour éviter la pollution :
- Playwright/Cypress
- localhost:5173 (dev)
- Emails de test

## 💡 Exemples d'Usage

### **Qui a fait quoi sur le spectacle 'Jam' ?**
```bash
node audit-cli.js list --event="Jam" --limit=100
```

### **Toutes les actions de Fiodor**
```bash
node audit-cli.js list --player="Fiodor" --limit=100
```

### **Actions d'un utilisateur spécifique**
```bash
node audit-cli.js list --user="user@example.com" --limit=50
```

### **Erreurs récentes**
```bash
node audit-cli.js list --type="client_error" --limit=20
```

## 🔧 Guide d'Implémentation

### **Méthodes d'Audit Disponibles**

#### **Authentification & Compte**
```javascript
await AuditClient.logLogin(email, method)
await AuditClient.logLogout(email)
await AuditClient.logPasswordChanged(email, data)
await AuditClient.logAccountDeleted(email, data)
```

#### **Gestion des Spectacles**
```javascript
await AuditClient.logEventAdded(eventTitle, seasonSlug, data)
await AuditClient.logEventReset(eventTitle, seasonSlug, data)
await AuditClient.logEventDeleted(eventTitle, seasonSlug, data)
await AuditClient.logEventArchived(eventTitle, seasonSlug, data)
await AuditClient.logEventUnarchived(eventTitle, seasonSlug, data)
await AuditClient.logEventModified(eventTitle, seasonSlug, changes, data)
await AuditClient.logEventAnnounced(eventTitle, seasonSlug, data)
```

#### **Sélection & Participation**
```javascript
await AuditClient.logAutoSelectionTriggered(seasonSlug, data)
await AuditClient.logSelectionValidated(seasonSlug, data)
await AuditClient.logPinEntered(seasonSlug, data) // Nouveau !
await AuditClient.logSelectionUnlocked(seasonSlug, data)
await AuditClient.logPlayerConfirmed(playerName, eventTitle, seasonSlug, data)
await AuditClient.logPlayerWithdrawn(playerName, eventTitle, seasonSlug, data)
await AuditClient.logSelectionAnnounced(seasonSlug, data)
await AuditClient.logTeamAnnounced(seasonSlug, data)
```

#### **Disponibilités (Nouveau !)**
```javascript
// Action générique de disponibilité (utilisée automatiquement)
await AuditClient.logUserAction({
  type: 'availability_changed',
  category: 'availability',
  data: {
    playerName: 'Eisen',
    eventTitle: 'Jam',
    seasonSlug: 'test',
    oldValue: null,
    newValue: true
  }
})
```

#### **Gestion des Joueurs**
```javascript
await AuditClient.logPlayerProtected(playerName, seasonSlug, data)
await AuditClient.logPlayerUnprotected(playerName, seasonSlug, data)
await AuditClient.logPlayerRenamed(oldName, newName, seasonSlug, data)
await AuditClient.logPlayerDeleted(playerName, seasonSlug, data)
```

#### **Application & Notifications**
```javascript
await AuditClient.logPWAInstalled(data)
await AuditClient.logPWAUpdated(data)
await AuditClient.logNotificationsEnabled(data)
await AuditClient.logNotificationPreferencesChanged(preferences, data)
```

### **Exemple d'Implémentation**
```javascript
// Import du service
import AuditClient from '../services/auditClient.js'

// Dans une fonction
async function handleEventCreation() {
  try {
    const eventData = await createEvent(formData)
    
    // Logger l'action - SÉCURISÉ : ne plantera jamais !
    await AuditClient.logEventAdded(
      eventData.title, 
      currentSeason.slug, 
      {
        createdBy: userEmail,
        eventDate: eventData.date,
        maxPlayers: eventData.maxPlayers
      }
    )
    
    showSuccess('Spectacle créé avec succès')
  } catch (error) {
    // Logger l'erreur - SÉCURISÉ : ne plantera jamais !
    await AuditClient.logError(error, { 
      context: 'event_creation',
      eventTitle: formData.title 
    })
    showError('Erreur lors de la création')
  }
}
```

### **💡 Sécurité Garantie**
```javascript
// ✅ TOUTES ces actions sont maintenant 100% sécurisées
await AuditClient.logLogin(email)           // Ne plantera jamais
await AuditClient.logPinEntered(seasonSlug) // Ne plantera jamais  
await AuditClient.logError(error)           // Ne plantera jamais
// Même si : Firebase down, navigator undefined, erreur réseau, etc.
```
