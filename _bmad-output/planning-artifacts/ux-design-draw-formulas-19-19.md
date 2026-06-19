---
title: UX — Formules de tirage (admin catalogue · coefficients)
author: Sally (UX) + Patrice
date: '2026-06-16'
updated: '2026-06-17'
status: approved-v2
relatedArtifacts:
  - _bmad-output/implementation-artifacts/19-19c-ui-admin-editeur-formules.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-16-draw-formula-factor-params.md
  - _bmad-output/planning-artifacts/ux-design-category-glossary-17-39.md
  - docs/v2/technical/draw-formulas-policies-spec.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/pages/troupe-settings/
stories:
  - '19.19c'
supersedes:
  - '19.19'
stakeholderDecisions:
  - mat-dialog-editor-parite-17-40
  - masquer-facteurs-reserves-en-coming-soon
  - equity-tag-silencieux-payload-seulement-f2-o
  - pas-de-preview-pourcentages-mvp
  - badges-direction-lecture-seule-pas-choix-admin
  - champs-coefficients-tous-sliders-pas-de-select
  - resume-effet-par-unite-dynamique-f2-e
  - rejeu-intensite-unique-mapping-f2-r
  - profil-recette-donut-3-criteres-f2-v
  - pas-d-explication-sans-decision-admin
  - composition-compacte-f2-c-post-recette
  - toggle-leading-avant-nom-critere
  - donut-exclut-off-et-intensite-zero
  - f2-e-repliable-exemples-20pct-base
  - pas-de-disclaimer-sous-donut-v2
---

# UX Design — Formules de tirage · admin catalogue (Story **19.19c**)

**Purpose:** Permettre aux **admins troupe** de **composer, nommer et publier** des recettes de tirage avec **intensité réglable** (coefficients malus/bonus), **sans code**, en extension directe de la page **Paramètres troupe** (**17.40**).

**Contexte :** API CRUD **19.17** (done) · runtime params **19.19b** (done) · catalogue normatif **19.19a** (done) · Wave D **Demo 1 gate**. Story **19.19** superseded par **19.19a/b/c** ([SCP 2026-06-16](sprint-change-proposal-2026-06-16-draw-formula-factor-params.md)).

**Preview visuelle (source de vérité v1) :**

- HTML multi-écrans : [`_bmad-output/previews/draw-formulas-19-19-mockup.html`](../previews/draw-formulas-19-19-mockup.html)

---

## Décisions figées — v2 UI (2026-06-17, post-recette)

Baseline **19.19c** livrée puis **affinée en recette admin** (composition compacte). Cette section **remplace** la table v1 pour l’implémentation et le handoff Amelia.

| # | Décision |
|---|----------|
| 1 | **F1** liste : résumé = critères malus/bonus **activés** uniquement ; `equity_tag` **omis** |
| 2 | **F2-O** : `equity_tag` **silencieux** (payload toujours ON) — pas de bloc UI, pas de copy |
| 3 | **F2-C** : bloc unique **Composition de la formule** — donut F2-V **+** liste compacte des 3 critères (toggle, slider, chevron) ; **plus** de section titre séparée « Bonus et malus » |
| 4 | **F2-E** : encart effet par unité **dans un panneau repliable** (chevron) ; exemples chiffrés avec **20 % de base** et delta **±X pt** ; param avancé **Plafond du bonus total** (aspirations) **uniquement** dans les détails |
| 5 | **F2-R** : rejeu = slider intensité `0–1` ; affichage `1−mult` ; **1,0 = exclure** ; **0 = aucune pénalité** ; mapping client ↔ API inchangé |
| 6 | **F2-V** : titre **Composition de la formule** ; donut = critères **ON** avec score **> 0** uniquement ; intensité **0 → 0 %** ; un seul critère influent → **100 %** ; légende **toujours 3 lignes** (off → « off », pas de %) ; **pas de disclaimer** sous le graphique ; **3 couleurs distinctes** par `factorId` |
| 7 | Toggle **leading** (avant le nom) ; badge Malus/Bonus après le nom ; slider compact libellé **Intensité** (libellés API détaillés réservés aux détails / a11y) ; **tous** params numériques = **`mat-slider`** ; **aucun** `mat-select` |
| 8 | Principe copy : **on n’explique que s’il y a une décision à prendre** |

