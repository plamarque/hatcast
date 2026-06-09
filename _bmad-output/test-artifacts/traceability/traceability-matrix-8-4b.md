---
stepsCompleted:
  - step-01-load-context
  - step-02-discover-tests
  - step-03-map-criteria
  - step-04-analyze-gaps
  - step-05-gate-decision
lastStep: step-05-gate-decision
lastSaved: '2026-06-09'
coverageBasis: acceptance_criteria
oracleConfidence: high
oracleResolutionMode: formal_requirements
oracleSources:
  - _bmad-output/implementation-artifacts/8-4b-notifications-orga-v2.md
  - _bmad-output/specs/spec-notifications-orga-v2/SPEC.md
externalPointerStatus: not_used
tempCoverageMatrixPath: _bmad-output/test-artifacts/traceability/8-4b-notifications-orga-v2-coverage-matrix.json
story_id: 8-4b-notifications-orga-v2
gate_status: PASS
ship_recommendation: done
regate:
  previous_gate: CONCERNS
  trigger: Lot D mini-DS 2026-06-09
---

# Traceability Report — Story 8.4b (notifications orga v2)

**Evaluator:** Murat (TEA) · **Date:** 2026-06-09 · **Requester:** Patrice  
**Mode:** Re-gate Create — post Lot D

## Gate Decision: PASS

**Ship recommendation:** `done` (no return to DS)

**Rationale:** P0 à 100 %. P1 FULL à **94 %** (15/16) après Lot D — seuil PASS ≥ 90 % atteint. Overall FULL **86 %** (19/22). Gaps defer Lot D combés (AC1/3/6/9/10/17). AC11 et AC21 reclassés FULL. Recette Mailpit CK 7/7. Suites auto vertes.

**Waiver:** AC16 / CAP-6 — recette manuelle par design ; CK Patrice 2026-06-09.

---

## Coverage Summary

| Métrique | Avant Lot D | Après Lot D |
|----------|-------------|-------------|
| Exigences tracées | 22 AC | 22 AC |
| FULL | 13 (59 %) | **19 (86 %)** |
| PARTIAL | 7 | **1** (AC4) |
| NONE (hors scope / by design) | 2 | 2 (AC19, AC20) |
| P0 FULL | 4/4 (100 %) | 4/4 (100 %) |
| P1 FULL | 9/16 (56 %) | **15/16 (94 %)** |
| Tests auto uniques | 28 cas / 11 fichiers | **35 cas / 14 fichiers** |
| Recette Mailpit | PASS (7/7) | PASS (7/7) |

---

## Traceability Matrix

