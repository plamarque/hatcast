# Monorepo HatCast (V1 legacy + V2)

## Structure

| Chemin | Contenu |
|--------|---------|
| [`legacy/`](../../legacy/) | Client **V1** (Vue 3, Vite, PWA). Build : `legacy/dist`. |
| [`apps/web/`](../../apps/web/) | Client **V2** (Angular 21 + Material). |
| [`services/api/`](../../services/api/) | API **V2** (cible Spring Boot). |
| [`functions/`](../../functions/) | Cloud Functions Firebase (ligne actuelle partagée avec la V1). |
| Racine | `firebase.json`, règles Firestore/Storage, `package.json` **workspace**, scripts transverses (`scripts/`). |

## Règles d’import (anti-mélange)

1. **`apps/web` et `services/api` ne doivent pas importer** de modules depuis `legacy/src` (ni chemins relatifs vers du code Vue).
2. **`legacy/`** sert de **référence** (lecture, copie de logique, comparaison). Toute logique partagée durable doit passer par des **contrats** (OpenAPI, paquets npm internes, etc.) — à introduire quand le besoin est réel.
3. Les fonctions dans `functions/` peuvent référencer du code sous `legacy/src` **uniquement** pour des cas exceptionnels documentés (ex. duplication évitée via chemins explicites dans le code serveur). Éviter d’étendre ce couplage.

## NPM workspaces

La racine déclare les workspaces `legacy` et `apps/web` ([`package.json`](../../package.json)). Commandes courantes :

```bash
npm install          # à la racine
npm run dev          # lance le dev V1 (hatcast-legacy)
npm run build        # build V1 → legacy/dist
```

Le client V2 expose ses scripts via le workspace **`@hatcast/web`** (ex. `npm run dev:web:v2` à la racine, `npm run build -w @hatcast/web`).