---

## Problème

| Point | Constat |
|-------|---------|
| **Gap spec UX (résolu SCP)** | L’ébauche **19.19** ne proposait que des toggles ; les admins doivent aussi **régler l’intensité** par critère (malus/bonus). |
| **Modèle mental admin** | « Formule » = **recette nommée** (comme une recette de cuisine), pas une équation. Copy **jamais** « pipeline », « multiplicateur », « poids » sur cette surface. |
| **Lisibilité malus/bonus** | Badges **Malus** / **Bonus** sur les **3 critères ajustables** ; `equity_tag` invisible dans l’UI (toujours dans le payload). |
| **Parité shell** | **17.39/17.40** a posé Paramètres troupe + onglet Catégories ; Formules doit **s’intégrer** sans réinventer chrome, breadcrumb, gating admin. |
| **Facteurs futurs** | Parité genre, mix, prestige = stories **19.11–19.14** ; l’éditeur ne doit **pas** laisser croire qu’ils sont activables aujourd’hui. |
| **Preview %** | Endpoint preview API **waivé** Demo 1 — pas de simulateur de cotes dans l’éditeur MVP (**OQ-P3**). |

---

## Principes de design

1. **Extension 17.40** — 2ᵉ onglet **Formules de tirage** ; même page, même `mat-tab-group` capsule M3 ([`ux-design-pill-tab-bar.md`](./ux-design-pill-tab-bar.md)).
2. **Liste + dialog** — CRUD liste sur l’onglet ; create/edit en **`MatDialog`** (parité `troupe-category-form-dialog`).
3. **Ton admin, pas pédagogique orga** — pas de copy longue sans décision ; lien **Comprendre les cotes** (optionnel F1) pour le détail produit.
4. **Formule système visible** — ligne **V1 standard (système)** toujours listée, **sans** edit/archive ; badge **Système**.
5. **États explicites** — chips **Brouillon** / **Publiée** / **Archivée** ; actions cohérentes par statut.
6. **Composition compacte** — bloc F2-C : donut + liste ; slider **Intensité** visible si critère ON ; détails F2-E + param avancé **repliables** (chevron).
7. **Erreurs API = feedback inline** — 400 validation (REF-V*, REF-P*) → message sous param ou section ; 409 politique → dialog actionnable.
8. **Material 3** — checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) ; tokens `--mat-sys-*`.

---

## Surfaces

| ID | Surface | Rôle | Composant |
|----|---------|------|-----------|
| **F1** | Paramètres · onglet **Formules de tirage** | Liste catalogue + CTA créer | `TroupeDrawFormulasTab` |
| **F2** | Dialog **Éditeur de formule** | Create / edit + **coefficients** | `TroupeDrawFormulaEditorDialog` |
| **F3** | Dialog **Archiver** | Confirmation soft-delete | `TroupeDrawFormulaArchiveDialog` ou `ConfirmDialog` |
| **F4** | Snackbar / inline erreur | 409 politique, 400 publish / **REF-P*** | — |

**Route :** `/troupes/:troupeSlug/admin/parametres?tab=formulas`

**Entrées :**

| Origine | Action |
|---------|--------|
| Hub gear → **Paramètres** | Ouvre paramètres ; onglet par défaut **Catégories** (inchangé **17.40**) |
| Deep link direct | `?tab=formulas` active l’onglet Formules |
| *(Futur 19.20)* | Lien « Gérer le catalogue » depuis écran politique → `?tab=formulas` |

---

## F1 — Onglet Formules de tirage (liste)

*(Inchangé vs ébauche 19.19 — pas de coefficients en liste, seulement résumé des facteurs activés.)*

### Wireframe mobile (≤ 480 px)

```
┌─────────────────────────────────────┐
│ ← Les Improbots                     │  breadcrumb (layout troupe)
├─────────────────────────────────────┤
│ Paramètres                          │  H1 mobile
│                                     │
│ Paramètres troupe                   │
│ Les formules définissent comment…   │  intro (1–2 lignes)
│                                     │
│ ( Catégories ) ( Formules de tirage )│  pill tab bar — Formules actif
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ V1 standard (système)    Système│ │  row read-only, border primary subtle
│ │ Participations passées          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ V1 + aspirations rôle   Publiée │ │  chip status
│ │ Participations passées ·          │ │
│ │ Aspirations                     │ │  factor summary (enabled labels)
│ │                          ✎  🗑 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ + Nouvelle formule ]              │  mat-stroked-button
└─────────────────────────────────────┘
```

