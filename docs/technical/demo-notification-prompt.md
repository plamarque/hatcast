# 🎯 Démonstration : Incitation aux Notifications

## Scénario de test

### Contexte
Un utilisateur reçoit un email avec un lien vers le détail d'un événement HatCast. Il clique sur le lien, arrive sur l'application, et veut indiquer sa disponibilité.

### Étapes de test

#### 1. Préparation
```bash
# Assurez-vous d'être déconnecté de l'application
# Vérifiez que vous n'avez pas de session active
```

#### 2. Accès à l'événement
```
1. Ouvrir l'application HatCast
2. Naviguer vers une saison
3. Cliquer sur un événement pour ouvrir la modal de détails
4. Vérifier que la modal s'ouvre correctement
```

#### 3. Test de la fonctionnalité
```
1. Dans la modal de détails de l'événement
2. Cliquer sur une cellule de disponibilité (disponible/indisponible)
3. Observer l'affichage de la modal d'incitation aux notifications
4. Vérifier le message : "Joueur, ne rates rien à propos de [événement]. Reçois des notifs."
```

#### 4. Processus d'activation
```
1. Saisir une adresse email valide
2. Cliquer sur "Activer les notifications"
3. Vérifier l'affichage du message de confirmation
4. Vérifier la réception de l'email d'activation
```

#### 5. Finalisation
```
1. Cliquer sur le lien dans l'email reçu
2. Observer le traitement par MagicLink.vue
3. Vérifier l'activation des notifications
4. Confirmer la redirection vers l'événement
```

## Points de vérification

### ✅ Modal d'incitation
- [ ] S'affiche uniquement pour les utilisateurs non connectés
- [ ] Design cohérent avec l'application
- [ ] Message personnalisé avec le nom du joueur et l'événement
- [ ] Formulaire de saisie d'email fonctionnel

### ✅ Processus d'activation
- [ ] Création du magic link
- [ ] Envoi de l'email d'activation
- [ ] Traitement du lien d'activation
- [ ] Association joueur-email
- [ ] Configuration des préférences de notification

### ✅ Intégration
- [ ] Fonctionne dans la modal de détails d'événement
- [ ] N'interfère pas avec les autres fonctionnalités
- [ ] Logs appropriés dans la console
- [ ] Gestion des erreurs

## Cas d'usage alternatifs

### Utilisateur déjà connecté
- La modal d'incitation ne s'affiche pas
- Le processus de disponibilité fonctionne normalement

### Utilisateur avec notifications déjà activées
- La modal d'incitation ne s'affiche pas
- Redirection vers la modal de connexion classique

### Événement archivé
- Aucune modal ne s'affiche
- Message d'erreur approprié

## Dépannage

### Modal ne s'affiche pas
1. Vérifier l'état d'authentification
2. Vérifier que `shouldPromptForNotifications()` retourne `true`
3. Vérifier les logs de la console

### Email non reçu
1. Vérifier la configuration Firebase
2. Vérifier la queue d'emails dans Firestore
3. Vérifier les logs du service d'email

### Erreur lors de l'activation
1. Vérifier la validité du magic link
2. Vérifier les permissions de notification
3. Vérifier les logs d'erreur

## Logs utiles

```javascript
// Dans la console du navigateur
console.log('🔔 Modal d\'incitation affichée')
console.log('📧 Email d\'activation envoyé')
console.log('✅ Notifications activées')

// Dans les logs Firebase
console.log('Demande d\'activation des notifications créée')
console.log('Notifications activées avec succès')
```

## Métriques à surveiller

- **Taux d'affichage** : Nombre de fois où la modal s'affiche
- **Taux de conversion** : Nombre d'emails saisis / affichages
- **Taux d'activation** : Nombre d'activations réussies / emails envoyés
- **Temps de conversion** : Délai entre l'affichage et l'activation
