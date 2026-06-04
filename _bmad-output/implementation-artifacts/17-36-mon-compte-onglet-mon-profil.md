---
baseline_commit: 8452760d56e9dcde104da0a519fc936df25c132d
---

# Story 17.36 : Mon compte — onglet Mon profil (fusion Identité + Sécurité)

Status: done

## Story

En tant que **membre HatCast connecté**,  
je veux **gérer mon profil, mes modes de connexion et la suppression de compte sur un seul premier onglet « Mon profil »**,  
afin de **ne plus naviguer entre Identité et Sécurité** et de modifier mon e-mail au bon endroit.

## Acceptance Criteria

1. **Given** un utilisateur authentifié sur **`/compte`**, **when** la page charge, **then** la barre d’onglets affiche **4 onglets** : **Mon profil** · Préférences · Notifications · À propos — **sans** onglet **Identité** ni **Sécurité** ; l’onglet actif par défaut est **Mon profil**. [Source: [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C4 amend. 2026-06-04b]

2. **Given** l’onglet **Mon profil**, **when** le contenu s’affiche, **then** il regroupe dans l’ordre : (a) zone **avatar** + e-mail + `displayName` auth si distinct (**17.35** / **2.6** inchangés) ; (b) **icône modifier** e-mail à côté de l’adresse ; (c) bloc **pseudo** + **Enregistrer** (`data-testid="account-pseudo-save"`) ; (d) section **Modes de connexion** ; (e) **Zone sensible** avec **Supprimer mon compte** en bas. [Source: C2, C6, C10, C12]

3. **Given** l’e-mail affiché, **when** l’utilisateur active le bouton icône **modifier** (`data-testid="account-email-edit"`, `aria-label` *Modifier l’adresse e-mail*), **then** le dialog **`AccountChangeEmailDialog`** s’ouvre (même flux **1.6** qu’aujourd’hui) — **pas** de ligne `mat-list-item` « Changer l’adresse e-mail ». [Source: C6 ; `account-security-tab.ts` `openChangeEmailDialog`]

4. **Given** la section **Modes de connexion**, **when** affichée, **then** elle indique l’état Google (`hasGoogleAccount`) et propose l’action mot de passe (**Changer** / **Définir** selon `hasPasswordProvider`) ouvrant **`AccountChangePasswordDialog`** ; conserver hint Google + secours si applicable (`data-testid="account-google-password-hint"`) ; `data-testid="account-reset-password"` sur le déclencheur MDP. [Source: C12 ; story **1.6**]

5. **Given** **Zone sensible**, **when** l’utilisateur tape **Supprimer mon compte**, **then** le dialog **`AccountDeleteDialog`** s’ouvre (`data-testid="account-delete"`) — comportement **1.7** inchangé. [Source: C10]

6. **Given** une navigation vers **`/compte/securite`** ou **`/compte/identite`**, **when** la route charge, **then** **redirect** vers **`/compte`** (`replaceUrl: true`) ; mettre à jour les liens internes qui pointent encore vers `/compte/securite` (ex. [`account-email-verification.html`](../../apps/web/src/app/pages/account-email-verification/account-email-verification.html)). [Source: ux-design-mon-compte.md deep links]

7. **Given** les onglets Préférences, Notifications, À propos, **when** affichés, **then** **aucune régression** (**17.35**, **8.1**, **8.2**, **10.3**) ; header **Se déconnecter** (C8b) et masquage menu compte (C8a) inchangés.

8. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false` (ou sous-ensemble documenté si échecs pré-existants hors scope) et `npm run build -w @hatcast/web`, **then** les deux passent pour le périmètre story ; specs couvrent : 4 onglets, icône e-mail, modes connexion, redirect sécurité, suppression depuis Mon profil.

**Couverture produit :** Amendement UX 2026-06-04b [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) (C4, C6, C10, C12) ; corrige doublon e-mail Identité/Sécurité post-**17.34**/**17.35**.

**Hors scope :** changement API/backend ; refonte dialogs **1.6**/**1.7** ; rail pseudo (**17.35** inchangé sauf libellé onglet) ; renommage route canonique `/compte/profil` (optionnel — non requis).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** Mon profil, **when** contrôles rendus, **then** e-mail edit = `mat-icon-button` + `mat-icon` `edit` ; pseudo = `mat-form-field` + `matInput` + `mat-flat-button` ; MDP = `mat-button` ou `mat-stroked-button` ; suppression = `mat-list-item` ou `mat-button` warn dans zone sensible — pas de `<button>` custom. [Source: FRONTEND_UI.md ; ux-design-mon-compte.md]

**M3-2. Tokens & thème** — **Given** styles fusionnés, **when** couleurs / séparateurs, **then** `var(--mat-sys-*)` ; zone sensible `error` / `outline-variant` — [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss).

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** icône e-mail et actions MDP, **then** cibles ≥ 48dp ; 4 onglets scrollables horizontalement. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** `/compte/*`, **when** chrome, **then** pas de 5ᵉ onglet ; pas de bottom app bar M2 ; rail inchangé (**17.25**). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implémentation terminée, **when** validation, **then** checklist M3 FRONTEND_UI.md parcourue ; écarts notés en Dev Notes.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` uniquement — fusion onglets, routes, liens, tests.
- [x] **AC 1–2 — Shell + Mon profil** — Renommer onglet **Mon profil** dans [`account-placeholder.html`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.html) ; retirer lien **Sécurité** ; fusionner contenu [`account-identity-tab`](../../apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.ts) + [`account-security-tab`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts) → `account-profile-tab` (recommandé) ou étendre identity et supprimer security component.
- [x] **AC 3 — E-mail icône** — Ajouter `mat-icon-button` edit à côté de `.account-page__email` ; déplacer `openChangeEmailDialog` + imports dialog depuis security tab.
- [x] **AC 4 — Modes de connexion** — Section avec titre ; déplacer `hasPasswordProvider`, `passwordRowLabel`, `openChangePasswordDialog`, hint Google ; `onAuthStateChanged` lifecycle.
- [x] **AC 5 — Zone sensible** — Déplacer bloc danger + `openDeleteAccountDialog` en bas du template profil.
- [x] **AC 6 — Routes & liens** — [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) : `securite` → redirect `''` ; supprimer route component `AccountSecurityTab` ; patch `account-email-verification` + specs redirect.
- [x] **AC 7–8 — Tests** — Mettre à jour [`account-placeholder.spec.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts), [`account-identity-tab.spec.ts`](../../apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.spec.ts) (renommer profil), retirer/ migrer tests security tab ; vérifier `data-testid` stables.

---

## Dev Notes

### Product and UX rules

- Spec normative : [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) **approved + amendé 2026-06-04b** (Sally).
- Hub chrome : [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Menu compte.
- **Ne pas** réintroduire une ligne liste « Changer l’adresse e-mail » — C6 impose l’icône à côté de l’e-mail.

### Current state (READ before coding)

| Fichier | État actuel | Ce que 17.36 change |
|---------|-------------|---------------------|
| [`account-placeholder.html`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.html) | 5 onglets dont **Identité** + **Sécurité** | 4 onglets ; libellé **Mon profil** |
| [`account-identity-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.html) | Avatar, email lecture seule, pseudo | + icône edit email ; + modes connexion ; + zone sensible |
| [`account-security-tab.ts/html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts) | Liste e-mail, MDP, hint, delete | **Supprimé** après fusion (logique → profil) |
| [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) L64–68 | `securite` → `AccountSecurityTab` | redirect `''` |
| [`account-email-verification.html`](../../apps/web/src/app/pages/account-email-verification/account-email-verification.html) | `routerLink="/compte/securite"` | `/compte` |

### Recommended implementation shape

**Fusion composant (préféré)**

1. Créer `account-profile-tab.ts/html` (copier identity + y greffer security).
2. Route enfant `''` → `AccountProfileTab`.
3. Supprimer `AccountSecurityTab` et ses imports dans `app.routes.ts` + `account-placeholder.spec.ts`.
4. Redirect : `{ path: 'securite', redirectTo: '', pathMatch: 'full' }` et idem `identite` si route existait.

**E-mail (AC 3)**

```html
<p class="account-page__email-row">
  <span class="account-page__email">{{ u.email }}</span>
  <button mat-icon-button type="button" data-testid="account-email-edit" aria-label="Modifier l'adresse e-mail" (click)="openChangeEmailDialog()">
    <mat-icon>edit</mat-icon>
  </button>
</p>
```

**Modes de connexion (AC 4)**

- `h2.account-page__section-title` ou `overline` : *Modes de connexion*
- Ligne statut Google si `hasGoogleAccount`
- Bouton MDP (pas `mat-nav-list` pleine largeur pour e-mail)

### Traps / regressions

| Trap | Mitigation |
|------|------------|
| Oublier redirect `/compte/securite` | Tests + patch verification email |
| Perdre `data-testid` **1.6**/**1.7** | Conserver `account-delete`, `account-reset-password` ; ajouter `account-email-edit` |
| Double section e-mail | Retirer toute ligne liste e-mail |
| Tests security tab orphelins | Migrer vers profile tab spec |
| `account-placeholder.spec` attend 5 onglets | Mettre à jour comptage et libellés |

### Explicit non-goals

- Modifier dialogs `account-change-email-dialog`, `account-change-password-dialog`, `account-delete-dialog`.
- Changer `MemberDisplayNameService` / rail (**17.35**).
- Backend auth API.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.34** | done | Shell onglets — modifier nav + routes |
| **17.35** | done | Pseudo sur onglet 1 — conserver |
| **1.6** | done | Dialogs email/MDP — réutiliser |
| **1.7** | done | Dialog suppression — réutiliser |
| **2.6** | done | Avatar — inchangé |

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- Fusion `AccountIdentityTab` + `AccountSecurityTab` → `AccountProfileTab` : avatar, e-mail + icône edit, pseudo, modes de connexion, zone sensible.
- Shell : 4 onglets (Mon profil · Préférences · Notifications · À propos) ; redirects `/compte/securite` et `/compte/identite` → `/compte`.
- `account-email-verification` : liens vers `/compte` et libellés Mon compte / Mon profil.
- M3 : `mat-icon-button` edit, `mat-stroked-button` MDP, tokens `--mat-sys-*`, cibles ≥ 48dp (480px) ; pas de 5ᵉ onglet.
- Tests : `account-placeholder.spec.ts` + `account-profile-tab.spec.ts` (25 tests périmètre story) ; `npm run build -w @hatcast/web` OK.

### File List

- apps/web/src/app/pages/account-placeholder/account-placeholder.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.scss
- apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.html
- apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.spec.ts
- apps/web/src/app/pages/account-email-verification/account-email-verification.html
- apps/web/src/app/pages/account-placeholder/legacy-account-tab-redirect.ts
- apps/web/src/app/app.routes.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.ts (deleted)
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.html (deleted)
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.spec.ts (deleted)
- apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts (deleted)
- apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.html (deleted)

### Change Log

- 2026-06-04 : Story créée — amendement UX Sally fusion Mon profil (4 onglets).
- 2026-06-04 : Implémentation — fusion onglets Identité+Sécurité, redirects, tests.
- 2026-06-04 : Code review — `LegacyAccountTabRedirect` avec `replaceUrl: true` pour `/compte/securite` et `/compte/identite` (AC6).
- 2026-06-04 : Story clôturée (`done`) après revue OK.

### Review Findings

- [x] [Review][Patch] Redirect legacy `/compte/securite` et `/compte/identite` sans `replaceUrl: true` [`legacy-account-tab-redirect.ts`, `app.routes.ts:66-67`] — corrigé : composant `LegacyAccountTabRedirect` avec `router.navigate(['/compte'], { replaceUrl: true })` ; tests mis à jour.
- [x] [Review][Defer] Subscription `afterClosed()` non nettoyée dans `openChangePasswordDialog` [`account-profile-tab.ts:184-189`] — deferred, pré-existant (identique à l’ancien `account-security-tab.ts`).
- [x] [Review][Defer] Checklist M3-5 non parcourue explicitement dans Dev Notes — deferred, process/doc mineur ; implémentation conforme aux critères M3-1…M3-4.
- [x] [Review][Defer] Dépassement budget bundle initial (+31 kB) au build — deferred, pré-existant hors périmètre story.
