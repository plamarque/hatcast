# Story 17.25 : Menu compte — rail footer (desktop) · avatar shell (mobile)

Status: done

<!-- Contexte UX formalisé 2026-05-28 — hub membre § Menu compte -->

## Story

En tant que **membre connecté**,  
je veux accéder à **Mon compte**, **Installer l'app** et **Se déconnecter** depuis un **emplacement stable** qui ne mange pas la place des titres et filtres,  
afin de **naviguer plus sereinement** entre Accueil, Agenda et Stats tout en gardant le compte à portée de main.

## Acceptance Criteria

1. **Given** une route où `shouldShowMemberNav(url)` est **true** ([`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts)) et viewport **≥ 840 px**, **when** le shell membre s’affiche, **then** un trigger **Menu compte** apparaît en **bas du rail** (`member-nav`) : avatar + libellé tronqué (displayName ou email) + icône `expand_less` / chevron ; **and** les headers de page **ne contiennent plus** de bouton menu compte dupliqué. [Source: ux-hub-a-faire.md § Menu compte 2026-05-28]
2. **Given** les mêmes routes et viewport **< 840 px**, **when** le shell s’affiche, **then** un trigger **avatar seul** (pas de nom, pas de `expand_more` dans le header de page) est affiché en **haut à droite du shell** (`member-shell`) ; **and** les headers de page **ne dupliquent pas** ce trigger. [Source: ux-hub § wireframes mobile]
3. **Given** le trigger (rail ou shell), **when** l’utilisateur l’ouvre, **then** un **`mat-menu`** affiche les entrées de [`app-user-account-menu-items`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) : **Mon compte** (masqué si déjà sur `/compte`), **Installer l'app** (si PWA non installée), **Se déconnecter** — comportement identique à l’existant. [Source: FR40 partiel ; story 2.6 / menu existant]
4. **Given** la route **`/compte`**, **when** la page ou le shell rend le chrome, **then** **aucun** trigger menu compte (ni rail footer, ni shell mobile) — déconnexion et actions sensibles restent **dans la page** ([ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C8). [Source: story **17.24**]
5. **Given** une route **sans** nav globale (`/connexion`, flux mot de passe, ou hors `shouldShowMemberNav`), **when** un header local proposait déjà le menu compte, **then** le comportement **reste local** (pas de régression) jusqu’à rattachement futur au shell. [Source: ux-hub § routes legacy]
6. **Given** le rail desktop, **when** rendu, **then** la colonne rail utilise `display: flex; flex-direction: column` avec les **3 destinations** en haut et le **footer compte** poussé en bas (`margin-top: auto` ou équivalent) ; le menu s’ouvre **au-dessus** du trigger (position `mat-menu` / `yPosition="above"`). [Source: pattern Cursor / ChatGPT sidebar]
7. **Given** session non chargée, **when** le trigger serait affiché, **then** le trigger est **masqué** ou désactivé sans erreur console (pas de menu vide). [Source: robustesse UX]
8. **Given** accessibilité, **when** le trigger est visible, **then** `aria-label` français du type « Menu compte : {displayName} » ; zone tactile **≥ 48×48 dp** sur mobile (avatar shell). [Source: NFR-A1 ; FRONTEND_UI.md]
9. **Given** les pages shell suivantes (liste minimale), **when** implémentation terminée, **then** les blocs header `user-btn` / `header-actions` compte sont **retirés** : [`member-home-todo`](../../apps/web/src/app/pages/member-home-todo/), [`user-agenda`](../../apps/web/src/app/pages/user-agenda/), [`member-season-glance`](../../apps/web/src/app/pages/member-season-glance/), [`troupes-list`](../../apps/web/src/app/pages/troupes-list/), [`troupe-hub`](../../apps/web/src/app/pages/troupe-hub/), [`season-header`](../../apps/web/src/app/pages/season-home/season-header.html), [`event-detail-header`](../../apps/web/src/app/pages/event-detail/event-detail-header.html), écrans admin participants/membres listés dans `member-shell-nav-visibility`. [Source: AC 1–2]
10. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false` et `npm run build -w @hatcast/web`, **then** les deux passent avec specs pour : visibilité trigger rail vs shell selon breakpoint, masquage sur `/compte`, menu items (Mon compte masqué sur `/compte`), absence de double trigger sur `/agenda`. [Source: repo norms]

**Couverture produit :** [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Menu compte (2026-05-28) ; **FR40** (PWA install) ; complète **17.22** (nav shell) et **17.24** (page Mon compte). **Hors scope :** 4ᵉ onglet Compte ; navigation drawer / hamburger ; refonte contenu `/compte` ; backend ; entrées menu « Clin d’œil » (retirées du menu — nav **Stats**).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** le trigger et le menu, **when** rendus, **then** `mat-menu` + `mat-menu-item` via `app-user-account-menu-items` ; bouton trigger `mat-button` ou `mat-icon-button` / zone cliquable Material ; `mat-icon` pour chevron ; `app-user-avatar` pour l’avatar — pas de div menu custom. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** les styles du footer rail et du trigger shell, **when** couleurs et bordures, **then** uniquement `var(--mat-sys-*)` / `color-mix` (fond footer aligné `surface-container` du rail). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **≤ 480 px**, **when** le trigger shell est affiché, **then** cible **≥ 48×48 dp** ; **aria-label** français obligatoire (pas de libellé visible). [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** cette story, **when** livrée, **then** **ne pas** ajouter de bottom app bar M2, de 4ᵉ onglet, ni de drawer hamburger ; le menu compte reste **hors** des 3 destinations rail (`home`, `calendar_month`, `insights`). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implémentation terminée, **when** validation, **then** checklist § « Checklist M3 HatCast » dans [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; écarts notés en Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Composant partagé** (AC: 3, 7, 8)
  - [x] Créer `apps/web/src/app/shared/member-account-menu/` (`member-account-menu-trigger.ts`, `.html`, `.scss`, `.spec.ts`) :
    - Charge session (`AuthApiService.ensureHatcastSession` / signal user existant sur pages agenda).
    - Inputs optionnels : `showLogout` (défaut `true`), `variant: 'rail-footer' | 'shell-mobile-icon'`.
    - Réutilise `UserAvatarComponent` + `UserAccountMenuItemsComponent`.
  - [x] Exposer `shouldShowAccountChrome(url): boolean` = `shouldShowMemberNav(url) && path !== '/compte'` (pur, testable).

- [x] **Rail footer desktop** (AC: 1, 6)
  - [x] Étendre [`member-nav.html`](../../apps/web/src/app/shared/member-nav/member-nav.html) : wrapper flex colonne ; footer avec `<app-member-account-menu-trigger variant="rail-footer" />` visible **≥ 840 px** uniquement.
  - [x] SCSS : `margin-top: auto` sur footer ; troncature texte ; menu `yPosition="above"`.

- [x] **Shell mobile trigger** (AC: 2)
  - [x] Étendre [`member-shell.html`](../../apps/web/src/app/layout/member-shell/member-shell.html) : trigger `variant="shell-mobile-icon"` positionné en haut à droite du contenu, **< 840 px**, si `shouldShowAccountChrome`.
  - [x] Éviter chevauchement avec titres : padding-top optionnel sur `.member-shell__content` ou position fixed avec safe-area.

- [x] **Retrait doublons headers** (AC: 9)
  - [x] Supprimer blocs menu compte des pages listées en AC 9 (HTML + imports + SCSS orphelins).
  - [x] Vérifier admin `showLogout: false` : si encore requis sans trigger shell, documenter exception ou passer `showLogout` au composant partagé via route data (défaut `true`).

- [x] **Tests** (AC: 10)
  - [x] `member-account-menu-trigger.spec.ts` : menu items, hide on `/compte`.
  - [x] `member-nav.spec.ts` / `member-shell.spec.ts` : footer présent desktop ; shell icon mobile ; pas de double trigger.
  - [x] `npm run test -w @hatcast/web -- --watch=false` ; `npm run build -w @hatcast/web`.

- [x] **Docs** (AC: 1)
  - [x] Lien story dans [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) (fait en 2026-05-28).
  - [x] Entrée **17.25** dans [`epics.md`](../planning-artifacts/epics.md).

## Dev Notes

### Product and UX rules

- Décision UX : [_bmad-output/planning-artifacts/ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § **Menu compte — placement responsive (2026-05-28)**.
- **M3** : le footer rail est une **extension** du chrome, pas une `NavigationRailItem` supplémentaire.
- **`/compte`** : nav globale **visible** (17.22 / visibilité actuelle) mais **sans** trigger compte — aligné [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C8–C9.
- **17.24** peut livrer la page compte avant ou après 17.25 ; 17.25 ne modifie pas le contenu de `account-placeholder`, seulement le chrome d’accès.

### Suggested layout (desktop)

```text
┌──┬──────────────────────┐
│▣ │ h1 + contenu         │
│▣ │                      │
│▣ │                      │
│──│                      │
│👤│ Nom… ▾               │
└──┴──────────────────────┘
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `mat-menu`, `mat-icon-button` / `mat-button`, `app-user-avatar` |
| Tokens | `--mat-sys-surface-container`, `--mat-sys-on-surface-variant` |
| Réutilisation | `user-account-menu-items.ts`, `user-avatar`, pattern session de `user-agenda.ts` |
| Breakpoint | **840 px** (aligné `member-nav` et ux-hub) |

### Explicit non-goals

- 4ᵉ onglet « Compte » dans `member-nav`.
- Drawer / hamburger pour le compte.
- Déplacer le sélecteur contexte troupe/saison (**17.23**) dans le rail.
- Modifier `PostLoginNavigationService` ou les entrées du menu (pas de retour « Clin d’œil » dans le menu).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.22** | done | Shell + rail ; cette story complète le chrome |
| **17.24** | review/backlog | Page `/compte` ; C8 sans trigger |
| **2.6** | done | Avatar / photo profil |
| **17.23** | done | Ne pas mélanger sélecteur contexte et footer compte |

## Dev Agent Record

### Agent Model Used

Composer (dev-story 17.25)

### Completion Notes List

- Composant `app-member-account-menu-trigger` : variants rail (avatar + libellé + `expand_less`, menu `yPosition="above"`) et shell mobile (icône 48×48 dp, `aria-label` français).
- Visibilité : `shouldShowAccountChrome` / `shouldShowAccountMenuLogout` (admin + fiche événement sans déconnexion).
- Rail : colonne flex desktop avec footer `margin-top: auto` ; shell : trigger **fixe** haut-droite viewport (`position: fixed`) + réserve d’espace headers via `member-shell-mobile-chrome.scss`.
- Fil d’Ariane : logo troupe seul &lt; 840 px ; flex priorité titre spectacle (17.1 / retouches post-review).
- Doublons retirés sur toutes les pages AC 9 ; `seasons-list` / routes hors shell inchangés (AC 5).
- Correctif annexe : `syncFilterQueryParams` remet `skipNextParamReload` après navigation (tests + changements de slug).
- **M3** : mat-menu / mat-button / tokens `--mat-sys-*` ; pas de 4ᵉ onglet ni drawer. Checklist OK (waived : n/a hors scope).

### File List

- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.ts
- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.html
- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.scss
- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.spec.ts
- apps/web/src/app/shared/member-account-menu/member-account-menu-visibility.ts
- apps/web/src/app/shared/member-account-menu/member-account-menu-visibility.spec.ts
- apps/web/src/app/shared/member-nav/member-nav.html
- apps/web/src/app/shared/member-nav/member-nav.scss
- apps/web/src/app/shared/member-nav/member-nav.ts
- apps/web/src/app/shared/member-nav/member-nav.spec.ts
- apps/web/src/app/layout/member-shell/member-shell.html
- apps/web/src/app/layout/member-shell/member-shell.scss
- apps/web/src/app/layout/member-shell/member-shell-mobile-chrome.scss
- apps/web/src/app/layout/member-shell/member-shell.ts
- apps/web/src/app/core/auth/auth-api.service.ts
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.scss
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts
- apps/web/src/app/shared/context-switcher/context-switcher.scss
- apps/web/src/app/pages/event-detail/event-detail-header.scss
- apps/web/src/app/pages/season-home/season-header.scss
- apps/web/src/styles.scss
- apps/web/src/app/layout/member-shell/member-shell.spec.ts
- apps/web/src/app/pages/member-home-todo/member-home-todo.html
- apps/web/src/app/pages/member-home-todo/member-home-todo.ts
- apps/web/src/app/pages/user-agenda/user-agenda.html
- apps/web/src/app/pages/user-agenda/user-agenda.ts
- apps/web/src/app/pages/member-season-glance/member-season-glance.html
- apps/web/src/app/pages/member-season-glance/member-season-glance.ts
- apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts
- apps/web/src/app/pages/troupes-list/troupes-list.html
- apps/web/src/app/pages/troupes-list/troupes-list.ts
- apps/web/src/app/pages/troupe-hub/troupe-hub.html
- apps/web/src/app/pages/troupe-hub/troupe-hub.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.spec.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/event-detail/event-detail-header.html
- apps/web/src/app/pages/event-detail/event-detail-header.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/admin-participants/admin-participants.html
- apps/web/src/app/pages/admin-participants/admin-participants.ts
- apps/web/src/app/pages/admin-event-participants/admin-event-participants.html
- apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts
- apps/web/src/app/pages/admin-membres/admin-membres.html
- apps/web/src/app/pages/admin-membres/admin-membres.ts

### Change Log

- 2026-05-28 : Story créée — formalisation UX menu compte (Patrice + UX).
- 2026-05-28 : Implémentation menu compte rail + shell mobile ; retrait doublons headers ; tests 672/672.
- 2026-05-28 : Retouches UX — avatar shell `position: fixed` (toutes pages shell), fil d’Ariane mobile logo seul + flex titre spectacle, `member-shell-mobile-chrome.scss` ; tests 674/674.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ux-hub, FR40, 17.24)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` / build web mentionnés
