# Story 3.20 : Statistiques — cellules événement participation (couleur + emoji)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created (2026-05-31, Sally UX + create-story). -->

## Story

En tant que **membre ou organisateur** consultant la grille **Statistiques** d'une ligue,  
je veux que les **cellules détail par spectacle** (colonnes mois dépliées) affichent le **même langage visuel de participation** que V1 et le reste de V2 (fond en dégradé sémantique + emoji de rôle),  
afin de **scanner instantanément** qui a joué, décliné, était dispo ou pas dispo — sans relire du texte neutre sur fond blanc.

## Acceptance Criteria

### API — cellules structurées (AC 1–4)

1. **Given** `GET /v1/seasons/{seasonId}/statistics`, **when** une ligne participant inclut des cellules événement, **then** chaque cellule expose un objet structuré (pas seulement une chaîne) avec au minimum : `status` ∈ `selected` | `pending` | `declined` | `available` | `unavailable` | `neutral`, `label` (FR), `roleKey` (nullable), `tooltip` (FR, optionnel). [Source: ux-design-participation-semantic-colors.md § API contract ; FR53–54]
2. **Given** un participant **sélectionné** sur une composition **validée**, **when** `participationStatus === CONFIRMED`, **then** `status = selected`, `label` = libellé rôle singulier (ex. *Comédien·ne*), `roleKey` renseigné, emoji dérivable côté UI. [Source: Story 3.6 AC11 ; legacy `SelectionCell.vue`]
3. **Given** un participant **sélectionné** avec `participationStatus === PENDING`, **when** la cellule est construite, **then** `status = pending`, `tooltip` inclut *en attente de confirmation* (ou équivalent V1), emoji ⏳ **ou** emoji rôle selon spec UX (voir Dev Notes). [Source: ux-design-participation-semantic-colors.md § Pending vs declined]
4. **Given** les autres cas déjà couverts par `eventCellExportValue` (Story 3.6), **when** la cellule est sérialisée, **then** le mapping reste :
   - `declined` + abbrevs dans `label` si désistement ;
   - `available` + `Dispo (J, …)` si dispo sans sélection ;
   - `unavailable` + *Non dispo* / *Pas dispo* ;
   - `neutral` + tiret *—* / *Non renseigné*.
   **Priorité identique** à l'export CSV actuel (décliné > sélection > dispo > indispo > neutre). [Source: `SeasonStatisticsService.eventCellExportValue` ; Story 3.6 AC11]

### Rétrocompatibilité export (AC 5)

5. **Given** le champ legacy `eventCells: Record<uuid, string>`, **when** l'API répond, **then** il **reste présent** avec la **même valeur texte** qu'aujourd'hui (export CSV client inchangé). Les nouvelles métadonnées vivent dans un champ parallèle `eventCellDetails` (nom exact à figer en OpenAPI). [Source: Story 3.6 AC9–12 ; `season-statistics-export.ts`]

### UI — composant cellule (AC 6–10)

6. **Given** la grille `app-season-statistics` avec mois **déplié** (colonnes par spectacle), **when** une cellule événement est rendue, **then** elle utilise un composant partagé (ex. `app-participation-event-cell`) avec :
   - fond `--hatcast-participation-{state}-gradient-strong` via `participationChartModifier()` ;
   - **ligne 1** : `label` ;
   - **ligne 2** : emoji rôle (`ROLE_EMOJIS`) ou ⏳ si `pending` sans rôle ;
   - texte blanc, bordure `color-mix(in srgb, #fff 32%, transparent)` ;
   - `matTooltip` + `aria-label` = `tooltip` ou `label` si tooltip absent. [Source: member-profile chart blocks ; FRONTEND_UI.md § Couleurs sémantiques]
7. **Given** `status = neutral` (tiret / non renseigné), **when** la cellule s'affiche, **then** fond gris `--hatcast-participation-neutral-gradient-strong`, libellé *—* ou *Non renseigné* (aligné API), **sans** emoji. [Source: V1 `status-unanswered`]
8. **Given** les colonnes **JEU / DECORUM / BÉNÉVOLE** et résumés mensuels (`app-stat-ratio-display`), **when** cette story est livrée, **then** elles **ne changent pas** (compteurs `X/Y (Z%)` uniquement — pas de dégradé participation). [Source: ux-design-participation-semantic-colors.md § Out of scope — band semantics]
9. **Given** viewport **≤ 480px**, **when** la grille est scrollée horizontalement, **then** les cellules événement conservent une **hauteur minimale lisible** (~`4rem`, parité V1 `SelectionCell`), sticky colonne participant inchangée (Story 16.2). [Source: ux-design-season-historique-statistiques.md D12]
10. **Given** l'implémentation terminée, **when** les tests tournent, **then** `./gradlew test --tests '*SeasonStatistics*'` + Vitest (`season-statistics.spec.ts`, nouveau spec composant cellule) passent ; `ng build` OK. [Source: architecture § Testing]

