---
feature_branch: feat/ops-m4-1-v1-cutover-announcement-banner
baseline_commit:
---

# Story OPS-M4-1 : Bannière V1 annonce HatCast 2 → hatcast.app

Status: ready-for-dev

**Story ID:** OPS-M4-1  
**Story key:** `ops-m4-1-v1-cutover-announcement-banner`  
**Priority:** P0 (gate **M4** — comms pre-cutover)  
**PLAN:** [PLAN.md](../../PLAN.md) § Gate M4 — comms V1 (2026-06-19)  
**SCP:** [sprint-change-proposal-2026-06-19-m4-v1-cutover-comms.md](../planning-artifacts/sprint-change-proposal-2026-06-19-m4-v1-cutover-comms.md)  
**Deploy runbook:** [docs/v1/technical/DEPLOYMENT.md](../../docs/v1/technical/DEPLOYMENT.md)  
**Related:** [ops-8-prod-domain-hatcast-app.md](ops-8-prod-domain-hatcast-app.md) (prod URL live) ; **OPS-7** (post-M4, out of scope)

## Story

En tant que **membre utilisant HatCast V1** (`selections.la-malice.fr`),  
je veux **voir une annonce claire qu’une nouvelle version est disponible avec un lien vers HatCast 2**,  
afin de **découvrir et rejoindre la prod V2 sur `https://hatcast.app` avant la bascule audience M4**.

## Acceptance Criteria

1. **Given** un build V1 avec `VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED=true`, **when** l’utilisateur ouvre n’importe quelle route, **then** une **bannière fixe en haut** s’affiche avec : titre **HatCast** ; corps *Une nouvelle version de HatCast est disponible. Retrouvez vos saisons et spectacles sur HatCast 2.* ; CTA **Découvrir HatCast 2** pointant vers `VITE_V2_PROD_URL` (défaut `https://hatcast.app`) en `target="_blank"` et `rel="noopener noreferrer"`. [Source: SCP §4.1–4.2 ; gate M4]

2. **Given** `VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED` est `false`, absent ou toute valeur autre que `true`, **when** l’app V1 charge, **then** **aucune** bannière cutover n’apparaît (zéro régression visuelle ou fonctionnelle). [Source: SCP AC2]

3. **Given** l’utilisateur ferme la bannière, **when** il revient sur l’app avec la **même** `VITE_V2_CUTOVER_ANNOUNCEMENT_VERSION`, **then** la bannière reste masquée (persistance `localStorage`). **Given** le build incrémente `VITE_V2_CUTOVER_ANNOUNCEMENT_VERSION`, **when** l’utilisateur avait dismissé l’ancienne version, **then** la bannière **réapparaît**. [Source: SCP AC3 ; clé `hatcast-v2-cutover-announcement-dismissed-{version}`]

4. **Given** une mise à jour PWA V1 est disponible (`updateAvailable`), **when** la bannière cutover est aussi active, **then** le flux `updateApp()` / barre SW existante reste **inchangé** ; la bannière cutover ne déclenche pas de reload SW et n’intercepte pas le CTA « Mettre à jour » V1. [Source: SCP AC4 ; `legacy/src/App.vue` L95–138, L514+]

5. **Given** bannières install PWA et/ou update SW visibles en même temps que la bannière cutover, **when** l’utilisateur interagit, **then** les CTA et boutons fermer restent **cliquables** (pas de chevauchement masquant les actions) — empiler verticalement ou ajuster `top` des barres secondaires si nécessaire. [Source: SCP AC5]

6. **Given** la bannière cutover, **when** inspectée en recette/E2E, **then** éléments portent `data-testid="v2-cutover-announcement"`, `data-testid="v2-cutover-announcement-cta"`, `data-testid="v2-cutover-announcement-dismiss"`. [Source: SCP AC6 ; pattern `legacy/tests/*.spec.js` `dismissPwaBanners`]

7. **Given** implémentation terminée, **when** un opérateur lit [DEPLOYMENT.md](../../docs/v1/technical/DEPLOYMENT.md), **then** une section documente : variables `VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED`, `VITE_V2_PROD_URL`, `VITE_V2_CUTOVER_ANNOUNCEMENT_VERSION` ; recette staging (`hatcast-staging.web.app`) avant prod ; **déploiement prod programmé par PO** (hors pipeline V2). [Source: SCP AC7–8]

