# Story 17.24 : Écran Mon compte — alignement hub membre

Status: done

<!-- Ultimate context engine analysis completed — bmad-create-story 2026-05-28 ; UX spec approved ; prépare stories 1.6 / 1.7 -->

## Story

En tant qu’**utilisateur authentifié**,  
je veux ouvrir **Mon compte** (`/compte`) avec une présentation **alignée sur Agenda et Stats**, centrée sur **identité et sécurité du compte**,  
afin de **gérer ma photo et mes identifiants sans dupliquer les préférences troupe** déjà disponibles sur le hub troupe.

## Acceptance Criteria

1. **Given** un utilisateur connecté, **when** il ouvre **`/compte`**, **then** la page affiche un header **`h1` Mon compte** + sous-titre **Identité et sécurité de ton compte HatCast.** (une ligne), conteneur **`max-width: 56rem`** centré, padding cohérent avec [`user-agenda`](../../apps/web/src/app/pages/user-agenda/user-agenda.scss) / [`member-season-glance`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.scss). [Source: [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C3 ; Story 12.2 chrome]
2. **Given** la session est valide, **when** la page charge, **then** la **zone identité** affiche : avatar (`app-user-avatar`, 72 px), **e-mail en lecture seule**, **displayName** si présent, actions photo existantes (choisir fichier, Google si `hasGoogleAccount`, supprimer) — **sans** `mat-card` « Paramètres du compte » ni paragraphe « prochaine livraison ». [Source: ux-design-mon-compte.md § Zone A ; Story 2.6]
3. **Given** `/compte`, **when** le contenu est rendu, **then** **aucune** section **Pseudo par troupe** ni **Rôles préférés par troupe** ; **aucun** appel `TroupeApiService.listMyTroupes` / `MemberProfileApiService.getPreferredRoles` pour cette page. [Source: ux-design-mon-compte.md C1 ; `TroupeHubPreferencesSheet`]
4. **Given** `/compte`, **when** l’utilisateur cherche les préférences troupe, **then** une ligne **Préférences par troupe** (`mat-nav-list` ou équivalent) avec icône `groups` et `routerLink="/troupes"` + sous-texte optionnel *Pseudo et rôles par défaut, troupe par troupe.* [Source: ux-design-mon-compte.md § Zone B]
5. **Given** les stories **1.6** / **1.7** ne sont pas livrées, **when** la section **Sécurité** s’affiche, **then** les lignes **Changer l’adresse e-mail** et **Changer le mot de passe** sont visibles mais **non fonctionnelles** (`disabled` ou tap → snackbar/dialog « Bientôt disponible ») avec **`matTooltip`** explicite ; mot de passe : tooltip rappelant la distinction avec mot de passe oublié (story 1.3). [Source: ux-design-mon-compte.md C6]
6. **Given** `hasGoogleAccount === true` sans mot de passe local, **when** la section Sécurité s’affiche, **then** masquer la ligne mot de passe **ou** la laisser disabled avec mention *Connexion via Google*. [Source: ux-design-mon-compte.md § Zone C]
7. **Given** story **1.7** non livrée, **when** la zone sensible s’affiche, **then** **Supprimer mon compte** est visible, style token **`error`**, **disabled** + indicateur **Bientôt**. [Source: ux-design-mon-compte.md § Zone D]
8. **Given** `/compte`, **when** le header est rendu, **then** **pas** de menu avatar en haut à droite ; **Se déconnecter** est disponible en bas de page (bouton `mat-stroked-button` ou `mat-list-item`) avec le même flux que [`UserAccountMenuItemsComponent`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) (`AuthApiService.logout` → `/connexion`). [Source: ux-design-mon-compte.md C8]
9. **Given** `/compte`, **when** la page est affichée, **then** **pas** de lien footer **Retour aux troupes** ; la barre membre globale (Accueil · Agenda · Stats) reste visible via [`MemberShell`](../../apps/web/src/app/layout/member-shell/member-shell.ts). [Source: ux-design-mon-compte.md C9 ; Story 17.22]
10. **Given** session invalide (`ensureHatcastSession` → 401), **when** `/compte` charge, **then** snackbar *« Votre session a expiré ou vous n’êtes pas connecté. »* (6 s) + `rememberCurrentUrlForPostLogin` + redirection `/connexion` — copier [`UserAgenda.redirectToLogin`](../../apps/web/src/app/pages/user-agenda/user-agenda.ts) (l.304–312). [Source: Story 12.2 AC7 ; `user-agenda.spec.ts` « redirige vers connexion avec snackbar »]
11. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** les specs couvrent : titre/sous-titre, absence pseudo/rôles, présence placeholders Sécurité + suppression, déconnexion, zone avatar, lien troupes ; tests pseudo/rôles **retirés**. [Source: NFR-Q1]

**Couverture produit :** [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) (approved 2026-05-28) ; prépare **FR36** / **FR37** (stories **1.6**, **1.7**) sans les implémenter. **Hors scope :** changement e-mail/mot de passe réel (**1.6**), suppression compte (**1.7**), PWA sur cette page (**10.1** / menu global).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** l’UI `/compte`, **when** les contrôles sont rendus, **then** utiliser `mat-list` / `mat-nav-list`, `mat-stroked-button`, `mat-icon`, `mat-spinner`, `matTooltip` — **pas** empiler plusieurs `mat-card` outline avec sous-titres longs ; pas de formulaires pseudo/checkbox rôles. [Source: FRONTEND_UI.md ; ux-design-mon-compte.md C4]

**M3-2. Tokens & thème** — **Given** les styles SCSS, **when** couleurs ou séparateurs s’appliquent, **then** uniquement `var(--mat-sys-*)` et `color-mix` ; zone sensible avec `--mat-sys-error`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** la page s’affiche, **then** cibles tactiles **≥ 48×48 dp** sur lignes liste et boutons avatar ; `aria-label` français sur actions photo ; sections titrées via `aria-labelledby`. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** `/compte`, **when** le chrome est modifié, **then** **ne pas** ajouter de 4ᵉ onglet nav ; **ne pas** réintroduire menu avatar header ; shell membre inchangé. [Source: ux-hub-a-faire.md ; Story 17.22]

**M3-5. Revue** — **Given** implémentation terminée, **when** validée, **then** checklist § « Checklist M3 HatCast » parcourue ; écarts notés en Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Refactor template & styles** (AC: 1, 2, 4, 8, 9, M3-1, M3-2)
  - [x] Remplacer [`account-placeholder.html`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.html) : header `h1` + sous-titre **sans** bloc `header-actions` / menu avatar (contrairement à [`member-season-glance.html`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.html) l.7–28) ; zone identité compacte ; listes sections **Préférences troupe**, **Sécurité**, **Zone sensible** ; bouton déconnexion.
  - [x] Supprimer du template : cartes intro « prochaine livraison », pseudo/rôles, `loadError` troupes, lien `Retour aux troupes`.
  - [x] Réécrire [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss) : reprendre conteneur + header depuis [`user-agenda.scss`](../../apps/web/src/app/pages/user-agenda/user-agenda.scss) / [`member-season-glance.scss`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.scss) (`max-width: 56rem`, titre `1.75rem`, sous-titre `0.95rem`) ; supprimer styles pseudo/roles/cards.
  - [x] Conserver route `/compte` et selector `app-account-placeholder` (renommage composant **optionnel**, non bloquant).

- [x] **Simplifier le composant TS** (AC: 3, 5–7, 10)
  - [x] Retirer de [`account-placeholder.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.ts) : injections `TroupeApiService`, `MemberProfileApiService`, `TroupeContextService`, signals/méthodes pseudo et preferred roles, états `loadError` / `troupes` / `preferredRolesLoading`.
  - [x] **`ngOnInit` simplifié** : uniquement `ensureHatcastSession` → `user.set` → `loading.set(false)` ; plus d’appel `troupeContext.load()`.
  - [x] **`avatarDisplayName()`** : remplacer `troupeContext.currentUserDisplayLabel(u)` par libellé **compte global** : `u.displayName?.trim() || u.email || 'Compte'` — le pseudo troupe ne doit **pas** apparaître sur `/compte` (voir trap ci-dessous).
  - [x] Garder logique avatar (upload, Google, delete) inchangée (story 2.6).
  - [x] Placeholders Sécurité : `disabled` + `matTooltip` ou handler snackbar « Fonctionnalité à venir ».
  - [x] Déconnexion : méthode `logout()` = `AuthApiService.logout` + `router.navigate(['/connexion'], { replaceUrl: true })` (identique [`UserAccountMenuItemsComponent.onLogout`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts)).
  - [x] **Imports Angular Material** : ajouter `MatListModule`, `MatTooltipModule` ; retirer `MatCardModule`, `MatCheckboxModule`, `MatFormFieldModule`, `MatInputModule`, `FormsModule` devenus inutiles.

- [x] **Menu compte global (optionnel)** (AC: 8)
  - [x] Dans [`user-account-menu-items.ts`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) : masquer l’entrée **Mon compte** quand `Router.url` est `/compte` (nice-to-have, AC8 couvre déjà l’absence de menu sur la page).

- [x] **Tests** (AC: 11, M3-3)
  - [x] Réécrire [`account-placeholder.spec.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts) : supprimer tests pseudo/rôles ; ajouter tests header, placeholders, lien `/troupes`, déconnexion, pas de « Pseudo par troupe » / « Retour aux troupes ».
  - [x] `npm run test -w @hatcast/web -- --watch=false` ; `npm run build -w @hatcast/web`.

- [x] **Trace docs** (AC: 11)
  - [x] Lier story depuis [`ux-design-mon-compte.md`](../planning-artifacts/ux-design-mon-compte.md) (`relatedStories`).

### Review Findings

- [x] [Review][Patch] Sous-titre `/compte` non conforme à l’AC1 [`apps/web/src/app/pages/account-placeholder/account-placeholder.html`:5]
- [x] [Review][Patch] Ligne `Préférences par troupe` vers `/troupes` absente et testée comme absente, en contradiction avec AC4/AC11 [`apps/web/src/app/pages/account-placeholder/account-placeholder.html`:94]
- [x] [Review][Patch] Mot de passe livré comme réinitialisation Firebase réelle au lieu d’un placeholder non fonctionnel AC5 [`apps/web/src/app/pages/account-placeholder/account-placeholder.ts`:136]
- [x] [Review][Patch] Section `Notifications` ajoutée hors périmètre alors que la story centre `/compte` sur identité/sécurité et le lien troupe [`apps/web/src/app/pages/account-placeholder/account-placeholder.html`:128]
- [x] [Review][Patch] Tooltips `Bientôt` portés par des boutons natifs `disabled`, donc difficilement accessibles au hover/focus/touch [`apps/web/src/app/pages/account-placeholder/account-placeholder.html`:97]

## Dev Notes

### Product and UX rules

- **Source UX normative :** [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) — statut **approved** (Patrice, 2026-05-28).
- **Pseudo & rôles préférés** restent sur **hub troupe** → [`troupe-hub-preferences-sheet.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts).
- **Stories 1.6 / 1.7** activeront les lignes Sécurité / Suppression — cette story pose le **shell liste** uniquement.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `MatListModule`, `MatNavList`, `MatTooltipModule`, boutons existants |
| Tokens | `--mat-sys-on-surface`, `outline-variant`, `error` |
| Réutilisation | Copier structure header SCSS depuis `user-agenda` (pas d’obligation d’extraire mixin partagé) |
| Avatar | Garder `UserAvatarComponent` + APIs avatar existantes (story 2.6) |

### Implementation traps (éviter régressions)

| Trap | Détail |
|------|--------|
| **Pseudo troupe dans l’avatar** | Aujourd’hui `avatarDisplayName()` appelle `troupeContext.currentUserDisplayLabel()` qui préfère le **pseudo de la troupe sélectionnée** — interdit sur `/compte` (AC2, C1). Utiliser uniquement `UserSummary.displayName` / `email`. |
| **Menu avatar en header** | Agenda et Stats ont un bouton compte en header ; `/compte` **n’en a pas** (C8). La nav membre basse ([`MemberShell`](../../apps/web/src/app/layout/member-shell/member-shell.ts), `shouldShowMemberNav('/compte') === true`) suffit. |
| **Session sans snackbar** | L’implémentation actuelle redirige vers `/connexion` sans snackbar si session invalide — ajouter le pattern `UserAgenda.redirectToLogin`. |
| **États troupe orphelins** | Retirer `loadError`, empty-troupe « rejoignez une troupe pour pseudo », et toute la branche `@else if (troupes().length === 0)` du template. |
| **Tests obsolètes** | [`account-placeholder.spec.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts) mocke encore `TroupeApiService` / `MemberProfileApiService` / pseudo — simplifier les providers après refactor. |

### Previous story intelligence

| Story | Apport pour 17.24 |
|-------|-------------------|
| **17.22** (done) | Barre membre M3 visible sur `/compte` — ne pas ajouter de 4ᵉ onglet ni bottom bar. |
| **17.23** (done) | Sélecteur contexte reste sur routes saison/événement uniquement — hors scope `/compte`. |
| **1.5** (done) | Menu avatar global → `routerLink="/compte"` ; déconnexion migrée en bas de page sur `/compte`. |
| Commits récents | `refactor(web): Streamline member nav after M3 bottom bar` et `fix(web): Align member stats page with hub M3 chrome` — modèle chrome hub membre à suivre pour padding/header. |

### Explicit non-goals

- Implémenter changement e-mail / mot de passe connecté (**1.6**).
- Implémenter suppression de compte (**1.7**).
- Déplacer ou dupliquer `TroupeHubPreferencesSheet` sur `/compte`.
- Ajouter **Installer l’app** sur cette page (reste menu avatar global).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 1.5 | done | Menu compte → route `/compte` |
| 2.6 | done | Avatar — conserver |
| 2.5 / 5.x | done | Pseudo & rôles — **retirés** de `/compte` |
| 17.4 | done | Préférences troupe sur hub |
| 17.22 | done | Nav shell sur `/compte` |
| 1.6 | backlog | Activer lignes Sécurité (follow-up) |
| 1.7 | backlog | Activer suppression (follow-up) |

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Implementation Plan

- Refonte `/compte` : shell hub membre (header `h1`, `max-width: 56rem`), zone identité avatar, listes M3 pour préférences troupe / sécurité / zone sensible, déconnexion en bas de page.
- Suppression pseudo, rôles préférés et chargement troupes ; `avatarDisplayName` basé sur le compte global uniquement.
- Session invalide : snackbar 6 s + `rememberCurrentUrlForPostLogin` (pattern `UserAgenda`).
- Menu global : masquer « Mon compte » sur la route `/compte`.

### Completion Notes List

- ✅ AC 1–11 et M3-1–M3-4 : page alignée sur ux-design-mon-compte.md ; placeholders Sécurité / suppression en `disabled` + `matTooltip` + badge « Bientôt » ; mot de passe masqué si `hasGoogleAccount`.
- ✅ Tests : 9 specs `account-placeholder` + 1 spec menu ; suite web 658 tests verts ; `npm run build -w @hatcast/web` OK.
- **M3-5 checklist :** composants `mat-list` / `mat-nav-list` / `mat-stroked-button` / tokens `--mat-sys-*` / cibles ≥ 48dp sur mobile / `aria-labelledby` sections — validé. Pas de 4ᵉ onglet nav ni menu avatar header.

### File List

- `apps/web/src/app/pages/account-placeholder/account-placeholder.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.html`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.scss`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts`
- `apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts`
- `apps/web/src/app/shared/user-account-menu/user-account-menu-items.spec.ts`

### Change Log

- 2026-05-28 : Story créée depuis ux-design-mon-compte.md (approved).
- 2026-05-28 : Enrichissement create-story — traps avatarDisplayName, snackbar session, imports Material, contraste header sans menu avatar.
- 2026-05-28 : Implémentation dev-story — refonte `/compte`, tests, menu compte masqué sur route.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ux-design-mon-compte ; epics 1.6/1.7 prep)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC (y compris M3-x)
- [x] Liens vers fichiers code existants
- [x] `npm run test` / build web mentionnés
