# 🔔 Fonctionnalité d'Incitation aux Notifications

## Vue d'ensemble

Cette fonctionnalité incite les utilisateurs non connectés à activer les notifications lorsqu'ils consultent un événement via un lien direct (partagé par email/message) et cliquent sur une cellule de disponibilité dans la modal de détails de l'événement. Elle suit le flow suivant :

1. **Détection** : L'utilisateur non connecté clique sur une cellule de disponibilité dans la modal de détails d'événement
2. **Proposition** : Affichage d'une modal avec le message "Joueur, ne rates rien à propos de [événement]. Reçois des notifs."
3. **Activation** : Email + magic link + association du joueur + activation des préférences de notification

## Composants créés

### 1. NotificationPromptModal.vue
- Modal d'incitation aux notifications
- Formulaire de saisie d'email
- Design cohérent avec l'application
- Gestion des états (chargement, succès, erreur)
- Z-index élevé (`z-[200]`) pour s'afficher au-dessus de la modal de détails d'événement

### 2. notificationActivation.js
- Service principal pour gérer l'activation des notifications
- Création de demandes d'activation
- Traitement des magic links
- Association automatique joueur-email
- Activation des notifications push

### 3. Templates d'email
- `buildNotificationActivationTemplate()` : Version HTML
- `buildNotificationActivationTextTemplate()` : Version texte
- Design attractif avec bouton d'action

## Intégration

### GridBoard.vue
- Import du composant `NotificationPromptModal`
- Variables d'état pour la modal
- Modification de `handleAvailabilityToggle()` pour détecter les utilisateurs non connectés dans la modal de détails
- Affichage conditionnel de la modal d'incitation

### MagicLink.vue
- Support de l'action `activate_notifications`
- Traitement des liens d'activation
- Redirection avec message de succès

### emailService.js
- Nouvelle fonction `queueNotificationActivationEmail()`
- Intégration avec le système de queue Firestore

## Flow utilisateur

```
1. Utilisateur reçoit un lien vers le détail d'un événement (par email/message)
   ↓
2. Clic sur le lien → ouverture de la modal de détails de l'événement
   ↓
3. Clic sur une cellule de disponibilité dans la modal
   ↓
4. Détection : shouldPromptForNotifications() + utilisateur non connecté
   ↓
5. Affichage de NotificationPromptModal
   ↓
6. Saisie de l'email
   ↓
7. Création du magic link
   ↓
8. Envoi de l'email d'activation
   ↓
9. Clic sur le lien dans l'email
   ↓
10. Traitement par MagicLink.vue
   ↓
11. Activation des notifications
   ↓
12. Association joueur-email
   ↓
13. Redirection avec confirmation
```

## Configuration requise

### Variables d'environnement
- `VITE_FIREBASE_VAPID_KEY` : Pour les notifications push
- Configuration Firebase complète

### Collections Firestore
- `notificationActivations` : Demandes d'activation en cours
- `userPreferences` : Préférences de notifications
- `playerAssociations` : Associations joueur-email
- `mail` : Queue d'emails (via Firebase Extension)

### Extensions Firebase
- Trigger Email (pour l'envoi d'emails)
- Cloud Messaging (pour les notifications push)

## Considérations techniques

### Z-index et superposition des modales
La modal d'incitation aux notifications utilise un z-index de `z-[200]` pour s'assurer qu'elle s'affiche au-dessus de :
- Modal de détails d'événement (`z-[80]`)
- Autres modales de l'application (`z-[100]` à `z-[170]`)
- Éléments de l'interface (`z-[60]` à `z-[120]`)

Cette hiérarchie garantit une expérience utilisateur cohérente sans problèmes de superposition.

## Utilisation

### Pour les développeurs
1. La modal s'affiche automatiquement pour les utilisateurs non connectés
2. Aucune configuration supplémentaire requise
3. Les logs sont disponibles dans la console

### Pour les utilisateurs
1. Recevoir un lien vers le détail d'un événement (par email/message)
2. Cliquer sur le lien et ouvrir la modal de détails
3. Cliquer sur une cellule de disponibilité sans être connecté
4. Saisir son email dans la modal d'incitation
5. Vérifier sa boîte mail et cliquer sur le lien d'activation
6. Les notifications sont automatiquement activées

## Personnalisation

### Messages
- Modifier les templates dans `emailTemplates.js`
- Adapter les textes dans `NotificationPromptModal.vue`

### Design
- Styles CSS dans le composant modal
- Utilisation des classes Tailwind existantes

### Comportement
- Modifier la logique dans `shouldPromptForNotifications()`
- Ajuster les conditions d'affichage

## Tests

### Test manuel
1. Ouvrir l'application sans être connecté
2. Ouvrir la modal de détails d'un événement
3. Cliquer sur une cellule de disponibilité dans la modal
4. Vérifier l'affichage de la modal d'incitation
5. Tester le processus complet d'activation

### Fichier de test
- Tests Playwright automatisés dans `tests/` : Tests complets de l'interface
- Console avec informations de debug

## Dépannage

### Problèmes courants
- **Modal ne s'affiche pas** : Vérifier l'état d'authentification
- **Email non reçu** : Vérifier la configuration Firebase
- **Notifications non activées** : Vérifier les permissions du navigateur

### Logs
- Console du navigateur pour les erreurs JavaScript
- Logs Firebase pour les erreurs de base de données
- Logs du service worker pour les notifications push

## Évolutions futures

### Fonctionnalités possibles
- A/B testing des messages d'incitation
- Personnalisation selon le contexte (événement, saison)
- Intégration avec l'analytics
- Rappels automatiques pour les utilisateurs inactifs

### Optimisations
- Cache des préférences utilisateur
- Gestion des tentatives d'activation
- Métriques de conversion
- A/B testing des templates d'email
