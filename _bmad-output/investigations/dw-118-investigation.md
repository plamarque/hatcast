# Investigation: DW-118 — V38 backfill `removal_source`

## Hand-off Brief

1. **What happened.** V38 sans backfill ; audit SQL **staging + prod** → **0** membre `REMOVED` + `removal_source` NULL — risque R-003 **non matérialisé**.
2. **Where the case stands.** **Concluded** — pas de migration ; DW-118 fermé documentairement.
3. **What's needed next.** **DW-119** (vérif slugs exotiques MIG-2).

## Case Info

| Field            | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Ticket           | DW-118                                                                |
| Date opened      | 2026-06-07                                                            |
| Status           | Concluded                                                             |
| System           | HatCast V2 — Spring API, Flyway, PostgreSQL (Neon)                    |
| Evidence sources | Code source, migrations, story 3.19, deferred-work, recette 3.19, git |

## Problem Statement

Item différé T2 : compléter le backfill SQL de `season_participants.removal_source` pour les lignes `REMOVED` existantes avant V38, afin d'éviter une réactivation intempestive par `ensureMembershipParticipants` / `ensureForMembership` après déploiement 3.19.

## Evidence Inventory

| Source                                      | Status    | Notes                                                       |
| ------------------------------------------- | --------- | ----------------------------------------------------------- |
| `V38__season_participant_removal_source.sql`| Available | Colonne + CHECK, pas de UPDATE                              |
| `SeasonParticipantService.kt`               | Available | Garde sync L767-768, remove() L618-619                       |
| `SeasonParticipantMembershipSync.kt`        | Available | Garde sync L44-45, cascade L118-120                         |
| Story 3.19 + review defer                   | Available | Item différé explicite                                      |
| Recette 3.19 M1 / R-003                     | Available | PASS manuel 2026-05-31 (sans audit SQL documenté)           |
| Scripts MIG V1                              | Available | Aucun import `REMOVED` season participants                  |
| Comptages Neon staging                      | Available | **0** / **0** — 2026-06-07 |
| Comptages Neon prod                         | Available | **0** / **0** — 2026-06-07 (Patrice) |

## Investigation Backlog

| # | Path to Explore                         | Priority | Status | Notes                                      |
| - | --------------------------------------- | -------- | ------ | ------------------------------------------ |
| 1 | Audit SQL staging                       | High     | Done   | 0 / 0 — 2026-06-07                         |
| 2 | Audit SQL prod                            | Medium   | Done   | 0 / 0 — 2026-06-07                           |
| 3 | Migration V61 backfill                  | High     | Cancelled | Staging = 0 ; prod attendu idem           |
| 3 | Patch `E2eFixtureService` (side finding)  | Low      | Open   | `removeSeasonParticipantIfActive` sans source |

## Timeline of Events

| Time       | Event                                              | Source                          | Confidence |
| ---------- | -------------------------------------------------- | ------------------------------- | ---------- |
| 2026-05-31 | Story 3.19 implémentée — garde `removal_source`    | `3-19-retrait-roster-saison…`   | Confirmed  |
| 2026-05-31 | V38 déployée sans backfill — defer review          | story 3.19 L143                 | Confirmed  |
| 2026-05-31 | Recette manuelle PASS (M1 smoke V38)               | `RECETTE-3.19-…`                | Confirmed  |
| 2026-06-09 | DW-118 repriorisé T2 #1 (avant M4)                 | `deferred-triage-2026-06.md`  | Confirmed  |

## Confirmed Findings

### Finding 1: V38 n'effectue aucun backfill

**Evidence:** `services/api/src/main/resources/db/migration/V38__season_participant_removal_source.sql:1-6`

**Detail:** Seuls `ADD COLUMN` et `ADD CONSTRAINT CHECK` ; toutes les lignes existantes ont `removal_source = NULL`.

### Finding 2: La garde sync ignore les lignes NULL (seul SEASON_ADMIN est protégé)

**Evidence:**
- `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt:767-784`
- `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt:44-61`

**Detail:** Si `existing.removalSource != SEASON_ADMIN`, le sync met `status = ACTIVE`, `removalSource = null`, `removedAt = null` pour les adhésions troupe `ACTIVE`.