**Couverture produit :** FR53–54, UX-DR11, [ux-design-participation-semantic-colors.md](../planning-artifacts/ux-design-participation-semantic-colors.md) (approved 2026-05-29), [ux-design-season-historique-statistiques.md](../planning-artifacts/ux-design-season-historique-statistiques.md) § Cell content.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Cellule **display-only** : pas de bouton custom ; `matTooltip` pour le détail ; pas de `<div onclick>`. Ratio columns inchangées (`app-stat-ratio-display`). [Source: FRONTEND_UI.md]

**M3-2. Tokens & thème** — Fonds participation via **`--hatcast-participation-*-gradient-strong`** uniquement ; pas de hex participation dans les features. Texte/icônes `#fff` sur fills saturés. [Source: FRONTEND_UI.md § Règles de rendu sur `-gradient-strong`]

**M3-3. Mobile & tactile** — Cellules événement **non interactives** (pas de cible 48dp requise) ; tooltip au survol/focus long press ; grille scrollable. Participant sticky row : conserver bouton ≥ 48dp (Story 16.2). [Source: FRONTEND_UI.md]

**M3-4. Navigation membre** — **N/A** — pas de changement chrome / nav.

**M3-5. Revue** — Parcourir checklist FRONTEND_UI.md ; citer points validés / N/A dans Dev Agent Record. Mentionner retrait volontaire de la simplification V1 « past event → gris » si applicable (voir Dev Notes).

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/` — pas de changement `legacy/`.

- [x] **API — DTO + service** (AC: 1–5)
  - [x] Ajouter `StatisticsEventCellDto` dans `SeasonStatisticsDtos.kt` + schéma OpenAPI `seasons.yaml`.
  - [x] Ajouter `eventCellDetails: Map<UUID, StatisticsEventCellDto>` sur `ParticipantStatisticsRowDto` / `ParticipantStatisticsRow`.
  - [x] Refactor `SeasonStatisticsService` : extraire `buildEventCell(...)` retournant DTO ; `eventCellExportValue` dérive `label` du DTO ou vice versa (une seule source de vérité).
  - [x] Gérer `pending` : lire `slot.participationStatus` dans `findSelectionRole` / builder (aujourd'hui ignoré).
  - [x] Tests Kotlin : matrice statuts (selected, pending, declined, available, unavailable, neutral) + priorité décliné > sélection.

- [x] **Web — types + service** (AC: 1, 5)
  - [x] Étendre `ParticipantStatisticsRow` + parse JSON dans `season-statistics-api.service.ts`.
  - [x] Type TS `StatisticsEventCell` aligné OpenAPI ; réutiliser `ParticipationChartStatus` si union identique.

- [x] **Web — composant partagé** (AC: 6–7, M3-1–3)
  - [x] Créer `apps/web/src/app/shared/participation/participation-event-cell.{ts,html,scss}` (ou sous `season-home/` si préféré local — **préférer `shared/participation/`** pour réutilisation future).
  - [x] Inputs : `cell: StatisticsEventCell` ; `@Input()` standalone.
  - [x] SCSS : reprendre pattern `member-profile__chart-block` (BEM `participation-event-cell` + modifiers `--selected`, etc.).
  - [x] `roleEmoji(roleKey)` via `event-roles.ts` / `ROLE_EMOJIS`.

- [x] **Web — intégration grille** (AC: 6, 8–9)
  - [x] Remplacer `{{ eventCell(row, ev.id) }}` dans `season-statistics.html` par `<app-participation-event-cell [cell]="eventCellDetail(row, ev.id)" />`.
  - [x] Fallback si `eventCellDetails` absent (vieux cache) : cellule neutre avec texte legacy `eventCells`.
  - [x] Ajuster `season-statistics.scss` : padding cellule, `min-height: 4rem`, `border-radius` cohérent V1.

- [x] **Export CSV** (AC: 5)
  - [x] Vérifier `season-statistics-export.ts` continue d'utiliser `eventCells` string — **aucun changement** sauf fixtures types.

- [x] **Tests** (AC: 10, M3-5)
  - [x] `participation-event-cell.spec.ts` : modifiers CSS, emoji, tooltip, neutral.
  - [x] `season-statistics.spec.ts` : stub `eventCellDetails`, assert composant présent.
  - [x] `./gradlew test --tests '*SeasonStatistics*'` ; `npm run test -w @hatcast/web -- --watch=false --include "**/participation-event-cell.spec.ts" --include "**/season-statistics.spec.ts"`.

- [x] **Docs** (optionnel, minimal)
  - [x] Ajouter ligne « Statistiques event cells » dans tableau **Surfaces branchées** de `FRONTEND_UI.md` si pas déjà listé après implémentation.

---

## Dev Notes

### Contexte UX (session 2026-05-31)

Patrice a signalé une régression : les cellules détail spectacle en V2 sont du **texte noir sur fond blanc**, alors que V1 (`SelectionCell.vue` dans `CastsView.vue`) utilisait **dégradés sémantiques + emoji**. La spec [ux-design-participation-semantic-colors.md](../planning-artifacts/ux-design-participation-semantic-colors.md) est **approuvée** ; Mes Stats, Équipe, Dispos et modale participation sont déjà branchés — **pas** la grille Statistiques (event columns).

### Scope boundaries

| In scope (3.20) | Out of scope |
|-----------------|--------------|
| Cellules **événement** (mois déplié) — couleur + emoji + tooltip | Colonnes ratio JEU/DECORUM/BÉNÉVOLE |
| API `eventCellDetails` + rétrocompat `eventCells` | Historique chronology cards (badges plats déjà OK) |
| Composant `participation-event-cell` réutilisable | Reprise logique V1 « past event → griser non confirmés » (voir ci-dessous) |
| Tests API + Vitest | Changement formules sel/dispo (Story 3.6) |
| | Export CSV format (reste texte) |

### V1 past-event gray-out (decision)

`SelectionCell.vue` (`getCellStatusClass`) **grise** pas-dispo / non-renseigné sur événements passés quand l'équipe est confirmée et le membre n'est pas sélectionné confirmé. **Décision story 3.20 : ne pas répliquer** cette simplification — afficher les **couleurs sémantiques complètes** pour tous les états où des données existent (alignement spec participation 2026-05-29 + demande stakeholder). Si produit souhaite le grisage V1, traiter en follow-up explicite.

### Référence V1

| Sujet | Fichier |
|--------|---------|
| Cellule colorée + emoji | [`legacy/src/components/SelectionCell.vue`](../../legacy/src/components/SelectionCell.vue), [`AvailabilityCell.vue`](../../legacy/src/components/AvailabilityCell.vue) |
| Intégration grille stats | [`legacy/src/components/CastsView.vue`](../../legacy/src/components/CastsView.vue) L615–631 |
| Classes CSS statuts | [`legacy/src/styles/status-colors.css`](../../legacy/src/styles/status-colors.css), [`legacy/src/utils/statusUtils.js`](../../legacy/src/utils/statusUtils.js) |
| Export texte (priorité) | `SeasonStatisticsService.eventCellExportValue` (déjà porté) |

### Référence V2 — réutiliser tel quel

| Asset | Usage |
|-------|--------|
| [`participation-status.ts`](../../apps/web/src/app/core/participation/participation-status.ts) | `participationChartModifier()`, `ParticipationChartStatus` |
| [`member-profile-dialog.scss`](../../apps/web/src/app/shared/member-profile/member-profile-dialog.scss) | Pattern `.member-profile__chart-block--*` |
| [`_hatcast-semantic-colors.scss`](../../apps/web/src/styles/_hatcast-semantic-colors.scss) | Tokens `-gradient-strong` |
| [`event-roles.ts`](../../apps/web/src/app/shared/event-roles/event-roles.ts) | `roleEmoji()` |
| [`season-statistics.html`](../../apps/web/src/app/pages/season-home/season-statistics.html) L187–188 | Point d'intégration |

### Proposition DTO (OpenAPI)

```yaml
StatisticsEventCell:
  type: object
  required: [status, label]
  properties:
    status:
      type: string
      enum: [selected, pending, declined, available, unavailable, neutral]
    label:
      type: string
      description: French display line (role label, Non dispo, Dispo (J), etc.)
    roleKey:
      type: string
      nullable: true
    tooltip:
      type: string
      nullable: true
      description: e.g. "Sélectionné — en attente de confirmation"
