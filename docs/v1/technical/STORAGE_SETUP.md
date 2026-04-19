# Configuration Firebase Storage pour HatCast

## Déploiement des règles de sécurité

Pour activer l'upload de logos de troupe, vous devez déployer les règles de sécurité Firebase Storage :

```bash
# Installer Firebase CLI si ce n'est pas déjà fait
npm install -g firebase-tools

# Se connecter à votre projet Firebase
firebase login

# Déployer les règles de sécurité Storage
firebase deploy --only storage
```

## Structure des dossiers

Les logos seront stockés dans la structure suivante :
- `season-logos/{seasonId}/{timestamp}_{filename}` - Logos des saisons existantes
- `season-logos/temp-{timestamp}/{timestamp}_{filename}` - Logos temporaires lors de la création

## Permissions

- **Lecture** : Tout le monde peut voir les logos (pour l'affichage public)
- **Écriture** : Seuls les utilisateurs authentifiés peuvent uploader des logos

## Limitations

- Taille maximale : 5MB par image
- Formats acceptés : PNG, JPG, GIF
- Les anciens logos sont automatiquement supprimés lors du remplacement

## Dépannage

Si l'upload ne fonctionne pas :
1. Vérifiez que Firebase Storage est activé dans votre console Firebase
2. Vérifiez que les règles de sécurité sont déployées
3. Vérifiez que l'utilisateur est authentifié
4. Vérifiez les logs de la console pour les erreurs
