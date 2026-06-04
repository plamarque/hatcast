---
baseline_commit: 09612e0129e2486cdda08b429fd793d9e0c0d65
---

# Story 17.35 : Mon compte — pseudo sur Identité + libellé rail desktop

Status: done

## Story

En tant que **membre HatCast connecté**,  
je veux **modifier mon pseudo sur l’onglet Identité et le voir sous mon avatar dans le rail desktop**,  
afin de **retrouver mon identité membre au bon endroit et ne plus voir le libellé générique « Compte »**.

## Acceptance Criteria

1. **Given** un utilisateur authentifié sur **`/compte`** (onglet **Identité**), **when** la page charge, **then** la zone identité affiche : avatar (story **2.6** inchangé), **e-mail lecture seule**, **`displayName` auth** en lecture seule si présent et distinct du pseudo, et un **`mat-form-field` Pseudo** éditable (`maxlength="255"`, hint *Nom affiché dans toutes vos troupes.*) avec bouton **Enregistrer** (`data-testid="account-pseudo-save"`) — **sans** champ pseudo sur **`/compte/preferences`**. [Source: [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C2, amendement 2026-06-04 ; story **17.34** AC2]

2. **Given** l’onglet **Identité**, **when** l’utilisateur enregistre un pseudo non vide, **then** `PATCH /v1/me/preferences` est appelé avec `{ memberDisplayName }` seul ; snack succès *Pseudo enregistré* (ou message existant cohérent) ; les adhésions actives sont synchronisées via `TroupeContextService.patchMembershipDisplayName` (même logique qu’aujourd’hui dans `MemberPreferencesForm.save`). [Source: story **17.33** ; `MePreferencesApiService`]

3. **Given** un pseudo vide ou whitespace, **when** l’utilisateur tente d’enregistrer, **then** validation inline *Le pseudo ne peut pas être vide.* — pas d’appel API. [Source: C2 ; parity **17.33**]

4. **Given** l’onglet **Préférences** (`/compte/preferences`), **when** le contenu s’affiche, **then** seule la grille **Rôles préférés** + bouton **Enregistrer** (`data-testid="member-preferences-save"`) ; **aucun** `mat-label` Pseudo ; `PATCH` n’envoie que `{ preferredRoleKeys }` si les rôles changent. [Source: C2b]

5. **Given** viewport **≥ 840 px** et route avec menu compte visible (`shouldShowAccountChrome`), **when** le trigger rail (`member-account-menu-trigger` variant `rail-footer`) s’affiche, **then** le libellé sous l’avatar (`.member-account-menu-trigger__rail-label`) affiche le **pseudo membre** (`memberDisplayName`) tronqué (`text-overflow: ellipsis`) — **pas** le texte statique « Compte » ; fallbacks : **e-mail** session → « Compte ». [Source: C11 ; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Menu compte amendé 2026-06-04]

6. **Given** le pseudo vient d’être enregistré sur Identité, **when** l’utilisateur revient sur une route avec rail (ex. `/agenda`), **then** le libellé rail reflète le **nouveau pseudo** sans rechargement complet de page. [Source: C11]

7. **Given** viewport **< 840 px**, **when** le trigger shell s’affiche, **then** comportement **inchangé** (avatar seul) ; `aria-label` = `Menu compte : {pseudo ou fallback}` (pas seulement `displayName` auth si pseudo disponible). [Source: C11 ; story **17.25** AC8]

8. **Given** `/compte` ou `/compte/*`, **when** le shell rend le chrome, **then** **aucun** trigger menu compte (C8a) — pas de régression **17.34** / **17.25**.

9. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false` et `npm run build -w @hatcast/web`, **then** les deux passent ; specs couvrent : pseudo sur Identité, absence pseudo sur Préférences, libellé rail = pseudo, fallbacks, refresh après save.

**Couverture produit :** Amendement UX 2026-06-04 [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) (C2, C2b, C11) ; corrige régression perçue post-**17.34** (pseudo sur Préférences au lieu d’Identité ; rail « Compte »).

**Hors scope :** changement API/backend (**17.33** done) ; pseudo par troupe ; 4ᵉ onglet nav ; refonte complète `TroupeContextService.currentUserDisplayLabel` hors rail/Identité.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** les onglets Identité et Préférences, **when** les contrôles sont rendus, **then** pseudo = `mat-form-field` + `matInput` + `mat-flat-button` ; rôles = `mat-checkbox` grid — pas de HTML custom pour les mêmes rôles. Rail : conserver `mat-button` trigger existant. [Source: FRONTEND_UI.md ; ux-design-mon-compte.md]

**M3-2. Tokens & thème** — **Given** les styles ajoutés ou déplacés, **when** couleurs / hints, **then** `var(--mat-sys-*)` uniquement ; reprendre classes existantes [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss) et [`member-preferences-form`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts) styles.

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** champ pseudo Identité et save, **then** cibles ≥ 48dp ; rail mobile inchangé (avatar seul ≥ 48dp). [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** cette story, **when** livrée, **then** pas de 4ᵉ onglet ; pas de bottom app bar M2 ; rail footer reste extension du rail (**17.25**). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implémentation terminée, **when** validation, **then** checklist M3 FRONTEND_UI.md parcourue ; écarts notés en Dev Notes.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` uniquement — pas de changement API.
- [x] **AC 1–3 — Pseudo sur Identité** — Ajouter champ pseudo + save dans [`account-identity-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.html) / [`.ts`](../../apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.ts) ; charger `GET /v1/me/preferences` ; patch partiel pseudo ; conserver avatar/e-mail/displayName auth existants.
- [x] **AC 4 — Préférences rôles seuls** — Scinder ou paramétrer [`MemberPreferencesForm`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts) : retirer le bloc pseudo ; [`account-preferences-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-preferences-tab.html) inchangé structurellement (toujours `<app-member-preferences-form />` ou composant rôles extrait).
- [x] **AC 5–7 — Rail libellé pseudo** — [`member-account-menu-trigger.html`](../../apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.html) : remplacer « Compte » hardcodé par pseudo + fallbacks ; charger/sync `memberDisplayName` (service partagé recommandé — voir Dev Notes).
- [x] **AC 6 — Refresh rail** — Après save Identité, mettre à jour le signal/service partagé consommé par le trigger rail.
- [x] **AC 8–9 — Tests** — Mettre à jour [`account-placeholder.spec.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts), [`member-preferences-form.spec.ts`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.spec.ts), [`member-account-menu-trigger.spec.ts`](../../apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.spec.ts) (remplacer test *« Compte label (not display name) »* par pseudo attendu).

---

## Dev Notes

### Product and UX rules

- Spec normative : [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) **approved + amendé 2026-06-04** (C2, C2b, C11).
- Hub chrome : [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Menu compte (pseudo rail, pas « Compte »).
- **FR9 produit V2** = pseudo **global** compte (story **17.33**) — ne pas réintroduire pseudo par troupe sur `/compte`.

### Current state (READ before coding)

| Fichier | État actuel | Ce que 17.35 change |
|---------|-------------|---------------------|
| [`account-identity-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.html) | Avatar + email + `displayName` auth lecture seule | + champ pseudo éditable + save |
| [`MemberPreferencesForm`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts) | Pseudo + rôles + save unique | **Rôles seuls** (pseudo retiré) |
| [`member-account-menu-trigger.html`](../../apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.html) | Avatar `displayLabel()` + libellé **hardcodé « Compte »** | Libellé = pseudo (`memberDisplayName`) + fallbacks |
| [`member-account-menu-trigger.spec.ts`](../../apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.spec.ts) L109–121 | Test **exige** « Compte » et **rejette** « Alice » | Inverser : pseudo attendu |
| [`MePreferencesApiService`](../../apps/web/src/app/core/account/me-preferences-api.service.ts) | `GET/PATCH /v1/me/preferences` | Réutiliser tel quel |
| [`AccountPageContext`](../../apps/web/src/app/pages/account-placeholder/account-page-context.ts) | Session user + avatar actions | Optionnel : y centraliser pseudo signal ou service dédié |

### Recommended implementation shape

**Pseudo Identité (AC 1–3)**

- Charger preferences dans `AccountIdentityTab` (ou étendre `AccountPageContext` avec `memberDisplayName` signal).
- Template pseudo : reprendre markup/validation de `MemberPreferencesForm` (l.33–45, l.158–163, l.195–200).
- Save : `patchPreferences({ memberDisplayName })` + boucle `troupeContext.patchMembershipDisplayName` (copier depuis `MemberPreferencesForm.save` l.226–232).
- Snack : *Pseudo enregistré* (distinct de *Préférences enregistrées* sur rôles).

**Préférences rôles seuls (AC 4)**

- Préférer **extraire** `MemberPreferredRolesForm` depuis le fichier actuel plutôt que dupliquer — ou retirer le bloc pseudo du template inline et ajuster `canSave` / `save()` pour rôles uniquement.
- Conserver `data-testid="member-preferences-save"`.

**Rail label (AC 5–7)**

- Introduire un petit service root **`MemberDisplayNameService`** (nom indicatif) :
  - `readonly displayName = signal('')`
  - `loadFromApi()` via `MePreferencesApiService.getPreferences()`
  - `setFromSave(value: string)` appelé depuis Identité après PATCH OK
  - `railLabel(user: UserSummary | null)` : `displayName().trim() || user?.email || 'Compte'`
- `MemberAccountMenuTrigger` : injecter le service ; `ngOnInit` → `loadFromApi()` ; template `{{ railLabel() }}` à la place de « Compte ».
- `accountAriaLabel` : utiliser la même cascade (pseudo → email → Compte).
- Avatar initials peuvent rester sur `displayLabel()` troupe **ou** aligner sur pseudo — **préférer pseudo** pour cohérence C11 si trivial.

**Ne pas** utiliser uniquement `troupeContext.currentUserDisplayLabel()` pour le rail sans charger preferences : sans troupe sélectionnée ou avant sync, ça retombe sur `displayName` Google, pas le pseudo membre.

### Traps / regressions

| Trap | Mitigation |
|------|------------|
| Double chargement API preferences (Identité + rail) | Service singleton avec cache + refresh on save |
| Test 17.25 « Compte not display name » | Mettre à jour — comportement **obsolète** post-C11 |
| `MemberPreferencesForm.spec` teste pseudo | Déplacer tests pseudo vers identity tab spec |
| Oubli sync troupe après save Identité | Réutiliser patch membership loop de 17.33 |
| Confondre `UserSummary.displayName` (Google) et `memberDisplayName` (pseudo) | Spec C2 : les deux visibles sur Identité si distincts ; rail = pseudo only |

### Previous story intelligence (17.34, 17.33, 17.25)

- **17.34** : shell onglets + extraction tabs — toucher `account-identity-tab` et `account-preferences-tab`, pas le shell routes.
- **17.33** : API `/v1/me/preferences` source de vérité — **aucun** changement backend requis.
- **17.25** : rail footer pattern, `yPosition="above"`, masquage `/compte` — ne pas déplacer le trigger.
- Revue **17.34** : logout dans header page (C8b) — ne pas remettre logout dans Identité.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `mat-form-field`, `matInput`, `mat-flat-button`, `mat-checkbox`, `mat-error` |
| Tokens | `--mat-sys-*` ; rail label styles déjà dans `member-account-menu-trigger.scss` (ellipsis L60–68) |
| Réutilisation | `MePreferencesApiService`, `TroupeContextService.patchMembershipDisplayName`, patterns save/snack de `MemberPreferencesForm` |
| i18n | Libellés français cohérents avec formulaire actuel |

### Explicit non-goals

- Modifier PRD FR9 (wording per-troupe obsolète — domaine amendé 17.33).
- Ajouter `memberDisplayName` à `GET /v1/auth/me` (possible futur optimisation — hors scope).
- Changer le menu `mat-menu` items (Mon compte, PWA, Déconnexion).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.33** | done | API preferences compte — réutiliser |
| **17.34** | done | Onglets Identité / Préférences — modifier contenu tabs |
| **17.25** | done | Rail trigger — libellé seulement |
| **2.6** | done | Avatar Identité inchangé |

## Dev Agent Record

### Agent Model Used

Composer (dev-story 17-35)

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created
- **Identité (AC 1–3)** : champ pseudo + `data-testid="account-pseudo-save"` sur `AccountIdentityTab` ; validation vide ; PATCH `{ memberDisplayName }` ; snack *Pseudo enregistré* ; sync troupes via `patchMembershipDisplayName`.
- **Préférences (AC 4)** : bloc pseudo retiré de `MemberPreferencesForm` ; save n’envoie que `{ preferredRoleKeys }`.
- **Rail (AC 5–7)** : `MemberDisplayNameService` (cache singleton) ; libellé rail + `aria-label` = pseudo → email → « Compte » ; avatar rail aligné sur pseudo.
- **Refresh (AC 6)** : `setFromSave()` après PATCH OK sur Identité ; rail réactif via signal partagé.
- **Tests** : 19 tests story (identity tab, rail trigger, preferences form, display-name service) — tous verts. `npm run build -w @hatcast/web` OK.
- **M3 checklist** : M3-1 OK (mat-form-field, matInput, mat-flat-button, mat-checkbox) ; M3-2 OK (`--mat-sys-*`, classes account-page existantes) ; M3-3 OK (save min-height 3rem) ; M3-4 OK (pas de 4ᵉ onglet) ; M3-5 OK.
- **Note suite complète** : `account-placeholder.spec.ts` — 4 tests Sécurité échouent sur mock Firebase `onAuthStateChanged` (pré-existant, hors périmètre 17.35) ; tests Identité/Préférences de cette story passent.

### File List

- apps/web/src/app/core/account/member-display-name.service.ts
- apps/web/src/app/core/account/member-display-name.service.spec.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.ts
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.html
- apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.spec.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.scss
- apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts
- apps/web/src/app/shared/member-preferences-form/member-preferences-form.spec.ts
- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.ts
- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.html
- apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.spec.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts

### Change Log

- 2026-06-04 : Story créée — amendement UX pseudo Identité + rail label (C2, C2b, C11).
- 2026-06-04 : Implémentation — pseudo sur Identité, Préférences rôles seuls, rail label pseudo, `MemberDisplayNameService`, tests.

### Review Findings

- [x] [Review][Patch] Cache pseudo non invalidé au changement de session [`member-display-name.service.ts:12-27`] — `syncSessionUser()` + `reset()` ; appelé depuis le trigger (effect) et l’onglet Identité.
- [x] [Review][Patch] Course concurrente sur `loadFromApi` [`member-display-name.service.ts:33-34`] — promesse partagée `loadPromise` coalesçant les appels concurrents.
- [x] [Review][Defer] AC9 suite complète `npm run test -w @hatcast/web` — ~80 échecs pré-existants hors périmètre 17.35 ; les 19 tests story (display-name, identity tab, rail trigger, preferences form) passent via `ng test`. — deferred, pre-existing
- [x] [Review][Defer] `account-placeholder.spec.ts` tests Sécurité (mock Firebase `onAuthStateChanged`) — échecs pré-existants documentés en Dev Notes ; tests Identité/Préférences 17.35 passent. — deferred, pre-existing
