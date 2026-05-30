# Migration recette — La Malice cycle 1 (findings)

**Purpose:** Handoff from **migration validation** to replay cycles and staging recette.  
**Do not fix migration pipeline items here** while finishing recette / replay cycles — schedule via ISSUES.md + PLAN.md + story.

**Last updated:** 2026-05-30 (post `[CR]` code review on `6b080ce1`…`fab2eda7`)

---

## Context

| Field | Value |
|-------|--------|
| Date (cycle 1) | 2026-05-29 |
| Troupe | La Malice |
| V1 season id | `o0kD2IJekMdGdiJeIg4O` |
| V2 season id (cycle 1) | `8792242a-7467-4f70-bf34-a7a5be277b86` |
| V2 troupe id | `16e088ae-f55a-498d-845f-a31acd8e29e1` |
| Run id | `2026-05-29T10-46-23-517Z` |
| Artifact dir | `export/malice-runs/2026-05-29T10-46-23-517Z/artifacts/2026-05-29T10-46-34-212Z` |
| Staging API | `https://hatcast-v2-staging-730278491306.europe-west9.run.app` |
| V1 prod (référence) | `https://selections.la-malice.fr` |
| Pipeline | `./scripts/migrate-from-v1.sh` — **smoke pass**, replay-log **1/3** cycles |
| Smoke counts | 55 events, 32 participants, 1226 availability, 32 compositions, rejects mig3=2 |

**Gate prod (PLAN):** ≥ 3 cycles `smoke: pass` — `npm run migrate:v2:validate-replay -- --path=export/malice/replay-log.jsonl --min=3`

**Product fix (BUG-002):** merged in repo — `6b080ce1` (API stats + role slots), `fab2eda7` (chart `selected`/`pending` + semantic colors UI). **ISSUES.md** BUG-002 → **Fixed**. Staging parity **not yet re-checked** after deploy.

---

## Recette en cours (migration validation)

- [x] Cycle 1 pipeline automatisé OK
- [ ] Comparaison manuelle V1 prod vs V2 staging (événements, dispos, compositions)
- [x] Correctif produit FINDING-001 / BUG-002 — **dans le repo** (tests `SeasonGlanceStatsProviderTest` OK)
- [ ] **Re-vérification « Mes stats » sur staging** après deploy API+web (cible : 3 désistements, 10 sélections, 19 dispos — Patrice)
- [ ] FINDING-003 : confirmer fermé ou résiduel après re-test staging
- [ ] FINDING-002 : spot-check Match Cambo (DJ slot)
- [ ] Décision : accepter cycle 1 pour replay (avec `notes` si écarts connus) ou bloquer
- [ ] Cycles 2–3 + gate `validate-replay --min=3`

**Règle:** finir les cycles replay migration dans une fenêtre dédiée ; éviter de mélanger d’autres correctifs produit non liés.

---

## Findings

### FINDING-001 — Stats membre : désistements non comptés (V2 ≠ V1) — **CORRIGÉ (repo)**

| | |
|---|---|
| **Type** | V2 product / stats API — not a migration data loss |
| **ISSUES** | [BUG-002](../../ISSUES.md) — **Fixed** |
| **Severity** | Medium (recette UX / confiance post-migration) |
| **Observer** | Patrice (`patrice.lamarque@gmail.com`) |
| **Code review** | 2026-05-30 — approuvé technique ; parité chiffrée staging **pending** |

**Observed at recette (2026-05-29, staging avant fix):**

| Métrique | V1 | V2 (staging ancien) |
|----------|----|------------------------|
| Disponibilités | 19 (56%) | 19 (56%) ✓ |
| Sélections | 10 (68%) | 8 (42%) |
| Désistements | 3 (23%) | 0 (0%) |

**Root cause (unchanged):** decline-only MIG-3 rows in `event_composition_declines` without slot; V2 ignored them in `hasInitialSelection` / chart.

**Fix shipped:**

