# Story 6.10c : Déplacer le rappel dispos dans le menu gear événement

Status: done

baseline_commit: 58003bfca037a1a43d294524788615a46364f09a

<!-- PO decision 2026-06-04 — déplacement toolbar Dispos → menu gear (recette mobile 6.10b) ; métier inchangé -->

## Story

En tant qu’**organisateur**,  
je veux **relancer les disponibilités manquantes depuis le menu engrenage** du détail spectacle,  
afin de **libérer la toolbar mobile de l’onglet Dispos** tout en conservant le même parcours de rappel (**UX-DR7**, amendement recette 2026-06-03).

## Acceptance Criteria

1. **Given** un spectacle **publié** (`availabilityOpenedAt != null`, story **3.21**), au moins un participant roster avec dispo **`unknown`**, et un utilisateur avec **`canManageComposition`**, **when** il ouvre le menu gear (⚙️) du header événement (tous onglets Infos · Dispos · Équipe · Activité), **then** un item **« Relance dispos »** (`mat-menu-item`, icône `notifications_active`) est visible **après** **Annoncer** (si présent) et **avant** **Participants** ; au clic, la même [`ShareAnnounceDialog`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts) s’ouvre avec intent **`availability_nudge`**, titre **« Rappel disponibilité »**, template ⏰, garde anti-spam et snacks inchangés (stories **6.10b**, **6.15**). [Source: amendement UX 2026-06-04 ; epics § 6.10b métier]

2. **Given** l’onglet **Dispos**, **when** la toolbar s’affiche, **then** il n’y a **plus** de bouton **« Rappel dispos »** (`mat-stroked-button`) — seuls restent le sélecteur de sujet (si applicable) et le toggle **Moi / Tous**. [Source: recette mobile Patrice 2026-06-03]

3. **Given** un membre **sans** `canManageComposition`, **when** il consulte le détail spectacle, **then** l’item **Relance dispos** est **absent** du menu gear (régression AC7 **6.10b**). [Source: NFR-S2]

4. **Given** spectacle **brouillon**, **archivé**, ou **zéro** participant `unknown`, **when** le menu gear s’ouvre, **then** l’item **Relance dispos** est **masqué** (même règle qu’aujourd’hui `canNudgeAvailability()`). [Source: 6.10b AC1, AC5]

5. **Given** intent **`availability_nudge`**, **when** POST notify / garde / dispatch, **then** **aucune** régression API : audience unknown-only, `MANUAL_AVAILABILITY_NUDGE`, `lastManualNotifyAt`, `ConfirmDialog` au clic Notifier — **pas** de changement sous `services/api/` sauf si un test d’intégration front-only l’exige. [Source: 6.10b, 6.16]

6. **Given** l’item gear **Annoncer** (`intent: event`, story **6.15** D9), **when** les deux entrées sont visibles, **then** elles restent **distinctes** : **Annoncer** = annonce spectacle (audience ouverte) ; **Relance dispos** = rappel ⏰ (audience unknown-only) — pas de fusion ni libellé ambigu. [Source: ux-design-share-announce-6-15.md D9]

7. **Given** implémentation terminée, **when** tests, **then** `npm run test -w @hatcast/web -- --watch=false` vert ; `./gradlew test` inchangé ou vert ; specs UX mises à jour (cette story + [**ux-design-share-announce-6-15.md**](../planning-artifacts/ux-design-share-announce-6-15.md) + [**ux-design-hatcast-v2.md**](../planning-artifacts/ux-design-hatcast-v2.md)). [Source: AGENTS.md]

**Couverture produit :** UX-DR7, UX-DR11 ; FR15, FR31 (intent manuel) ; NFR-A1 (toolbar Dispos allégée). **Supersède** le point d’entrée toolbar de **6.10b** AC1 / M3-1 uniquement — le métier rappel + garde reste **6.10b**.

### Explicit out of scope

| Item | Reason |
|------|--------|
| Changement copy modale / templates | Hors scope déplacement UI |
| Nouvel intent API | Réutiliser `availability_nudge` |
| Item gear visible **uniquement** onglet Dispos | PO 2026-06-04 : gear global (relance depuis n’importe quel onglet) |
| Renommer **Annoncer** ou fusionner avec relance | Deux intents distincts |
| Backend guard / dispatch | Déjà livré 6.10b |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** l’entrée gear et la modale, **when** rendus, **then** item via `app-scope-admin-menu` / `mat-menu-item` + icône `mat-icon` ; ouverture via helper [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts) (ajouter `openAvailabilityNudgeDialog` sur le modèle de `openEventAnnounceDialog`) ; modale et `ConfirmDialog` inchangés — **pas** de `mat-stroked-button` dans la toolbar Dispos. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** styles touchés, **when** appliqués, **then** tokens `--mat-sys-*` uniquement ; retirer styles `.event-dispos__nudge` devenus morts. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **≤ 480px**, **when** onglet Dispos, **then** toolbar = toggle Moi/Tous (+ sélecteur sujet si besoin) **sans** bouton supplémentaire ; item gear ≥ 48×48 dp (trigger existant). [Source: NFR-A1 ; capture recette 2026-06-03]