### Règles liste

| Élément | Règle |
|---------|-------|
| **Ordre** | API `name ASC` ; formule **système** peut apparaître en tête (alphabet « V1… ») |
| **Nom** | `name` API ; typo `font-weight: 500` |
| **Résumé facteurs** | Labels FR des critères **malus/bonus activés** uniquement, séparés par « · » — **pas** de valeurs coefficients en liste MVP ; **`equity_tag` omis** (rien à décider pour l’admin) |
| **Chip statut** | `DRAFT` → **Brouillon** ; `PUBLISHED` → **Publiée** ; `ARCHIVED` → **Archivée** (ton muted) |
| **Badge système** | `isSystem` → pill **Système** ; pas d’actions ✎/🗑 |

### Intro copy (F1)

> Les formules définissent comment HatCast ajuste les cotes (bonus et malus). Les politiques (par saison ou catégorie) seront configurées ensuite.

Lien optionnel (text button) : **Comprendre les cotes** → doc produit (nouvel onglet).

---

## F2 — Dialog éditeur de formule (coefficients)

**Pattern :** `MatDialog` large mobile (`max-width: min(480px, 100vw - 2rem)`) ; **scroll interne obligatoire** (contenu plus long qu’ébauche toggles-only).

### Wireframe — éditeur v2 (composition compacte)

```
┌─────────────────────────────────────┐
│ Nouvelle formule                 ✕  │
├─────────────────────────────────────┤
│ Nom *                               │
│ [ V1 + aspirations rôle          ]  │
│ Description (optionnel)             │
│ [ Bonus pour les membres qui…    ]  │
│                                     │
│ ─── Composition de la formule ────  │  F2-C + F2-V
│         ╭──────────╮                │
│        ╱  2 actifs  ╲   Participations 35 % │
│       │ 3 critères  │   Rejouer       45 % │
│        ╲            ╱   Aspirations    20 % │
│         ╰──────────╯                │
│                                     │
│ [●] Participations passées [Malus]  ▾│  toggle leading
│     Intensité [====●====] 1,0       │
│                                     │
│ [●] Rejouer immédiatement  [Malus]  ▾│
│     Intensité [====●====] 0,75      │
│                                     │
│ [○] Aspirations de rôle   [Bonus]  ▾│  off → pas de slider
│                                     │
│ ─── Bientôt ──────────────────────  │
│ Parité genre                  Bientôt │
│                                     │
│   Annuler  Enregistrer  Publier     │
└─────────────────────────────────────┘
```

**Déplié (chevron ▴) :** encart F2-E + plafond aspirations (role_request seulement).

### F2-C — Composition compacte (layout éditeur)

**Objectif :** une seule zone de travail « recette » — visualiser la composition **et** régler les critères sans scroll excessif.

| Règle | Détail |
|-------|--------|
| **Structure** | `<section class="composition">` : `TroupeDrawFormulaProfileChart` **puis** `<ul>` liste compacte des 3 critères |
| **Ligne critère** | `[toggle] [nom + chip Malus/Bonus] [chevron détails]` |
| **Toggle** | **`mat-slide-toggle` leading** (avant le nom) — activation ON/OFF du critère |
| **Slider compact** | Visible **uniquement si ON** ; libellé générique **Intensité** + valeur à droite |
| **Détails repliables** | Chevron `expand_more` / `expand_less` ; contient **F2-E** ; pour `role_request` ON → slider **Plafond du bonus total** |
| **Hors bloc** | Section **Bientôt** (facteurs réservés) **sous** la composition — inchangée |

**Plus en v2 :** titre de section « Bonus et malus » ; disclaimer sous le donut ; encarts F2-E toujours visibles ; plafond aspirations sur la ligne compacte.

### F2-V — Composition de la formule (anneau donut)

**Demande PO :** visualiser l’**intensité relative** des réglages **malus/bonus** (pas l’assiette de calcul).

#### Pourquoi pas un pie chart de « vraies cotes » ?

