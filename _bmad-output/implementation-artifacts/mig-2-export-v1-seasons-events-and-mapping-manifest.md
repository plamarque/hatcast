# Story MIG-2 : Export V1 saisons + événements vers V2 et manifest de mapping

Status: ready-for-dev

**Type :** Migration / outillage (PLAN.md § Pre-prod V2 + migration V1). Pas de feature produit.
**ADR :** [docs/adr/0016-…-migration-pipeline.md](../../docs/adr/0016-v1-v2-availability-compositions-migration-pipeline.md) · [0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md) · [0015](../../docs/adr/0015-v2-demo-troupe-product-bootstrap.md)

## Story

En tant qu'**opérateur de migration (Patrice)**,
je veux **exporter en lecture seule la saison + les événements de La Malice depuis la prod V1 (Firestore `(default)`) et les charger dans la troupe/saison V2 cible, en produisant un `manifest.json` de mapping (joueurs + événements)**,
afin de **disposer du pont d'identités V1→V2 déterministe dont MIG-3 (dispos/compositions) a besoin, et de pouvoir rejouer la migration autant que nécessaire avant la bascule**.

## Acceptance Criteria

1. **Given** la saison V1 `o0kD2IJekMdGdiJeIg4O` ("Malice 2025-2026") sur Firestore `(default)`, **when** on lance l'extraction, **then** seuls des `.get()` sont effectués (jamais d'écriture V1) et un dump JSON horodaté est écrit sous `export/malice/<ts>/` (hors git). [Source: ADR-0016 §Decision.2]
2. **Given** le dump V1 des événements (55 attendus ; champs `date` string `YYYY-MM-DD`, `title`, `location`, `description`, `templateType`, `roles{role_key:count}`, `archived`), **when** on transforme, **then** chaque événement non supprimé mappe vers une ligne `events` V2 : `title`, `starts_at` (date V1 + heure par défaut documentée, ex. `19:00` local), `location`, `description`, `template_type` ← `templateType`, `role_slots` (JSON `{role_key:count}`), `archived`, `season_id` = saison V2 cible. [Source: V5__events.sql, V7__event_types_and_role_slots.sql ; ADR-0016]
3. **Given** les événements chargés, **when** la génération du slug s'applique, **then** chaque `events.slug` est renseigné selon la convention V2 (V24/ADR-0013), unique par saison. [Source: V24__events_slug.sql, ADR-0013]
4. **Given** que les membres V1 sont déjà importés en V2 (Story 2.3, `season_participants` peuplés), **when** on construit le manifest, **then** `manifest.json` contient `players[] = { v1PlayerId, email, v2UserId, v2SeasonParticipantId }` résolus **par email normalisé** contre `users` + `season_participants` de la saison cible. [Source: ADR-0016 §Decision.3 ; V14__season_and_event_participants.sql]
5. **Given** les événements chargés en V2, **when** on construit le manifest, **then** `manifest.json` contient `events[] = { v1EventId, v2EventId, slug, date }` couvrant tous les événements migrés. [Source: ADR-0016 §Decision.3]
6. **Given** un joueur V1 sans correspondance V2 (email absent des `season_participants`) ou un événement non résolu, **when** on construit le manifest, **then** la ligne est listée dans un rapport `rejects.json` (raison + détail) et **n'interrompt pas** le run. [Source: ADR-0016 §Decision.4]
7. **Given** le chargement en base, **when** on applique le SQL généré, **then** il est **idempotent** (`INSERT … ON CONFLICT DO UPDATE`), exécuté dans **une transaction**, en **`--dry-run` par défaut** ; une cible production exige `--confirm-prod=<slug>`, `staging` accepte `--yes`. [Source: ADR-0016 §Decision.5]
8. **Given** la commande `--database=default` historiquement documentée, **when** on cible la prod V1, **then** la base réelle `(default)` est utilisée (BUG-DOC-001 corrigé : `getDb` normalise `default`/vide → `(default)`). [Source: ISSUES.md BUG-DOC-001]

**Couverture produit :** N/A (outillage migration). PLAN.md MIG-2.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; story 100 % scripts Node + SQL + données V2. Section Material 3 omise volontairement.

---

