# Story 6.24 : Copy participation — déclinaison, désistement, retrait

Status: done

baseline_commit: 5d9a72bf39cf7100e18352eba56695d26e3faf3f

## Story

En tant que **membre ou orga** utilisant HatCast V2,  
je veux **une terminologie cohérente** (déclinaison / désistement / retrait) dans les écrans, notifications et messages API,  
afin de **comprendre précisément** ce qui s’est passé sur une composition sans jargon ambigu (« déclin »).

## Acceptance Criteria

**Source normative :** [DOMAIN.md § Participation — déclinaison, désistement et retrait](../../DOMAIN.md#participation--déclinaison-désistement-et-retrait-v2-normative) (glossaire + 9 règles de copy).

1. **Given** un assigné avec slot `pending` sur compo validée, **when** il refuse via UI ou API `declined`, **then** les libellés live (bouton **Décliner**, confirm, toast) parlent de **déclinaison** — pas de « désistement » ni « déclin » comme nom. [DOMAIN règles 1–3]

2. **Given** un assigné avec slot `confirmed`, **when** il se retire via UI ou API `declined`, **then** le bouton affiche **Se désister**, confirm/toast parlent de **désistement**. [DOMAIN règles 1–3]

3. **Given** une régression lifecycle `TEAM_REGRESSED` déclenchée par `declined` sur compo validée, **when** `reasonSummary` est construit, **then** il vaut `déclinaison de {nom}` si `beforeStatus == pending`, ou `désistement de {nom}` si `beforeStatus == confirmed`. [DOMAIN règle 4 ; `CompositionParticipationService.kt`]

4. **Given** l’onglet Équipe avec des lignes `event_composition_declines`, **when** la liste et le badge sont affichés, **then** le titre est **Retraits de la compo** et le badge **N retrait(s)** (pas « ont décliné » / « Personnes ayant décliné »). [DOMAIN règle 5]

5. **Given** une cellule agenda dérivée d’un focus `declined` (ligne `declines`), **when** elle est rendue, **then** le tooltip/libellé utilise **Retrait** ou **Plus dans la compo** — pas « Décliné ». [DOMAIN règle 6]

6. **Given** les emails/push `CONFIRMATION_REQUEST` / `RECONFIRMATION_REQUEST`, **when** le corps invite à refuser l’offre, **then** le verbe **décliner** est conservé. [DOMAIN règle 7]

7. **Given** une action proxy `declined` sur le slot d’un assigné, **when** notifications et toasts sont générés, **then** la copy distingue déclinaison vs désistement selon le `beforeStatus` du slot du sujet (même règle que self-service). [DOMAIN règle 8]

8. **Given** les libellés audit affichés pour `PARTICIPATION_DECLINED` et `DECLINE_RESTORED`, **when** un utilisateur consulte le journal, **then** les libellés FR sont **Retrait de la compo** et **Réintégration après retrait** (ou équivalent DOMAIN) — pas « Participation déclinée » / « Déclin restauré ». [DOMAIN règle 9]

9. **Given** stats saison (`SeasonStatisticsService`), prefs orga (`notification-preference-orga-ui-copy`), messages API erreur restore (`CompositionDeclineRestoreService`), OpenAPI `composition.yaml`, **when** le copy agrège ou ne connaît pas la cause, **then** le terme **retrait** / **désistements** remplace « déclin » comme nom. [DOMAIN glossaire Retrait]

10. **Given** les tests unitaires, intégration et e2e touchés par cette story, **when** `./gradlew test` (API) et `npm run test` / e2e ciblés (web) s’exécutent, **then** tous passent avec les nouveaux libellés assertés.

11. **Given** `docs/v2/technical/NOTIFICATIONS_CATALOG.md`, **when** la story est livrée, **then** les exemples `reasonSummary` et proxy restent alignés DOMAIN (déjà partiellement à jour — vérifier cohérence finale).

**Couverture produit :** amendement stories **6.7**, **6.8**, **6.9**, **8.4b** (copy uniquement). **Hors scope :** migration DB `previous_participation_status`, legacy V1, renommage identifiants `declined` / tables SQL.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1.** Boutons participation : `mat-button` / actions dialog existantes ; libellés dynamiques selon `currentStatus` — pas de nouveau composant custom.

**M3-2.** Aucune nouvelle couleur hex ; tokens participation inchangés (`--hatcast-participation-declined-*` — identifiants CSS inchangés).

**M3-3.** Cibles tactiles ≥ 48 dp sur boutons Décliner / Se désister (déjà le cas).

**M3-4.** N/A — pas de changement chrome navigation.

**M3-5.** Revue copy-only ; pas de waiver M3 attendu.

---

## Tasks / Subtasks

### API — runtime & copy

- [x] **AC-3** — `CompositionParticipationService.kt` : `reasonSummary` = `déclinaison de` vs `désistement de` selon `beforeStatus` (remplacer toute forme `déclin de` / désistement systématique)
- [x] **AC-8, AC-9** — `AuditActionLabels.kt` : `PARTICIPATION_DECLINED`, `DECLINE_RESTORED`
- [x] **AC-9** — `CompositionDeclineRestoreService.kt` : `Retrait inconnu`, `Retrait sans participant`
- [x] **AC-7** — `ProxyNotificationLabels.kt` : labels statut + push — distinguer si possible via contexte builder, sinon **Retrait enregistré** générique pour titre push ; corps proxy peut garder verbe ou préciser selon `beforeStatus` si exposé au builder
- [x] **AC-9** — `SeasonStatisticsService.kt` : cellules `Désisté (abbr)` / tooltip `— Retrait` (pas `Décliné`)
- [x] **AC-9** — `openapi/composition.yaml` : descriptions FR (`désistement`, `retrait`)
- [x] **AC-9** — `R__seed_improbots_dev_demo.sql` : spectacle MVP `Désistement et compléter` (optionnel garder slug interne)
- [x] Tests API : `NotificationPayloadBuilderOrganizerOpsTest`, `NotificationPayloadBuilderProxyTest`, `NotificationEmailBodyBuilderTest`, `SeasonStatisticsEventCellTest`, `CompositionLifecycleIntegrationTest`, `CompositionNotificationTriggerMatrixIntegrationTest`, `OrganizerOpsNotificationIntegrationTest` (si assertions copy)

### Web — dialogs & équipe (flux live AC-1, AC-2, AC-7)

- [x] **AC-1, AC-2** — `composition-participation-dialog.html` : bouton `pending` → **Décliner** ; `confirmed` → **Se désister**
- [x] **AC-1, AC-2** — `composition-participation-dialog.ts` : confirm title/message selon `currentStatus` + mode proxy
- [x] **AC-1, AC-2** — `event-equipe-tab.ts` : idem confirm + toasts déclinaison / désistement
- [x] **AC-1, AC-2** — `open-agenda-participation-dialog.ts` : idem
- [x] **AC-4** — `event-equipe-tab.ts` : `declineBadgeLabel` → retrait(s)
- [x] **AC-4** — `event-equipe-tab.html` : `aria-label` + titre **Retraits de la compo**
- [x] **AC-5** — `agenda-participation-status.utils.ts` : tooltip retrait
- [x] **AC-5** — `season-participant-focus.ts` : `· désisté` → **`· Retrait`** (focus decline = cause inconnue rétro)
- [x] **AC-8** — `audit-display-labels.ts`, `audit-labels.ts`
- [x] **AC-9** — `composition-equipe-status.ts`, `composition-status-hint.ts`
- [x] **AC-9** — `notification-preference-orga-ui-copy.ts` : `(retrait, statut à confirmer…)`
- [x] **AC-9** — `member-profile-panel.ts` : statut retrait
- [x] **AC-9** — `season-statistics.utils.ts` : tooltips / préfixes `Décliné` → `Retrait` ou `Désisté` selon règle stats (agrégat → retrait)
- [x] **AC-9** — `account-delete-dialog.html` : `désistements` ou `retraits`
- [x] **AC-6** — Vérifier `NotificationEmailBodyBuilder.kt` : garder **décliner** sur CONFIRMATION_REQUEST / rappels ; pas de régression

### Tests web

- [x] `event-equipe-tab.spec.ts`, `composition-participation-dialog.spec.ts`, `agenda-participation-status.utils.spec.ts`, `participation-event-cell.spec.ts`, `season-participant-focus.spec.ts`, `season-statistics.utils.spec.ts`, `composition-equipe-status.spec.ts`, `composition-equipe-status-header.spec.ts`, `audit.spec.ts`, `notification-preferences-section.spec.ts` (si assertions)
- [x] **AC-1** — `apps/web/e2e/helpers/agenda-participation-cell.ui.ts` : scénario déclinaison depuis `pending` (titres attendus)

### Docs & preview

- [x] **AC-11** — Relire `NOTIFICATIONS_CATALOG.md`, `FRONTEND_UI.md` (déjà amorcés)
- [x] `email-previews/hatcast-email-previews.html` : exemple TEAM_REGRESSED + libellés cohérents

### Validation finale

- [x] `cd services/api && ./gradlew test`
- [x] `cd apps/web && npm run test` (ou scope fichiers modifiés)
- [x] Grep repo `apps/web` + `services/api/src/main` : plus de copy user-facing « déclin » / « Décliné » hors exceptions documentées (verbe **décliner** sur offres OK)

---

## Dev Notes

### Glossaire (rappel)

| Terme | Usage |
|-------|--------|
| **Déclinaison** | `pending` → `declined` |
| **Désistement** | `confirmed` → `declined` |
| **Retrait** | Historique, agrégats, cause inconnue, retrait orga |
| **Décliner** (verbe) | Offre / invitation à confirmer uniquement |

### Fichiers principaux (checklist grep)

**API main :**

- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionLabels.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/ProxyNotificationLabels.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`
- `services/api/openapi/composition.yaml`

**Web :**

- `apps/web/src/app/shared/composition/composition-participation-dialog.{html,ts}`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.{ts,html}`
- `apps/web/src/app/shared/composition/open-agenda-participation-dialog.ts`
- `apps/web/src/app/shared/participation/agenda-participation-status.utils.ts`
- `apps/web/src/app/pages/season-home/season-participant-focus.ts`
- `apps/web/src/app/core/audit/audit-display-labels.ts`
- `apps/web/src/app/core/audit/audit-labels.ts`
- `apps/web/src/app/core/composition/composition-equipe-status.ts`
- `apps/web/src/app/core/composition/composition-status-hint.ts`
- `apps/web/src/app/core/notifications/notification-preference-orga-ui-copy.ts`
- `apps/web/src/app/shared/member-profile/member-profile-panel.ts`
- `apps/web/src/app/pages/season-home/season-statistics.utils.ts`
- `apps/web/src/app/pages/account-placeholder/dialogs/account-delete-dialog.html`

### Helper suggéré (optionnel, évite duplication)

Centraliser en `apps/web/src/app/core/participation/participation-withdrawal-copy.ts` :

```typescript
export function participationDeclineButtonLabel(status: 'pending' | 'confirmed'): string
export function participationDeclineConfirmMessage(status, mode: 'self' | 'proxy', name?: string): string
export function participationDeclineSuccessToast(status: 'pending' | 'confirmed'): string
```

Même logique côté API : fonction privée `withdrawalReasonSummary(beforeStatus, displayName)` dans `CompositionParticipationService`.

### Proxy push / email

`NotificationPayloadBuilder` + `ProxyNotificationLabels` reçoivent aujourd’hui un `decisionLabel` sans `beforeStatus`. Options :

1. **Minimal :** statut affiché **Désisté** / **Refusé** (pending) si le builder connaît le statut avant action ; sinon libellé générique **Retrait**.
2. **Ne pas changer** le verbe « a décliné ta participation » si le builder n’a pas le contexte — acceptable DOMAIN (verbe d’action).

Préférence story : enrichir le contexte proxy si `beforeStatus` est déjà disponible dans l’event de notif ; sinon titre push **Retrait enregistré**.

### Explicit non-goals

- Renommer `declined`, `event_composition_declines`, routes `/declines/`, enum `DECLINED`
- Colonne `previous_participation_status` (DOMAIN OPEN QUESTION — story future)
- `legacy/` (V1 Firebase)
- `_bmad-output/` stories historiques (8.4b, etc.) sauf mise à jour sprint-status
- Changer sujets SMTP ou structure intents notification

### Dependencies

| Story | Relationship |
|-------|----------------|
| 6.7, 6.8, 6.9 | Comportement participation — copy only |
| 8.4b | `TEAM_REGRESSED` reasonSummary |
| 8.10 | Emails shell — corps CONFIRMATION garde décliner |
| DOMAIN.md § Participation | **Source de vérité** |

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (Cursor)

### Completion Notes List

- Alignement copy V2 DOMAIN : déclinaison (pending→declined), désistement (confirmed→declined), retrait (agrégats / historique).
- Helper central `participation-withdrawal-copy.ts` pour boutons, confirms et toasts web.
- API : `withdrawalReasonSummary(beforeStatus)` ; proxy enrichi avec `beforeParticipationStatus` sur l’event → labels Refusé / Désisté / Retrait.
- Tests copy-related : 113 tests web ciblés OK ; tests notification/stats API OK.
- Suite API complète : 5 échecs préexistants non liés (CompositionDraw/GapFill/SlotAssignment + 2 AvailabilityController) — statuts HTTP 409 vs 200, hors périmètre copy.
- Grep `src/main` : plus de copy user-facing « déclin/Décliné » ; verbe **décliner** conservé sur offres CONFIRMATION_REQUEST.

### File List

- `apps/web/src/app/core/participation/participation-withdrawal-copy.ts` (new)
- `apps/web/src/app/shared/composition/composition-participation-dialog.{html,ts}`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.{ts,html}`
- `apps/web/src/app/shared/composition/open-agenda-participation-dialog.ts`
- `apps/web/src/app/shared/participation/agenda-participation-status.utils.ts`
- `apps/web/src/app/pages/season-home/season-participant-focus.ts`
- `apps/web/src/app/core/audit/audit-display-labels.ts`
- `apps/web/src/app/core/audit/audit-labels.ts`
- `apps/web/src/app/core/composition/composition-equipe-status.ts`
- `apps/web/src/app/core/notifications/notification-preference-orga-ui-copy.ts`
- `apps/web/src/app/shared/member-profile/member-profile-panel.ts`
- `apps/web/src/app/pages/season-home/season-statistics.utils.ts`
- `apps/web/src/app/pages/account-placeholder/dialogs/account-delete-dialog.html`
- `apps/web/e2e/helpers/agenda-participation-cell.ui.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `apps/web/src/app/shared/participation/agenda-participation-status.utils.spec.ts`
- `apps/web/src/app/pages/season-home/season-participant-focus.spec.ts`
- `apps/web/src/app/shared/participation/participation-event-cell.spec.ts`
- `apps/web/src/app/core/audit/audit.spec.ts`
- `apps/web/src/app/shared/composition/composition-equipe-status-header.spec.ts`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionLabels.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/ProxyNotificationLabels.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/ProxyNotificationEvents.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/ProxyNotificationPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/ProxyWorkflowNotificationAdapter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/ProxyWorkflowNotificationEventListener.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationEmailBodyBuilder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/memberprofile/SeasonGlanceStatsProvider.kt`
- `services/api/openapi/composition.yaml`
- `services/api/src/main/resources/db/seed-postgresql/R__seed_improbots_dev_demo.sql`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderProxyTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderOrganizerOpsTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationEmailBodyBuilderTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/CompositionNotificationTriggerMatrixIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsEventCellTest.kt`
- `docs/v2/technical/NOTIFICATIONS_CATALOG.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-09 : Story créée — glossaire DOMAIN validé ; implémentation globale copy V2
- 2026-06-09 : Implémentation copy déclinaison/désistement/retrait — API, web, notifs, audit, tests, docs
- 2026-06-09 : Code review BMad — 9 patches appliqués (statTooltip, restore API, profil, tests, catalog)

### Review Findings

- [x] [Review][Patch] `statTooltip` agrège avec « désistement » au lieu de « retrait » [`season-statistics.utils.ts:42`] — AC-9 / DOMAIN § Retrait
- [x] [Review][Patch] Test `statTooltip` asserte l’ancien terme « désistement » [`season-statistics.utils.spec.ts:25`] — AC-10
- [x] [Review][Patch] Messages API restore : « Désistement inconnu/sans participant » → « Retrait … » (cause inconnue à la restauration) [`CompositionDeclineRestoreService.kt:68-85`] — AC-9
- [x] [Review][Patch] Libellé stat profil « Désistements » incohérent avec tooltips « Retrait » dans le même panneau [`member-profile-panel.html:33`] — AC-9
- [x] [Review][Patch] Résidu « déclin enregistré » dans le catalog notifications [`NOTIFICATIONS_CATALOG.md:627`] — AC-11
- [x] [Review][Patch] Aucune assertion toast déclinaison/désistement dans `event-equipe-tab.spec.ts` — AC-1, AC-2, AC-10
- [x] [Review][Patch] Test proxy `confirmed → declined` manquant dans `event-equipe-tab.spec.ts` — AC-7, AC-10
- [x] [Review][Patch] Libellés audit `PARTICIPATION_DECLINED` / `DECLINE_RESTORED` non assertés dans `audit.spec.ts` — AC-8, AC-10
- [x] [Review][Patch] `NotificationPayloadBuilderOrganizerOpsTest` ne couvre que `déclinaison de` (pas désistement) — AC-10
- [x] [Review][Defer] Dispatch proxy par égalité de `decisionLabel` (fragile si labels changent) [`ProxyNotificationLabels.kt:41-64`] — deferred, pattern préexistant
- [x] [Review][Defer] Clé enum `DECLINE_RESTORED` non renommée (hors scope story) — deferred, explicit non-goal
- [x] [Review][Defer] Paramètre optionnel `statusBeforeDecline` sans garde si appelant omet l’argument [`event-equipe-tab.ts`] — deferred, risque latent faible
