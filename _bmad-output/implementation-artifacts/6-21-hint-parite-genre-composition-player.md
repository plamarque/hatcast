---
baseline_commit: be75520c58e566e0f694163efd5e19d3b831ee11
---

# Story 6.21 : Hint mixité de genre sur composition (rôle player)

Status: done

<!-- UX Screen 2 approved 2026-06-05 (Patrice) — qualitative score + semantic colors -->
<!-- Gap analysis: Wave A/B (2.12–2.12c) delivered prerequisites; UI-only slice -->

## Story

En tant qu'**organisateur** constituant l'équipe,  
je veux un **indicateur compact de mixité** (bon / acceptable / faible) sur les créneaux **Comédien·ne** (`player`),  
afin d'être **guidé** sans contrainte — je peux ignorer le signal.

## Acceptance Criteria

1. **Given** tous les créneaux `player` **remplis** ont un genre **connu** (`u = 0`) et `n = f + m ≥ 2`, **when** l'onglet Équipe s'affiche pour `canManageComposition`, **then** une **ligne compacte** au-dessus de la grille affiche le score : *Mixité équilibrée*, *Mixité acceptable*, ou *Mixité faible* — **sans** chiffres F/H dans la ligne principale. [Source: epics 6.21 ; UX amend 2026-06-05 ; member-gender.md]
2. **Given** le score, **when** rendu, **then** couleur sémantique : **bon** = vert, **acceptable** = gris, **faible** = orange — tokens `--hatcast-participation-available-badge-*`, `--hatcast-participation-neutral-badge-*`, `--hatcast-participation-declined-badge-*` ; **pas** warning amber **6.20**, **pas** `--mat-sys-error`. [Source: DESIGN.md § parity indicator]
3. **Given** `u = 0` et `n = f + m ≥ 2`, **when** score calculé, **then** **écart** `= |f − m|` : **bon** si `écart = 0` ; **acceptable** si `écart = 1` ; **faible** si `écart ≥ 2`. [Source: PO confirmé 2026-06-05]
4. **Given** au moins un créneau `player` rempli avec genre **inconnu** (`u > 0`), **when** Équipe, **then** indicateur **masqué** — on ne se prononce pas sur la mixité. [Source: PO 2026-06-05]
5. **Given** aucun créneau `player` rempli, ou tous connus mais `n < 2`, **when** Équipe, **then** indicateur **masqué**. [Source: EXPERIENCE.md]
6. **Given** modification des slots, **when** refresh local/API, **then** score recalculé client-side (même signal que `slotRows()`). [Source: epics 6.21 AC3]
7. **Given** membre sans `canManageComposition`, **when** Équipe, **then** indicateur **masqué**. [Source: EXPERIENCE.md audience]
8. **Given** l'indicateur, **when** rendu, **then** **non bloquant** — Valider / Tirer / Compléter toujours disponibles ; posture « garde-fou ignorable » (V2 guide, n'optimise pas). [Source: PO 2026-06-05]
9. **Given** indicateur visible (`u = 0`), **when** tap ou tooltip (optionnel), **then** *{f} F · {m} H* — progressive disclosure. [Source: DESIGN.md]
10. **Couverture :** FR21. **Priorité :** P2. **Depends :** **2.12**, **2.12b**, **2.12c** (done), **6.5** (done). **UX :** [ux-design-member-gender-parity.md](../planning-artifacts/ux-design-member-gender-parity.md) Screen 2 **approved** ; spines [DESIGN](../planning-artifacts/ux-designs/ux-member-gender-parity-2026-06-05/DESIGN.md) / [EXPERIENCE](../planning-artifacts/ux-designs/ux-member-gender-parity-2026-06-05/EXPERIENCE.md).

**Out of scope 6.21:** flag « spectacle cherche la mixité » ; mixité bi-équipes match/catch (Epic 15 rencontre).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Ligne = `<div role="status">` + `<mat-icon>groups</mat-icon>` (18px, `aria-hidden`) ; tooltip optionnel via `matTooltip` — **pas** bandeau pleine largeur, **pas** bouton d'action obligatoire. [Source: FRONTEND_UI.md]

**M3-2. Tokens & thème** — Score colors via participation badge tokens (§ AC2) ; **interdit** hex en dur. Forme : ligne compacte (~22–28px), pas fond primary 10% full-width. [Source: DESIGN.md amend]

**M3-3. Mobile & tactile** — Wrap autorisé ≤ 480px ; tooltip touch-friendly si implémenté. [Source: EXPERIENCE.md]

**M3-4. Navigation membre** — N/A.