## Tasks / Subtasks

- [ ] **Périmètre :** `scripts/` (Node) + SQL appliqué sur Neon. Pas d'`apps/web/`, pas de `services/api/` runtime (réutilise le schéma existant).
- [ ] **Extract** (AC 1, 8) : étendre `scripts/replay/loadSeasonData.js` `getDb` pour normaliser `default`→`(default)` ; commande `migrate:malice:extract` qui dump events + season meta en JSON horodaté. Réutiliser `loadEvents()`.
- [ ] **Transform events** (AC 2, 3) : module pur testable (cf. `scripts/v1/troupeMembersCsv.js`) qui produit les `INSERT events` (+ slug) idempotents.
- [ ] **Manifest** (AC 4, 5, 6) : résolution joueurs par email contre `users`/`season_participants` (lecture Neon ou export), résolution events par `v1EventId`; écrire `manifest.json` + `rejects.json`.
- [ ] **Load** (AC 7) : `migrate:malice:load` (partagé avec MIG-3) — `psql -f load.sql` en transaction, dry-run par défaut, garde-fou prod.
- [ ] **npm scripts** : `migrate:malice:extract`, `migrate:malice:transform`, `migrate:malice:load` dans `package.json` (+ variantes `:prod`).
- [ ] **Tests** : tests unitaires du transform events + résolution manifest (jeux de données fixtures, sans Firestore), à la manière de `scripts/v2/generate-improbots-seed-sql.test.js`.
- [ ] **Doc** : mettre à jour `docs/v2/migration/preprod-reset-and-migrate.md` (étape events + manifest, `(default)`).

## Dev Notes

### Contexte migration (V1 → V2)

- Source V1 profilée 2026-05-29 (`scripts/v1-inspect-season.js`, lecture seule) : saison `o0kD2IJekMdGdiJeIg4O`, 31 joueurs (tous avec email), 55 events, 32 casts, 1227 dispos.
- V1 `events.date` est une **string `YYYY-MM-DD` sans heure** → choisir une heure par défaut pour `starts_at` (à documenter ; ne pas inventer une heure par event).
- Le manifest est **le livrable nouveau** de MIG-2 imposé par ADR-0016 ; MIG-3 en dépend strictement.

### Schéma V2 cible (référence)

| Table | Fichier |
|-------|---------|
| `events` (+ `template_type`, `role_slots`) | `services/api/src/main/resources/db/migration/V5__events.sql`, `V7__event_types_and_role_slots.sql` |
| `events.slug` | `V24__events_slug.sql` |
| `season_participants` / `event_participants` | `V14__season_and_event_participants.sql` |
| equity tags (MIG-4, hors scope) | `V25__equity_tags.sql` |

### Patterns à réutiliser

- Lecture Firestore read-only : `scripts/replay/loadSeasonData.js` (`getDb`, `loadEvents`).
- Génération SQL idempotente : `scripts/v2/generate-improbots-seed-sql.js` (+ son test).
- Mapping pur + tests : `scripts/v1/troupeMembersCsv.js` (+ `troupeMembersCsv.test.js`).
- Inspecteur déjà créé : `scripts/v1-inspect-season.js` (base de l'extract).

### Explicit non-goals

- Pas de migration des dispos/compositions (→ MIG-3).
- Pas de mapping `template_type=deplacement` → `equity_tag` (→ MIG-4).
- Pas de bascule prod / DNS / Hosting (checklist séparée, ADR-0014 §6).
- Pas d'import Firebase Auth (séparé).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 2.3 import membres CSV | done | Prérequis : `season_participants` peuplés pour résoudre le manifest |
| 2.11 / MIG-0 création troupe | done | Prérequis : troupe + saison V2 cibles existent |
| MIG-1 reset Neon staging | done | Boucle reset/replay (ADR-0014 Proc. C) |
| MIG-3 | ready-for-dev | Consommateur du `manifest.json` |

## Dev Agent Record

### Agent Model Used

…

### Completion Notes List

- …

### File List

- …

### Change Log

- 2026-05-29 : Création de la story (ADR-0016).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ADR-0016 / schéma / ISSUES)
- [x] Section **Material 3** : **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` (tests scripts) mentionné
