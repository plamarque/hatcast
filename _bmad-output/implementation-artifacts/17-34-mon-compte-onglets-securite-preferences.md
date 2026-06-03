---
baseline_commit: 959408d2299e2486cdda08b429fd793d9e0c0d65
---

# Story 17.34 : Mon compte — onglets (Identité · Préférences · Notifications · Sécurité · À propos)

Status: done

## Story

En tant que **membre HatCast connecté**,  
je veux **parcourir Mon compte via des onglets clairs** au lieu d’une longue page,  
afin de **retrouver rapidement identité, préférences globales, notifications, sécurité et version de l’app**.

## Acceptance Criteria

1. **Given** un utilisateur authentifié, **when** il ouvre **`/compte`**, **then** la page affiche le header hub membre (`h1` **Mon compte**, sous-titre **Paramètres de votre compte HatCast.**), une barre **`mat-tab-nav-bar`** avec **5 onglets** (Identité · Préférences · Notifications · Sécurité · À propos), le contenu de l’onglet actif, et le bouton **Se déconnecter** **uniquement** sur l’onglet **Identité** (pas sur les autres onglets). [Source: [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C3–C4, C8b ; story **17.24** chrome]
2. **Given** la barre d’onglets, **when** l’utilisateur navigue, **then** chaque onglet a une **route enfant** dédiée et le lien actif est synchronisé (`routerLink` + `routerLinkActive` / `[active]`) :

   | Onglet | Route | Contenu |
   |--------|-------|---------|
   | Identité | `/compte` (path enfant `''`) | Avatar, email lecture seule, `displayName` si présent — logique photo story **2.6** inchangée |
   | Préférences | `/compte/preferences` | [`MemberPreferencesForm`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts) — pseudo + rôles **globaux** (story **17.33**) |
   | Notifications | `/compte/notifications` | [`PushNotificationsSection`](../../apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts) puis [`NotificationPreferencesSection`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts) |
   | Sécurité | `/compte/securite` | Placeholders email / MDP (**1.6**) + hint Google-only + **Zone sensible** (suppression compte **1.7**) en bas, séparée visuellement — **pas d’onglet « Zone sensible » séparé** |
   | À propos | `/compte/a-propos` | Bloc version `data-testid="account-app-version"` + dialog changelog (**10.3**) |

3. **Given** une navigation vers **`/compte#notifications`** (legacy story **10.6**), **when** la page charge, **then** redirection vers **`/compte/notifications`** (`replaceUrl: true`) ; mettre à jour [`PushOptInDialog`](../../apps/web/src/app/shared/push/push-opt-in-dialog/push-opt-in-dialog.ts) pour naviguer directement vers `/compte/notifications` (plus de fragment).
4. **Given** `/compte` ou toute route **`/compte/*`**, **when** le shell membre rend le chrome, **then** la **nav globale** (Accueil · Agenda · Stats) reste visible ; **aucun** trigger menu compte (rail footer, avatar shell) — même règle qu’avant **17.25** / C8a. [Source: ux-design-mon-compte.md C8a–C9]
5. **Given** les stories **1.6** / **1.7** non livrées, **when** l’onglet **Sécurité** s’affiche, **then** les lignes e-mail, mot de passe (si applicable) et suppression restent **disabled** + badge **Bientôt** + `matTooltip` — comportement identique à l’actuel `account-placeholder.html`, sans régression des `data-testid` existants.
6. **Given** `hasGoogleAccount === true`, **when** l’onglet Sécurité s’affiche, **then** pas de ligne mot de passe ; hint *Connexion via Google* conservé (`data-testid="account-google-password-hint"`).
7. **Given** session invalide, **when** le shell `/compte` charge, **then** même flux qu’aujourd’hui : snackbar session expirée, `rememberCurrentUrlForPostLogin`, redirect `/connexion` — **y compris** depuis une route enfant (`/compte/notifications`, etc.).
8. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** les tests passent ; specs `account-placeholder` (ou shell + onglets) couvrent navigation onglets, deep link notifications, placeholders sécurité, version/changelog, déconnexion, session invalide.

**Couverture produit :** P0 V2.0.0 cutover ([sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md)) ; UX [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) (approved 2026-06-03).

**Hors scope :** implémentation réelle changement e-mail / MDP (**1.6**), suppression compte (**1.7**), contenu API préférences (**17.33** — déjà done), liens GitHub/MIT dans À propos, PWA install sur `/compte`.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** la navigation interne Mon compte, **when** les onglets sont rendus, **then** utiliser **`MatTabNav`**, **`MatTabLink`**, **`MatTabNavPanel`** + **`router-outlet`** (pattern identique à [`member-nav.html`](../../apps/web/src/app/shared/member-nav/member-nav.html)) — pas de `mat-tab-group` avec contenu inline dupliqué par `@if`. Contenu onglets : composants existants (`mat-list`, `mat-stroked-button`, formulaires Material). [Source: FRONTEND_UI.md ; ux-design-mon-compte.md C4]

**M3-2. Tokens & thème** — **Given** les styles du shell et des onglets, **when** couleurs / séparateurs, **then** `var(--mat-sys-*)` uniquement ; zone sensible en `error` / `outline-variant` — reprendre [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss).

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** la barre d’onglets s’affiche, **then** tabs **scrollables horizontalement** ; cibles ≥ 48dp ; libellés onglets visibles (pas icon-only). [Source: ux-design-mon-compte.md wireframe mobile]

**M3-4. Navigation membre** — **Given** toute route `/compte` ou `/compte/*`, **when** chrome global, **then** **ne pas** ajouter de 5ᵉ entrée « Compte » dans la nav membre ; ne pas introduire de bottom app bar M2 supplémentaire. [Source: ux-hub-a-faire.md ; C9]

**M3-5. Revue** — **Given** implémentation terminée, **when** validation story, **then** checklist M3 FRONTEND_UI.md parcourue ; écarts notés en Dev Notes.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` uniquement — refactor layout `/compte`, routes enfants, helpers visibilité shell, deep link 10.6.
- [x] **AC 1–2 — Shell + routes** — Transformer [`AccountPlaceholder`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.ts) en **shell** (session, header, tabs, logout, `<router-outlet>`) ; enregistrer routes enfants dans [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) sous `path: 'compte'`.
- [x] **AC 2 — Onglets contenu** — Extraire le contenu actuel de `account-placeholder.html` en composants onglet (recommandé : `pages/account/account-*-tab/` ou sous-dossier `account-placeholder/tabs/`) ; **déplacer** sans changer la logique métier (avatar, placeholders, version).
- [x] **AC 3 — Deep link** — Guard ou `ngOnInit` shell : fragment `#notifications` → `/compte/notifications` ; patch `push-opt-in-dialog.ts` + spec associée.
- [x] **AC 4 — Visibilité shell** — Étendre [`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts) : matcher **`/compte` et `/compte/*`** pour `shouldShowMemberNav`. Étendre [`member-account-menu-visibility.ts`](../../apps/web/src/app/shared/member-account-menu/member-account-menu-visibility.ts) et [`user-account-menu-items.ts`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) : masquer menu compte sur **tout** préfixe `/compte`.
- [x] **AC 5–7 — Régressions** — Conserver tous les `data-testid` listés ci-dessous ; session gate au niveau shell (enfants ne chargent pas si redirect login).
- [x] **AC 8 — Tests** — Mettre à jour `account-placeholder.spec.ts` + specs visibilité shell/menu ; ajouter tests navigation onglets et redirect `#notifications`.
- [x] **Docs** — Lier cette story depuis [`ux-design-mon-compte.md`](../planning-artifacts/ux-design-mon-compte.md) (`relatedStories` déjà **17.34**).

---

## Dev Notes

### Product and UX rules

- Spec normative : [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) (approved 2026-06-03). Layout scroll **17.24** est **obsolète** ; le contenu fonctionnel est **réparti**, pas supprimé.
- **5 onglets**, pas 6 : « Zone sensible » = sous-section de **Sécurité** (C10).
- Sous-titre header : **Paramètres de votre compte HatCast.** (remplace *Identité et sécurité…*).
- Onglet **Préférences** : pseudo + rôles **globaux** (C2) — ne pas réintroduire pseudo par troupe ni lien `/troupes`.
- **Déconnexion** sur l’onglet **Identité** uniquement (C8b) — pas de footer global sous le `router-outlet`.

### Current state (READ before coding)

| Fichier | État actuel | Ce que 17.34 change |
|---------|-------------|---------------------|
| `account-placeholder.ts/html/scss` | Page scroll unique : identité, préférences, notifications, sécurité, à propos, logout | Devient **shell** + extraction contenu vers onglets / `router-outlet` |
| `app.routes.ts` | `{ path: 'compte', component: AccountPlaceholder }` | `compte` + **children** (5 paths) |
| `member-shell-nav-visibility.ts` | `/^\/compte$/` seulement | Doit inclure `/compte/preferences`, etc. |
| `member-account-menu-visibility.ts` | `path !== '/compte'` | `!path.startsWith('/compte')` (ou helper `isAccountPath`) |
| `push-opt-in-dialog.ts` | `navigate(['/compte'], { fragment: 'notifications' })` | `navigate(['/compte/notifications'])` |

### Recommended routing shape

```typescript
{
  path: 'compte',
  component: AccountPlaceholder, // shell: header, tabs, logout, session
  children: [
    { path: '', component: AccountIdentityTab },
    { path: 'preferences', component: AccountPreferencesTab },
    { path: 'notifications', component: AccountNotificationsTab },
    { path: 'securite', component: AccountSecurityTab },
    { path: 'a-propos', component: AccountAboutTab },
  ],
}
```

- **`/compte`** → Identité (path enfant vide).
- Optionnel : alias `/compte/identite` → redirect `''` (non requis si UX accepte `/compte` seul).

### Tab bar implementation pattern

Réutiliser le pattern [`member-nav`](../../apps/web/src/app/shared/member-nav/member-nav.ts) :

```html
<nav mat-tab-nav-bar [tabPanel]="accountTabPanel" aria-label="Sections Mon compte">
  <a mat-tab-link routerLink="/compte" routerLinkActive #identityRla="routerLinkActive"
     [active]="identityRla.isActive" [routerLinkActiveOptions]="{ exact: true }">Identité</a>
  <!-- … autres onglets avec routerLink non-exact … -->
</nav>
<mat-tab-nav-panel #accountTabPanel />
<router-outlet />
```

- **`routerLinkActiveOptions: { exact: true }`** sur Identité pour éviter que `/compte/preferences` active aussi Identité.
- Icônes M3 optionnelles dans le label (`person`, `tune`, …) — texte seul acceptable si place insuffisante sur mobile ; préférer icône + label court si ça tient.

### Session and shared user state

- Conserver **`ensureHatcastSession()`** dans le **shell** (comme aujourd’hui `ngOnInit`).
- Exposer `user` au tab Identité via :
  - **Option A (recommandée)** : signal `user` sur le shell + `@Input()` ou `inject` d’un petit `AccountPageContext` service fourni au shell ;
  - **Option B** : re-fetch session par onglet — **à éviter** (appels API dupliqués).
- Avatar upload/delete : reste dans l’onglet Identité ; mettre à jour le signal `user` partagé après succès.

### data-testid to preserve (regression checklist)

| testid | Onglet |
|--------|--------|
| `account-avatar-menu-trigger`, `account-avatar-choose`, `account-avatar-google`, `account-avatar-delete` | Identité |
| `member-preferences-save` | Préférences |
| `account-change-email`, `account-reset-password`, `account-google-password-hint`, `account-delete` | Sécurité |
| `account-app-version` | À propos |
| `account-logout` | Identité |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `MatTabNav`, `MatTabLink`, `MatTabNavPanel`, `RouterLink`, `RouterLinkActive` |
| Tokens | Reprendre classes `account-page__*` existantes ; pas de hex |
| Réutilisation | **Ne pas** réécrire `MemberPreferencesForm`, push, notification prefs, changelog — **déplacer** les sélecteurs existants |
| Nav shell | Mettre à jour **tous** les tests/specs qui comparent `path === '/compte'` en dur |

### Explicit non-goals

- Pas de changement API / backend.
- Pas d’activation des flows **1.6** / **1.7**.
- Pas de refonte copy des sections push/notifications au-delà du déplacement.
- Pas de renommage public du selector `app-account-placeholder` (optionnel interne).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.24** | done | Chrome hub membre — structure scroll remplacée |
| **17.25** | done | Menu compte masqué sur `/compte` — étendre à `/compte/*` |
| **17.33** | done | Contenu onglet Préférences — ne pas modifier l’API |
| **8.1** / **8.2** | done | Contenu onglet Notifications |
| **10.3** | done | Contenu onglet À propos — déplacer bloc version seulement |
| **10.6** | done | Deep link à migrer vers route enfant |
| **1.6** / **1.7** | backlog | Placeholders Sécurité — hors scope activation |

### Testing requirements

```bash
npm run test -w @hatcast/web -- --watch=false
```

Cas minimum :

- Header + sous-titre mis à jour.
- Clic / navigation vers chaque onglet → URL + contenu attendu.
- `/compte#notifications` → `/compte/notifications`.
- Placeholders sécurité + Google-only inchangés.
- Version + changelog sur À propos.
- Logout + session invalide.
- `shouldShowMemberNav('/compte/notifications') === true`.
- `shouldShowAccountChrome('/compte/securite') === false`.

### Previous story intelligence (17.33)

- `MemberPreferencesForm` appelle `MePreferencesApiService` — **pas** de boucle troupes ; conserver tel quel dans l’onglet Préférences.
- Tests web 17.33 : `member-preferences-form.spec.ts` — ne pas casser en extrayant l’onglet.

### Project context reference

- [project-context.md](../../project-context.md) — Material 3, `apps/web/`, tests obligatoires.
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — checklist M3.

---

## Amendement UX — déconnexion header (2026-06-03)

**Contexte :** Sur `/compte`, le menu avatar est masqué (C8a) ; la déconnexion dans l’onglet Identité seule obligeait un changement d’onglet.

**Changement :** C8b révisé — **Se déconnecter** dans le **header** `account-placeholder` (droite du `h1`), visible sur **tous** les onglets ; retiré de `account-identity-tab`.

**Spec :** [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C8b (amendement révisé 2026-06-03).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- Refactored `AccountPlaceholder` into tab shell with `MatTabNav` + `router-outlet` (5 tabs, logout below tabs).
- Extracted tab components under `account-placeholder/tabs/`; shared user/avatar state via `AccountPageContext`.
- Child routes: `/compte`, `/compte/preferences`, `/compte/notifications`, `/compte/securite`, `/compte/a-propos`.
- Legacy `#notifications` fragment redirects to `/compte/notifications`; `PushOptInDialog` updated.
- Extended `isAccountPath` / nav visibility for all `/compte/*` routes; post-login redirect allows compte child paths.
- All 913 web unit tests pass (`npm run test -w @hatcast/web -- --watch=false`).

**M3 checklist:** M3-1 MatTabNav/Link/Panel ✓ · M3-2 tokens `--mat-sys-*` ✓ · M3-3 scrollable tabs mobile ✓ · M3-4 no extra nav entry ✓ · M3-5 validated.

### File List

- apps/web/src/app/app.routes.ts
- apps/web/src/app/core/navigation/post-login-redirect-storage.ts
- apps/web/src/app/core/navigation/post-login-redirect-storage.spec.ts
- apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts
- apps/web/src/app/layout/member-shell/member-shell-nav-visibility.spec.ts
- apps/web/src/app/pages/account-placeholder/account-page-context.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.scss
- apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.html
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.html
- apps/web/src/app/pages/account-placeholder/tabs/account-notifications-tab.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-notifications-tab.html
- apps/web/src/app/pages/account-placeholder/tabs/account-preferences-tab.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-preferences-tab.html
- apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.html
- apps/web/src/app/shared/member-account-menu/member-account-menu-visibility.ts
- apps/web/src/app/shared/member-account-menu/member-account-menu-visibility.spec.ts
- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.spec.ts
- apps/web/src/app/shared/push/push-opt-in-dialog/push-opt-in-dialog.ts
- apps/web/src/app/shared/push/push-opt-in-dialog/push-opt-in-dialog.spec.ts
- apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts
- apps/web/src/app/shared/user-account-menu/user-account-menu-items.spec.ts

### Change Log

- 2026-06-03 : Story créée (`bmad-create-story`) — onglets Mon compte P0 V2.0.0.
- 2026-06-03 : Implémentation onglets Mon compte — shell, routes enfants, visibilité shell, deep link, tests.

---

### Review Findings

- [x] [Review][Patch] Test navigation onglet Notifications manquant — le test « navigue vers chaque onglet via la barre d’onglets » couvre Préférences, Sécurité et À propos mais pas Notifications (AC 8) [`apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts:209`]
- [x] [Review][Patch] Route enfant `/compte/*` invalide → contenu vide — pas de redirect wildcard vers `/compte` ; URL ex. `/compte/identite` ou `/compte/unknown` affiche les onglets sans contenu [`apps/web/src/app/app.routes.ts:60`]

### Validation create-story

- [x] AC métier numérotés et sourcés (ux-design-mon-compte ; SCP V2.0.0)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test -w @hatcast/web` mentionné