```

Mapper Kotlin : enum interne ou réutiliser les strings alignées `MemberProfileChartBlockDto`.

### Pending emoji

Spec UX : pending = orange→jaune, emoji horloge. **Règle implémentation :** si `status === pending`, afficher **⏳** en ligne 2 (comme V1 `SelectionCell` L50) ; si `selected`/`declined` avec `roleKey`, afficher emoji rôle.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `matTooltip` only on event cells |
| Tokens | `--hatcast-participation-*-gradient-strong` |
| Réutilisation | Extraire styles communs chart-block ↔ event-cell si duplication > 15 lignes (optionnel) |
| Anti-pattern | Ne pas parser `eventCells` string pour deviner la couleur |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **3.6** | done | Grille stats, export texte, `eventCells` |
| **16.2** | done | Sticky participant + avatar |
| **17.10** | done | Filtre groupes spectacles |
| Participation semantic colors (spec) | approved | Tokens + sémantique couleurs |

### Tests ciblés

```bash
./gradlew test --tests '*SeasonStatistics*'
npm run test -w @hatcast/web -- --watch=false \
  --include "**/participation-event-cell.spec.ts" \
  --include "**/season-statistics.spec.ts"
```

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- API : `StatisticsEventCellDto` + `eventCellDetails` sur chaque ligne ; `buildEventCell()` source unique ; `eventCells` legacy inchangé (export CSV).
- Pending : `findSelectionSlot()` lit `participationStatus` → `status=pending` + tooltip « En attente de confirmation ».
- UI : composant `app-participation-event-cell` (dégradés `-gradient-strong`, emoji rôle / ⏳, `matTooltip`, fallback neutre si cache sans `eventCellDetails`).
- **M3-1** : display-only + `matTooltip` — validé.
- **M3-2** : tokens `--hatcast-participation-*-gradient-strong` — validé.
- **M3-3** : cellules non interactives, min-height 4rem — validé.
- **M3-4** : N/A.
- **M3-5** : pas de reprise grisage V1 « past event » (décision story).
- Tests : `./gradlew test --tests '*SeasonStatistics*'` OK ; Vitest 11/11 ; `ng build` OK.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonStatisticsDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`
- `services/api/openapi/seasons.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsEventCellTest.kt`
- `apps/web/src/app/core/seasons/season-statistics-api.service.ts`
- `apps/web/src/app/shared/participation/participation-event-cell.ts`
- `apps/web/src/app/shared/participation/participation-event-cell.html`
- `apps/web/src/app/shared/participation/participation-event-cell.scss`
- `apps/web/src/app/shared/participation/participation-event-cell.spec.ts`
- `apps/web/src/app/pages/season-home/season-statistics.ts`
- `apps/web/src/app/pages/season-home/season-statistics.html`
- `apps/web/src/app/pages/season-home/season-statistics.scss`
- `apps/web/src/app/pages/season-home/season-statistics.spec.ts`
- `docs/v2/technical/FRONTEND_UI.md`

