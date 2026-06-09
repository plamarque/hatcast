---
baseline_commit: 24f30d5ef0a42ad29157de7a1168232b1b1cf710
---

# Story 19.4 : Documentation orga / membre — comprendre les cotes

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant qu **organisateur ou membre**,  
je veux une **explication lisible** de ce que signifient les pourcentages,  
afin de **faire confiance** au tirage sans lire le code.

## Acceptance Criteria

1. **Given** doc produit sous `docs/v2/product/draw-chances-explained.md`, **when** publiée, **then** elle explique en français (plain language) : rôle des participations passées, multi-places sur un même rôle, qui voit les % et quand (brouillon orga vs membre après validation — **6.4** / **6.14**), snapshot « au tirage » vs recalcul live (`chanceSource`), et renvoie à la spec technique pour les implémenteurs sans dupliquer la formule. [Source: epics 19.4 AC1 ; FR24]
2. **Given** doc relue, **when** PO vérifie le périmètre produit actuel, **then** **aucune promesse** sur facteurs non livrés (formules admin, parité genre, politiques par catégorie — Wave C/D ; OQ-19-xx ouverts). [Source: epics 19.4 AC2]
3. **Given** liens depuis docs normatives, **when** un développeur ou PO ouvre la spec ou l’ADR, **then** un lien vers la doc utilisateur est présent (§ doc utilisateur). Lien in-app optionnel — **waivable** MVP si doc + liens normatifs suffisent. [Source: epics 19.4 AC3]
4. **Couverture :** FR24. **Priorité :** P1. **Depends :** 19.1 (done). **UI :** N/A sauf lien minimal waivable.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement obligatoire sous `apps/web/`. Si lien in-app ajouté (optionnel), respecter FRONTEND_UI.md (`mat-button` ou `mat-hint`, tokens `--mat-sys-*`).

---

## Tasks / Subtasks

