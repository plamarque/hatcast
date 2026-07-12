---
baseline_commit:
---

# Story 17.45: Nav shell — Mes stats avant Ma troupe

Status: done

## Story

En tant que **membre**,  
je veux **Mes stats** placé **avant Ma troupe** dans la navigation globale,  
afin de **retrouver plus naturellement** ma vue perso avant l’espace collectif.

## Acceptance Criteria

1. **Given** un membre connecté sur une route shell avec nav visible, **when** viewport **< 840px**, **then** la barre basse affiche **quatre** destinations dans l’ordre : **Accueil** → **Mon agenda** → **Mes stats** → **Ma troupe**. [Source: amendement PO 2026-07-12 ; ex-17.41]
2. **Given** les mêmes routes shell, **when** viewport **≥ 840px**, **then** le rail gauche affiche le **même ordre** (icône + libellé) ; footer compte inchangé (**17.25**).
3. **Given** les liens et états actifs existants (**17.41**), **when** l’ordre change, **then** routes, `aria-label`, icônes et logique `isStatsTabActive` / `isTroupeTabActive` restent **inchangés** — seul l’ordre DOM change.
4. **Given** badge inbox (**17.22**), **when** nav rendue, **then** badge reste sur **Accueil uniquement**.
5. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false` sur `member-nav.spec.ts`, **then** tests passent dont assertion explicite sur l’ordre des onglets.

**Couverture produit :** amendement [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) MT3 ; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § navigation 4 entrées.

**Hors scope :** contenu hub, post-login, backend, renommage libellés.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Réutiliser `mat-nav-list` / `mat-tab-link` existants ; pas de nouveau pattern. [Source: member-nav]

**M3-2. Tokens & thème** — Aucun changement SCSS attendu ; `--mat-sys-*` inchangé.

**M3-3. Mobile & tactile** — Quatre onglets, cibles ≥ 48dp inchangées.

**M3-4. Navigation membre** — Amendement ordre uniquement ; pas de bottom app bar M2.

**M3-5. Revue** — Checklist FRONTEND_UI.md : N/A hors ordre DOM (waived).

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` — `member-nav.html` (rail + bottom) : swap blocs Mes stats / Ma troupe
- [x] **Tests :** `member-nav.spec.ts` — assertion ordre onglets bottom + rail
- [x] **Docs :** `epics.md`, `PLAN.md`, `sprint-status.yaml`, amendement UX MT3
- [x] **Release :** ligne `v2.4.3-cutover.json`

## Dev Notes

Amendement PO post-17.41 : l’ordre collectif après le perso paraît plus logique à la lecture gauche→droite (stats perso puis troupe).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 17.41 | done | Amende l’ordre des onglets 3–4 |
| 17.22 | done | Badge Accueil inchangé |

### Review Findings

- [x] [Review][Patch] Commentaire stale ordre nav [`member-shell-nav-visibility.ts:29`]
- [x] [Review][Patch] Incohérence PLAN.md in-progress vs done [`PLAN.md:666`]
- [x] [Review][Defer] Doc E2E gate stale [`test-design-e1-cutover-preprod-gate.md:293`] — deferred, pre-existing
- [x] [Review][Defer] Epic 17.41 AC historique [`epics.md:2157`] — deferred, amendé par 17.45