### Finding 3: `remove()` post-3.19 pose toujours `SEASON_ADMIN` pour les membres

**Evidence:** `SeasonParticipantService.kt:618-619`

**Detail:** Seules les lignes **préexistantes** ou créées hors API (fixtures, SQL manuel) peuvent être `REMOVED` + membre + `NULL`.

### Finding 4: Avant 3.19, seul le retrait par adhésion inactive produisait des REMOVED membre

**Evidence:** Story 3.19, `SeasonParticipantMembershipSync.removeForMembership:116-120`, absence de `REMOVED` dans scripts MIG V1.

**Detail:** Le retrait season-local admin d'un **membre** n'existait pas avant 3.19 ; les REMOVED membre historiques viennent de la cascade troupe (désactivation adhésion).

### Finding 5: Recette M1 marquée PASS sans trace SQL d'audit

**Evidence:** `scripts/v2/RECETTE-3.19-RETRAIT-ROSTER-SAISON.md:216`

**Detail:** Contrôle M1 validé manuellement ; pas de comptage archivé dans le repo.

## Deduced Conclusions

### Deduction 1: Sous-ensemble à risque = REMOVED + membre + NULL + adhésion ACTIVE

**Based on:** Findings 2, 4

**Reasoning:** Sync ne parcourt que les adhésions `ACTIVE`. Une ligne `REMOVED` liée à une adhésion `INACTIVE` n'est pas touchée tant que l'adhésion reste inactive. La réactivation lors d'un `INACTIVE → ACTIVE` est **comportement voulu** pour les retraits cascade troupe.

**Conclusion:** Le scénario dangereux pour la pyramide 3.19 (fantôme réapparaît alors qu'un admin l'avait retiré de la saison) **ne peut pas** concerner des données pré-3.19 pour des membres — sauf corruption manuelle ou fixture E2E incorrecte post-3.19.

### Deduction 2: Backfill recommandé = `MEMBERSHIP_INACTIVE`, pas `SEASON_ADMIN`

**Based on:** Findings 3, 4

**Reasoning:** Attribuer `SEASON_ADMIN` à tort empêcherait la réintégration légitime après réactivation troupe. Les REMOVED membre pré-V38 correspondent à la cascade adhésion.

**Conclusion:** `UPDATE … SET removal_source = 'MEMBERSHIP_INACTIVE' WHERE status = 'REMOVED' AND removal_source IS NULL AND troupe_membership_id IS NOT NULL`.

## Hypothesized Paths

### Hypothesis 1: Prod/staging contient 0 ligne membre REMOVED + NULL

**Status:** Confirmed (staging + prod)

**Theory:** Comme supposé en review 3.19, aucune donnée réelle à backfiller.

**Would confirm:** Audit SQL retourne 0 sur staging et prod.

**Would refute:** Comptage > 0, surtout sous-ensemble adhésion ACTIVE.

**Resolution:** Staging + prod — requête B = **0**, requête C = **no rows** (Patrice, 2026-06-07).

### Hypothesis 2: Staging contient des lignes fixture E2E sans `removal_source`

**Status:** Open

**Theory:** `E2eFixtureService.removeSeasonParticipantIfActive` (L243-257) pose `REMOVED` sans `removalSource` — mais cible des carnets EXTERNE, exclus du sync membre.

**Would confirm:** Audit limité aux non-EXTERNE ; fixtures EXTERNE ignorées pour DW-118.

## Missing Evidence

| Gap                         | Impact                                      | How to Obtain                          |
| --------------------------- | ------------------------------------------- | -------------------------------------- |
| Row counts staging/prod     | Confirme/refute nécessité migration         | Requêtes audit ci-dessous sur Neon     |
| Corrélation `removed_at`    | Affiner triage cas ambigus ACTIVE+REMOVED   | JOIN audit_events si besoin            |

## Source Code Trace

| Element       | Detail                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Error origin  | `SeasonParticipantService.ensureMembershipParticipants:766-784`       |
| Trigger       | GET participants, composition draw, share, notifications, etc.         |
| Condition     | `status=REMOVED`, `removalSource=null`, `troupeMembership` ACTIVE      |
| Related files | `SeasonParticipantMembershipSync.kt`, `V38__…sql`, `ParticipantEnums.kt` |

