---
baseline_commit: f6eb873d
---

# Story 19.7 : Breakdown explicabilité par facteur

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant qu’**organisateur·ice ou membre**,  
je veux **comprendre pourquoi ma cote (ou celle d’un candidat) diffère du tirage pur**, via une **fiche waterfall en points de %**,  
afin d’**expliquer les écarts** sans jargon technique et de **comparer intuitivement** avec les candidats devant moi dans le pool.

## Acceptance Criteria

### API & moteur

1. **Given** le pipeline facteurs actif (**19.6** — `PastParticipationFactor`, `FACTOR_ID = past_participation`), **when** l’API expose le breakdown pour un candidat / rôle / événement, **then** la réponse inclut `ChanceBreakdownDto` : `participantId`, `roleKey`, `displayName`, `chancePercent`, `referencePercent`, `adjustments[]` (`factorId`, `label` FR produit, `deltaPoints`), `pool.peers[]` (optionnel), `factorBreakdown[]` (optionnel — moteur/tests, **non affiché** en UI MVP). [Source: epics 19.7 AC1 ; UX W1–W2 ; ADR 0019 §3]
2. **Given** la définition PO **W18 (option C)**, **when** `referencePercent` est calculé, **then** c’est la cote du candidat avec le **même pool**, le même `requiredCount`, et un pipeline où **tous les multiplicateurs facteur = 1,0** (`DrawWeightPipelines.EMPTY` ou équivalent) — tirage pondéré **pur** sans malus/bonus. **Copy serveur** pour la ligne référence : « Tirage pur entre tous les candidats : {referencePercent} % ». [Source: UX W18 ; draw-weight-engine-v1-spec § Explainability]
3. **Given** `adjustments[]`, **when** agrégés (+ tolérance arrondi ±1 pt), **then** `referencePercent + Σ deltaPoints ≈ chancePercent` ; les lignes avec `deltaPoints === 0` sont **omises** côté serveur. [Source: UX W2, W10]
4. **Given** seul `PastParticipationFactor` actif, **when** breakdown pour un candidat avec `pastSelectionCount = n`, **then** une ligne `past_participation` avec label du type « Déjà joué {n}× en {rôle} cette saison » et delta négatif cohérent avec l’écart `chancePercent − referencePercent`. [Source: epics 19.7 AC2 ; 19-6]
5. **Given** `requiredCount > 1`, **when** breakdown renvoyé, **then** inclure `requiredCount` (ou champ dérivé) pour permettre au front d’afficher le hint **W19** sous le waterfall. [Source: UX W19]
6. **Given** droits explainability **6.3 / 6.4** (`CompositionService.showExplainability`, visibilité Dispos), **when** un utilisateur **sans** droit appelle l’endpoint breakdown ou un summary enrichi, **then** **403** ou absence de champs breakdown — **aucune fuite** de `referencePercent`, `adjustments`, `pool` détaillé. [Source: epics 19.7 AC3 ; UX W8]
7. **Given** orga avec `canManageComposition` et composition **brouillon**, **when** GET breakdown / preview pool, **then** accès autorisé (explainability orga). **Given** membre ordinaire, **when** composition **non validée**, **then** pas de breakdown. **Given** membre, **when** composition **validée**, **then** breakdown autorisé (Dispos + Équipe selon visibilité slots). [Source: stories 6.3, 6.4 ; UX W8, W11]
8. **Given** golden **19.2** + tests dédiés breakdown, **when** `./gradlew test`, **then** scénarios figés sur `referencePercent`, deltas `past_participation`, et non-régression `chancePercent` existant. [Source: NFR-Q1 ; ADR 0019 §4]

### UI — composant `app-chance-breakdown-sheet`

9. **Given** tap sur un **%** uniquement (pas toute la ligne candidat — **W7**), **when** droit explainability, **then** ouverture de `app-chance-breakdown-sheet` : en-tête identité (avatar, prénom, rôle), **% final** héros, barre pool **silencieuse** (**W3**), waterfall « Échelle de ta chance », section « Devant toi dans le pool » (**W4**), lien discret vers doc **19.4** (**W6**). [Source: UX spec complète]
10. **Given** viewport ≤ **480 px**, **when** sheet ouverte, **then** conteneur **`MatBottomSheet`** ; **Given** ≥ **840 px**, **then** **`MatDialog`** panneau (~26–28 rem) — **même composant interne**. [Source: UX W9 ; FRONTEND_UI.md]
11. **Given** tap sur un **pair** dans « Devant toi », **when** liste pairs, **then** sheet se met à jour avec **breadcrumb** retour (‹ Alice · Bob ›). [Source: UX wireframe mobile]
12. **Given** `requiredCount > 1`, **when** waterfall affiché, **then** hint sous waterfall : « {n} places à pourvoir — ce % = chance d’être pris·e au moins une fois » + lien doc ; **option** icône `info_outline` + `matTooltip` (**W19**).
13. **Given** **zéro** carrousel / slides / JPG dans la fiche (**W6**). Comparateur 2 colonnes = **hors MVP** (**W5**).

