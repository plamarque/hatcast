---
title: UX — Décomposition des cotes par facteur (waterfall + pairs)
author: Sally (UX)
date: '2026-06-07'
amended: '2026-06-07'
asShippedValidated: '2026-06-07'
status: amended-as-shipped
stakeholderSignOff: po-validated-recette
relatedStories:
  - '19.7'
  - '19.6'
relatedArtifacts:
  - _bmad-output/planning-artifacts/epics.md#story-197
  - _bmad-output/implementation-artifacts/19-6-facteur-past-participation-v1.md
  - docs/v2/product/draw-chances-explained.md
  - docs/v2/technical/draw-weight-engine-v1-spec.md
  - docs/adr/0019-draw-weight-engine.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/shared/availability/availability-tous-panel.html
  - apps/web/src/app/shared/composition/composition-draw-animation.html
  - legacy/src/components/EventRoleGroupingView.vue
  - legacy/src/components/ChanceExplanationSlides.vue
---

# UX Design — Pourquoi cette cote ? (story 19.7)

**Purpose:** Quand un·e orga ou membre tape sur un **%**, ouvrir une fiche **chaleureuse et visuelle** qui répond à la vraie question : *« Pourquoi j’ai moins (ou plus) que les autres ? »* — sans parler de formule, sans slides pédagogiques, sans recalcul côté client.

**Trigger:** Story **19.7** — API `factorBreakdown` + UI explainability ; prolonge la doc produit **19.4** et le pipeline facteurs **19.5–19.6**.

**Principe produit (PO 2026-06-07) :**

> Tout le monde part du principe que **l’équité = égalité** (mêmes chances de base). Ce qu’on veut qu’on **justifie**, ce sont les **écarts** — surtout ce qui a **fait perdre** des points — et pouvoir **regarder ceux qui passent devant**.

---

## Ce qu’on ne refait pas (leçon V1)

| V1 (`EventRoleGroupingView` + `ChanceExplanationSlides`) | V2 cible |
|----------------------------------------------------------|----------|
| Popup fourre-tout : chiffres perso + carrousel JPG « chapeau » | **Deux couches séparées** : doc **19.4** (général) vs fiche **19.7** (cas concret) |
| Métaphore répétée 3× | Une **barre pool** silencieuse + **waterfall** en langage humain |
| « Formule » / divisions affichées | **Points gagnés / perdus** (+ / −) |
| Comparer = relire deux popups | **Tap sur un pair** ou comparateur (phase 2) |

L’**animation de tirage** V2 (`composition-draw-animation`) sert **deux modes** : spectacle **pendant** le tirage (existant) et **aperçu statique avant** tirage pour les orgas (amendement PO 2026-06-07). La fiche waterfall reste un **panneau séparé** branché sur les segments / % — pas mélangée à la pédagogie générale.

---

## Deux surfaces, deux usages *(amendement PO 2026-06-07)*

| Persona | Surface **principale** | Moment | Besoin |
|---------|------------------------|--------|--------|
| **Orga / admin** | **Onglet Équipe** | Avant / pendant / après tirage ; assignation manuelle | Décider, comparer, **calibrer** (futur : formule avant tirage) |
| **Membre** | **Dispos → Tous** | Dispos ouvertes ; équipe **validée** | « Pourquoi ma cote ? » ; voir les autres |

**Insight PO :** les % en Dispos aident à **se projeter** ; l’**Équipe** est le **poste de commande** — c’est là qu’on tire, assigne à la main, et qu’on confronte **résultat du tirage** vs **% calculés**. L’explicabilité orga ne doit **pas** être reléguée au second plan.

**Composant unique :** `app-chance-breakdown-sheet` — même waterfall, **plusieurs entrées**. Seul le **contexte** change (titre, rôle pré-sélectionné, visibilité barre pool).

---

## User stories

> En tant qu’**organisateur·ice**, je veux comprendre **pourquoi un candidat a une cote plus basse qu’attendu**, en une dizaine de secondes, pour **rassurer** ou **expliquer** en réunion sans ouvrir la doc technique.

> En tant qu’**organisateur·ice**, je veux voir **le pool pondéré avant de lancer le tirage**, toucher un candidat, et ouvrir **son échelle de chance** — pour arbitrer une assignation manuelle ou anticiper le tirage.

