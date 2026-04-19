# HatCast V1 (legacy)

SPA **Vue 3 + Vite + Firebase** — code historique déplacé ici depuis la racine du dépôt pour isoler la future V2 (`apps/web/`, `services/api/`).

## Rôle

- **Référence** pour le comportement produit et l’UX lors du développement V2.
- **Maintenance** / correctifs sur la ligne actuelle jusqu’au bascule prod V2.
- Ce dossier **n’est pas** une dépendance des builds V2 : pas d’import depuis `apps/web` ou `services/api` vers `legacy/` (voir [MONOREPO.md](../docs/shared/technical/MONOREPO.md)).

## Commandes

À exécuter depuis **`legacy/`** ou via la racine du monorepo :

```bash
# Racine du repo
npm install
npm run dev          # démarre le client V1 (workspace hatcast-legacy)
npm run build        # build → legacy/dist
```

Ou :

```bash
cd legacy && npm install && npm run dev
```

Les certificats HTTPS locaux optionnels restent à la **racine** du dépôt (`192.168.1.134*.pem`).

## Sortie de build

`npm run build` produit **`legacy/dist`**, référencé par [`firebase.json`](../firebase.json) pour Firebase Hosting.