### UI — onglet Équipe (P0 orga)

14. **Given** orga, brouillon, rôle avec candidats, **when** onglet Équipe, **then** bloc **aperçu pool** via `composition-draw-animation` mode **`preview`** (barre statique, segments tapables → sheet). [Source: UX W11–W13, W17]
15. **Given** mobile ≤ **480 px**, **when** aperçu pool, **then** **replié par défaut** (`mat-expansion-panel` ou chip « Voir le pool du tirage ») ; **Given** desktop ≥ **840 px**, **then** **ouvert par défaut** si au moins un rôle avec candidats ; état mémorisé **par événement** (session). [Source: UX W17]
16. **Given** animation tirage **live**, **when** tap segment barre, **then** sheet pour ce candidat avec bannière étape (ex. « Étape 2/5 — JEU »). [Source: UX W13]
17. **Given** `composition-slot-picker-dialog`, **when** orga voit la liste candidats, **then** `%` **cliquable** (`stopPropagation`) → même sheet (**W14**).
18. **Given** grille Équipe (slot assigné, explainability visible), **when** `%` affiché à droite du nom, **then** tap → sheet (**W15**, si effort raisonnable).

### UI — Dispos → Tous (P1 membre)

19. **Given** Dispos → Tous, `chancePercent != null`, droit explainability, **when** tap sur **%** (+ affordance chevron / info), **then** même sheet (**P1**, après livraison Équipe P0).

### Documentation normative