| AC | CAP | Priorité | Statut | Tests automatisés | Recette Mailpit (CK) |
|----|-----|----------|--------|-------------------|----------------------|
| **1** | CAP-1 | P1 | **FULL** | `notification-preferences-section.spec.ts` — copy v2 (Nouveau spectacle, Compo proposée, Nouveau rôle orga, Équipe plus complète) | — |
| **2** | CAP-1 | P1 | **FULL** | `NotificationPayloadBuilderOrganizerOpsTest` (copy + subjects) | — |
| **3** | CAP-1 | P1 | **FULL** | `MeNotificationPreferencesIntegrationTest` — `ORG_SCOPE_GRANTED` + absence `ORG_ASSIGNEE_DECLINED` | — |
| **4** | CAP-2 | P1 | PARTIAL | `MeNotificationPreferencesIntegrationTest` + `NotificationPreferenceEligibilityAdapterTest` — defaults OFF (échantillon ORG_*) | — |
| **5** | CAP-3 | P1 | **FULL** | `OrganizerScopeGrantedNotificationServiceTest` + `OrganizerScopeGrantedNotificationIntegrationTest` | Step 7 — email transactionnel prefs OFF |
| **6** | CAP-3 | P1 | **FULL** | `OrganizerScopeGrantedNotificationServiceTest` — push ON + OFF | — |
| **7** | CAP-3 | P1 | **FULL** | Dedupe unit + idempotent integration | — |
| **8** | CAP-4 | **P0** | **FULL** | `OrganizerOpsNotificationIntegrationTest` — decline → `TEAM_REGRESSED` | Step 5 — `déclin de…` → Charlene |
| **9** | CAP-4 | P1 | **FULL** | `OrganizerOpsNotificationIntegrationTest` — 2 edges → 2 dispatches (anti-dedupe journalier) | — |
| **10** | CAP-4 | P1 | **FULL** | Integration : déclin, unlock, reset PENDING, slot clear `place à pourvoir` | — |
| **11** | CAP-4 | P1 | **FULL** | `MeNotificationPreferencesIntegrationTest` + `StoredNotificationPreferencesTest` + static review retrait `ASSIGNEE_DECLINED` | — |
| **12** | CAP-5 | **P0** | **FULL** | `OrganizerOpsRecipientMatrixIntegrationTest` + `NotificationRecipientResolverTest` | Step 1 — draft → Pierrick |
| **13** | CAP-5 | **P0** | **FULL** | Matrix + `OrganizerOpsNotificationIntegrationTest` (COMPOSITION_SHARED, TEAM_COMPLETE) | Steps 3–5 → Charlene |
| **14** | CAP-5 | P1 | **FULL** | `OrganizerSlaOpenAvailabilityJobTest` + `CompositionIncompleteReminderJobTest` dual-role dedupe | Step 6 — 1 email/user/tick |
| **15** | CAP-5 | **P0** | **FULL** | `OrganizerOpsRecipientMatrixIntegrationTest` | Steps 1–6 — matrice complète |
| **16** | CAP-6 | P1 | **FULL** *(manual)* | — | **CK Patrice** — seed Improbots + Mailpit ; **WAIVED** auto |
| **17** | CAP-7 | P1 | **FULL** | `OrganizerControllerIntegrationTest` — seed season→event + bootstrap admins | Step 2 — retrait Pierrick orga événement |
| **18** | CAP-7 | P1 | **FULL** | `OrganizerControllerIntegrationTest` — `revoking last event organizer returns 409` | — |
| **19** | CAP-7 | P2 | NONE | Déféré story 17.15 | — |
| **20** | CAP-7 | P2 | NONE | Non-goal OQ-5c (by design) | — |
| **21** | cross | P1 | **FULL** | Héritage `NotificationDispatcherTest` — isolation per-recipient (8.3/8.4) | — |
| **22** | cross | P1 | **FULL** | `NOTIFICATIONS_CATALOG.md` aligné runtime v2 | — |

---

## Test Inventory (key files)

| Fichier | Niveau | Rôle |
|---------|--------|------|
| `OrganizerOpsRecipientMatrixIntegrationTest.kt` | API | Matrice Pierrick/Charlene (CAP-5) |
| `OrganizerOpsNotificationIntegrationTest.kt` | API | Intents v2, `TEAM_REGRESSED` edges + anti-dedupe + slot clear |
| `OrganizerScopeGrantedNotificationIntegrationTest.kt` | API | Promotion hook + idempotence |
| `OrganizerScopeGrantedNotificationServiceTest.kt` | Unit | Email transactionnel, dedupe, push gate ON/OFF |
| `NotificationPayloadBuilderOrganizerOpsTest.kt` | Unit | Copy normative v2 |
| `NotificationRecipientResolverTest.kt` | Unit | Audiences par intent |
| `NotificationDispatcherTest.kt` | Unit | NFR-R2 per-recipient isolation (héritage) |
| `NotificationPreferenceEligibilityAdapterTest.kt` | API | Defaults orga opt-in blocked |
| `OrganizerSlaOpenAvailabilityJobTest.kt` | Unit | Escalade + dedupe dual rôle |
| `CompositionIncompleteReminderJobTest.kt` | Unit | Escalade + dedupe dual rôle |
| `OrganizerControllerIntegrationTest.kt` | API | Seed CAP-7 + garde dernier orga |
| `MeNotificationPreferencesIntegrationTest.kt` | API | Prefs API nouvelles clés |
| `StoredNotificationPreferencesTest.kt` | Unit | Legacy key stripping |
| `notification-preferences-section.spec.ts` | Component | Copy UI v2 complète |