> En tant qu’**organisateur·ice**, pendant l’**animation de tirage**, je veux **tap sur un segment** de la barre pour voir la fiche du candidat **au moment où il est en lice** — pour recoller % affichés et tirage effectif.

> En tant qu’**organisateur·ice ou membre**, je veux **voir qui est devant moi** dans le pool et **ouvrir sa fiche** d’un geste, pour comparer intuitivement.

> En tant que **membre**, après **validation** de l’équipe, je veux la même transparence sur **mon** % depuis **Dispos** — sans jargon.

> *(Futur — Epic 19.21+)* En tant qu’**organisateur·ice**, je veux **prévisualiser l’impact** d’une formule sur **ce spectacle** avant « Tirer au sort ».

---

## Modèle mental — « Échelle de la chance »

Pas de ticket comptable. Pas de Π. On raconte une **petite histoire en 3 temps** :

```
   🎯  Départ : « Tirage pur entre tous les candidats »           63 %
        │
        ▼  ajustements visibles (waterfall)
   📉  « Déjà joué souvent en JEU cette saison »           −38
   📉  (futurs facteurs : parité, prestige, …)             −7
        │
        ▼
   ✨  « Ta chance aujourd’hui »                           18 %
```

**Ton copy :** bienveillant, concret, **jamais** « multiplicateur », « poids », « formule », « pipeline ».

---

## Design decisions