20. **Given** implémentation API, **when** docs mises à jour, **then** [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) contient § **Explainability API** (`referencePercent`, deltas, droits, tolérance arrondi) et [`draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) § « Détail par personne » (1 paragraphe + renvoi UI). [Source: UX liens normatifs]

**Couverture produit :** FR24 ; UX-DR11 ; [`ux-design-factor-breakdown-19-7.md`](../planning-artifacts/ux-design-factor-breakdown-19-7.md) (PO + Sally validés 2026-06-07).

### Amendement as-shipped (PO recette 2026-06-07)

Les AC **9–12, 14–15, 19** et copy **AC2** ci-dessus reflètent le **draft UX initial**. Le livré validé PO est décrit dans la spec UX § **Amendement as-shipped** et dans [`19-7-as-shipped-handoff-paige.md`](../planning-artifacts/19-7-as-shipped-handoff-paige.md). Synthèse :

| Thème | Livré (fait foi) |
|-------|------------------|
| Fiche breakdown | Waterfall « **D’où vient ce % ?** » ; ligne référence « **Chance de base pour les N candidats** » ; **rang pool en une ligne** (`chance-breakdown-rank-summary`) — **pas** barre pool ni liste pairs |
| Entrées | Tap **segment pool** (Dispos + aperçu Équipe) ; % sur picker / grille / animation |
| Dispos → Tous | **Pool par rôle** (`app-composition-pool-preview`), pas liste % par candidat |
| Équipe pool | **Toggle pillule rôle** — pas expansion panel W17 draft |
| Aide 19.4 | **`DrawChancesHelpDialog`** carrousel **5 slides** ; markdown stub |
| Multi-places W19 | Hint **en-tête** (places + tooltip), pas sous waterfall |
| Pool visuel | Wrap proportionnel, **4 paliers** couleur, pas rangées égales |

**Waivers PO documentés :** W3, W4, W7 (partiel), W17 (pattern), W6 (carrousel hors fiche), M3 segments pool &lt; 48 dp — follow-up technique dans Review Findings.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** la fiche breakdown livrée, **when** contrôles équivalents existent, **then** utiliser `MatBottomSheet` / `MatDialog`, `mat-list`, `mat-stroked-button`, `mat-icon`, `mat-expansion-panel`, `mat-chip-listbox`, `matTooltip`, `app-user-avatar` — pas d’overlay maison ni `<button>` custom pour les mêmes rôles. [Source: UX M3-1 ; FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** styles SCSS/HTML du sheet et triggers `%`, **when** couleurs appliquées, **then** `var(--mat-sys-*)` + sémantique chance existante (`availability-tous__chance--*`, `--hatcast-v1-chance-*`) ; deltas négatifs `error-container` / `on-error-container`, positifs `tertiary-container` ; fond sheet `surface-container-low`, en-tête `primary-container` — **pas de hex ad hoc**. [Source: UX palette ; FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** triggers `%` et contrôles sheet, **then** cibles **≥ 48×48 dp** ; `aria-label` français sur trigger : « Voir le détail de la cote : {name}, {percent} pourcent » ; sheet `role="dialog"`, waterfall en liste sémantique ; barre pool `aria-hidden="true"` + résumé texte une ligne. [Source: UX accessibilité ; NFR-A1]

**M3-4. Navigation membre** — **N/A** — pas de nouveau chrome global ; fiche = overlay contextuelle au détail événement.

**M3-5. Revue** — **Given** implémentation terminée, **when** validation story, **then** checklist § « Checklist M3 HatCast » de [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; écarts volontaires notés en Dev Notes.

**Test hooks (data-testid)** — `chance-breakdown-trigger`, `chance-breakdown-sheet`, `chance-breakdown-pool-bar`, `chance-breakdown-waterfall`, `chance-breakdown-reference`, `chance-breakdown-adjustment-{factorId}`, `chance-breakdown-final`, `chance-breakdown-peer-{participantId}`. [Source: UX test hooks]

---

## Tasks / Subtasks

Ordre d’implémentation **obligatoire** (dépendances front ← API).

### 1. API + tests (AC 1–8, 20 backend)

- [x] **Périmètre :** `services/api/` — **ne pas** réimplémenter **19.6** ; consommer `DrawWeightPipelines.DEFAULT`, `PastParticipationFactor.FACTOR_ID`.
- [x] **`ChanceBreakdownCalculator`** (ou extension `AvailabilityChanceCalculator`) — calcul `referencePercent` (pipeline EMPTY), `chancePercent` (pipeline effectif), deltas séquentiels par facteur enregistré, labels FR (`PastParticipationFactor` → « Déjà joué {n}× en {ROLE} cette saison »). (AC 2–4)
- [x] **Métadonnées facteur** — étendre le contrat facteur si besoin (`factorId`, hook label) sans casser `DrawWeightFactor` ; réutiliser `PastParticipationFactor.FACTOR_ID`.
- [x] **DTO** — `ChanceBreakdownDto`, `ChanceAdjustmentDto`, `ChanceBreakdownPoolDto` dans `composition/dto/` ou `availability/dto/` ; aligner types TS miroir dans `composition-api.service.ts`.
- [x] **Endpoint dédié** — `GET /v1/seasons/{seasonId}/events/{eventId}/composition/chance-breakdown?roleKey=&participantId=` (nom final au choix dev, documenter dans spec). Alternative acceptable : enrichir `GET .../composition/candidates` avec breakdown optionnel — **préférer endpoint dédié** pour Dispos + Équipe + animation.
- [x] **Endpoint preview pool** (orga) — `GET .../composition/pool-preview?roleKey=` renvoyant segments barre (`participantId`, `displayName`, `chancePercent`, `weight`) pour mode `preview` ; réutiliser même logique pool que breakdown.
- [x] **Garde droits** — factoriser avec `CompositionService.showExplainability` + règles Dispos (`AvailabilityService` / `includeChances`) ; tests 403 membre brouillon, OK orga brouillon, OK membre validé. (AC 6–7)
- [x] **Tests** — unitaires calculator ; intégration controller ; golden/régression : veteran vs rookie deltas, multi-places hint, somme deltas ≈ écart. (AC 8)
- [x] **Gate** — `./gradlew test --tests '*ChanceBreakdown*' --tests DrawGoldenTest --tests DrawOrchestrationGoldenTest`

### 2. Sheet waterfall (AC 9–13, M3)

- [x] **Périmètre :** `apps/web/src/app/shared/composition/chance-breakdown-sheet/`
- [x] **Service d’ouverture** — helper `openChanceBreakdownSheet(context)` : BottomSheet mobile / Dialog desktop (breakpoint **840 px**, cohérent W17/W9).
- [x] **Composant** — waterfall, barre pool silencieuse, liste pairs triée desc par `chancePercent`, breadcrumb navigation pair, hint multi-places, lien doc 19.4 (`draw-chances-explained` — route help ou URL doc).
- [x] **Aucun recalcul client** des deltas / `referencePercent` — afficher verbatim API. (AC 9, UX W2)
- [x] **Tests** — `chance-breakdown-sheet.spec.ts` : rendu waterfall, omission delta 0, breadcrumb, testids.
- [x] **Gate** — `npm run test -w @hatcast/web -- --watch=false --include='**/chance-breakdown*.spec.ts'`

### 3. Équipe P0 — preview pool + picker + animation (AC 14–18)

- [x] **`composition-draw-animation`** — input `mode: 'live' | 'preview'` ; `@Output() segmentTap` ; preview = pas de curseur / pas d’animation auto ; segments cliquables + `data-testid`. (AC 14, 16)
- [x] **`event-equipe-tab`** — bloc aperçu pool (W17 repliable mobile / ouvert desktop, état session par `eventId`) ; chip sélecteur rôle si plusieurs pools ; orchestration preview + live ; emplacement **réservé** sous toolbar pour future formule **19.21+** (bandeau vide / commentaire — **ne pas implémenter**). (AC 14–15)
- [x] **`composition-slot-picker-dialog`** — `%` trigger avec `stopPropagation` → sheet. (AC 17)
- [x] **Grille Équipe** — `%` cliquable sur slots assignés quand `chancePercent` présent. (AC 18)
- [x] **Tests** — `composition-draw-animation.spec.ts`, `event-equipe-tab.spec.ts`, `composition-slot-picker-dialog.spec.ts` (triggers, preview mode, tap segment).
- [x] **Gate** — `npm run test -w @hatcast/web -- --watch=false --include='**/event-equipe-tab.spec.ts' --include='**/composition-draw-animation.spec.ts' --include='**/composition-slot-picker-dialog.spec.ts'`

### 4. Dispos → Tous P1 (AC 19)

- [x] **`availability-tous-panel`** — remplacer span `%` statique par trigger Material (`mat-button` texte ou chip) ; tap `%` seulement (`stopPropagation` vs sélection sujet dispos). (AC 19, W7)
- [x] **Tests** — `availability-tous-panel.spec.ts` : trigger visible si `chancePercent`, ouvre sheet mock.
- [x] **Gate** — `npm run test -w @hatcast/web -- --watch=false --include='**/availability-tous-panel.spec.ts'`

### 5. Docs normatives (AC 20)

- [x] **`draw-weight-engine-v1-spec.md`** — ajouter § **Explainability API** (contrat DTO, `referencePercent` option C, algorithme deltas, droits, tolérance ±1 pt, `factorBreakdown` vs `adjustments`).
- [x] **`draw-chances-explained.md`** — § « Où voir le détail par personne » ; retirer « Prévu » pour explainability avancée dans le tableau hors scope si livré.
- [x] **Pas** de modification `CompositionSelectionHistoryService` (**19.8**).

---

## Dev Notes

### Décisions produit figées (ne pas rouvrir)

| ID | Décision |
|----|----------|
| **W1–W2** | UI = waterfall **deltas en points de %** ; vérité **serveur uniquement** |
| **W18** | `referencePercent` = tirage pur (pipeline sans facteurs, multiplicateurs = 1,0) ; copy « **Tirage pur** entre tous les candidats : {referencePercent} % » |
| **W3–W4** | Barre pool silencieuse + section « Devant toi dans le pool » ; tap pair → même sheet + breadcrumb |
| **W5** | Comparateur 2 colonnes = **phase 2 / hors MVP** |
| **W6** | Zéro slides/carrousel V1 ; lien doc **19.4** |
| **W7** | Entrée = tap sur **%** uniquement |
| **W8** | Droits **6.3 / 6.4** : orga brouillon ; membre après validation |
| **W11–W15** | **Équipe = surface orga P0** (preview, animation, picker, grille) |
| **W17** | Aperçu repliable mobile (fermé ≤480px) ; ouvert desktop ≥840px ; état mémorisé par événement/session |
| **W19** | Hint + tooltip optionnel si `requiredCount > 1` |
| **Dispos → Tous** | Entrée **P1** (membres), pas P0 |
| **19.21+** | Emplacement sous aperçu pool **réservé** ; **ne pas implémenter** what-if |

### Normative sources (read order)

1. [`ux-design-factor-breakdown-19-7.md`](../planning-artifacts/ux-design-factor-breakdown-19-7.md) — **spec UX normative** (wireframes, copy FR, M3, test hooks)
2. [`19-6-facteur-past-participation-v1.md`](19-6-facteur-past-participation-v1.md) — pipeline livré ; `FACTOR_ID = past_participation`
3. [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) — invariant `% = draw` ; facteurs Wave B+
4. [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — formule, golden ; **ajouter § Explainability**
5. [`docs/v2/product/draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) — doc membre/orga **19.4**
6. [`docs/v2/technical/FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md) — checklist M3

### Modèle API (contrat TypeScript / DTO)

```typescript
/** Explainability d'un candidat pour un rôle (et slot si multi-places). */
export interface ChanceBreakdownDto {
  participantId: string
  roleKey: string
  displayName: string
  chancePercent: number
  /** Cote avant facteurs modificatifs — tirage pur (W18). */
  referencePercent: number
  /** Lignes triées par |deltaPoints| desc ; delta 0 omis côté serveur. */
  adjustments: ChanceAdjustmentDto[]
  requiredCount?: number
  /** Barre pool + liste pairs (optionnel MVP si déjà calculé pour le rôle). */
  pool?: {
    peers: Array<{
      participantId: string
      displayName: string
      avatarUrl?: string | null
      chancePercent: number
    }>
  }
  /** Rétro-compat moteur / tests — pas affiché en UI MVP. */
  factorBreakdown?: Array<{
    factorId: string
    multiplier: number
    label: string
  }>
}

export interface ChanceAdjustmentDto {
  factorId: string
  /** Copy FR produit — ex. « Déjà joué 3× en JEU cette saison » */
  label: string
  deltaPoints: number
}
```

**Algorithme `referencePercent` (backend — documenter dans spec) :**

1. Construire le pool éligible identique au tirage affiché (mêmes exclusions cross-rôle / dispos que `scoreCandidates` pour ce contexte).
2. `weightedRef = toWeightedCandidates(..., pipeline = DrawWeightPipelines.EMPTY)` → poids = `requiredCount` pour chaque candidat.
3. `referencePercent = round(exactSelectionProbability(requiredCount, weightedRef, indexTarget) × 100)`.
4. `chancePercent` = score actuel (pipeline DEFAULT ou contexte snapshot **6.14** si rétrospectif figé).
5. Pour chaque facteur `f` dans l’ordre du pipeline : recalculer % après application cumulative ; `deltaPoints = percentAfter − percentBefore` ; omettre si 0.
6. **`pool.peers`** pour section « Devant toi » : candidats du pool avec `chancePercent` **strictement supérieur** au sujet, tri desc.

**Snapshot / rétrospectif :** si `event_draw_chance_snapshots` fournit `chancePercent` figé, `chancePercent` breakdown = snapshot ; recalculer quand même `referencePercent` + deltas **au même instant logique** (pool opening) ou documenter l’écart si snapshot seul disponible — **préférer cohérence snapshot % = chancePercent affiché**.

### Droits explainability (runtime actuel — ne pas inventer)

```301:308:services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
        val showExplainability =
            canViewSlots &&
                (composition?.validatedAt != null || resolvedCanManage)
        val explainabilityByRoleAndParticipant =
            if (showExplainability && includeSlotExplainability) {
                buildExplainabilityLookup(event, seasonId, eventId, slots)
```

- **Orga** (`canManageComposition`) : explainability en **brouillon** + validé.
- **Membre** : explainability seulement si `validatedAt != null` (**6.3**).
- **Dispos Tous** : `includeChances=true` sur summary — aligner breakdown sur les mêmes gates (voir `AvailabilityService.getSummary`).

### Architecture backend cible

```
GET chance-breakdown
       ↓
CompositionExplainabilityService (new)
       ↓
  ├─ resolve pool + pastSelectionCount (reuse CompositionSlotAssignmentService / Availability paths)
  ├─ ChanceBreakdownCalculator
  │     ├─ referencePercent (EMPTY pipeline)
  │     ├─ chancePercent (DEFAULT pipeline or snapshot)
  │     └─ adjustments[] per factor
  └─ authorization (showExplainability mirror)
```

**Fichiers API probables :**

| Fichier | Action |
|---------|--------|
| `availability/draw/DrawWeightFactor.kt` | Optionnel : interface enrichie ou registry `factorId` + label provider |
| `availability/draw/ChanceBreakdownCalculator.kt` | **NEW** |
| `availability/draw/PastParticipationFactor.kt` | Label hook ou mapper externe |
| `composition/dto/ChanceBreakdownDtos.kt` | **NEW** |
| `composition/CompositionExplainabilityService.kt` | **NEW** |
| `composition/CompositionController.kt` | Routes `chance-breakdown`, `pool-preview` |
| `composition/CompositionService.kt` | **Lire** `buildExplainabilityLookup` — réutiliser pool/history, **ne pas dupliquer SQL** |
| `availability/AvailabilityService.kt` | Optionnel : lien breakdown depuis summary (P1 Dispos) |

### Architecture frontend cible

| Fichier | Action |
|---------|--------|
| `shared/composition/chance-breakdown-sheet/*` | **NEW** — sheet + waterfall + peers |
| `shared/composition/chance-breakdown.service.ts` | **NEW** — open BottomSheet/Dialog, fetch API |
| `shared/composition/composition-draw-animation.*` | Modes `live` \| `preview` ; `@Output segmentTap` |
| `pages/event-detail/event-equipe-tab.*` | Aperçu pool W17, triggers grille, orchestration |
| `shared/composition/composition-slot-picker-dialog.*` | Trigger `%` |
| `shared/availability/availability-tous-panel.*` | Trigger `%` P1 |
| `core/composition/composition-api.service.ts` | Types + `getChanceBreakdown`, `getPoolPreview` |

**État session aperçu pool (W17) :** `sessionStorage` clé `hatcast:pool-preview:{eventId}` = `'open' | 'closed'` ; défaut selon viewport au premier rendu.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | BottomSheet/Dialog, mat-list, mat-stroked-button, mat-icon, mat-expansion-panel |
| Tokens | `--mat-sys-*` ; chance `--hatcast-v1-chance-*` / classes `availability-tous__chance--*` |
| Réutilisation | Barre pool — **un seul** rendu SCSS partagé avec `composition-draw-animation.scss` (tokens, pas copier couleurs V1 legacy) |
| Legacy V1 | **Ne pas** porter `ChanceExplanationSlides.vue` ni popup fourre-tout `EventRoleGroupingView` |

### Explicit non-goals

- **Pas** de slides `ChanceExplanationSlides` V1 (**W6**).
- **Pas** de recalcul client des deltas / `referencePercent` (**W2**).
- **Pas** de formules admin / politiques (**19.15+**).
- **Pas** de comparateur 2 colonnes MVP (**W5**).
- **Pas** de modification `CompositionSelectionHistoryService` (**19.8**).
- **Pas** de réimplémentation **19.6** / changement formule malus.
- **Pas** de persistance formule au tirage (**19.22**).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 19.6 | done | **Consomme** `PastParticipationFactor`, pipeline DEFAULT — ne pas réimplémenter |
| 19.5 | done | Shell pipeline |
| 19.2, 19.3 | done | Golden gate |
| 6.3, 6.4 | done | Droits explainability |
| 6.14 | done | Snapshots `%` — cohérence breakdown |
| 19.4 | done | Doc produit — lien depuis sheet |
| 19.8 | backlog | Partition category — **hors scope** ; ne pas toucher SQL historique |
| 19.21+ | backlog | What-if formule — emplacement UI seulement |

### Previous story intelligence (19.6)

- `DrawWeightPipelines.DEFAULT = DrawWeightPipeline.of(PastParticipationFactor)`.
- `baseWeight = requiredCount` ; malus dans le facteur : `1/(1+pastSelectionCount)`.
- `PastParticipationFactor.FACTOR_ID = "past_participation"` — **utiliser** pour `adjustments[].factorId` et testids.
- Golden **19.2** fixtures **inchangées** — breakdown tests = **nouveaux** cas, ne pas modifier JSON golden existants sans accord.
- Review 19.6 : `sanitizeMultiplier` traite NaN/inf/négatif → 0.0.

### Git intelligence (commits récents Epic 19)

| Commit | Insight |
|--------|---------|
| `f6eb873d` feat(draw): Migrate past participation malus to factor pipeline | Patterns `PastParticipationFactor`, `baseWeight`, tests `PastParticipationFactorTest` |
| `97216aee` refactor(draw): Introduce DrawWeightFactor pipeline shell | `DrawWeightPipeline`, `DrawWeightContext` |
| `34c49561` docs(draw): Add draw chances user guide | `draw-chances-explained.md` — mettre à jour § détail par personne |

### Commandes test

```bash
# API — breakdown + non-régression golden
./gradlew test --tests '*ChanceBreakdown*' \
  --tests com.hatcast.api.availability.DrawGoldenTest \
  --tests com.hatcast.api.composition.DrawOrchestrationGoldenTest \
  --tests com.hatcast.api.availability.draw.DrawWeightPipelineTest \
  --tests com.hatcast.api.availability.AvailabilityChanceCalculatorDrawTest

# Front — composants touchés
npm run test -w @hatcast/web -- --watch=false \
  --include='**/chance-breakdown*.spec.ts' \
  --include='**/composition-draw-animation.spec.ts' \
  --include='**/event-equipe-tab.spec.ts' \
  --include='**/composition-slot-picker-dialog.spec.ts' \
  --include='**/availability-tous-panel.spec.ts'

# Build front (sanity)
npm run build -w @hatcast/web
```

### Latest tech notes (Angular Material 21.2)

- `MatBottomSheet` : `@angular/material/bottom-sheet` — `BottomSheetRef`, `MAT_BOTTOM_SHEET_DATA`.
- Breakpoint dialog vs sheet : utiliser `BreakpointObserver` (`Breakpoints.Handset` / custom `(min-width: 840px)`) — pattern existant dans le repo à chercher avant d’introduire un nouveau helper.
- `MatDialog` max-width ~28rem via `panelClass` + SCSS token-friendly.

---

## Dev Agent Record

### Agent Model Used

Auto (Cursor agent)

### Completion Notes List

- API : `ChanceBreakdownCalculator`, `CompositionExplainabilityService`, endpoints `chance-breakdown` + `pool-preview` ; `LabeledDrawWeightFactor` + labels FR `past_participation`.
- GET composition inclut `chancePercent` sur slots quand explainability visible (grille Équipe AC 18).
- Front : `app-chance-breakdown-sheet` + `ChanceBreakdownService` (BottomSheet &lt; 840px / Dialog ≥ 840px).
- Équipe P0 : aperçu pool repliable (sessionStorage), animation preview/live + `segmentTap`, picker + grille triggers `%`.
- Dispos P1 : trigger `%` dans `availability-tous-panel` si `explainabilityEnabled`.
- Docs : § Explainability API (spec) + § détail par personne (produit).
- Tests : `ChanceBreakdownCalculatorTest` (5), golden 19.2/19.3 OK ; front 74 tests ciblés OK ; `npm run build -w @hatcast/web` OK.
- M3 : tokens `var(--mat-sys-*)`, testids UX, cibles ≥ 48dp sur triggers ; lien doc GitHub 19.4 (pas de route in-app dédiée).

### File List

- services/api/src/main/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculator.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightFactor.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/PastParticipationFactor.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/ChanceBreakdownDtos.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculatorTest.kt
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/shared/composition/chance-breakdown.constants.ts
- apps/web/src/app/shared/composition/chance-breakdown.service.ts
- apps/web/src/app/shared/composition/chance-breakdown-sheet/chance-breakdown-sheet.ts
- apps/web/src/app/shared/composition/chance-breakdown-sheet/chance-breakdown-sheet.html
- apps/web/src/app/shared/composition/chance-breakdown-sheet/chance-breakdown-sheet.scss
- apps/web/src/app/shared/composition/chance-breakdown-sheet/chance-breakdown-sheet.spec.ts
- apps/web/src/app/shared/composition/composition-draw-animation.ts
- apps/web/src/app/shared/composition/composition-draw-animation.html
- apps/web/src/app/shared/composition/composition-draw-animation.scss
- apps/web/src/app/shared/composition/composition-draw-animation.spec.ts
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.ts
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.html
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.scss
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/shared/availability/availability-tous-panel.ts
- apps/web/src/app/shared/availability/availability-tous-panel.html
- apps/web/src/app/shared/availability/availability-tous-panel.scss
- apps/web/src/app/shared/availability/availability-tous-panel.spec.ts
- apps/web/src/app/shared/availability/event-dispos-tab.ts
- apps/web/src/app/shared/availability/event-dispos-tab.html
- docs/v2/technical/draw-weight-engine-v1-spec.md
- docs/v2/product/draw-chances-explained.md

### Change Log

- 2026-06-07 : Story créée (`bmad-create-story` 19.7) — spec UX PO+Sally intégrée ; statut `ready-for-dev`.
- 2026-06-07 : Implémentation breakdown API + sheet waterfall + entrées Équipe/Dispos + docs ; statut `review`.
- 2026-06-07 : Code review BMAD — findings ci-dessous ; statut `in-progress`.
- 2026-06-07 : Recette PO validée ; spec UX amendée (Sally) ; statut **`as-shipped`**. Décisions W3′–W4′, W6′–W7′, W17′–W20 tranchées — voir [`ux-design-factor-breakdown-19-7.md`](../planning-artifacts/ux-design-factor-breakdown-19-7.md) § Amendement as-shipped.
- 2026-06-07 : Sync doc (Paige) — `draw-chances-explained.md` (produit + public), `draw-weight-engine-v1-spec.md` § Explainability (rang pool, surfaces UI), `FRONTEND_UI.md` waivers 19.7 ; handoff [`19-7-as-shipped-handoff-paige.md`](../planning-artifacts/19-7-as-shipped-handoff-paige.md) complété.
- 2026-06-07 : **Re-review BMAD** — 22 patches appliqués ; décision B label rookie ; statut `done`.

---

### Review Findings

> **Re-review 2026-06-07** — Baseline : changements non commités sur `v2` (43 fichiers, ~+1883/−454 lignes). Spec d’audit : amendement as-shipped (UX + story § Amendement as-shipped). Verdict UX livré : **conforme W3′–W20**. Gaps techniques / AC API 1–8 : voir patches ouverts.

#### Decision needed

- [x] [Review][Decision] **Section pool fiche : ranking vs spec W3/W4** — **Résolu PO (W3′–W4′)** : rang texte `poolRankSummary` ; pas de barre ni liste pairs dans la fiche.

- [x] [Review][Decision] **Label rookie `past_participation`** — **Résolu PO (B)** : conserver « Jamais {rôle} » / « Déjà {rôle} {n} fois » ; AC4 draft supersédé par copy produit livrée + test `rookie with no past gets Jamais label`.

#### Patch — résolus (review précédente ou livré as-shipped)

- [x] [Review][Patch] **W17 aperçu pool Équipe** — **W17′** toggle pillule rôle livré.
- [x] [Review][Patch] **Hint multi-places sous waterfall** — **W19′** hint en-tête livré.
- [x] [Review][Patch] **M3-5 écarts non documentés** — waivers `FRONTEND_UI.md` + amendement story.
- [x] [Review][Patch] **Avatar sujet `avatarUrl`** — `[avatarUrl]="breakdown().avatarUrl ?? null"` (`chance-breakdown-sheet.html`).
- [x] [Review][Patch] **Rang pool sous-estimé** — `candidateCount` + `poolRank`/`aheadCount` API + fallback peers.
- [x] [Review][Patch] **Contrôles imbriqués Dispos** — pool preview ; plus de trigger `%` dans `mat-list-item`.
- [x] [Review][Patch] **Code mort branche live animation** — finding initial obsolète après refactor `@if` preview/live.

#### Patch — ouverts

_(aucun — re-review 2026-06-07, patches appliqués)_

#### Patch — appliqués (re-review 2026-06-07)

- [x] [Review][Patch] **Pool Dispos visible sans droit explainability** — gate `includeChances` API + front ; pool masqué si `!explainabilityEnabled`.
- [x] [Review][Patch] **Snapshot rétrospectif casse tolérance waterfall** — réconciliation delta `snapshot` dans `ChanceBreakdownCalculator`.
- [x] [Review][Patch] **OpenAPI composition non synchronisé** — routes + schémas dans `composition.yaml`.
- [x] [Review][Patch] **TypeScript miroir incomplet** — `factorBreakdown[]` sur `ChanceBreakdown`.
- [x] [Review][Patch] **Tests intégration droits explainability** — `CompositionExplainabilityIntegrationTest`.
- [x] [Review][Patch] **Golden breakdown incomplet** — test figé `REF-B1` dans `ChanceBreakdownCalculatorTest`.
- [x] [Review][Patch] **Échec API breakdown silencieux** — snack + `CompositionOverlayGateService`.
- [x] [Review][Patch] **Second tap overlay ignoré** — snack « Une fiche est déjà ouverte ».
- [x] [Review][Patch] **Breakpoint overlay après fetch** — viewport capturé avant fetch.
- [x] [Review][Patch] **Course async pool preview** — token génération `poolPreviewGeneration`.
- [x] [Review][Patch] **Erreur pool preview = pool vide** — `poolPreviewError` + message alert.
- [x] [Review][Patch] **Gate explainability front ≠ backend** — `canShowCompositionExplainability()` partagé.
- [x] [Review][Patch] **`aria-haspopup="dialog"` manquant** — triggers Équipe + picker.
- [x] [Review][Patch] **Segments live sous `aria-hidden`** — `role="group"` + label sur barre live.
- [x] [Review][Patch] **Superposition aide + fiche** — gate overlay partagée.
- [x] [Review][Patch] **Accordion Dispos réinitialisé au refresh** — expand initial seulement si vide.
- [x] [Review][Patch] **Code mort navigation pair (W4′)** — breadcrumb/`openPeer` retirés.
- [x] [Review][Patch] **Emplacement réservé 19.21+** — commentaire HTML sous toolbar.
- [x] [Review][Patch] **Test trigger picker %** — `composition-slot-picker-dialog.spec.ts`.
- [x] [Review][Patch] **Ancre preview par slot** — ancrage par `roleKey` uniquement.
- [x] [Review][Patch] **Branche morte reload chances** — supprimée dans `event-dispos-tab.ts`.
- [x] [Review][Patch] **Export mort `renderHelpMarkdown`** — `help-markdown.ts` supprimé.
- [x] [Review][Patch] **Picker sans garde `chancePercent != null`** — condition template + guard TS.
- [x] [Review][Patch] **Contrôles imbriqués picker** — row + trigger `%` siblings.

#### Deferred (waiver PO documenté ou post-release)

- [x] [Review][Defer] **Cibles tactiles &lt; 48 dp (segments pool, trigger % grille)** [`composition-draw-animation.scss`, `event-equipe-tab.scss`] — waiver PO `FRONTEND_UI.md` ; follow-up post-release.

- [x] [Review][Defer] **Boutons imbriqués picker manuel** [`composition-slot-picker-dialog.html:15-47`] — waiver PO `FRONTEND_UI.md` § 19.7 ; dette a11y connue.

- [x] [Review][Defer] **`indexOf` dans boucle facteurs O(n²)** [`ChanceBreakdownCalculator.kt:71-74`] — un seul facteur en prod ; refactor quand pipeline grossit.

- [x] [Review][Defer] **Fallback `javaClass.simpleName` facteurs non labellisés** [`ChanceBreakdownCalculator.kt:96-98`] — seul `PastParticipationFactor` actif.

- [x] [Review][Defer] **Seuil vert pool 75 % vs spec « ≥ ~70 % »** [`availability-chances.ts:chancePoolTier`] — écart mineur spec as-shipped ; pas bloquant recette PO.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / UX spec)
- [x] Section **Material 3** remplie (UI obligatoire)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés
- [x] Décisions W1–W19 figées ; non-goals explicites
- [x] Dépendance 19.6 = consommation pipeline, pas réimplémentation