8. **Given** recette staging V1, **when** PO active le flag et ouvre l’app, **then** copy FR, lien vers prod URL et dismiss sont validés manuellement avant deploy prod `selections.la-malice.fr`. [Source: SCP AC8]

**Couverture produit :** gate M4 comms (pre-audience cutover) ; pas de nouveau FR SPEC — annonce opérationnelle vers V2.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — périmètre `legacy/` (Vue 3 + Tailwind V1) ; pas de changement sous `apps/web/`.

---

## Tasks / Subtasks

- [ ] **Périmètre :** `legacy/src/App.vue` (principal) ; optionnel petit module util si ça clarifie (ex. `legacy/src/services/v2CutoverAnnouncement.js`) — **réutiliser le chrome** des barres install/update existantes.
- [ ] **AC1–AC2** — Lire `import.meta.env.VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED === 'true'` ; URL depuis `import.meta.env.VITE_V2_PROD_URL || 'https://hatcast.app'`.
- [ ] **AC1** — Bloc template Transition + barre fixe (même classes visuelles que install banner : `z-[99999]`, fond noir, logo `/icons/icon-48x48.png`).
- [ ] **AC3** — `announcementVersion` depuis `import.meta.env.VITE_V2_CUTOVER_ANNOUNCEMENT_VERSION || '1'` ; dismiss → `localStorage.setItem('hatcast-v2-cutover-announcement-dismissed-' + version, '1')` ; init on mount lit cette clé.
- [ ] **AC4–AC5** — Ne pas modifier `updateAvailable`, `updateApp`, `handleServiceWorkerUpdate` ; si plusieurs barres : offset `top` dynamique ou ordre DOM documenté (cutover **au-dessus**).
- [ ] **AC6** — `data-testid` sur conteneur, CTA `<a>` ou `<button>`, bouton dismiss (`aria-label` français cohérent avec barres existantes).
- [ ] **AC7** — Section « Annonce bascule HatCast 2 » dans `docs/v1/technical/DEPLOYMENT.md` (env, staging, prod, bump version pour re-afficher).
- [ ] **AC8** — Checklist recette PO dans Dev Notes ou DEPLOYMENT.md.
- [ ] **Tests** — Au minimum : test unitaire léger (composable/logic dismiss) **ou** note recette manuelle ; si Playwright : helper `dismissV2CutoverBanner` calqué sur `dismissPwaBanners` dans `legacy/tests/`.

## Dev Notes

### Product and UX rules

- **Objectif :** informer, pas forcer la migration — lien externe vers V2 ; l’utilisateur peut continuer sur V1.
- **PO** active le flag au moment du build prod qu’il choisit ; indépendant de la date M4.
- Copy FR validée dans SCP ; ne pas confondre avec le message SW « Mettre à jour » (même app V1).

### Current state — `legacy/src/App.vue` (READ BEFORE EDIT)

| Zone | Comportement actuel | À préserver |
|------|---------------------|-------------|
| L36–87 | Barre install PWA `canInstallPwa && !bannerDismissed` | Logique `installPwa`, `dismissBanner`, `checkIfShouldShowInstallBanner` |
| L89–138 | Barre update SW `updateAvailable && !refreshing && isPwaInstalled()` | `handleServiceWorkerUpdate`, `updateApp` |
| L298–302 | Dismiss install → `hatcast-pwa-banner-dismissed` + TTL 24h | Clés localStorage distinctes pour cutover |
| L329–337 | TTL 24h sur dismiss install | Cutover : dismiss **persistant** par version (pas de TTL sauf bump version) |

### Implementation guardrails

| Concern | Action |
|--------|--------|
| Stack | Réutiliser pattern `Transition name="install-banner"` et structure flex des barres existantes |
| Env Vite | `import.meta.env.VITE_*` — valeurs injectées au **build** ; documenter pour CI V1 prod |
| z-index | Cutover ≥ install/update ; si empilement : `style="top: var(--cutover-banner-height)"` sur barres secondaires **ou** masquer install quand cutover visible (préférer empilement pour AC5) |
| Audit | Optionnel P2 : `AuditClient.safeLogUserAction` sur CTA/dismiss (`V2_CUTOVER_ANNOUNCEMENT_*`) — non bloquant |
| Branche V1 | Travail sur branche `v1` / `staging` selon workflow PO ; **ne pas** mélanger avec `apps/web/` |