**M3-5. Revue** — Checklist FRONTEND_UI.md ; `member-gender-surfaces.md` row → ✅.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` uniquement — pas d'API. [AC 1–10]
- [x] **Helper** — `computeCompositionPlayerGenderParity(slots)` → `{ f, m, u, ecart, score, label, detailLabel } | null` ; return **`null`** when `u > 0`, no players, or `n < 2`. [AC 3–5]
- [x] **Tests unitaires** — 2F3H u=0→acceptable ; 2F2H→bon ; 1F4H→faible ; 2F1U→null ; all U→null ; 1F only→null. [AC 3–5]
- [x] **EventEquipeTab** — computed + `visiblePlayerGenderParity` when result non-null ; classes `--bon|acceptable|faible`. [AC 1–7]
- [x] **Template** — ligne compacte before grid ; `data-testid="composition-gender-parity-indicator"`. [AC 1–2]
- [x] **SCSS** — `.event-equipe-tab__parity--*` with badge token colors. [AC 2 ; M3-2]
- [x] **Tooltip** (optional) — `{f} F · {m} H` when visible. [AC 9]
- [x] **Tests composant** — orga + all known → visible ; one non_specified → hidden ; member hidden. [AC 1–7]
- [x] **Registry** — `member-gender-surfaces.md` ❌ → ✅. [M3-5]
- [x] **Validation** — `npm run test -w @hatcast/web -- --watch=false` (ciblé : 58/58 parity + équipe tab ; suite complète : échecs préexistants hors périmètre 6.21).

---

## Dev Notes

### Already delivered by 2.12* (do NOT re-implement)

| Deliverable | Story |
|-------------|-------|
| `participantGender` on composition slots | **2.12b** |
| Gender-aware équipe rows + avatars | **2.12b/c** |

### UX decisions (2026-06-05, Patrice)

- **Qualitative score** + **écart** thresholds (0/1/≥2).
- **Semantic colors:** bon=vert, acceptable=gris, faible=orange.
- **Compact line** not full bandeau.
- **`u > 0` → hidden** — cannot pronounce on mixité if any unknown gender among assigned players.
- Indicator ignorable; no blocking.

### Score algorithm (PO confirmé)

```
filled = player slots with participantId
if filled.length == 0 → null
u = count non_specified among filled
if u > 0 → null                    // genres inconnus → rien
f, m = known counts; n = f + m
if n < 2 → null
écart = |f - m|
écart 0 → bon / Mixité équilibrée
écart 1 → acceptable / Mixité acceptable
écart ≥ 2 → faible / Mixité faible
```

### Manual recette

1. Orga, 5 players all known 2F·3H → *Mixité acceptable* (grey).
2. Same + one slot non_specified → **no line**.
3. 1F·4H all known → *Mixité faible* (orange).
4. Ordinary member → no line.

---

## Dev Agent Record

### Implementation Plan

- Helper pur `computeCompositionPlayerGenderParity` sur slots `player` remplis ; seuils écart 0/1/≥2 ; `u > 0` → masqué.
- `EventEquipeTab` : `visiblePlayerGenderParity` + bloc `composition-guidances` (team-level) ; pill mixité `role="status"` + `mat-icon groups` + tooltip progressive disclosure.
- Couleurs via tokens participation badge (vert / gris / orange) — pas warning amber ni error.

### Completion Notes

- Indicateur mixité visible pour organisateur quand tous les comédiens assignés ont un genre connu et `n ≥ 2`.
- Libellés : Mixité équilibrée / acceptable / faible ; détail `{f} F · {m} H` en tooltip + aria-label.
- 7 tests unitaires helper + 3 tests composant ; 58/58 sur fichiers ciblés.
- Checklist M3 : composants Material (icon + tooltip), tokens sémantiques, mobile wrap ≤480px, registry ✅.
- UX amend 2026-06-06 : guidances strip validée en recette — doc spine mise à jour (pas à côté badge état).

### File List

- `apps/web/src/app/core/composition/composition-player-gender-parity.ts` (new)
- `apps/web/src/app/core/composition/composition-player-gender-parity.spec.ts` (new)
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `docs/v2/technical/member-gender-surfaces.md`

### Change Log

- 2026-06-06 : UX doc — guidances composition strip (team-level) ; parity pill inside ; slot warnings unchanged.
- 2026-06-06 : UI polish — `composition-guidances` container (recette Patrice OK).
- 2026-06-05 : Implementation complete — helper, UI strip, tests, registry (dev-story).
- 2026-06-05 : Story created (strip + counts).
- 2026-06-05 : UX amend — qualitative score, semantic colors, compact line (Patrice).
- 2026-06-05 : Copy FR — **Mixité** remplace Parité (libellés UI).
- 2026-06-05 : Seuils **écart** confirmés : 0=bon, 1=acceptable, ≥2=faible (PO).
- 2026-06-05 : **`u > 0` → masqué** — pas de copy « genre non renseigné » (PO).
- 2026-06-06 : Code review — garde `animatingDraw`/`drawing` sur `visiblePlayerGenderParity` ; +4 tests composant (bon, faible, n&lt;2, tirage).

### Review Findings

- [x] [Review][Patch] Masquer l'indicateur mixité pendant tirage (`animatingDraw` / `drawing`) — `visiblePlayerGenderParity` ne garde pas ces états contrairement à `equipeStatus` ; score intermittent possible en cours d'animation. [`event-equipe-tab.ts:331`]

- [x] [Review][Patch] Compléter tests composant pour scores `bon` / `faible` et masquage `n < 2` — seul le chemin `acceptable` est couvert en DOM ; helper unitaire OK. [`event-equipe-tab.spec.ts`]

- [x] [Review][Defer] Harmoniser délais `matTooltip` avec les warnings slot voisins — cohérence UX mineure, pas d'AC violé. [`event-equipe-tab.html`] — deferred, pre-existing pattern gap

- [x] [Review][Defer] Formuler le détail mixité en langage naturel dans `aria-label` (éviter abréviations F/H) — amélioration a11y optionnelle. [`event-equipe-tab.html`] — deferred, pre-existing

- [x] [Review][Defer] Genre de slot potentiellement périmé si le membre met à jour son profil après assignation — modèle slot existant (2.12b), pas introduit par 6.21. [`composition-player-gender-parity.ts`] — deferred, pre-existing

- [x] [Review][Defer] Resynchroniser `epics.md` §6.21 avec UX amendée (score qualitatif, masquage `u > 0`) — drift documentaire hors diff. [`epics.md`] — deferred, doc-only