| ID | Decision |
|----|----------|
| **W1** | UI centrée sur **deltas en points de %** vs **`referencePercent`** (tirage pur, sans facteurs — **W18**) — pas sur la décomposition algébrique brute. |
| **W2** | **`referencePercent` et `adjustments[].deltaPoints`** = **vérité API** ; le front n’infère pas la baseline. |
| **W3** | **Barre du pool** en en-tête : **purement visuelle** (segments colorés, surbrillance sur le sujet) — **zéro** copy pédagogique sur la barre. |
| **W4** | Section **« Devant toi dans le pool »** : liste des candidats avec % **strictement supérieur**, tri desc — **1 tap** ouvre leur fiche (breadcrumb retour). |
| **W5** | **Comparateur 2 colonnes** (Alice \| Bob, lignes différenciées) = **phase 2** ; MVP = bascule nom-à-nom + liste pairs. |
| **W6** | **Zéro** carrousel / slides / JPG dans la fiche. Lien discret « Comprendre le tirage en général » → [`draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md). |
| **W7** | **Entrée** : tap sur le **%** uniquement (Dispos Tous + slot Équipe) — pas sur toute la ligne candidat (conflit sélection sujet dispos). Affordance : `%` stylé **cliquable** (`mat-button` texte ou chip + `chevron_right` / `info` discret). |
| **W8** | **Droits** : **Dispos** — membre dès spectacle publié (story **5.9**, FR24 Dispos) ; **Équipe** — orga en brouillon ; membre après publication ou validation composition ; pas de fiche si explainability masquée sur la surface. |
| **W9** | Conteneur : **`MatBottomSheet`** mobile ; **≥ 840 px** : bottom sheet large ou `MatDialog` panneau (max-width ~28rem) — même composant interne `app-chance-breakdown-sheet`. |
| **W10** | Facteurs avec **`deltaPoints === 0`** : **omis** en UI (pas de bruit). |
| **W11** | **Équipe = surface orga prioritaire** pour explicabilité : aperçu pool, picker manuel, animation tirage — pas seulement Dispos. |
| **W12** | **Aperçu pool avant tirage** : réutiliser `composition-draw-animation` en mode **`preview`** (barre statique, pas de curseur) — visible orga quand `canDraw()` et rôle sélectionné ou « prochain slot ». |
| **W13** | **Tap segment barre** (preview **ou** animation live) → ouvre `app-chance-breakdown-sheet` pour ce candidat / ce rôle / cette étape. |
| **W14** | **Picker manuel** (`composition-slot-picker-dialog`) : `%` **cliquable** → même sheet (MVP orga — **promu** depuis « hors scope »). |
| **W15** | **Grille Équipe** (slot assigné, brouillon orga) : afficher **`chancePercent`** discret à droite du nom + tap → sheet (aligné explainability 6.4). |
| **W16** | **Formule de tirage (19.21)** — changement **optionnel** dans menu overflow **⋮** Équipe seulement si ≥2 formules ; **pas** de bandeau sous pool ; tirage **immédiat**. Spec : [ux-design-orga-formula-choice-19-21.md](./ux-design-orga-formula-choice-19-21.md). |
| **W17** | **Aperçu pool repliable** sur **mobile (≤ 480 px)** : **fermé par défaut** ; orga l’ouvre via `mat-expansion-panel` ou chip « Voir le pool du tirage ». **Desktop (≥ 840 px)** : **ouvert par défaut** si au moins un rôle avec candidats. État ouvert/fermé mémorisé **par événement** (session). *(PO Patrice 2026-06-07)* |
| **W18** | **`referencePercent`** = cote **avant tout facteur modificatif** : tirage pondéré **pur** entre les candidats éligibles du pool (même `requiredCount` / places multiples, **aucun** malus ou bonus facteur actif). Les lignes `adjustments` expliquent l’écart vers `chancePercent`. *(PO Patrice 2026-06-07 — option C)* |
| **W19** | **`requiredCount > 1`** : risque de confusion (« pourquoi ~63 % et pas 5÷8 ? »). Afficher une ** ligne hint** sous le waterfall (déjà prévu) ; **option** icône `info_outline` + **`matTooltip`** ou tap → phrase courte — *« Plusieurs places : ce % = chance d’être pris·e au moins une fois, pas une simple part du pool. »* Lien doc **19.4** § plusieurs places. Pas de paragraphe long en MVP ; ajuster après recette si besoin. *(PO Patrice 2026-06-07)* |

---

## Anatomie visuelle — composant `app-chance-breakdown-sheet`

### Palette & tokens (chaleureux, pas austère)

| Zone | Token / traitement | Effet |
|------|-------------------|--------|
| Fond sheet | `surface-container-low` | Carte accueillante, légèrement distincte du fond page |
| En-tête identité | `primary-container` + `on-primary-container` | Bandeau doux avec avatar + prénom + rôle emoji |
| % final | `headline-small`, couleur sémantique chance (`high` / `medium` / `low` — réutiliser `--hatcast-v1-chance-*` ou tokens existants `availability-tous__chance--*`) | Gros chiffre « héros » |
| Ligne référence | `on-surface-variant`, icône `balance` ou `groups` | Neutre — « point de départ équitable » |
| Delta négatif | `error-container` texte `on-error-container`, icône `trending_down` | Perte de points — visible mais pas agressif |
| Delta positif | `tertiary-container`, icône `trending_up` | Bonus rare — à célébrer |
| Barre pool | Segments `primary` / `outline-variant` ; sujet = `primary` saturé + léger glow `box-shadow` token | Lecture immédiate « part du gâteau » |
| Liste pairs | `mat-list` + avatars existants `app-user-avatar` | Social, familier |

**Interdit :** fond noir type V1, texte `text-xs` gris sur gris, murs de paragraphes.

---

## Wireframe — mobile (≤ 480 px)

**Entrée :** onglet **Dispos → Tous**, rôle JEU déplié.

```
┌─────────────────────────────────────────┐
│  Dispos › Tous › 🎭 JEU (8/5)           │
├─────────────────────────────────────────┤
│  (👤) Alice                    [ 18 % › ]│  ← tap sur %
│  (👤) Bob                      [ 42 % › ]│
│  (👤) Camille                  [ 35 % › ]│
└─────────────────────────────────────────┘
                    │
                    ▼  MatBottomSheet
┌─────────────────────────────────────────┐
│  ─── poignée drag ───                   │
│  ┌───────────────────────────────────┐  │
│  │ 🎭 JEU · Spectacle 12 juin        │  │  primary-container
│  │ (👤) Alice                        │  │
│  │        ✨ 18 %                    │  │  headline — couleur low
│  └───────────────────────────────────┘  │
│                                         │
│  Où tu te situes                        │
│  ┌───────────────────────────────────┐  │
│  │▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │  barre pool — Alice surlignée
│  │ Bob   Camille  Alice  …  +5       │  │  légende mini sous barre
│  └───────────────────────────────────┘  │
│                                         │
│  Échelle de ta chance                   │
│  ┌───────────────────────────────────┐  │
│  │ ⚖️  Tirage pur entre tous           │  │
│  │     les candidats                63 % │  │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  │
│  │ 📉  Déjà joué 3× en JEU          │  │
│  │     cette saison            −38   │  │  chip delta rouge doux
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  │
│  │ ✨  Ta chance aujourd’hui    18 % │  │  encadré surface
│  └───────────────────────────────────┘  │
│                                         │
│  ℹ️ 5 places à pourvoir — ce % =       │
│     chance d’être prise au moins 1×     │
│     [ En savoir plus ]                  │  lien doc 19.4
│                                         │
│  Devant toi dans le pool                │
│  ┌───────────────────────────────────┐  │
│  │ (👤) Bob              42 %    ›   │  │
│  │ (👤) Camille          35 %    ›   │  │
│  │ (👤) Dana             31 %    ›   │  │
│  │     Voir les 8 candidats          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [ Fermer ]                             │  mat-stroked-button
└─────────────────────────────────────────┘
```

**Navigation pair :** tap **Bob** → sheet se met à jour ; fil d’Ariane en haut :

```
  ‹ Alice          Bob ›
```

---

## Wireframe — waterfall seul (détail visuel)

Variante « carte illustrée » — chaque step a une **barre horizontale proportionnelle** au % (purement décorative, pas une échelle math secondaire) :

```
  Échelle de ta chance
  ╭──────────────────────────────────────╮
  │ ⚖️  Point de départ                    │
  │     Tirage pur entre tous            │
  │     les candidats                    │
  │     ████████████████████░░░░  63 %   │
  │                                      │
  │ 📉  Déjà joué souvent                │
  │     en JEU cette saison              │
  │     ░░░░░░░░░░░░░░░░░░░░░░  −38 pts  │
  │                                      │
  │ ✨  Aujourd’hui                      │
  │     ██████░░░░░░░░░░░░░░░░  18 %   │  ← bordure primary
  ╰──────────────────────────────────────╯
```

Les barres **ne remplacent pas** les chiffres — elles **renforcent** le scan visuel pour les orgas pressés.

---

## Wireframe — desktop (≥ 840 px)

Même contenu ; sheet devient **dialog centré** (~26–28 rem) ou bottom sheet ancrée avec coins `1rem`.

```
                    ┌─────────────────────────────┐
                    │  🎭 JEU · Alice · 18 %      │
                    │  [ barre pool ]             │
                    │  [ waterfall card ]         │
                    │  [ liste pairs ]            │
                    │         [ Fermer ]          │
                    └─────────────────────────────┘
```

Pas de rail-specific : fiche = overlay contextuelle au détail événement.

---

## Wireframe — onglet Équipe · aperçu pool **avant** tirage *(orga)*

Placé **sous** le hint « Proposition automatique… » et **au-dessus** de la grille de slots — uniquement si `canManageComposition` && brouillon && au moins un rôle avec candidats.

**Repliable (W17) — mobile, fermé par défaut :**

```
┌─────────────────────────────────────────┐
│  [ Tirer au sort ]  [ Partager ]  …     │
├─────────────────────────────────────────┤
│  ▶ Aperçu du pool · 🎭 JEU (8 cand.)    │  mat-expansion-panel — replié
├─────────────────────────────────────────┤
│  [🎭 JEU]  (○) À pourvoir               │
│  [🎤 MC]   (👤) Patrice          42 % › │
└─────────────────────────────────────────┘
```

**Mobile ouvert / desktop ouvert par défaut :**

```
┌─────────────────────────────────────────┐
│  [ Tirer au sort ]  [ Partager ]  …     │
├─────────────────────────────────────────┤
│  ▼ Aperçu · 🎭 JEU — 8 candidats, 5 pl. │
│  ┌───────────────────────────────────┐  │
│  │▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │  composition-draw-animation
│  │ Bob  Camille  Alice  …            │  │  mode preview (statique)
│  └───────────────────────────────────┘  │
│  Tap un nom ou un segment pour le détail  │
├─────────────────────────────────────────┤
│  [🎭 JEU]  (○) À pourvoir               │
│  [🎤 MC]   (👤) Patrice          42 % › │  ← W15
└─────────────────────────────────────────┘
         │ tap segment « Alice »
         ▼
   [ même chance-breakdown-sheet ]
```

**Sélecteur de rôle :** si plusieurs rôles ont des candidats, **`mat-chip-listbox`** horizontal (rôle actif) ou barre = rôle du **prochain slot vide** dans l’ordre de tirage.

**Pendant l’animation** (post-clic Tirer) : même composant barre, mode **live** ; tap segment → sheet avec bannière « Étape 2/5 — JEU ».

**Après tirage** (brouillon, slots partiellement remplis) : aperçu reste utile pour le **prochain** rôle / compléter — ou se replie en accordéon « Voir le pool du prochain tirage ».

---

## Wireframe — picker manuel (orga)

```
  Choisir pour 🎭 JEU
  ┌─────────────────────────────────────┐
  │ (👤) Bob                    42 % ›  │  ← tap % ouvre sheet
  │ (👤) Alice                  18 % ›  │
  └─────────────────────────────────────┘
```

La ligne reste cliquable pour **assigner** ; le **%** a sa propre zone tap (`stopPropagation`) — pattern identique à Dispos Tous.

---

## Wireframe — phase 2 : comparateur 2 colonnes

Bouton **`mat-stroked-button`** « Comparer avec… » → `mat-menu` ou petite liste → split view :

```
  Comparaison · Alice et Bob
  ╭──────────────────────────────────────╮
  │              Alice        Bob        │
  │  Chance      18 %        42 %       │  row highlight si écart
  │  Déjà joué   3×          0×         │  fond tertiary-container
  │  (autres     —           —           │  facteurs futurs
  │   facteurs)                          │
  ╰──────────────────────────────────────╯
  [ Retour à Alice seule ]
```

Sur mobile étroit : **`mat-tab-group`** « Alice » | « Bob » au lieu de deux colonnes.

---

## Entrées écran

| Priorité | Surface | Élément cliquable | Persona | Condition |
|----------|---------|-------------------|---------|-----------|
| **P0 orga** | **Équipe · aperçu pool** | Segment barre ou nom sous barre | Orga | `canManageComposition` ; brouillon ; API pool rôle |
| **P0 orga** | **Équipe · animation tirage** | Segment barre (live) | Orga | `animatingDraw()` |
| **P0 orga** | **Picker manuel** | `%` sur ligne candidat | Orga | `composition-slot-picker-dialog` |
| **P1 orga** | **Équipe · grille** | `%` sur slot assigné | Orga / membre validé | `showExplainability` |
| **P1 membre** | **Dispos → Tous** | `%` + chevron | Membre (+ orga) | `chancePercent != null` + droit explainability |

**Ordre d’implémentation suggéré (19.7) :** sheet + API → **Équipe orga (P0)** → Dispos membre (P1) → comparateur phase 2.

**Futur (19.21) — implémenté :** formule changeable via menu overflow **⋮** toolbar Équipe (pas sous pool). What-if sliders = hors scope.

---

## Contrat API suggéré (story 19.7)

Expose côté composition summary, availability « Tous », et/ou endpoint dédié — **même shape** partout.

```typescript
/** Explainability d’un candidat pour un rôle (et slot si multi-places). */
export interface ChanceBreakdownDto {
  participantId: string
  roleKey: string
  displayName: string
  chancePercent: number

  /** Cote avant facteurs modificatifs — tirage pur (W18). */
  referencePercent: number

  /** Lignes triées par |deltaPoints| desc ; delta 0 omis côté serveur. */
  adjustments: ChanceAdjustmentDto[]

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

### Sémantique `referencePercent` — **figée PO 2026-06-07 (option C)**

> **`referencePercent`** = pourcentage du candidat si le moteur appliquait **uniquement** le tirage pondéré de base sur le pool éligible actuel — **sans aucun facteur modificatif** (participations passées, parité, prestige, etc.).

**En pratique (backend) :** recalculer les cotes avec le **même pool**, le même `requiredCount`, et un pipeline où **tous les multiplicateurs facteur = 1,0** (ou équivalent : seule la base « places à pourvoir » compte, poids identique par candidat).

**Copy UI (ligne référence) :** « **Tirage pur** entre tous les candidats : **{referencePercent} %** »

**Cohérence waterfall :** la somme des `adjustments[].deltaPoints` (+ arrondi) doit retrouver `chancePercent − referencePercent`. Chaque facteur actif contribue une ligne delta ; facteurs inactifs omis.

Documenter la règle exacte dans [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) § Explainability — **ne pas** laisser le front deviner.

---

## Copy FR — exemples (facteur actuel + futurs)

| factorId | label UI (exemple) | delta typique |
|----------|-------------------|---------------|
| `past_participation` | « Déjà joué {n}× en {rôle} cette saison » | négatif |
| `equity_tag` (19.8) | « Compté dans un autre type de spectacle » | négatif ou 0 |
| `gender_parity` (19.11) | « Équilibre des genres sur ce rôle » | ± |
| `prestige_history` (19.13) | « Prestige des spectacles passés » | ± |

**Ligne référence (fixe) :** « **Tirage pur** entre tous les candidats : **{referencePercent} %** »

**Ligne finale (fixe) :** « Ta chance aujourd’hui **{chancePercent} %** »

**Hint multi-places (`requiredCount > 1`) — W19 :**

- **Ligne fixe** sous le waterfall : « **{n} places** à pourvoir — ce % = chance d’être pris·e **au moins une fois**. »
- **Tooltip optionnel** (icône `info_outline` à côté de la ligne **Tirage pur** ou du **% final**) :

  > *Avec plusieurs places, HatCast simule plusieurs tirages successifs pour ce rôle. Le % affiché n’est donc pas « places ÷ candidats » (ex. 5÷8).*

- **Lien** « En savoir plus » → [`draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) § Plusieurs places.

**Note PO :** la confusion touche surtout la **ligne référence** (souvent ~60 %+ à tirage pur) — le tooltip peut être limité à ce cas ; on affine après recette utilisateur.

---

## Accessibilité & M3

| Élément | Exigence |
|---------|----------|
| Trigger `%` | `aria-label="Voir le détail de la cote : {name}, {percent} pourcent"` ; `aria-haspopup="dialog"` |
| Sheet | `role="dialog"`, `aria-labelledby` → titre prénom + rôle |
| Waterfall | Liste sémantique `<ul>` / `mat-list` ; deltas annoncés « moins 38 points » |
| Barre pool | `aria-hidden="true"` (décoratif) ; résumé texte une ligne sous la barre : « {name} est parmi {n} candidats » |
| Fermeture | Bouton explicite + swipe down bottom sheet ; focus trap CDK |
| Cibles | `%` trigger **≥ 48×48 dp** hit area (padding autour du chiffre) |

---

## Test hooks

| Hook | Élément |
|------|---------|
| `data-testid="chance-breakdown-trigger"` | Bouton / zone % cliquable |
| `data-testid="chance-breakdown-sheet"` | Conteneur sheet/dialog |
| `data-testid="chance-breakdown-pool-bar"` | Barre pool |
| `data-testid="chance-breakdown-waterfall"` | Carte échelle |
| `data-testid="chance-breakdown-reference"` | Ligne référence % |
| `data-testid="chance-breakdown-adjustment-{factorId}"` | Ligne delta |
| `data-testid="chance-breakdown-final"` | Ligne finale |
| `data-testid="chance-breakdown-peer-{participantId}"` | Ligne pair |
| `data-testid="chance-breakdown-compare-trigger"` | Bouton comparer (phase 2) |

---

## Périmètre livraison

| Lot | Contenu |
|-----|---------|
| **MVP 19.7** | API `referencePercent` + `adjustments` + `pool` par rôle ; sheet waterfall ; **`composition-draw-animation` mode preview** ; entrées **Équipe P0** (aperçu, animation, picker) ; entrée Dispos Tous **P1** ; % sur slot grille orga (W15) si effort raisonnable |
| **Phase 2** | Comparateur 2 colonnes ; accordéon repliable aperçu pool ; mémorisation dernier pair comparé |
| **Epic 19.21+** | Sélecteur formule + what-if branché sur aperçu pool (W16) |
| **Hors scope** | Slides pédagogiques ; recalcul client des deltas ; persistance formule (19.15–19.22) |

---

## Acceptance Criteria — Material 3 (UI) — pour story 19.7

**M3-1.** `MatBottomSheet` / `MatDialog` + `mat-list` + `mat-stroked-button` + `mat-icon` + `app-user-avatar` — pas d’overlay maison.

**M3-2.** Couleurs via `--mat-sys-*` et sémantique chance existante ; deltas via `error-container` / `tertiary-container` — pas de hex ad hoc.

**M3-3.** Mobile ≤ 480 px : trigger % ≥ 48 dp ; sheet scrollable ; textes FR.

**M3-4.** N/A chrome global — pas de nouvelle nav membre.

**M3-5.** Checklist FRONTEND_UI.md en fin de story ; écarts notés en Dev Notes.

---

## Composants cibles (implémentation)

| Fichier suggéré | Rôle |
|-----------------|------|
| `apps/web/src/app/shared/composition/chance-breakdown-sheet/` | Sheet + waterfall + pool bar + peers |
| `apps/web/src/app/shared/composition/composition-draw-animation.*` | Modes **`live`** \| **`preview`** ; `@Output` segment tap |
| `apps/web/src/app/pages/event-detail/event-equipe-tab.*` | Bloc aperçu pool ; triggers grille ; orchestration animation |
| `apps/web/src/app/shared/composition/composition-slot-picker-dialog.*` | Trigger `%` orga |
| `apps/web/src/app/shared/availability/availability-tous-panel.*` | Trigger `%` membre (P1) |
| `apps/web/src/app/core/composition/composition-api.service.ts` | Types `ChanceBreakdownDto` ; endpoint pool preview par rôle |

Réutiliser styles barre depuis `composition-draw-animation.scss` (**tokens**, pas copier-coller couleurs V1 legacy). **Un seul composant barre** — preview et tirage partagent le même rendu visuel pour renforcer le lien « ce que tu vois avant = ce qui anime pendant ».

---

## Liens normatifs à mettre à jour (implémentation)

- [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — § Explainability API + définition `referencePercent`
- [`draw-chances-explained.md`](../../docs/v2/product/draw-chances-explained.md) — § « Où voir le détail par personne » (1 paragraphe + renvoi UI)
- Story file **`19-7-breakdown-explicabilite-par-facteur.md`** — créer via `bmad-create-story` en citant ce doc UX

---

## Amendement as-shipped (recette PO — 2026-06-07)

**Contexte :** implémentation 19.7 livrée et validée en recette par Patrice. Cette section **remplace** les wireframes / AC UX ci-dessus là où elles divergent. Les IDs **W1–W19** restent l’historique ; les lignes **W\***′ ci-dessous font foi pour la release.

### Décisions révisées

| ID | Décision as-shipped |
|----|---------------------|
| **W3′** | **Pas de barre pool dans la fiche** breakdown. Le pool visuel reste sur les surfaces **aperçu** (Équipe, Dispos → Tous). Dans la fiche : **une ligne texte** de classement (`poolRankSummary`) — ex. « 3e sur 8 candidats · 2 devant toi », ex aequo, ou « Classement indisponible » si champs API absents (fallback client depuis `pool.peers.length`). |
| **W4′** | **Liste « Devant toi dans le pool »** et **navigation pair / breadcrumb** = **hors MVP livré**. Comparaison intuitive = lire le résumé rang + revenir au pool tapable. Phase 2 si besoin. |
| **W6′** | **Deux couches maintenues** : (1) fiche 19.7 = waterfall + lien « Comprendre le tirage en général » ; (2) aide générale = **`DrawChancesHelpDialog`** en **carrousel 5 slides** (images V1 `public/img/slide-1.jpg` … `slide-5.jpg`), **pas** d’article markdown long. Stub markdown conservé pour liens / SEO. **Zéro** carrousel **dans** la fiche breakdown. |
| **W7′** | **Entrée principale pool** : tap sur un **segment** du pool (`app-composition-pool-preview`) → fiche. **Dispos → Tous** : liste par candidat remplacée par **barre pool par rôle** (accordion). Triggers **%** conservés sur picker manuel, grille Équipe, animation live. |
| **W17′** | **Toggle inline** sur la **pillule de rôle** (Équipe) pour afficher/masquer l’aperçu pool — **pas** `mat-expansion-panel` dédié ni chip « Voir le pool du tirage ». Pas de persistance `sessionStorage` par événement dans le livré. |
| **W18′** | Calcul inchangé (tirage pur sans facteurs). **Copy UI ligne référence** : « Chance de base pour les {n} candidats » (pas « Tirage pur entre… »). |
| **W19′** | Hint multi-places dans **l’en-tête** : sous-titre « {n} places à pourvoir » + icône `info_outline` + `matTooltip` (phrase courte). **Pas** de ligne hint sous le waterfall dans le livré. |
| **W20** | **Titre waterfall** : « **D’où vient ce % ?** » (remplace « Échelle de (ta/sa) chance »). Ligne finale : « Ta/Sa chance aujourd’hui » inchangée. |

### Pool visuel (aperçu — `composition-pool-preview` / `composition-draw-animation`)

| Aspect | Spec as-shipped |
|--------|-----------------|
| **Layout** | `flex-wrap` ; largeur segment **proportionnelle** au % (`flex: 0 1 {widthPercent}%`) ; **pas** de rangées à largeurs égales après wrap. |
| **Largeur min.** | Avatar + ~5 caractères de prénom + ellipsis. |
| **Couleurs** | **4 paliers** (vert ≥ ~70 %, jaune, orange, rouge) ; nuances HSL par pas de **5 %** dans le palier (`chancePoolTier`, `chancePoolSegmentBackground` dans `availability-chances.ts`). |
| **Interactivité** | Segments tapables si explainability ; ouvre `app-chance-breakdown-sheet`. |
| **Accessibilité** | Barre décorative ; pas de barre dans la fiche — résumé rang en texte (`data-testid="chance-breakdown-rank-summary"`). |

### Fiche breakdown — structure livrée

```
[ breadcrumb retour ]          ← seulement si navigation pair (code mort UI : plus de liste pairs)
[ bannière étape ]             ← animation tirage live uniquement
En-tête : rôle · avatar · prénom · % héros [hint multi-places]
Ligne classement pool (texte)
« D’où vient ce % ? »
  • Chance de base pour les N candidats    → referencePercent
  • ajustements (+/− pt)
  • Ta/Sa chance aujourd’hui               → chancePercent
Lien « Comprendre le tirage en général » → DrawChancesHelpDialog (carrousel)
[ Fermer ]
```

### Aide « Comprendre les pourcentages » (`DrawChancesHelpDialog`)

- **5 slides** pédagogiques (reprise visuelle V1), navigation chevrons + pastilles.
- **Mobile** : chevrons 48×48 dp ; bouton « Fermer » pleine largeur sur ligne séparée.
- **Pas** de bloc « Dans l’app » sur la dernière slide (l’utilisateur y est déjà).
- Fichiers : `draw-chances-help-dialog.*`, `draw-chances-help-slides.ts` ; markdown réduit à stub (`public/help/draw-chances-explained.md`).

### Chrome Équipe (hors breakdown strict)

- Colonne badge rôle élargie (~7,5 rem), hauteur min. alignée sur badge % (`_hatcast-equipe-composition.scss`).

### Écarts connus / follow-up (non bloquants release PO)

- Review findings techniques (droits API, snapshot waterfall, golden tests, cibles 48 dp segments pool, etc.) — voir story **19.7** § Review Findings ; traitement post-release ou story dédiée.
- **`poolRank` / `aheadCount`** : préférer API à jour ; fallback client documenté ci-dessus.

### Handoff doc (Paige)

→ [`19-7-as-shipped-handoff-paige.md`](./19-7-as-shipped-handoff-paige.md)

---

## Sign-off

| Rôle | Statut | Date |
|------|--------|------|
| Sally (UX) | Draft + amendement as-shipped | 2026-06-07 |
| Patrice (PO) | **Recette validée** — W3′–W7′, W17′, W18′–W20, pool, aide slides | 2026-06-07 |

**Décisions PO tranchées (historique + as-shipped) :** `referencePercent` = tirage pur sans facteurs (**W18**) ; hint multi-places en en-tête (**W19′**) ; pool aperçu via toggle rôle (**W17′**) ; fiche = waterfall + rang texte (**W3′–W4′**) ; aide générale = carrousel 5 slides (**W6′**).
