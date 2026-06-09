# Simulation volume notifications V2 (replay V1)

Outil **rejouable** pour estimer combien de notifications (push + email) auraient été
délivrées en V2 à partir d’un export V1 (`raw.json` MIG-2/MIG-3).

## Usage

```bash
# 1) Extraire la saison V1 (si pas déjà fait)
npm run migrate:malice:extract:prod -- --season=o0kD2IJekMdGdiJeIg4O

# 2) Simuler avec les préférences par défaut V2
npm run simulate:notification-volume -- --raw=export/malice/<timestamp>/raw.json

# JSON structuré (sans la liste complète des deliveries)
npm run simulate:notification-volume -- --raw=... --output=json

# Tester si tout le monde activait le push global
npm run simulate:notification-volume -- --raw=... --push-global=on

# Scénario orga : toutes alertes ORG_* activées
npm run simulate:notification-volume -- --raw=... --prefs=scripts/v2/notification-volume/scenario-org-all-on.json

# Tester un autre modèle de prefs (copier default-preferences.json)
npm run simulate:notification-volume -- --raw=... --prefs=./my-prefs-scenario.json

# Journal JSONL de chaque unité simulée
npm run simulate:notification-volume -- --raw=... --write-deliveries=/tmp/deliveries.jsonl
```

## Métriques produites

Pour **participants** et **organisateurs** séparément :

| Agrégat | Définition |
|---------|------------|
| **Par événement** | Nombre d’unités livrées par couple (personne × spectacle) |
| **Par semaine** | Nombre d’unités livrées par couple (personne × semaine ISO, Europe/Paris) |
| **Total saison** | Total par personne sur toute la saison |

Chaque stat bloc inclut **n, moyenne, médiane, min, max, p90**.

Une **unité** = un canal (push **ou** email). Un intent peut donc compter 0, 1 ou 2 unités
selon les prefs catégorie + opt-in push global.

## Préférences par défaut (`default-preferences.json`)

Aligné sur le runtime Kotlin :

- Catégories **membre** : push ON, email ON (opt-out si absent du JSON utilisateur).
- Catégories **ORG_*** : push OFF, email OFF (opt-in).
- **`pushGlobalEnabled: false`** : reflète `users.push_notifications_enabled` par défaut
  → en pratique **email seul** pour les membres tant qu’ils n’activent pas le push navigateur.

## Hypothèses de replay (état final V1)

Le dump `raw.json` est un **instantané** : pas d’historique des transitions.

| Simulé | Source / heuristique |
|--------|----------------------|
| `EVENT_DRAFT_CREATED` | Création estimée J-45 avant le show |
| `AVAILABILITY_OPENED` | Si engagement (dispo, cast, déclin) |
| `CONFIRMATION_REQUEST` | Assignés `pending` sur compo validée (état final) |
| `TEAM_COMPLETE_MEMBER` / `TEAM_COMPLETE` | Lifecycle `COMPLETE` |
| `EVENT_ARCHIVED` | `archived: true` + roster engagé |
| `ASSIGNEE_PRESENCE_REMINDER` J-7/J-1 | Assignés `confirmed`, compo validée |
| Jobs orga SLA / compo incomplète | Simulation jour par jour |

**Non simulé** (nécessiterait un journal d’audit V1) : annonces manuelles, nudges dispo,
retraits/revalidations, proxies, changements détail, régressions équipe, rappels dispo 8.7.

## Tests

```bash
node --test scripts/v2/notification-volume/simulator.test.js
```

## Fichiers

| Fichier | Rôle |
|---------|------|
| `simulator.js` | Moteur de replay |
| `season-model.js` | Modèle saison depuis raw.json |
| `lifecycle.js` | Lifecycle composition (port Kotlin) |
| `stats.js` | Agrégations moyenne / médiane / extrêmes |
| `default-preferences.json` | Prefs rejouables |
| `../simulate-notification-volume.mjs` | CLI |
