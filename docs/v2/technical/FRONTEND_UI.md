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
| [`_bmad-output/planning-artifacts/ux-event-draft-publish-3-21.md`](../../../_bmad-output/planning-artifacts/ux-event-draft-publish-3-21.md) | Brouillon spectacle, publication, bandeau, agendas (story **3.21**) |
| [`_bmad-output/planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md`](../../../_bmad-output/planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md) | Détail spectacle — titre inline header, badge statut onglet Équipe, Infos › Saison (2026-06-06, amend. 17.43) |
| [`_bmad-output/planning-artifacts/ux-design-ma-troupe-hub.md`](../../../_bmad-output/planning-artifacts/ux-design-ma-troupe-hub.md) | Hub troupe + chrome détail spectacle ED1–ED5 (breadcrumb retiré, chevron retour) |
| [`_bmad-output/planning-artifacts/ux-design-pill-tab-bar.md`](../../../_bmad-output/planning-artifacts/ux-design-pill-tab-bar.md) | Barre d’onglets capsule M3 — coque + pastille active ; mixin `_hatcast-pill-tab-bar.scss` (2026-06-09) |
| [`_bmad-output/planning-artifacts/ux-design-factor-breakdown-19-7.md`](../../../_bmad-output/planning-artifacts/ux-design-factor-breakdown-19-7.md) | Détail cote par personne — waterfall deltas, barre pool, pairs (story **19.7**) |
| [`_bmad-output/planning-artifacts/ux-design-orga-formula-choice-19-21.md`](../../../_bmad-output/planning-artifacts/ux-design-orga-formula-choice-19-21.md) | Formule de tirage orga — menu overflow ⋮ Équipe, tirage immédiat (story **19.21**, PO 2026-06-19) |
| [`_bmad-output/planning-artifacts/ux-design-role-toggle-chips.md`](../../../_bmad-output/planning-artifacts/ux-design-role-toggle-chips.md) | Sélection multi-rôles — `RoleToggleChipSet` (`mat-chip` + `[highlighted]`), Préférences compte |
| [`_bmad-output/planning-artifacts/ux-design-dialog-patterns.md`](../../../_bmad-output/planning-artifacts/ux-design-dialog-patterns.md) | Fermeture modales — taxonomie M3, libellés Annuler/Fermer, anti double-affordance |

Avant toute story UI, lire la section **checklist** ci-dessous et les **Dev Notes** / AC de la story (souvent sous `_bmad-output/implementation-artifacts/`).

---

## Checklist M3 HatCast (implémentation & revue)

Utiliser cette liste **à la fin** de chaque changement sous `apps/web/` (développement, PR, `bmad-code-review`, checkpoint UX). Un point non coché sans justification documentée dans la story = dette UX à traiter ou reporter explicitement.

### Waivers documentés (par story)

Ne pas étendre ces exceptions à d’autres écrans sans décision PO.

| Story | Point checklist | Waiver (as-shipped) | Suivi |
|-------|-----------------|---------------------|-------|
| **19.7** explainability | Cibles tactiles ≥ 48 dp | Segments du pool (`composition-pool-preview`, `composition-draw-animation`) ~36–44 dp ; chevrons carrousel aide = 48 dp | [`19-7-breakdown-explicabilite-par-facteur.md`](../../../_bmad-output/implementation-artifacts/19-7-breakdown-explicabilite-par-facteur.md) § Review Findings |
| **19.7** | Contrôles imbriqués | Trigger `%` dans listes Dispos / picker (HTML imbriqué) — dette a11y connue | idem |
| **19.7** | Barre pool dans fiche | Pas de barre décorative dans `chance-breakdown-sheet` ; résumé rang texte à la place (spec UX W3′) | [`ux-design-factor-breakdown-19-7.md`](../../../_bmad-output/planning-artifacts/ux-design-factor-breakdown-19-7.md) § Amendement as-shipped |

### Composants et structure