| Piège | Explication |
|-------|-------------|
| **Math multiplicative** | Les facteurs se **multiplient** (`poids = base × Π facteurs`), ils ne forment pas des parts additives à 100 %. Un camembert de « % de cote » serait **mathématiquement faux** sans contexte spectacle + candidats. |
| **Pas de preview MVP** | L’API preview % est **waivée** (**OQ-P3**) en **19.19c** — on n’a pas les poids réels calculés dans l’éditeur. |
| **Lecture admin** | L’admin veut surtout **comparer l’intensité de ses réglages** entre critères, pas simuler Alice vs Bob. |

#### Recommandation Sally : **anneau donut « Composition de la formule »**

Variante du pie chart : même grammaire visuelle (secteurs = parts relatives), sémantique honnête = **parts d’influence relative des réglages actifs**, pas des cotes de tirage.

```
┌─ Composition de la formule ─────────────────────┐
│         ╭──────────╮     ■ Participations  35 % │
│        ╱  2 actifs  ╲    ■ Rejouer        45 % │
│       │ 3 critères  │    (off → « off », pas %)  │
│        ╲            ╱                           │
│         ╰──────────╯                           │
└────────────────────────────────────────────────┘
```

**Placement :** en tête du bloc **F2-C** ; intégré à la liste compacte (pas de section séparée).

**Hors scope du graphique :** `equity_tag` — **pas** de segment donut, **pas** de ligne éditeur (voir F2-O).

**Comportement :**

| Règle | Détail |
|-------|--------|
| **Mise à jour** | Recalcul **live** à chaque toggle / slider (client-side only). |
| **Segments donut** | Uniquement critères **ON** avec **score > 0** ; off ou intensité 0 → **absent** de l’anneau. |
| **Légende** | **Toujours 3 lignes** ; ON → **N %** (0 % si intensité nulle) ; OFF → **« off »** sans %. |
| **Centre du donut** | Ligne 1 : **« 3 critères »** (fixe). Ligne 2 : **« {n} actif(s) »**. |
| **Couleurs** | **3 couleurs distinctes** par `factorId` (`PROFILE_CHART_COLORS`). |
| **Accessibilité** | `role="img"` + `aria-label` FR (actifs avec % uniquement). |
| **Disclaimer** | **Supprimé v2** — F2-E + lien F1 **Comprendre les cotes**. |

#### Algorithme `visualInfluence` (UI only — spec normative pour dev)

Score brut — **uniquement si toggle ON** ; sinon `0` :

| factorId | Score (critère ON) |
|----------|-------------------|
| `past_participation` | `strength / 2` |
| `immediate_replay` | `displayIntensity` (F2-R) |
| `role_request` | `bonusPerUnfulfilled / 5` |

**Pas de plancher** : intensité **0 → 0 %**. Part = `score / Σ scores` × 100 (critères ON, total > 0).

**Exemple A** (past `1`, replay `0.75`, role `1.0`) : ~35 % / 52 % / 13 %.

**Exemple B** (past `0`, replay `0`, role `5`) : 0 % / 0 % / **100 %**.

*(Mockup + `computeProfileSegments()` alignés v2.)*

#### Implémentation Angular (19.19c)

| Choix | Recommandation |
|-------|----------------|
| Composant | `TroupeDrawFormulaProfileChart` (standalone) ; SVG `<circle>` stroke-dasharray **ou** CSS `conic-gradient` + trou central |
| Lib chart | **Pas** de Chart.js/Recharts — SVG/CSS pur (~40 lignes), cohérent bundle perf |
| Test | Unit : segments actifs sum to 100 ; intensité 0 → 0 % ; seul critère influent → 100 % |

#### Évolution future (hors 19.19c)

| Story | Visualisation |
|-------|---------------|
| Preview API (**OQ-19-03** / **19.19d**) | Barres **% candidats** (réutiliser pattern `CompositionPoolPreview`) — là, vraies cotes |
| **19.21** orga | Menu overflow ⋮ — formule (si ≥2) ; [ux-design-orga-formula-choice-19-21.md](./ux-design-orga-formula-choice-19-21.md) |

**Scope 19.19c :** F2-V **recommandé** dans la story (PO 2026-06-16) — waivable si time-box, mais mockup + spec prêts pour dev.

### F2-O — `equity_tag` : **silencieux dans l’UI** (pas de bloc explicatif)

