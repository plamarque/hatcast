# Interface V2 — Angular Material, CDK et responsive

Ce document fixe les **références officielles** et les **principes d’implémentation** pour le client [`apps/web/`](../../../apps/web/) (Angular + Angular Material). Il complète le PRD / l’architecture produit sous [`_bmad-output/planning-artifacts/`](../../../_bmad-output/planning-artifacts/).

## Documentation officielle

- **Angular Material (composants, guides)** : [material.angular.dev](https://material.angular.dev/)  
  C’est la source normative pour les patterns UI V2 : privilégier au maximum les **composants Material standard** plutôt que des implémentations ad hoc.

## Thème et personnalisation

- Choisir un **thème Material** (préconstruit ou sur mesure), puis le **personnaliser** via le système de theming documenté ici :  
  [Theming — Angular Material](https://material.angular.dev/guide/theming)

## Composants personnalisés

Lorsqu’un besoin ne peut pas être couvert proprement par les composants Material existants :

- S’appuyer sur le **CDK** (primitives sans style imposé) : [CDK — catégories](https://material.angular.dev/cdk/categories)
- Pour le style des composants maison, suivre :  
  [Theming your components](https://material.angular.dev/guide/theming-your-components)  
  afin de rester **aligné sur les tokens / variables de thème** et d’éviter un îlot de CSS incohérent avec le reste de l’app.

## Responsive et mobile-first

**HatCast** vise une utilisation **mobile-first** : les écrans doivent être **pensés et testés d’abord pour les téléphones** (petites largeurs, interactions tactiles, densité lisible).  
L’usage sur **navigateur desktop** reste **pleinement supporté** : layouts adaptatifs (breakpoints, grilles, navigation) pour que l’expérience soit confortable sur grand écran sans dupliquer des parcours métier distincts.

Cette exigence est alignée avec le positionnement produit (PWA, usage sur le terrain) et les NFR d’accessibilité (voir PRD / epics).

---

## Material 3 — exigence transverse (UX-DR11)

Le PRD et les epics imposent **Angular Material en première intention**, le **theming M3** (`mat.theme()` dans [`apps/web/src/styles.scss`](../../../apps/web/src/styles.scss)), et **pas Tailwind comme surface de style principale** (utilitaires ponctuels tolérés s’ils ne pilotent pas layout ni identité visuelle).

**Specs produit complémentaires** (parcours, chrome, navigation membre) :

| Document | Contenu |
|----------|---------|
| [`_bmad-output/planning-artifacts/ux-design-hatcast-v2.md`](../../../_bmad-output/planning-artifacts/ux-design-hatcast-v2.md) | Continuité V1, tokens, écrans de référence |
| [`_bmad-output/planning-artifacts/ux-hub-a-faire.md`](../../../_bmad-output/planning-artifacts/ux-hub-a-faire.md) | Top app bar M3, nav rail desktop (≥ 840 px), interdits M2 |
| [`_bmad-output/planning-artifacts/ux-design-hub-section-headers.md`](../../../_bmad-output/planning-artifacts/ux-design-hub-section-headers.md) | Titres L1/L2 hub membre (typo, espacements, anti-dérive dialogue → page) |
| [`_bmad-output/planning-artifacts/ux-design-accueil-actions-requises.md`](../../../_bmad-output/planning-artifacts/ux-design-accueil-actions-requises.md) | Accueil — cartes Actions requises + moment « Tout est à jour » |
| [`_bmad-output/planning-artifacts/ux-design-specification.md`](../../../_bmad-output/planning-artifacts/ux-design-specification.md) | Surfaces admin (Material defaults + tokens) |

Avant toute story UI, lire la section **checklist** ci-dessous et les **Dev Notes** / AC de la story (souvent sous `_bmad-output/implementation-artifacts/`).

---

## Checklist M3 HatCast (implémentation & revue)

Utiliser cette liste **à la fin** de chaque changement sous `apps/web/` (développement, PR, `bmad-code-review`, checkpoint UX). Un point non coché sans justification documentée dans la story = dette UX à traiter ou reporter explicitement.

### Composants et structure

- [ ] **Composant Material d’abord** — boutons (`mat-button`, `mat-stroked-button`, `mat-flat-button`), champs (`mat-form-field`), listes (`mat-list`, `mat-table`), dialogs (`MatDialog`), menus (`mat-menu`), chips (`mat-chip`), onglets (`mat-tab-group`), toolbars (`mat-toolbar`) : pas de `<button class="…">` ou div cliquable custom si Material couvre le cas.
- [ ] **Icônes** — `mat-icon` + noms [Material Symbols](https://fonts.google.com/icons) déjà utilisés dans l’app (`calendar_month`, `groups`, `settings`, etc.) ; `aria-hidden="true"` sur l’icône décorative si un libellé texte ou `aria-label` porte le sens.
- [ ] **Dialogs / bottom sheets** — `MatDialog` (ou pattern documenté dans la story) ; pas de overlay maison pour des flux modaux standard.
- [ ] **CDK seulement si nécessaire** — overlay, drag-drop, focus trap : via CDK + tokens, pas de z-index / couleurs arbitraires.

### Thème, couleurs, typographie

- [ ] **Tokens système** — couleurs et fonds via `var(--mat-sys-*)` (`primary`, `on-surface`, `surface`, `outline-variant`, `error`, etc.) ; nuances avec `color-mix(in srgb, var(--mat-sys-…) …)` comme dans le code existant.
- [ ] **Pas de palette ad hoc** — éviter `#rrggbb`, `rgb()` ou gradients en dur dans les composants ; **exception** : stops V1 `--hatcast-v1-*` dans `_hatcast-semantic-colors.scss` uniquement (voir § Couleurs sémantiques — participation).
- [ ] **Typographie** — hiérarchie Material (`--mat-sys-body-medium`, `title-medium`, etc.) ou classes du thème ; pas de `font-size` arbitraire sauf compactage local justifié (toolbar, chip).
- [ ] **Thème global** — ne pas contourner `mat.theme()` dans `styles.scss` ; personnalisation via palettes / density documentées.

### Layout, navigation, densité

- [ ] **Mobile-first** — concevoir et tester d’abord ≤ 480 px (breakpoint le plus utilisé dans l’app), puis tablette / desktop.
- [ ] **Chrome membre** — top app bar M3 (titre + actions à droite) ; **pas** de bottom app bar Material 2 pour changer d’espace applicatif (cf. `ux-hub-a-faire.md`).
- [ ] **Desktop membre (cible)** — navigation **rail** à gauche à partir de **840 px** lorsque la story ou le hub membre le prévoit ; jusqu’alors, raccourcis header / chips acceptés (phase discoverability).
- [ ] **Admin** — densité plus compacte acceptable ; rester sur Material defaults + tokens (UX-DR10 / UX-DR11), clarté avant effet « spectacle ».

### Accessibilité et tactile

- [ ] **Cibles tactiles** — contrôles interactifs **≥ 48×48 dp** de préférence ; minimum **40×40** seulement si documenté dans l’AC de la story (ex. icône seule avec `aria-label`).
- [ ] **Libellé masqué** — si le texte est caché en mobile (`display: none` sur le label), **`aria-label` français** obligatoire sur le contrôle (voir `member-agenda-shortcut`).
- [ ] **Focus** — `cdkFocusInitial` / ordre de tabulation cohérent dans les dialogs ; pas de piège clavier.
- [ ] **Contraste** — états erreur / warning via `--mat-sys-error` ou tokens sémantiques, pas uniquement une couleur custom faible.

### Copy et cohérence produit

- [ ] **UI en français** — tutoiement ; possessifs et couples titre/sous-titre : [ux-voice-and-tone.md](../../../_bmad-output/planning-artifacts/ux-voice-and-tone.md).
- [ ] **Réutilisation** — avant un nouveau bloc UI, chercher un composant partagé (`shared/`, `member-cross-nav`, cartes agenda, headers saison/événement).

### Anti-patterns (rejeter en revue)

| Éviter | Faire à la place |
|--------|------------------|
| Tailwind (ou utilitaires) pour grille, couleurs, typo principales | Flex/grid SCSS léger + tokens `--mat-sys-*` |
| Bouton HTML stylé en CSS | `mat-button` / `mat-stroked-button` + `routerLink` si lien |
| Couleur hardcodée `#9333ea` sur un écran | Token ou `color-mix` sur `--mat-sys-primary` |
| Modale div + `position: fixed` | `MatDialog` + composant standalone |
| Nouvelle barre de navigation basse globale | Top app bar + rail desktop (spec hub) |
| Dupliquer la logique « dernière saison » / agenda | `LastVisitedSeasonShortcutService`, `member-cross-nav` |

### Références code (bons patterns)

- Raccourcis membre : [`apps/web/src/app/shared/member-cross-nav/`](../../../apps/web/src/app/shared/member-cross-nav/) — `mat-stroked-button`, `routerLink`, `aria-label`, ellipsis mobile.
- Thème M3 global : [`apps/web/src/styles.scss`](../../../apps/web/src/styles.scss).
- **Charte sémantique participation** : [`apps/web/src/styles/_hatcast-semantic-colors.scss`](../../../apps/web/src/styles/_hatcast-semantic-colors.scss) (dispo, sélection, en attente, désistement, indispo ; cartes agenda [`_hatcast-agenda-event-card.scss`](../../../apps/web/src/styles/_hatcast-agenda-event-card.scss) ; badges [`_hatcast-agenda-event-badges.scss`](../../../apps/web/src/styles/_hatcast-agenda-event-badges.scss) + [`_hatcast-agenda-dispo-badge.scss`](../../../apps/web/src/styles/_hatcast-agenda-dispo-badge.scss)).
- Helpers : [`availability-status.ts`](../../../apps/web/src/app/core/availability/availability-status.ts) (dispo pure), [`participation-status.ts`](../../../apps/web/src/app/core/participation/participation-status.ts) (chart, équipe, badges étendus).
- Spec UX : [`ux-design-participation-semantic-colors.md`](../../../_bmad-output/planning-artifacts/ux-design-participation-semantic-colors.md).
- Tokens dans les features : `event-detail`, `admin-membres`, `user-agenda` (fichiers `*.scss` avec `--mat-sys-*`, `--hatcast-participation-*` ou alias `--hatcast-availability-*`).

### Couleurs sémantiques — participation

Spec UX normative : [`ux-design-participation-semantic-colors.md`](../../../_bmad-output/planning-artifacts/ux-design-participation-semantic-colors.md).

#### États et tokens (`-gradient-strong`)

| État | Signification | Token |
|------|---------------|-------|
| Disponible | Dispo saisie (sans sélection) | `--hatcast-participation-available-gradient-strong` |
| Sélection / dans l'équipe | Slot confirmé ou assigné | `--hatcast-participation-selected-gradient-strong` |
| En attente de confirmation | Sélectionné, participation non confirmée | `--hatcast-participation-pending-gradient-strong` |
| Désistement / décliné | Retrait après engagement | `--hatcast-participation-declined-gradient-strong` |
| Pas dispo | Refus de disponibilité | `--hatcast-participation-unavailable-gradient-strong` |
| Non renseigné / neutre | Pas de réponse ou N/A | `--hatcast-participation-neutral-gradient-strong` |

#### Dégradés V1 (stops canoniques — 135°)

Source : `legacy/src/components/ConfirmationModal.vue`, `legacy/src/styles/status-colors.css`. Stops définis **une seule fois** dans `_hatcast-semantic-colors.scss` (`--hatcast-v1-*`).

| État | Stop A → Stop B | Hex |
|------|-----------------|-----|
| Sélection / confirmé | purple-500 → pink-500 | `#a855f7` → `#ec4899` |
| En attente | orange-500 → yellow-500 | `#f97316` → `#eab308` |
| Désistement | red-500 → orange-500 | `#ef4444` → `#f97316` |
| Disponible | green-500 → emerald-500 | `#22c55e` → `#10b981` |
| Pas dispo | red-500 → red-600 | `#ef4444` → `#dc2626` |
| Non renseigné | gray-400 → gray-500 | `#9ca3af` → `#6b7280` |

#### Variantes de dégradé

| Suffixe | Usage |
|---------|--------|
| `-gradient-strong` | **Fill par défaut** — compteurs Mes Stats, cases chart, boutons modale participation, toggles Dispos (sélectionné), lignes Équipe, badges statut équipe |
| `-gradient-medium` | Emphase secondaire (~72 % stop + tint chart) |
| `-gradient-soft` | Équivalent V1 `from-*-500/60` sur surface claire |
| `-gradient-row` | 90° — legacy ; lignes Équipe utilisent `-gradient-strong` |

Alias : `-stat-bg`, `-chart-fill`, `-surface` → `-gradient-strong`.

#### Surfaces branchées

| Surface | Fichier |
|---------|---------|
| Mes Stats (compteurs + chart) | `member-profile-dialog.scss` |
| Modale participation | `composition-participation-dialog.scss` |
| Onglet Dispos | `availability-form.scss` |
| Onglet Équipe (lignes + badge désistements + header statut) | `event-equipe-tab.scss`, `composition-equipe-status-header.scss` |
| Grille Statistiques — cellules événement (mois déplié) | `participation-event-cell.scss` |

#### Règles de rendu sur `-gradient-strong`

- Texte et icônes : `#fff`
- Bordure : `color-mix(in srgb, #fff 32%, transparent)`
- **Interdit** dans les features : hex/rgba de participation ; consommer uniquement les variables CSS
- **Exception** : les hex V1 ci-dessus ne vivent que dans `_hatcast-semantic-colors.scss`

**Chances de tirage (grille Dispos « Tous »)** — sémantique **distincte** : `--hatcast-chance-high` / `-medium` / `-low` (probabilité, pas état de participation).

**Helpers BEM :** `participationChartModifier()`, `participationSlotRowModifier()`, `participationBadgeModifier()`, `availabilityBadgeModifier()` (dispo pure).

### Stories et agents

- Chaque **story UI** doit référencer ce fichier et **UX-DR11**, et reprendre la section **« Acceptance Criteria — Material 3 (UI) »** du modèle [`story-template.md`](../../../_bmad-output/implementation-artifacts/story-template.md) (AC **M3-1** … **M3-5**, adaptés au périmètre).
- En fin de tâche, l’agent cite dans le résumé les points checklist **non applicables** et ceux **validés** ; toute dérive volontaire est notée dans la story ou `ISSUES.md`.

---

## Grille de revue rapide (copier dans une PR / checkpoint)

```text
M3 HatCast — revue UI
[ ] Composants Material (pas de contrôles HTML custom équivalents)
[ ] Couleurs / typo : --mat-sys-* uniquement (ou color-mix documenté)
[ ] Mobile ≤480px : lisible, pas de chevauchement chrome
[ ] Touch + aria-label si label masqué
[ ] Pas bottom app bar M2 ; nav conforme spec hub si dans le scope
[ ] Copy FR ; réutilisation shared/ existant
[ ] Tests unitaires des templates touchés (repo norm)
```