| Area | Change |
|------|--------|
| API | `hasDeclineOnlyInitialSelection`, `hasSlottedInitialSelection`, `chartBlockForEvent` decline-only → `declined`, `isCompositionLockedForStats` for understaffed confirmed casts |
| Tests | `SeasonGlanceStatsProviderTest` (decline-only, chart, effective availability, pending/selected) |
| UI | `fab2eda7` — API emits `selected`/`pending`; tokens `_hatcast-semantic-colors.scss` + `participation-status.ts` |
| Commits | `6b080ce1`, `fab2eda7` |

**Recette impact:** Does **not** block automated smoke or SQL load. **Re-test staging** before closing FINDING-003; optional `notes` on replay-log line if cycle 1 accepted before deploy.

---

### FINDING-002 — Rejets MIG-3 attendus (2) — **OPEN (recette)**

| | |
|---|---|
| **Type** | **Known / accepted** (thresholds in `migrate.config.json`) |
| **File** | `rejects-ac.json` in artifact dir |

1. `EVENT_UNRESOLVED` — availability on V1 event not in manifest (`OBJTAH7HqF0rBjENUpvR`) → −1 availability vs V1 raw (1227 → 1226).
2. `PLAYER_UNRESOLVED` — Match Cambo DJ slot, player `a4yfpMeKx0FbGsbW1yX9` not in manifest.

**Recette:** Spot-check **Match Cambo** (`match-cambo`) — DJ slot empty in V2 if expected.

---

### FINDING-003 — Écart sélections 10 → 8 — **À RE-VALIDER (staging)**

| | |
|---|---|
| **Type** | Investigate — likely same root as FINDING-001 + understaffed `validated_at` |
| **Status** | Open until post-deploy « Mes stats » check |

Likely addressed by `6b080ce1` (decline-only + `isCompositionLockedForStats`). Confirm on 2–3 events where V1 showed selection and V2 did not, **after** staging deploy.

---

## Tooling notes (fixed this sprint, for replay cycles)

| Issue | Fix | Commit |
|-------|-----|--------|
| `channelBinding` / `channel_binding` in Neon URL breaks `psql` | `normalizePostgresUrl` strips both | `9d29c64` |
| Migration API 401 after Neon reset | Sync `HATCAST_MIGRATION_API_KEY` GitHub ↔ `.env.local` + redeploy | ops |
| Post-reset redeploy | `migrate-from-v1.sh` → `gh workflow run` Deploy V2 | `5cbe90b` |

---

## Next steps by context window

### Migration validation (current)

1. Deploy staging (API + web) with `6b080ce1` / `fab2eda7`.
2. Re-check « Mes stats » Patrice vs V1 prod (table FINDING-001).
3. Finish manual recette (events, dispos, compositions) + FINDING-002 spot-check.
4. Close or update FINDING-003 from staging numbers.
5. If acceptable → accept cycle 1 (optional `notes` on `export/malice/replay-log.jsonl`).
6. Cycles 2–3: `./scripts/migrate-from-v1.sh` (Neon reset each time).
7. Gate: `npm run migrate:v2:validate-replay -- --min=3`.

### Product fix (BUG-002) — **DONE in repo**

| Step | Statut |
|------|--------|
| Implement + tests | `6b080ce1`, `fab2eda7` |
| Code review | 2026-05-30 — OK avec recette staging requise |
| Story BMad | Skipped (fix direct) |

---

## Copy-paste prompt for new chat (staging recette)

```
Contexte: recette migration La Malice cycle 1 — post-fix BUG-002.
Lire: _bmad-output/implementation-artifacts/migration-recette-malicie-cycle-1-findings.md

Staging déployé avec 6b080ce1 + fab2eda7. Re-comparer V1 prod vs V2 staging
(Mes stats Patrice: dispos / sélections / désistements + chart mensuel).
Puis cycles migrate 2–3 si OK.

Ne pas modifier MIG-3 sauf écart données prouvé.
```
