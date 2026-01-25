# Référence CORS (Firebase Storage)

Le fichier **cors.json** dans ce dossier est la configuration CORS de référence pour le bucket Firebase Storage du projet. Il n’est pas chargé automatiquement par l’application.

Pour l’appliquer au bucket :

```bash
gsutil cors set docs/technical/cors.json gs://<BUCKET_NAME>
```

Origines autorisées : localhost, IP locale 192.168.1.134, et `https://hatcast-staging.web.app`.