### Change Log

- 2026-05-31 : Story créée (UX gap Statistiques event cells — couleur + emoji, spec participation semantic colors).
- 2026-05-31 : Implémentation API `eventCellDetails` + composant `participation-event-cell` + intégration grille Statistiques.

- 2026-06-01 : Code review — tests `declined`/`available`, alignement type TS `eventCellDetails` required.

### Review Findings

- [x] [Review][Patch] Tests Vitest incomplets pour `declined` et `available` [participation-event-cell.spec.ts]
- [x] [Review][Patch] Contrat OpenAPI `eventCellDetails` required vs type TS optionnel [season-statistics-api.service.ts:37]
- [x] [Review][Defer] Bras `SlotParticipationStatus.DECLINED` dans `buildEventCell` inaccessible via `findSelectionSlot` [SeasonStatisticsService.kt:397] — deferred, exhaustivité Kotlin + garde-fou futur
- [x] [Review][Defer] `resolveParticipationChartStatus` remappe `available + roleKey → selected` [participation-event-cell.ts:27] — deferred, `buildEventCell` ne renseigne jamais `roleKey` sur `available`
- [x] [Review][Defer] Fallback cache legacy (`eventCellDetails` absent) affiche toujours neutre gris [season-statistics.ts:131] — deferred, comportement explicitement spécifié dans la story

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / UX specs)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