## Conclusion

**Confidence:** High

Le mécanisme de résurrection reste **Confirmé** en code ; **staging et prod confirment 0 ligne** à backfiller. **Pas de migration V61.** DW-118 **fermé** — voir `deferred-work.md`.

**Suite :** **DW-119**.

## Recommended Next Steps

### Fix direction

1. **Audit** (staging puis prod) — requêtes ci-dessous.
2. **Migration Flyway** `V61__backfill_season_participant_removal_source.sql` si lignes membre > 0.
3. **Optionnel :** corriger `E2eFixtureService.removeSeasonParticipantIfActive` pour poser `SEASON_ADMIN` si le scénario simule un retrait admin (hors scope DW-118 strict).

### Diagnostic — requêtes audit

```sql
-- A. Toutes les lignes REMOVED sans source (vue globale)
SELECT COUNT(*) AS total_removed_null_source
FROM season_participants
WHERE status = 'REMOVED'
  AND removal_source IS NULL;

-- B. Sous-ensemble membre (scope DW-118)
SELECT COUNT(*) AS member_removed_null_source
FROM season_participants sp
WHERE sp.status = 'REMOVED'
  AND sp.removal_source IS NULL
  AND sp.troupe_membership_id IS NOT NULL;

-- C. Sous-ensemble à risque immédiat (réactivation au prochain sync)
SELECT sp.id, sp.season_id, sp.troupe_membership_id, tm.status AS membership_status,
       sp.removed_at, sp.display_name
FROM season_participants sp
JOIN troupe_memberships tm ON tm.id = sp.troupe_membership_id
WHERE sp.status = 'REMOVED'
  AND sp.removal_source IS NULL
  AND tm.status = 'ACTIVE'
ORDER BY sp.removed_at NULLS LAST;

-- D. Détail staging (non-EXTERNE)
SELECT sp.id, sp.season_id, tm.baseline_role, tm.status
FROM season_participants sp
JOIN troupe_memberships tm ON tm.id = sp.troupe_membership_id
WHERE sp.status = 'REMOVED'
  AND sp.removal_source IS NULL
  AND tm.baseline_role != 'EXTERNE';
```

### Migration proposée (si B > 0)

```sql
-- V61__backfill_season_participant_removal_source.sql
UPDATE season_participants sp
SET removal_source = 'MEMBERSHIP_INACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE sp.status = 'REMOVED'
  AND sp.removal_source IS NULL
  AND sp.troupe_membership_id IS NOT NULL;
```

Idempotent : ne touche pas les lignes déjà backfillées ni les retraits post-3.19 (`SEASON_ADMIN`).

## Reproduction Plan

1. Insérer ou identifier une ligne test : `REMOVED`, `removal_source NULL`, `troupe_membership_id` non null, adhésion `ACTIVE`.
2. Appeler un endpoint déclenchant `ensureMembershipParticipants` (ex. liste participants saison).
3. **Attendu avant fix :** ligne repasse `ACTIVE`.
4. **Attendu après backfill `MEMBERSHIP_INACTIVE` :** même comportement si adhésion ACTIVE (réactivation voulue pour cascade troupe).
5. **Attendu garde 3.19 :** `remove()` → `SEASON_ADMIN` → sync ne réactive pas (test existant `SeasonParticipantServiceTest` L144).

## Side Findings

- **Confirmé :** `E2eFixtureService.removeSeasonParticipantIfActive:254-256` ne set pas `removalSource` — impact limité aux EXTERNE (sync skip).
- **Confirmé :** seed `R__bootstrap_improbots_dev_operator_memberships.sql:89-104` remet explicitement des REMOVED dev en ACTIVE (opérateur demo).

## Follow-up: 2026-06-07

Investigation initiale — code trace + stratégie backfill. En attente résultats audit SQL runtime.

### New Evidence

- **Staging audit (Patrice) :** requête B → **count = 0** ; requête C → **no result**.
- **Prod audit (Patrice) :** requête B → **count = 0** ; requête C → **no result**.

### Updated Conclusion

Migration backfill **non requise**. DW-118 **fermé** dans `deferred-work.md` et `deferred-triage-2026-06.md`.