**Principe PO :** on n’explique que s’il y a une **décision à prendre**. `equity_tag` (compartiment par catégorie) est **toujours actif**, **non configurable** en MVP — **aucun bloc**, **aucun libellé**, **aucune copy** dans l’éditeur F2 ni dans le résumé liste F1.

| Règle | Détail |
|-------|--------|
| **Éditeur F2** | Pas de section « Assiette de calcul », pas de toggle, pas de badge |
| **Liste F1** | Ne pas lister `equity_tag` dans le résumé « · » |
| **Payload API** | Toujours `{ "factorId": "equity_tag", "enabled": true }` (REF-V02) — assemblé côté client sans interaction |
| **Doc produit** | Explication éventuelle dans **Comprendre les cotes** (lien F1), pas dans l’éditeur |

*(Note dev : le runtime scope l’historique par catégorie de spectacle — comportement fixe HatCast, pas un réglage formule admin.)*

### Badges Malus / Bonus — **lecture seule (critères malus/bonus uniquement)**

| Règle | Détail |
|-------|--------|
| **Périmètre** | Badges **Malus** / **Bonus** uniquement sur les **3 critères ajustables** (`past_participation`, `immediate_replay`, `role_request`). **`equity_tag` : aucun badge** (voir F2-O). |
| **Nature** | Chaque critère malus/bonus a un **type fixe** (catalogue HatCast). **L’admin ne choisit pas** le type — seulement ON/OFF et l’intensité. |
| **Affichage** | Petit libellé discret à côté du nom : « Malus », « Bonus » — **pas** de toggle, **pas** de select, **pas** le mot « mode ». |
| **Tooltip optionnel** | « Type du critère (fixe) » |
| **Ne pas confondre** | L’**intensité affichée** du rejeu (F2-R) suit la même logique que les autres malus : **plus c’est haut, plus la pénalité est forte**. Le select `mode` / « Exclure vs Réduire » **n’apparaît pas** dans l’UI — mapping client ↔ API uniquement. |

| `direction` | Label UI (fixe) | Token M3 suggéré | factorIds |
|-------------|-----------------|------------------|-----------|
| `MALUS` | Malus | tonal error / error-container | `past_participation`, `immediate_replay` |
| `BONUS` | Bonus | tonal tertiary / tertiary-container | `role_request` |
| `NEUTRAL` | *(non affiché)* | — | `equity_tag` — silencieux F2-O |

### F2-R — Rejouer immédiatement : **un seul slider Intensité** (mapping affichage ↔ API)

**Demande PO :** même grammaire que les autres malus — **un slider « Intensité du malus »**, sans select Exclure / Réduire. L’exclusion = intensité **maximale** (cote × 0).

**Principe :** le runtime stocke `malusMultiplier` (0 = cote nulle) ou `mode=EXCLUDE`. L’UI affiche l’**intensité perçue** :

```
displayIntensity = 1 − malusMultiplier    (mode MALUS)
displayIntensity = 1.0                    (mode EXCLUDE)
```

| Intensité affichée | Effet si rejeu détecté | Payload API (save) |
|--------------------|------------------------|---------------------|
| **1,0** | **Exclue du tirage** (cote nulle) | `{ "mode": "EXCLUDE" }` — **sans** `malusMultiplier` (REF-P03) |
| **0,75** | Cote × **0,25** | `{ "mode": "MALUS", "malusMultiplier": 0.25 }` |
| **0,0** | Aucune pénalité (cote × 1) | `{ "mode": "MALUS", "malusMultiplier": 1.0 }` |

**Contrôle UI :** slider **Intensité du malus** `0.0–1.0` step `0.05` — **même libellé** que participations passées. Défaut à l’activation : **1,0** (EXCLUDE, aligné V1).

**Load (API → UI) :** `mode=EXCLUDE` ou absent → slider `1.0` ; `mode=MALUS` → slider `1 − malusMultiplier`.

**Save (UI → API) :** si `displayIntensity >= 1.0` → `EXCLUDE` ; sinon → `MALUS` + `malusMultiplier = round(1 − displayIntensity, 2)`.

**Implémentation 19.19c :** helpers purs `replayDisplayFromParams(mode, mult)` / `replayParamsFromDisplay(display)` dans le module draw — **pas** de changement API runtime.

