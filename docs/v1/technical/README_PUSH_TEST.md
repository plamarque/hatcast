# 🧪 Script de Test des Notifications Push

Script de diagnostic pour tester et troubleshooter le système de notifications push.

## Prérequis

1. Variable d'environnement `GOOGLE_APPLICATION_CREDENTIALS` configurée:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
   ```

2. Node.js et Firebase Admin SDK installés (déjà configuré dans le projet)

## Commandes disponibles

### Vérifier un utilisateur spécifique

```bash
node test-push-notifications.js --email user@example.com
```

**Affiche:**
- Tokens FCM enregistrés
- Préférences de notification
- Dernière mise à jour

**Exemple de sortie:**
```
============================================================
Vérification des tokens FCM pour: user@example.com
============================================================

✅ 2 token(s) FCM trouvé(s)
{
  "tokens": ["cXXXXXXXXXX...", "dYYYYYYYYYY..."],
  "lastToken": "dYYYYYYYYYY...",
  "updatedAt": "2025-10-14T10:30:00.000Z",
  "userAgent": "Mozilla/5.0..."
}

============================================================
Vérification des préférences pour: user@example.com
============================================================

✅ Notifications push activées dans les préférences
```

### Vérifier tous les utilisateurs

```bash
node test-push-notifications.js --check-all
```

**Affiche:**
- Liste de tous les utilisateurs avec tokens FCM
- État de la queue push

**Utilisation:** Pour avoir une vue d'ensemble du système.

### Vérifier la queue push

```bash
node test-push-notifications.js --queue
```

**Affiche:**
- Nombre de documents dans la queue
- Détails des documents non traités

**Note:** La queue devrait être vide ou presque. Des documents qui restent indiquent un problème.

### Envoyer une notification de test

```bash
node test-push-notifications.js --send-test user@example.com
```

**Fait:**
1. Vérifie que l'utilisateur a des tokens FCM
2. Ajoute une notification de test à la queue
3. Attend 5 secondes
4. Vérifie que la Cloud Function l'a traitée

**Résultat attendu:**
```
============================================================
Envoi d'une notification de test à: user@example.com
============================================================

ℹ️ Ajout à la queue push...
✅ Document ajouté à la queue: abc123xyz
ℹ️ La Cloud Function processPushQueue devrait le traiter automatiquement
ℹ️ Attente de 5 secondes pour le traitement...
✅ Document supprimé de la queue (traité avec succès)
```

### Afficher la configuration

```bash
node test-push-notifications.js --config
```

**Affiche:** Résumé de l'architecture du système de notifications push.

## Cas d'usage

### 1. Un utilisateur ne reçoit pas de notifications

```bash
# Étape 1: Vérifier si l'utilisateur a des tokens
node test-push-notifications.js --email user@example.com

# Si aucun token → L'utilisateur n'a pas activé les notifications
# Si tokens présents → Passer à l'étape 2

# Étape 2: Vérifier les préférences
# Le script affiche automatiquement les préférences
# Si pushNotifications: false → L'utilisateur a désactivé les push

# Étape 3: Envoyer un test
node test-push-notifications.js --send-test user@example.com

# Si le test réussit → Le problème vient d'ailleurs (app, permissions navigateur)
# Si le test échoue → Vérifier les logs Cloud Functions
```

### 2. Les notifications ne sont plus envoyées à personne

```bash
# Vérifier l'état de la queue
node test-push-notifications.js --queue

# Si la queue contient des documents non traités:
# → La Cloud Function n'est pas déployée ou échoue
# → Vérifier les logs Firebase Console

# Si la queue est vide:
# → Les notifications ne sont peut-être pas créées côté app
# → Vérifier le code d'envoi (notificationsService.js)
```

### 3. Vérifier que le système fonctionne globalement

```bash
# Voir combien d'utilisateurs ont des tokens
node test-push-notifications.js --check-all

# Vérifier la queue
node test-push-notifications.js --queue

# Si > 0 utilisateurs avec tokens ET queue vide → Système OK
```

## Interprétation des résultats

### ✅ Tokens trouvés
L'utilisateur a bien activé les notifications push et des tokens FCM sont enregistrés.

### ⚠️ Aucun token trouvé
L'utilisateur n'a jamais activé les notifications push, ou les tokens ont été supprimés.

**Actions:**
- Vérifier que le Service Worker est actif
- Vérifier que les permissions sont accordées dans le navigateur
- Vérifier que l'utilisateur est bien authentifié (pas anonyme)

### ⚠️ Push désactivées dans les préférences
L'utilisateur a explicitement désactivé les notifications push dans ses préférences.

**Actions:**
- Respecter le choix de l'utilisateur
- Proposer de réactiver dans l'interface

### ⚠️ Documents dans la queue
Des notifications n'ont pas été traitées par la Cloud Function.

**Actions:**
1. Vérifier que `processPushQueue` est déployée:
   ```bash
   firebase deploy --only functions:processPushQueue
   ```

2. Vérifier les logs Cloud Functions:
   - Firebase Console > Functions > Logs
   - Rechercher: `processPushQueue`
   - Vérifier les erreurs

### ❌ Document toujours dans la queue après 5 secondes
La Cloud Function n'a pas traité la notification de test.

**Causes possibles:**
- Cloud Function pas déployée
- Cloud Function échoue (vérifier les logs)
- Délai de traitement > 5 secondes (rare)

## Troubleshooting

### Erreur: `GOOGLE_APPLICATION_CREDENTIALS non définie`

**Solution:**
```bash
# Localiser le fichier de credentials
# Il devrait être dans le dossier du projet ou téléchargé depuis Firebase Console

export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# Ou ajouter dans .zshrc/.bashrc pour le rendre permanent
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"' >> ~/.zshrc
```

### Erreur: `Permission denied`

**Solution:**
```bash
# Vérifier que le fichier est accessible
ls -l $GOOGLE_APPLICATION_CREDENTIALS

# Si nécessaire, ajuster les permissions
chmod 600 $GOOGLE_APPLICATION_CREDENTIALS
```

### Erreur de connexion à Firestore

**Solution:**
- Vérifier que le service account a les bonnes permissions
- Vérifier que le projet Firebase est correct
- Vérifier la connexion internet

## Logs détaillés

Le script utilise des logs colorés avec emojis pour faciliter la lecture:

- ✅ **Vert** - Succès
- ❌ **Rouge** - Erreur
- ⚠️ **Jaune** - Avertissement
- ℹ️ **Bleu** - Information

## Documentation complète

Pour plus de détails, consulter:
- `docs/v1/technical/PUSH_NOTIFICATIONS_TROUBLESHOOTING.md` - Guide complet
- `PUSH_NOTIFICATIONS_SUMMARY.md` - Résumé exécutif
- Firebase Console > Functions > Logs - Logs de production

## Support

En cas de problème avec le script:
1. Vérifier les prérequis (credentials, Node.js)
2. Lire les messages d'erreur (en rouge)
3. Consulter la documentation complète
4. Vérifier les logs Cloud Functions

---

**Version:** 1.0  
**Dernière mise à jour:** 14 octobre 2025


