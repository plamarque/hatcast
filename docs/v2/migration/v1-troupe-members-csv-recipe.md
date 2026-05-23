# V1 → V2 migration — utilisateurs et membres de troupe

Guide opérationnel pour préremplir HatCast V2 **via l’application** (Neon / Postgres — pas de `psql` requis).

## Vue d’ensemble

| Étape | Quoi | Outil |
|-------|------|--------|
| 1 | Comptes applicatifs (`users`) | Script V1 → CSV → **Importer utilisateurs** (UI V2) |
| 2 | Adhésions troupe | Script V1 → CSV → **Importer membres** (UI V2) |
| 3 (optionnel) | Comptes auth Firebase (mot de passe) | `firebase auth:export` / `auth:import` vers Identity Platform V2 |

Les utilisateurs importés à l’étape 1 ont `activated_at = null` jusqu’à leur **première connexion V2** (Google ou IdP). L’import membres (étape 2) fonctionne dès l’étape 1, sans connexion préalable.

## Étape 1 — Exporter les utilisateurs V1

```bash
npm run export:v1-users -- --season=SEASON_ID --output=users.csv
```

Format CSV :

```csv
email,displayName
alice@example.com,Alice
bob@example.com,Bob
```

Sources V1 : `players.email`, `players.name`, plus emails présents dans `roles.admins` / `roles.users`.

## Étape 2 — Importer les utilisateurs en V2

1. Connectez-vous en **admin de troupe** sur la V2.
2. Ouvrez **Membres** (depuis la saison / troupe).
3. **Importer utilisateurs CSV** — sélectionnez `users.csv`.

Résultat : comptes stub en Postgres, en attente de première authentification.

## Étape 3 — Exporter puis importer les membres

```bash
npm run export:v1-members -- --season=SEASON_ID --output=members.csv
```

Format CSV :

```csv
email,displayName,baselineRole,status
alice@example.com,Alice,MEMBER,active
bob@example.com,Bob,TROUPE_ADMIN,active
```

Dans l’UI V2 : **Importer membres CSV**. Les emails absents de l’étape 1 produisent `USER_NOT_FOUND`.

### Mapping V1 Firestore → CSV membres

| CSV | Source V1 |
|-----|-----------|
| `email` | `players.email`, `roles.admins`, `roles.users` |
| `displayName` | `players.name` |
| `baselineRole` | `TROUPE_ADMIN` si email ∈ `roles.admins`, sinon `MEMBER` |
| `status` | `active` |

## Première connexion (réactivation du compte)

### Google

1. Stub Postgres créé à l’import utilisateurs.
2. Première connexion Google en V2 → `AuthUserLinkService` attache `google_sub`, définit `activated_at`.
3. Les memberships importées restent valides.

### Email / mot de passe

Pour « mot de passe oublié » ou connexion IdP, le compte doit exister dans **Identity Platform V2** (import Firebase Auth séparé). Sans cela, seul Google (ou création manuelle IdP) permet la première connexion.

## Scripts

| Script | Rôle |
|--------|------|
| `npm run export:v1-users` | Saison V1 → CSV utilisateurs |
| `npm run export:v1-members` | Saison V1 → CSV membres |
| `node --test scripts/v1/*.test.js` | Tests mapping |

## API V2

| Endpoint | Rôle |
|----------|------|
| `POST /v1/troupes/{id}/users/import` | Import CSV utilisateurs (admin troupe) |
| `POST /v1/troupes/{id}/members/import` | Import CSV membres (admin troupe) |

## Références code

- `UserAccountService.importMigrationUser` — création stub migration
- `UserImportService` — import CSV utilisateurs
- `AuthUserLinkService` — liaison + `activated_at` à la première connexion
- `TroupeMemberCsvImportService` — import membres (`USER_NOT_FOUND` si user absent)