**Vérification exécutée 2026-06-09 (re-gate):** `./gradlew test --tests "com.hatcast.api.notification.*"` + `OrganizerControllerIntegrationTest` ✅ · Vitest prefs **17/17** ✅

---

## Recette Mailpit — Preuve manuelle (CK Patrice)

| Step | Action | Attendu | Statut |
|------|--------|---------|--------|
| 1 | Créer draft event | `EVENT_DRAFT_CREATED` → Pierrick | ✅ |
| 2 | Pierrick retiré orga événement | Charlene seule | ✅ |
| 3 | Publier compo | `COMPOSITION_SHARED` → Charlene | ✅ |
| 4 | Équipe complète | `TEAM_COMPLETE` → Charlene | ✅ |
| 5 | Déclin validé | `TEAM_REGRESSED` `déclin de…` → Charlene | ✅ |
| 6 | Jobs SLA/incomplete | Les deux si prefs ON, 1 email/user/tick | ✅ |
| 7 | Grant orga | Email transactionnel promotion (prefs OFF) | ✅ |

Comptes : `pierrick@seed.improbots.test` / `charlene@seed.improbots.test` (mdp = slug).

---

## Gaps résiduels

### Closed (Lot D — 2026-06-09)

| ID | Gap | Résolution |
|----|-----|------------|
| AC1 | Vitest copy v2 incomplète | `notification-preferences-section.spec.ts` — Nouveau spectacle, Compo proposée, Nouveau rôle orga |
| AC3 | Pas d’assertion `ORG_SCOPE_GRANTED` / retrait `ORG_ASSIGNEE_DECLINED` | `MeNotificationPreferencesIntegrationTest` |
| AC6 | Pas de test push ON promotion | `OrganizerScopeGrantedNotificationServiceTest` |
| AC9 | Pas de test anti-dedupe journalier | `OrganizerOpsNotificationIntegrationTest` — 2 edges → 2 dispatches |
| AC10 | `place à pourvoir` non couvert | Slot clear validé + wire `CompositionSlotAssignmentService` |
| AC17 | Pas de test seed CAP-7 | `EventService.create` + `OrganizerControllerIntegrationTest` |

### Reclassé FULL (re-gate)

| ID | Ancien statut | Justification |
|----|---------------|---------------|
| AC11 | PARTIAL | API omission + legacy strip + static review — retrait complet documenté |
| AC21 | PARTIAL | `NotificationDispatcherTest` per-recipient isolation — héritage 8.3/8.4 suffisant pour orga ops v2 |

### Defer (non bloquant)

| ID | Gap | Action suggérée |
|----|-----|-----------------|
| AC4 | Grant-then-prefs E2E non explicite | Optionnel — defaults + eligibility adapter couvrent le modèle opt-in |
| AC19 | Infos tab orga visible | Déféré 17.15 |

### By design (no patch)

| ID | Note |
|----|------|
| AC20 | Pas de sync auto ni backfill — intentionnel (OQ-5c) |
| AC16 | Recette manuelle = AC ; waiver automation |

---

## Next Actions

1. **Story → `done`** — gate **PASS** ; aucun retour DS requis.
2. **Optionnel post-ship:** test E2E grant→prefs pour AC4 (profondeur, non bloquant).
3. Artefacts machine-readable à jour : `gate-decision-8-4b.json`, `e2e-trace-summary-8-4b.json`, `8-4b-notifications-orga-v2-coverage-matrix.json`.

---

## Gate Decision Summary

```
🚨 GATE: PASS (re-gate Lot D)
📊 P0: 100% MET | P1 FULL: 94% MET | Overall FULL: 86% MET
✅ Recommandation: done
📝 Waiver: AC16 manual recette (CK Patrice 7/7)
📂 Artefacts:
   - traceability-matrix-8-4b.md
   - 8-4b-notifications-orga-v2-coverage-matrix.json
   - gate-decision-8-4b.json
   - e2e-trace-summary-8-4b.json
```