### F2-E — Résumé **effet par unité** (copy prioritaire — dynamique)

**Objectif PO :** l’admin doit comprendre **concrètement** :
- quel **malus** vient de **chaque participation passée** ;
- quel **malus** vient d’un **rejeu immédiat** ;
- quel **bonus** vient de **chaque demande de rôle** non satisfaite.

**Pattern UI :** panneau **repliable** (chevron sur la ligne critère) ; encart **`.effect-summary`** (`surface-container-low`, `on-surface`, 0.8125rem) — **recalculé live**. **Remplace** les hints statiques.

**Exemples chiffrés (v2) :** baseline illustrative **20 %** + impact en **points** (`+X pt` / `−X pt`) en plus des multiplicateurs — voir `draw-formula-effect-summary.ts` (`BASE_CHANCE_EXAMPLE_PCT = 20`).

**Formules affichées (alignées runtime 19.19b) :**

| Critère | Copy dynamique (template FR) |
|---------|------------------------------|
| **Participations passées** | Multiplicateurs 1 et 3 participations + « Exemple avec **20 %** de base : … (**±X pt**). » ; intensité **0** → « aucun effet » |
| **Rejouer immédiatement** — **1,0** | Exclue du tirage + exemple 20 % → 0 % (−20 pt) |
| **Rejouer** — **0** | Aucune pénalité (× 1) + exemple reste 20 % (0 pt) |
| **Rejouer** — **{d}** &lt; 1 | Cote × `{1−d}` + exemple 20 % → … pt |
| **Aspirations de rôle** | × pour 1 et 3 demandes + plafond + exemples 20 % base en pt |

*( `equity_tag` : aucun encart F2-E — invisible éditeur.)*

**Labels contrôles :**

| Contexte | Label UI |
|----------|----------|
| Slider compact (ligne critère ON) | **Intensité** (générique — les 3 critères) |
| `strength` (a11y / détails) | Intensité participations passées |
| `immediate_replay` (a11y) | Intensité rejeu immédiat |
| `bonusPerUnfulfilled` (a11y) | Intensité aspirations de rôle |
| `maxBonusMultiplier` (détails repliables) | **Plafond du bonus total** |

**Interdit dans l’UI admin :** « pipeline », « multiplicateur », « poids », « mode », select Exclure/Réduire, « cote multipliée par » (remplacé par intensité + encart F2-E).


| factorId | Badge | Toggle | Paramètres UI (si ON) | Défaut | Plage |
|----------|-------|--------|------------------------|--------|-------|
| `equity_tag` | *(invisible UI)* | — | — | — | — |
| `past_participation` | Malus | ON/OFF (leading) | **Intensité** compacte (`strength`) | `1.0` | `0.0–2.0` |
| `immediate_replay` | Malus | ON/OFF (leading) | **Intensité** compacte (F2-R) | `1.0` (EXCLUDE) | `0.0–1.0` |
| `role_request` | Bonus | ON/OFF (leading) | **Intensité** compacte (`bonusPerUnfulfilled`) ; **Plafond** en détails | `1.0` / `10.0` | `0.0–5.0` / cap `1.0–20.0` |

**Steps slider (implémentation `mat-slider`) :**

| Param key | min | max | step | Affichage valeur |
|-----------|-----|-----|------|------------------|
| `strength` | 0 | 2 | 0.1 | 1 décimale |
| `immediate_replay` *(display)* | 0 | 1 | 0.05 | 2 décimales |
| `bonusPerUnfulfilled` | 0 | 5 | 0.1 | 1 décimale |
| `maxBonusMultiplier` | 1 | 20 | 0.5 | 1 décimale |

**Tous les params numériques en slider** — y compris rejeu immédiat (F2-R). **Aucun** `mat-select` dans l’éditeur MVP.

**Copy paramètres :** voir **F2-E** (résumé dynamique prioritaire). Hints statiques courts uniquement si l’encart dynamique est absent (fallback).

### Comportement champs