- [ ] **Composant Material d’abord** — boutons (`mat-button`, `mat-stroked-button`, `mat-flat-button`), champs (`mat-form-field`), listes (`mat-list`, `mat-table`), dialogs (`MatDialog`), menus (`mat-menu`), chips (`mat-chip`), onglets (`mat-tab-group`), toolbars (`mat-toolbar`) : pas de `<button class="…">` ou div cliquable custom si Material couvre le cas.
- [ ] **Barre d’onglets capsule** — si la story ajoute ou modifie une barre d’onglets page (détail spectacle, Mon compte, paramètres troupe, etc.) : mixin [`_hatcast-pill-tab-bar.scss`](../../../apps/web/src/styles/_hatcast-pill-tab-bar.scss) + spec [ux-design-pill-tab-bar.md](../../../_bmad-output/planning-artifacts/ux-design-pill-tab-bar.md) — pas de styles tab ad hoc ni ancien pattern `opacity: 0.75` / `rgba(255,255,255,0.1)`.
- [ ] **Icônes** — `mat-icon` + noms [Material Symbols](https://fonts.google.com/icons) déjà utilisés dans l’app (`calendar_month`, `groups`, `settings`, etc.) ; `aria-hidden="true"` sur l’icône décorative si un libellé texte ou `aria-label` porte le sens.
- [ ] **Dialogs / bottom sheets** — `MatDialog` (ou pattern documenté dans la story) ; pas de overlay maison pour des flux modaux standard.
- [ ] **Fermeture dialog** — type identifié (formulaire / consultation / picker — cf. [`ux-design-dialog-patterns.md`](../../../_bmad-output/planning-artifacts/ux-design-dialog-patterns.md)) ; libellé dismiss conforme (**Annuler** / **Fermer** / **Plus tard**) ; dismiss en `mat-button` ; **pas** de croix header **et** bouton texte footer sur un dialog standard ; pickers filtre = exception documentée (✕ + Appliquer).
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
| ✕ header + « Fermer » footer sur dialog standard | Une seule affordance (footer texte) — voir `ux-design-dialog-patterns.md` |
| `mat-icon-button` close sur dialog formulaire / consultation | `app-hatcast-dialog-dismiss` ; ✕ réservé à `app-hatcast-picker-header` (sheet) |
| Dismiss ad hoc (`mat-flat-button`, libellé anglais…) | `app-hatcast-dialog-dismiss` avec clé typée |
| `mat-flat-button` pour le seul dismiss | `mat-button` pour Annuler / Fermer |
| Nouvelle barre de navigation basse globale | Top app bar + rail desktop (spec hub) |
| Barre d’onglets sans coque / styles tab dupliqués par page | Mixin `_hatcast-pill-tab-bar.scss` + [ux-design-pill-tab-bar.md](../../../_bmad-output/planning-artifacts/ux-design-pill-tab-bar.md) |
| Dupliquer la logique « dernière saison » / agenda | `LastVisitedSeasonShortcutService`, `member-cross-nav` |

### Références code (bons patterns)

- Footers modales : [`apps/web/src/styles/_hatcast-dialog-actions.scss`](../../../apps/web/src/styles/_hatcast-dialog-actions.scss) — dismiss `mat-button`, cibles 3 rem ; actions contenu `.hatcast-dialog-content-actions`.
- Garde-fou dismiss : [`apps/web/src/app/shared/dialog-chrome/`](../../../apps/web/src/app/shared/dialog-chrome/) — `app-hatcast-dialog-dismiss` (libellé typé `annuler` \| `fermer` \| `plus_tard`) sur dialogs standard ; `app-hatcast-picker-header` **uniquement** sur pickers filtre (✕ + drag = sheet seulement).
- Raccourcis membre : [`apps/web/src/app/shared/member-cross-nav/`](../../../apps/web/src/app/shared/member-cross-nav/) — `mat-stroked-button`, `routerLink`, `aria-label`, ellipsis mobile.
- Thème M3 global : [`apps/web/src/styles.scss`](../../../apps/web/src/styles.scss).
- **Charte sémantique participation** : [`apps/web/src/styles/_hatcast-semantic-colors.scss`](../../../apps/web/src/styles/_hatcast-semantic-colors.scss) (dispo, sélection, en attente, désistement, indispo ; cartes agenda [`_hatcast-agenda-event-card.scss`](../../../apps/web/src/styles/_hatcast-agenda-event-card.scss) ; badges [`_hatcast-agenda-event-badges.scss`](../../../apps/web/src/styles/_hatcast-agenda-event-badges.scss) + [`_hatcast-agenda-dispo-badge.scss`](../../../apps/web/src/styles/_hatcast-agenda-dispo-badge.scss)).
- Helpers : [`availability-status.ts`](../../../apps/web/src/app/core/availability/availability-status.ts) (dispo pure), [`participation-status.ts`](../../../apps/web/src/app/core/participation/participation-status.ts) (chart, équipe, badges étendus).
- Spec UX : [`ux-design-participation-semantic-colors.md`](../../../_bmad-output/planning-artifacts/ux-design-participation-semantic-colors.md).
- Tokens dans les features : `event-detail`, `admin-membres`, `user-agenda` (fichiers `*.scss` avec `--mat-sys-*`, `--hatcast-participation-*` ou alias `--hatcast-availability-*`).
- Détail spectacle — header + titre inline + statut Équipe : [`event-detail-header.html`](../../../apps/web/src/app/pages/event-detail/event-detail-header.html) (chevron + titre projeté), [`event-equipe-tab.html`](../../../apps/web/src/app/pages/event-detail/event-equipe-tab.html) (`app-composition-equipe-status-header`), [`event-infos-tab.html`](../../../apps/web/src/app/pages/event-detail/event-infos-tab.html) (section **Saison**), specs [ux-design-ma-troupe-hub.md](../../../_bmad-output/planning-artifacts/ux-design-ma-troupe-hub.md) ED1–ED5 et [ux-design-event-detail-title-row-2026-06-06.md](../../../_bmad-output/planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md).
- Chips rôles événement : [`role-toggle-chip-set`](../../../apps/web/src/app/shared/event-roles/role-toggle-chip-set/) (sélection) + [`role-display-chip-set`](../../../apps/web/src/app/shared/event-roles/role-display-chip-set/) (lecture seule) + [`role-action-chip`](../../../apps/web/src/app/shared/event-roles/role-action-chip/) (action unitaire, ex. équipe) ; spec [ux-design-role-toggle-chips.md](../../../_bmad-output/planning-artifacts/ux-design-role-toggle-chips.md) ; référence filtre admin [`membres-tab.html`](../../../apps/web/src/app/pages/admin-membres/membres-tab.html).
- Barre d’onglets capsule : [`_hatcast-pill-tab-bar.scss`](../../../apps/web/src/styles/_hatcast-pill-tab-bar.scss) — `@include pill-tabs.group()` / `nav-bar()` ; spec [ux-design-pill-tab-bar.md](../../../_bmad-output/planning-artifacts/ux-design-pill-tab-bar.md) ; surfaces [`event-detail.scss`](../../../apps/web/src/app/pages/event-detail/event-detail.scss), [`account-placeholder.scss`](../../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss), [`troupe-settings.scss`](../../../apps/web/src/app/pages/troupe-settings/troupe-settings.scss).

### Couleurs sémantiques — participation

Spec UX normative : [`ux-design-participation-semantic-colors.md`](../../../_bmad-output/planning-artifacts/ux-design-participation-semantic-colors.md).

#### États et tokens (`-gradient-strong`)

| État | Signification | Token |
|------|---------------|-------|
| Disponible | Dispo saisie (sans sélection) | `--hatcast-participation-available-gradient-strong` |
| Sélection / dans l'équipe | Slot confirmé ou assigné | `--hatcast-participation-selected-gradient-strong` |
| En attente de confirmation | Sélectionné, participation non confirmée | `--hatcast-participation-pending-gradient-strong` |
| Retrait (déclinaison ou désistement) | Participation plus dans la compo — voir [DOMAIN.md § Participation](../../DOMAIN.md#participation--déclinaison-désistement-et-retrait-v2-normative) | `--hatcast-participation-declined-gradient-strong` |
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
| Onglet Dispos (sondage — story 5.8) | `availability-poll-row.scss`, `availability-poll.scss`, `event-dispos-tab.scss` |
| Onglet Dispos (dialog agenda — formulaire) | `availability-form.scss` |
| Onglet Équipe (lignes + badge désistements + header statut) | `event-equipe-tab.scss`, `composition-equipe-status-header.scss` |
| Grille Statistiques — cellules événement (mois déplié) | `participation-event-cell.scss` |

#### Règles de rendu sur `-gradient-strong`

- Texte et icônes : `#fff`
- Bordure : `color-mix(in srgb, #fff 32%, transparent)`
- **Interdit** dans les features : hex/rgba de participation ; consommer uniquement les variables CSS
- **Exception** : les hex V1 ci-dessus ne vivent que dans `_hatcast-semantic-colors.scss`

**Chances de tirage (grille Dispos « Tous »)** — sémantique **distincte** : `--hatcast-chance-high` / `-medium` / `-low` (probabilité, pas état de participation).

**Helpers BEM :** `participationChartModifier()`, `participationSlotRowModifier()`, `participationBadgeModifier()`, `availabilityBadgeModifier()` (dispo pure).

### Onglet Dispos — vue sondage (baseline figée 2026-06-09)

**Spec UX normative :** [_bmad-output/planning-artifacts/ux-design-dispos-poll-as-built-2026-06-09.md](../../../_bmad-output/planning-artifacts/ux-design-dispos-poll-as-built-2026-06-09.md) — **lire avant tout changement** sur `app-availability-poll`, `app-availability-poll-row`, toolbar proxy de `app-event-dispos-tab`.

| Composant | Fichiers |
|-----------|----------|
| Liste sondage | `availability-poll.ts`, `availability-poll.html`, `availability-poll.scss` |
| Ligne vote | `availability-poll-row.ts`, `availability-poll-row.html`, `availability-poll-row.scss` |
| Toolbar orga | `event-dispos-tab.scss` (`.event-dispos__toolbar`, `.event-dispos__proxy-hint`) |
| Tokens proxy | `styles.scss` (`--hatcast-proxy-banner-*`) |

**Layout obligatoire :**

- **Mobile ≤ 480 px** — 2 lignes par vote : L1 = case + libellé + compteur + avatars ; L2 = jauge pleine largeur. Grille CSS **uniquement** dans `@media (max-width: 480px)` ; `.poll-row__gauge-row { display: contents }`.
- **Desktop > 480 px** — 2 lignes : L1 = case + libellé ; L2 = jauge indentée (`--poll-gauge-indent`) + compteur + avatars en flex. **Défaut** : `.poll-row__main { display: flex; flex-direction: column }` — ne pas appliquer la grille mobile par défaut.

**Régressions connues à éviter :**

- Double indent mobile (`padding-inline-start` + `margin-inline-start` sur le pool-trigger).
- Pré-cochage multi-rôles au premier clic (un toggle = un rôle).
- Bandeau proxy gris (`on-surface`) ou empilé verticalement en mobile.
- Désactivation des rôles quand « Pas disponible » est coché (as-built : rôles restent éditables sauf read-only / archivé).

**Tests :** `availability-poll.spec.ts`, `event-dispos-tab.spec.ts` + checklist § anti-régression du doc as-built.

### Stories et agents

- Chaque **story UI** doit référencer ce fichier et **UX-DR11**, et reprendre la section **« Acceptance Criteria — Material 3 (UI) »** du modèle [`story-template.md`](../../../_bmad-output/implementation-artifacts/story-template.md) (AC **M3-1** … **M3-5**, adaptés au périmètre).
- En fin de tâche, l’agent cite dans le résumé les points checklist **non applicables** et ceux **validés** ; toute dérive volontaire est notée dans la story ou `ISSUES.md`.

---

## Grille de revue rapide (copier dans une PR / checkpoint)

```text
M3 HatCast — revue UI
[ ] Composants Material (pas de contrôles HTML custom équivalents)
[ ] Fermeture dialog conforme (ux-design-dialog-patterns.md)
[ ] Couleurs / typo : --mat-sys-* uniquement (ou color-mix documenté)
[ ] Mobile ≤480px : lisible, pas de chevauchement chrome
[ ] Touch + aria-label si label masqué
[ ] Pas bottom app bar M2 ; nav conforme spec hub si dans le scope
[ ] Copy FR ; réutilisation shared/ existant
[ ] Tests unitaires des templates touchés (repo norm)
```