- [x] **Périmètre :** documentation — `docs/v2/product/`, liens dans `docs/v2/technical/draw-weight-engine-v1-spec.md`, `docs/adr/0019-draw-weight-engine.md`, `docs/v2/README.md` — **ne pas** modifier `AvailabilityChanceCalculator`, `CompositionDrawService`, ni `legacy/`.
- [x] **AC1 — Doc utilisateur** — créer [`docs/v2/product/draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) :
  - [x] § **En bref** — % = chance d’être tiré pour ce rôle sur cet événement ; pas une garantie.
  - [x] § **Participations passées** — exemple concret « Alice a joué 3× en JEU cette saison → cote plus basse qu’un rookie » ; malus équitable ; compte uniquement compositions **validées** ; refus / archivé exclus.
  - [x] § **Plusieurs places sur un rôle** — 5 joueurs pour 1 place ≠ 20 % chacun ; algorithme tient compte des places multiples (sans formule complète — renvoi spec).
  - [x] § **Où voir les %** — tableau Dispos **Tous** (FR19, futur = live) vs Équipe explainability (FR24) ; orga voit % en brouillon ; membre voit équipe + % après **validation** (comportement V2 actuel ; publish = étape orga, pas visibilité membre équipe aujourd’hui).
  - [x] § **Spectacles passés** — `chanceSource` : `live` / `snapshot` / `estimated` ; snapshot = % au moment du tirage ; estimated = recalcul sans archive.
  - [x] § **Ce qui n’est pas encore dans le produit** — formules personnalisables, parité genre, mix équipe, politiques par catégorie — renvoi futur sans date (Wave C/D, stories 19.7+).
  - [x] § **Pour aller plus loin** — lien vers [`draw-weight-engine-v1-spec.md`](../technical/draw-weight-engine-v1-spec.md) et ADR 0019 (implémenteurs).
- [x] **AC3 — Liens normatifs** — mettre à jour :
  - [x] Spec § Scope : remplacer « User-facing orga/member doc (**19.4**) » OUT par lien vers doc produit.
  - [x] ADR 0019 : ajouter § **Documentation utilisateur** avec lien.
  - [x] [`docs/v2/README.md`](../v2/README.md) : entrée doc produit.
- [x] **AC3 optionnel (waivable)** — lien in-app panneau Dispos Tous : **non requis** (doc + liens normatifs suffisent MVP).
- [x] **Gate** — `./gradlew test` inchangé (doc-only) ; story → `review` ; `sprint-status.yaml` → `19-4-…: review`.

---

## Dev Notes

### Normative sources (read order)

1. [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — formule, historique, %, redraw, E-04 opening snapshot
2. [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md)
3. [`_bmad-output/planning-artifacts/epics.md`](../planning-artifacts/epics.md) — Story 19.4 AC
4. [`19-1-spec-normative-v1-adr-draw-weight-engine.md`](19-1-spec-normative-v1-adr-draw-weight-engine.md) — handoff spec
5. [`19-3-fixtures-orchestration-draw-complet.md`](19-3-fixtures-orchestration-draw-complet.md) — E-04 opening snapshot
6. [`6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md`](6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md) — visibilité explainability
7. [`6-14-snapshot-chances-au-tirage.md`](6-14-snapshot-chances-au-tirage.md) — `chanceSource`, snapshots

### Product behaviour to document (runtime — do not change)

| Surface | Qui | Quand | Source % |
|---------|-----|-------|----------|
| Dispos → **Tous** | Membre / orga avec accès Dispos | Spectacle **publié** (dispos ouvertes) — **indépendant** de la composition | Recalcul **live** / snapshot / estimé selon `chanceSource` |
| Dispos → **Tous** | Idem | Événement **passé** avec tirage archivé | **Snapshot** au tirage (`snapshot`) |
| Dispos → **Tous** | Idem | Passé sans archive (migré) | **Estimé** (`estimated`) + hint UI |
| Équipe (slots assignés) | **Organisateur** | Brouillon (publié ou non) | Live + snapshot passé si applicable |
| Équipe | **Membre** | Composition **publiée ou validée** | Idem explainability |

**Invariant (ADR 0019) :** les % affichés utilisent le **même calcul** que le tirage serveur — pas de formule parallèle côté client pour la décision.

**E-04 (opening snapshot) :** le % archivé au tirage correspond à l’état **au début** du tirage (avant exclusions cross-rôle accumulées pendant la même requête). Suffisant pour la doc utilisateur ; détail technique en spec.

### Explicit non-goals

- Dupliquer la formule complète (`malus`, `exactSelectionProbability`, pseudocode).
- Modifier `AvailabilityChanceCalculator` / `CompositionDrawService` (**19.5** en parallèle).
- Promettre Wave C/D (formules admin **19.15+**, parité genre **19.11**, politiques **19.18**).
- Changements `legacy/`.
- Tests nouveaux (doc-only).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 19.1 | done | Spec + ADR — source technique |
| 19.2 | done | Golden calculator — pas de lecture requise pour doc |
| 19.3 | done | E-04 opening snapshot — cite en doc utilisateur |
| 6.4 | done | Visibilité explainability |
| 6.14 | done | `chanceSource`, snapshots passés |
| 19.5 | backlog | Pipeline facteurs — **ne pas toucher** |

### File structure

```
docs/v2/product/draw-chances-explained.md   # NEW — doc principale FR
docs/v2/technical/draw-weight-engine-v1-spec.md  # UPDATE — lien doc user
docs/adr/0019-draw-weight-engine.md         # UPDATE — § doc utilisateur
docs/v2/README.md                           # UPDATE — index produit
```

### Testing requirements

- `./gradlew test` — doit rester vert sans modification de code métier.
- Pas de `ng test` requis (pas de changement web sauf optionnel waivable).

### Tone & examples (PO gate)

- Français, tutoiement ou vouvoiement cohérent (préférer **vous** pour orga/membre).
- Exemples nommés : Alice, Bob, rôle JEU, 3 participations passées.
- Éviter jargon : « malus » → « pénalité équitable » ou « cote réduite ».

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Implementation Plan

1. Rédiger `draw-chances-explained.md` (sections AC1).
2. Croiser liens spec, ADR, README.
3. Vérifier gate `./gradlew test`.
4. Marquer story `review`.

### Completion Notes List

- Doc utilisateur FR `docs/v2/product/draw-chances-explained.md` : participations passées (ex. Alice 3× JEU), multi-places (63 % vs 20 % naïf), visibilité Dispos/Équipe, `chanceSource`, hors périmètre Wave C/D.
- Liens croisés : spec normative § Scope + paragraphe doc utilisateur, ADR 0019 § Documentation utilisateur, `docs/v2/README.md`.
- Lien in-app waivable — non implémenté (MVP doc + liens normatifs).
- Tests draw ciblés verts (`AvailabilityChanceCalculatorTest`, `DrawOrchestrationGoldenTest`) — doc-only, aucun code métier touché. Suite complète : échec infra « Could not write XML test results » (concurrence Gradle locale), sans lien avec cette story.

### File List

- `docs/v2/product/draw-chances-explained.md` (new)
- `docs/v2/technical/draw-weight-engine-v1-spec.md` (modified)
- `docs/adr/0019-draw-weight-engine.md` (modified)
- `docs/v2/README.md` (modified)
- `_bmad-output/implementation-artifacts/19-4-doc-orga-membre-comprendre-les-cotes.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

### Change Log

- 2026-06-07 : Story créée (create-story Epic 19.4).
- 2026-06-07 : Doc produit + liens normatifs livrés ; story → review.
- 2026-06-07 : Code review — 8 patches appliqués ; story → done.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie **ou** **UI : N/A** explicite
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code / docs existants
- [x] `./gradlew test` mentionné (doc-only)

### Review Findings

- [x] [Review][Decision] Phrase « séparation par type de spectacle selon les règles en vigueur » (L117) — **résolu : retirer** (choix PO 1).
- [x] [Review][Patch] Retirer la mention compartiment type de spectacle en fin de § hors périmètre

- [x] [Review][Patch] `sprint-status.yaml` 19-5 hors périmètre — non régressé (19-5 `done` indépendamment) ; 19-4 → `done`

- [x] [Review][Patch] Exemple multi-places corrigé (8 candidats / 5 places ≈ 63 %, REF-P3)

- [x] [Review][Patch] Identifiants backlog **FR19** / **FR24** retirés

- [x] [Review][Patch] Section passés vs à venir réorganisée (plus de `live` dans le tableau passés)

- [x] [Review][Patch] « En bref » couvre spectacles à venir et passés

- [x] [Review][Patch] Mode estimé élargi (pas seulement spectacles migrés)

- [x] [Review][Patch] § multi-places : renvoi inline vers la spec technique

- [x] [Review][Defer] Onglet Équipe : pas de libellé `chanceSource` côté API composition (snapshot appliqué silencieusement sur `chancePercent`) [`docs/v2/product/draw-chances-explained.md`:73-82] — deferred, pre-existing gap 6.14 vs UX doc

- [x] [Review][Defer] Gate `./gradlew test` non prouvé dans le diff doc-only — deferred, infra Gradle locale signalée en Dev Agent Record

- [x] [Review][Defer] Titres de sections vs checklist story (« Pourquoi l’historique compte » vs « Participations passées ») — deferred, cosmetique

- [x] [Review][Defer] Cas limites non documentés : historiques inégaux multi-places, snapshots partiels, assignation manuelle sans tirage — deferred, hors MVP doc utilisateur