### Explicit non-goals

- Redirection automatique V1 → V2.
- Modale plein écran ou blocage de navigation V1.
- Changement DNS, Firebase, ou pipeline V2 (`deploy_prod.sh`).
- Filtre par troupe / saison (tous les utilisateurs V1).
- **OPS-7** renommage branches (après M4).

### Dependencies

| Story / gate | Status | Relationship |
|--------------|--------|--------------|
| OPS-8 | done | URL cible `https://hatcast.app` live |
| M4 gate | open | OPS-M4-1 = prérequis comms **pre-M4** ; deploy PO |
| OPS-7 | backlog | Après M4 uniquement |

### Branch & deploy strategy (PO decision 2026-06-19)

- **Implémentation :** sur branche **`v2`**, périmètre **`legacy/`** (BMad `bmad-dev-story` — monorepo a `_bmad/` ; `main`/`staging` V1 n’en ont pas).
- **Pas de cherry-pick** commit `v2` → `main` : chemins différents (`legacy/src/App.vue` vs `src/App.vue` sur `main`/`staging`).
- **Port prod V1 :** après merge sur `v2`, reporter le **diff métier** vers `src/App.vue` sur branche **`staging`** → recette `hatcast-staging.web.app` → `main` + `release-version.sh` (deploy PO).
- Réf. branches : [BRANCH_ENVIRONMENTS.md](../../docs/shared/technical/BRANCH_ENVIRONMENTS.md).

### Architecture compliance

- V1 reste sous `legacy/` + Firebase Hosting ; V2 non touchée ([MONOREPO.md](../../docs/shared/technical/MONOREPO.md)).
- Feature flag build-time uniquement — pas de Remote Config requis pour M4.

### File structure requirements

| Fichier | Action |
|---------|--------|
| `legacy/src/App.vue` | UPDATE — template + script cutover banner |
| `docs/v1/technical/DEPLOYMENT.md` | UPDATE — § env + checklist PO |
| `legacy/tests/*.spec.js` | OPTIONAL — helper dismiss si E2E impactés |

### Testing requirements

- **Manuel staging :** flag `true`, URL staging peut pointer vers `https://hatcast.app` ; vérifier mobile Safari + desktop Chrome.
- **Manuel prod (PO) :** après merge + release V1, valider lien et dismiss.
- **Régression :** flag `false` → comportement identique à avant (install + update banners inchangés).
- Pas de `./gradlew` ; pas de `apps/web` tests.

### Previous story intelligence (OPS)

- Stories OPS = périmètre clair, runbook à jour, recette manuelle explicite ([ops-8](ops-8-prod-domain-hatcast-app.md)).
- PO est owner du deploy V1 — documenter les étapes, pas automatiser via scripts V2.

### Project context reference

- [project-context.md](../../project-context.md) — legacy séparé de V2 ; scope discipline.
- Commits : Conventional Commits en anglais, scope `legacy` ou `v1` si applicable.

### PO recette checklist (staging → prod)

1. Build staging avec `VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED=true`, `VITE_V2_PROD_URL=https://hatcast.app`, `VITE_V2_CUTOVER_ANNOUNCEMENT_VERSION=1`.
2. Ouvrir `https://hatcast-staging.web.app` — bannière visible, CTA ouvre `hatcast.app`.
3. Dismiss → rechargement → bannière absente.
4. Bump `VITE_V2_CUTOVER_ANNOUNCEMENT_VERSION=2` → rebuild → bannière réapparaît.
5. Flag `false` → rebuild → aucune bannière.
6. PO : release prod V1 quand satisfait (`./scripts/release-version.sh` ou workflow documenté DEPLOYMENT.md).

## Dev Agent Record

### Agent Model Used

(create-story)

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created (2026-06-19).

### File List

- (pending implementation)

### Change Log

- 2026-06-19 : Story créée via `bmad-create-story` (SCP M4 V1 cutover comms approuvé).
- 2026-06-19 : Stratégie branches — dev `v2`/`legacy/` ; port manuel vers `staging`/`src/App.vue` (pas cherry-pick `v2`→`main`).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (SCP / gate M4)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers `App.vue` et barres existantes
- [x] Recette manuelle + DEPLOYMENT.md documentés