| Règle | Détail |
|-------|--------|
| **Visibilité** | Slider compact masqué si critère OFF |
| **Effet par unité** | Encart **F2-E** dans panneau **repliable** ; visible si déplié (critère ON recommandé pour contenu utile) |
| **Param avancé** | Plafond aspirations **uniquement** dans détails repliables |
| **Rejeu F2-R** | Slider intensité seul ; mapping save/load documenté § F2-R |
| **Contrôle numérique** | **`mat-slider`** + valeur à droite pour **tous** les params |
| **Payload rejeu** | `displayIntensity >= 1` → `mode=EXCLUDE` sans `malusMultiplier` ; sinon `mode=MALUS` + `malusMultiplier=1−display` |
| **Défauts** | À l’ouverture create : toggles ON pour equity + past_participation (comme V1) ; replay OFF ; role_request OFF ; params omis ou à défaut catalogue |
| **Ordre payload** | `equity_tag` → `past_participation` → `immediate_replay` → `role_request` |

### Champs & validation (formulaire)

| Champ | Règle |
|-------|-------|
| **Nom** | Requis, trim, max 255 |
| **Description** | Optionnel, max 2000 |
| **equity_tag** | Toujours `enabled: true` dans payload ; **aucun contrôle UI** (F2-O) |
| **immediate_replay** | Si ON → slider **Intensité du malus** (F2-R) ; défaut affichage **1,0** (= EXCLUDE) |
| **Reserved** | Section **Bientôt** ; exclus du payload |

### Actions dialog

| Bouton | Comportement |
|--------|--------------|
| **Annuler** | Ferme sans save |
| **Enregistrer brouillon** | `POST`/`PATCH` `status: DRAFT` ; snackbar **Formule enregistrée** |
| **Publier** | `status: PUBLISHED` ; snackbar **Formule publiée** ; disabled pendant submit |

### Copy facteurs (libellés ligne)

| factorId | Label UI | Contexte |
|----------|----------|----------|
| `equity_tag` | *(omis liste + éditeur)* | Toujours ON en payload ; doc produit si besoin |
| `past_participation` | Participations passées | Malus si la personne a déjà joué ce rôle (dans la même catégorie) |
| `immediate_replay` | Rejouer immédiatement | Malus si la personne a joué au spectacle précédent (même catégorie) |
| `role_request` | Aspirations de rôle | Bonus si la personne s’est proposée sans être tirée |

---

## F3 — Dialog archivage

*(Inchangé.)*

**409 response :**

> Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.

---

## F4 — Erreurs inline

| Cas | Emplacement | Exemple copy |
|-----|-------------|--------------|
| Publish sans facteur actif | Sous composition / footer dialog | Au moins un critère malus/bonus doit être activé pour publier la formule. |
| REF-P02/P05 out of range | Sous param concerné | `strength doit être entre 0.0 et 2.0` (message API tel quel) |
| REF-P03 malus + Exclure | Sous Rejouer immédiatement | `malusMultiplier n'est autorisé que si mode=MALUS` |
| REF-P01 clé inconnue | Sous facteur | `Paramètre inconnu pour past_participation : …` |

Variante mockup : onglet **F4 — Erreurs** dans le HTML.

---

## États & edge cases

| Cas | Comportement UI |
|-----|-----------------|
| Toggle OFF puis ON | Réafficher params avec **dernières valeurs** ou défauts catalogue si jamais édités |
| Rejeu : slider à 1,0 | Encart F2-E « exclue du tirage » ; payload `EXCLUDE` |
| Rejeu : slider &lt; 1,0 | Encart avec cote × `{1−d}` ; payload `MALUS` + `malusMultiplier` |
| `strength = 0` | Critère peut rester ON ; donut **0 %** ; encart F2-E « effet nul » |
| Tous ON, intensités 0 | Donut vide (anneau neutre) ; légende **0 %** partout |
| Un seul critère ON avec influence | Donut **100 %** sur ce critère |
| Catalogue vide (hors système) | Liste = système seule ; CTA visible |
| Non-admin | Redirect hub + snackbar **Accès non autorisé** |

---

## Accessibilité & M3

| Élément | Exigence |
|---------|----------|
| Badges direction | Texte visible ; pas couleur seule (`Malus`, `Bonus` sur critères ajustables uniquement) |
| Sliders | `aria-label` FR + `aria-valuetext` sur chaque `mat-slider` ; valeur visible à côté pour les malvoyants |
| Icon buttons | `Modifier {name}`, `Archiver {name}` |
| Dialog | Focus trap ; titre dynamique |
| Cibles | ≥ 48×48 dp icon buttons ; champs numériques min height 48 dp |