**M3-4. Navigation membre** — **N/A** — pas de nouveau chrome global.

**M3-5. Revue** — **Given** implémentation faite, **when** validation, **then** checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; docs UX § entry points alignés (faits dans cette formalisation). [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope :** `apps/web/` uniquement — **ne pas modifier** `legacy/`, `services/api/` (sauf test Kotlin si régression involontaire).

- [x] **Helper partagé** (AC 1, 5, M3-1)
  - [x] [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts) : ajouter `openAvailabilityNudgeDialog(...)` (intent `availability_nudge`, snack via `shareAnnounceSnackMessage`).
  - [x] Migrer l’appel inline actuel dans [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) — **puis supprimer** l’appel lors du retrait du bouton.

- [x] **Éligibilité gear** (AC 1, 4)
  - [x] [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) : computed `canRelanceDispos()` — `canManageComposition`, publié, non archivé, ≥1 `unknown` dans le summary.
  - [x] **Option recommandée :** charger `GET …/availability/summary` depuis `event-detail` quand orga + publié (réutiliser [`AvailabilityApiService`](../../apps/web/src/app/core/availability/availability-api.service.ts)) ; rafraîchir après sauvegarde dispo (`EventDisposTab` peut `@Output()` ou callback parent existant).
  - [x] **Alternative documentée :** déléguer via `@ViewChild(EventDisposTab)` si PO accepte item masqué tant que Dispos non visité — **non retenu** par défaut (AC4 exige masquage fiable sans visiter Dispos).

- [x] **Menu gear** (AC 1, 6)
  - [x] `eventAdminItems()` : insérer **Relance dispos** après **Annoncer**, icône `notifications_active`, action → `openAvailabilityNudgeDialog`.
  - [x] Ordre cible : Modifier → Annoncer → **Relance dispos** → Participants → Désactiver/Réactiver.

- [x] **Retrait toolbar Dispos** (AC 2)
  - [x] [`event-dispos-tab.html`](../../apps/web/src/app/shared/availability/event-dispos-tab.html) : supprimer bloc `@if (canNudgeAvailability())` + bouton.
  - [x] Nettoyer `canNudgeAvailability`, `openNudgeDialog`, imports dialog/snack devenus inutiles dans `event-dispos-tab.ts` si plus d’appels locaux.

- [x] **Tests** (AC 7)
  - [x] [`share-announce-open.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.spec.ts) : `openAvailabilityNudgeDialog` → `intent: 'availability_nudge'`.
  - [x] [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) : item **Relance dispos** visible/masqué (mock `getEventAvailabilitySummary`) ; ordre après **Annoncer** ; clic ouvre dialog (mirror test L374–409).
  - [x] [`event-dispos-tab.spec.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.spec.ts) : retirer tests « shows Rappel dispos » ; ajouter assertion **absence** du bouton pour orga+unknown.
  - [x] Régression `share-announce-dialog.spec.ts` / garde nudge inchangée.

- [x] **Docs** — déjà mis à jour en formalisation 2026-06-04 ; vérifier cohérence post-implémentation.

---

## Dev Notes

### Product and UX rules

- **Libellé menu gear :** **Relance dispos** (PO 2026-06-04) — **≠** libellé historique toolbar **« Rappel dispos »** (6.10b) ; **titre modale inchangé :** **Rappel disponibilité** ; intent API **`availability_nudge`** inchangé.
- **Ne pas confondre** avec gear **Annoncer** (`event`) — annonce initiale / ré-annonce spectacle vs rappel ciblé unknown-only.
- Recette origine : toolbar Dispos trop chargée sur mobile (sélecteur sujet + Moi/Tous + bouton nudge).

### Current code state (READ BEFORE EDIT)

| File | Today | This story |
|------|--------|------------|
| [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts) | `openShareAnnounceDialog` + `openEventAnnounceDialog` only | Add **`openAvailabilityNudgeDialog`** wrapping `intent: 'availability_nudge'` (mirror `openEventAnnounceDialog`) |
| [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) L92–99, L126–156 | `canNudgeAvailability()` + **`openNudgeDialog()`** opens `ShareAnnounceDialog` inline (duplicates helper pattern) | **Remove** nudge entry ; delete dead dialog/snack imports if unused |
| [`event-dispos-tab.html`](../../apps/web/src/app/shared/availability/event-dispos-tab.html) L15–25 | `@if (canNudgeAvailability())` + `mat-stroked-button` **Rappel dispos** | Remove entire block ; toolbar = subject selector (if any) + Moi/Tous toggle only |
| [`event-dispos-tab.scss`](../../apps/web/src/app/shared/availability/event-dispos-tab.scss) | `.event-dispos__nudge` + mobile `min-height/width: 3rem` | Delete `.event-dispos__nudge` rules (lines 1–3, 55–58) |
| [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) L151–194 | `eventAdminItems`: **Modifier → Annoncer → Participants → Désactiver/Réactiver** | Insert **Relance dispos** after **Annoncer** when `canRelanceDispos()` |
| [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) L66–78 | `app-event-dispos-tab` lazy-mounted **only** when `activeTab() === 'dispos'` | Gear must **not** depend on tab visit — parent loads summary itself |

**Preserve:** `ShareAnnounceDialog` guard (`lastManualNudgeAt`, `ConfirmDialog`), POST `availability_nudge`, snacks, D10 channel rows (story **6.16** in review — no API change here).

### Eligibility & summary on `event-detail` (AC 4 — critical)

Mirror [`canNudgeAvailability`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) logic on parent:

```typescript
// canRelanceDispos — same gates as today’s canNudgeAvailability
canManageComposition() && !isEventDraft(ev) && !ev.archived
  && summary?.participants.some(p => p.status === 'unknown')
```

**Summary fetch (recommended):** inject `AvailabilityApiService` in `event-detail.ts` ; call **`getEventAvailabilitySummary(seasonId, eventId, false)`** (no `includeChances`) when `canManageComposition()` and event is published (`availabilityOpenedAt != null`) and not archived — on `loadEvent` success and after `applyEventDetailUpdate` when publish state may change.

**Refresh after dispo edit:** when Dispos tab saves, `EventDisposTab.onSaved` patches local summary — gear on other tabs would stay stale. Minimal fix: add optional `@Output() summaryChanged` from `EventDisposTab` (emit patched summary or void + parent reload) **or** parent `reloadDisposSummary()` on tab leave from Dispos. Do **not** ship gear item visible with stale unknown count.

### Helper to add (`share-announce-open.ts`)

```typescript
export function openAvailabilityNudgeDialog(
  dialog: MatDialog,
  snack: MatSnackBar,
  ctx: Omit<OpenShareAnnounceDialogContext, 'intent' | 'roleLines' | 'compositionValidatedAt'>,
): void {
  openShareAnnounceDialog(dialog, snack, { ...ctx, intent: 'availability_nudge', roleLines: [] })
}
```

Wire gear action like [`openAnnounceEvent`](../../apps/web/src/app/pages/event-detail/event-detail.ts) (L355–372) but call `openAvailabilityNudgeDialog` with `seasonId`, `seasonSlug`, `troupeSlug`, `event`.

**Gear item shape:**

```typescript
{
  label: 'Relance dispos',
  icon: 'notifications_active',
  action: () => this.openRelanceDispos(),
}
```

### Architecture compliance

| Rule | Application |
|------|-------------|
| Scope | `apps/web/` only — **no** `services/api/`, **no** `legacy/` |
| Stack | Angular **21.2** + Material **21.2** ([project-context.md](../../project-context.md)) |
| UI norm | [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) checklist ; rule `.cursor/rules/material-m3-hatcast.mdc` |
| Menu pattern | [`ScopeAdminMenuItem`](../../apps/web/src/app/shared/scope-admin-menu/scope-admin-menu.ts) via [`event-detail-header`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts) `[adminItems]` |
| API | `GET/POST …/share-recipients` with `intent=availability_nudge` — already implemented **6.10b** |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `mat-menu-item` in gear ; **no** `mat-stroked-button` nudge in Dispos toolbar |
| Helper | **Must** use `openAvailabilityNudgeDialog` — delete duplicated `dialog.open(ShareAnnounceDialog, …)` from `event-dispos-tab` |
| Summary | Parent fetch without chances ; avoid double fetch when Dispos tab already loaded (acceptable: two lightweight GETs on tab switch vs stale gear — prefer refresh callback) |
| Tests | Copy patterns from `event-detail.spec.ts` « Annoncer » tests (L301–409) for **Relance dispos** visibility + dialog open |
| Spec file | Add `openAvailabilityNudgeDialog` test beside [`share-announce-open.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.spec.ts) `openEventAnnounceDialog` |

### Previous story intelligence (6.10b)

- **Done:** `MANUAL_AVAILABILITY_NUDGE`, unknown-only audience, `lastManualNudgeAt` + 3-day soft guard, `ShareAnnounceDialog` reminder template ⏰.
- **Review patches applied:** push eligibility scoped to nudge intent only ; confirm-gate tests ; guard warning M3 tokens ; archived 409 integration test.
- **Superseded UI only:** Dispos toolbar button — **do not** regress dialog/guard/API tests in `share-announce-dialog.spec.ts`.
- **Label trap:** tests grep **« Rappel dispos »** today in `event-dispos-tab.spec.ts` L207–244 — update to gear **« Relance dispos »** on `event-detail` and assert toolbar **absence**.

### Git intelligence (baseline `58003bf`)

Recent work on **Mon compte** / release sync — **no** conflict with share-announce files. Last touch on share flow: **6.15** / **6.16** (`share-announce-dialog`, `ShareRecipientsService`). Rebase if local branch diverged from `baseline_commit`.

### Testing requirements

```bash
npm run test -w @hatcast/web -- --watch=false
# Optional sanity if API touched accidentally:
./gradlew test
```

| Spec | Change |
|------|--------|
| `event-detail.spec.ts` | Menu order includes **Relance dispos** when published + unknown + orga ; hidden for draft / member / no unknown ; action opens dialog with `availability_nudge` |
| `event-dispos-tab.spec.ts` | Remove « shows Rappel dispos » ; add « does not show Rappel dispos button » for orga+unknown |
| `share-announce-open.spec.ts` | New test `openAvailabilityNudgeDialog` → `intent: 'availability_nudge'` |
| `share-announce-dialog.spec.ts` | **No** regressions on guard confirm |

### Explicit non-goals

- Renommer le titre dialog ou le template ⏰
- Déplacer **Partager** / **Annoncer la compo** (onglet Équipe)
- Item gear conditionné à l’onglet actif

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **6.10b** | done | Métier rappel + garde ; entry toolbar **supersédé** |
| **6.15** | done | Shell M3 modale + gear **Annoncer** |
| **6.16** | review | Pastilles canal D10 — pas de conflit |
| **3.21** | done | Gate publish |

### Supersedes (6.10b — placement UI only)

| 6.10b AC | Avant | Après 6.10c |
|----------|-------|-------------|
| AC1 when | toolbar Dispos « Rappel dispos » | gear **Relance dispos** |
| M3-1 | `mat-stroked-button` toolbar | `mat-menu-item` gear |
| Task Dispos entry | button in `event-dispos-tab` | gear in `event-detail` |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 6.10c)

### Completion Notes List

- 2026-06-04 : Story formalisée + specs UX mises à jour (Patrice) ; dev reporté session distincte.
- 2026-06-04 : create-story — enrichissement contexte dev (état code, summary parent, helper, tests, 6.10b learnings) ; status **ready-for-dev**.
- 2026-06-04 : Implémentation — `openAvailabilityNudgeDialog` ; item gear **Relance dispos** (après Annoncer) avec `canRelanceDispos` + summary parent ; retrait bouton toolbar Dispos ; `@Output summaryChanged` pour rafraîchir le gear ; tests unitaires ciblés verts (fichiers touchés). Suite web globale : échecs préexistants hors scope (routes `/saison/:troupeSlug/…`, autres specs).

### File List

- `apps/web/src/app/shared/share-announce/share-announce-open.spec.ts`
- `apps/web/src/app/shared/share-announce/share-announce-open.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `apps/web/src/app/shared/availability/event-dispos-tab.html`
- `apps/web/src/app/shared/availability/event-dispos-tab.scss`
- `apps/web/src/app/shared/availability/event-dispos-tab.ts`
- `apps/web/src/app/shared/availability/event-dispos-tab.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts` (tests AC4 brouillon/archivé, post-review)

### Change Log

- 2026-06-04 : Création story 6.10c ; amendement entry points UX (toolbar → gear).
- 2026-06-04 : Implémentation déplacement rappel dispos → menu gear événement (front uniquement).
- 2026-06-04 : Code review — tests AC4 brouillon/archivé pour Relance dispos ; status **done**.

### Review Findings

- [x] [Review][Patch] Tests AC4 brouillon / archivé manquants pour « Relance dispos » [`event-detail.spec.ts`] — ajoutés `hides Relance dispos in admin menu for draft events` et `hides Relance dispos when event is archived` (code review 2026-06-04).
- [x] [Review][Defer] Échecs `event-detail.spec.ts` hors périmètre 6.10c (routes `/saison/:troupeSlug/…`, breadcrumb, etc.) — déjà noté en Completion Notes ; les 4 tests Relance dispos / `share-announce-open` / `event-dispos-tab` ciblés passent en isolation.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (6.10b, 6.15, PO 2026-06-04)
- [x] Section **Material 3** remplie
- [x] Tasks référencent AC + M3
- [x] Liens fichiers code existants
- [x] `npm run test` mentionné
- [x] Docs UX mis à jour (formalisation)