**Checklist :** FRONTEND_UI.md § Checklist M3 HatCast ; écarts dans Dev Agent Record **19.19c**.

---

## Test hooks (suggestion dev)

| Hook | Élément |
|------|---------|
| `data-testid="draw-formulas-tab"` | Onglet Formules |
| `data-testid="draw-formula-row-{id}"` | Ligne liste |
| `data-testid="draw-formula-add"` | CTA nouvelle formule |
| `data-testid="draw-formula-editor-dialog"` | Dialog F2 |
| `data-testid="draw-formula-factor-{factorId}"` | Ligne critère malus/bonus |
| `data-testid="draw-formula-direction-{factorId}"` | Badge direction |
| `data-testid="draw-formula-effect-{factorId}"` | Encart F2-E effet par unité |
| `data-testid="draw-formula-param-{factorId}-{paramKey}"` | Slider coefficient |
| `data-testid="draw-formula-profile-chart"` | Anneau composition F2-V |
| `data-testid="draw-formula-details-toggle-{factorId}"` | Chevron détails (si implémenté) |
| `data-testid="draw-formula-profile-legend"` | Légende profil |
| `data-testid="draw-formula-publish"` | Bouton Publier |
| `data-testid="draw-formula-archive-dialog"` | Dialog F3 |

---

## Périmètre livraison

| Lot | Contenu |
|-----|---------|
| **MVP 19.19c** | F1 liste + F2 éditeur **composition compacte (F2-C)** + **F2-V** + F2-E repliable + F3 archivage + F4 erreurs 400/409 |
| **19.21** orga | Sélecteur overflow ⋮ Équipe — [ux-design-orga-formula-choice-19-21.md](./ux-design-orga-formula-choice-19-21.md) |
| **Hors scope 19.19c** | Preview % ; politiques (**19.20**) ; facteurs réservés activables |

---

## Open questions — résolues (SCP / 19.19a)

| ID | Décision |
|----|----------|
| OQ-P1 | Courbe `(1/(1+n))^strength` — contrôle **Intensité** unique |
| OQ-P2 | Params séparés replay + role_request |
| OQ-P3 | Pas de preview % MVP |
| OQ-F1 | Afficher ARCHIVED muted — **Oui** MVP |
| OQ-F2 | Bouton **Publier** explicite — **Oui** |
| OQ-F3 | Pas de lien gear → Formules — deep link suffit |

---

## Handoff dev / review

1. Lire cette spec **approved-v2** + mockup HTML **avant** review ou `dev-story` **19.19c**.
2. Réutiliser `troupe-settings/` (**17.40**).
3. Catalogue TS : `apps/web/src/app/core/draw/draw-factor-catalog.ts` — **mirror** [`DrawFactorParamCatalog.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFactorParamCatalog.kt).
4. Story file : [`19-19c-ui-admin-editeur-formules.md`](../implementation-artifacts/19-19c-ui-admin-editeur-formules.md) — § **Handoff Amelia** pour checklist review v2.

---

## Changelog UX

| Date | Change |
|------|--------|
| 2026-06-16 | Ébauche **19.19** — toggles + mode replay |
| 2026-06-16 | **19.19c** — badges direction, champs coefficients, wireframe F2 étendu, mockup + canvas mis à jour (SCP factor params) |
| 2026-06-16 | **19.19c amend** — PO : **tous** les params numériques en **slider** (`mat-slider`) ; seul `mode` reste un select |
| 2026-06-16 | **19.19c amend** — PO : copy **effet par unité** (F2-E) ; malus/bonus = type fixe ; select rejeu renommé |
| 2026-06-16 | **19.19c amend** — PO : `equity_tag` = **assiette de calcul** (F2-O), hors donut et hors badges ; donut **3 critères** malus/bonus |
| 2026-06-17 | **19.19c amend** — PO : rejeu immédiat = **un slider Intensité** (F2-R) ; affichage `1−mult` ; max = exclure ; plus de select |
| 2026-06-17 | **v2 approved** — F2-C composition compacte ; toggle leading ; F2-E repliable + exemples 20 % / pt ; F2-V sans disclaimer ni INACTIVE_FLOOR ; donut exclut off et intensité 0 ; 3 couleurs distinctes ; story 19.19c AC alignés |
