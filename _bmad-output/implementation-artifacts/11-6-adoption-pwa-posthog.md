---
feature_branch: codex/pwa-adoption-posthog
baseline_commit: 369deb3b59ac95fae9669e34919dbd581a48672b
---

# Story 11.6 : Adoption PWA PostHog

Status: done

**Story key:** `11-6-adoption-pwa-posthog`
**Epic alignment:** Epic 11 (analytics opérateurs produit)
**Contract:** [SPEC PWA adoption](../specs/spec-pwa-adoption-posthog/SPEC.md) and [measurement companion](../specs/spec-pwa-adoption-posthog/pwa-adoption-measurement.md)

## Story

En tant qu’**opérateur produit**,
je veux distinguer l’usage navigateur et PWA de HatCast,
afin de comprendre l’adoption PWA sans collecter de donnée personnelle ou d’empreinte d’appareil.

## Acceptance Criteria

1. Une fois une session HatCast identifiée, `pwa_access_mode_observed` est capturé une fois par session navigateur avec exactement `{ access_mode: 'standalone' | 'web' }`; `standalone` est déterminé par `display-mode: standalone` ou iOS `navigator.standalone === true`. [Source: SPEC CAP-1 ; companion § Browser-state rules]
2. Si PostHog est désactivé, aucune capture n’est effectuée et les parcours PWA restent inchangés. [Source: SPEC Constraints]
3. Les allow-lists de propriétés empêchent user agent brut, URL, identifiant d’appareil, texte libre et toute nouvelle People property. [Source: SPEC Constraints ; companion Event catalogue]
4. Le runbook fournit la recette de dashboard à 30 jours pour PWA-used, web-only, mixed-use et breakdowns de compatibilité. Le dashboard est créé dans PostHog seulement après autorisation explicite. [Source: SPEC CAP-3 à CAP-5]

**Couverture produit :** SPEC-pwa-adoption-posthog CAP-1 à CAP-5 ; NFR-S2.
**UI : N/A** — instrumentation invisible, sans surface ni comportement utilisateur nouveau.

## Tasks / Subtasks

- [x] Ajouter les constantes, détection de mode et captures typées (AC 1, 3, 4).
- [x] Couvrir détection, déduplication par session, no-op et allow-lists (AC 1–3).
- [x] Ajouter la recette opérateur et, après autorisation explicite, le dashboard PostHog d’adoption (AC 4).
- [x] Revue locale, build et contrôles ciblés.

## Dev Notes

- Réutiliser `ProductAnalyticsService`; ne pas capturer depuis un composant ou créer de People property.
- La valeur `hatcast-pwa-installed` est un aide UX existant, jamais une preuve d’adoption analytique.
- Le dashboard vit dans PostHog, pas dans HatCast. Son provisionnement est hors périmètre sans autorisation explicite.

### Explicit non-goals

- Mesurer l’installation ou la mise à jour ; ces signaux appartiennent à la story lifecycle PWA.
- Ajouter un identifiant de périphérique, un user-agent brut, une URL ou une propriété People.
- Créer/modifier un dashboard, insight, cohorte, définition ou variable PostHog sans autorisation explicite.

## Dev Agent Record

### Completion Notes List

- Analyse PostHog réalisée en lecture seule le 2026-10-17 : aucun événement PWA dédié ni objet SQL persistant observé/créé ; les primitives locales `PwaInstallService` et `PwaUpdateService` existaient déjà.
- `pwa_access_mode_observed` ne contient que `access_mode`, déterminé par l’état navigateur réel, une fois par utilisateur identifié/session.
- Après autorisation explicite, le dashboard PostHog « Adoption PWA HatCast » a été créé, puis limité à l’adoption PWA vs web lors de la séparation avec la story lifecycle.
- Revue locale formelle : aucun défaut bloquant dans le diff. Material 3 : N/A, sans UI ni style touché.
- Vérifications : 36 tests ciblés verts avec `NODE_OPTIONS=--localstorage-file=/private/tmp/hatcast-pwa-adoption-localstorage`; `npm run build -w @hatcast/web` vert. Warnings Sass / budgets existants hors périmètre, sans nouveau warning attribuable.

### File List

- `apps/web/src/app/core/analytics/fr47-event-names.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.spec.ts`
- `apps/web/src/app/core/pwa/pwa-access-mode.ts`
- `apps/web/src/app/core/pwa/pwa-access-mode.spec.ts`
- `apps/web/src/app/core/pwa/pwa-install.service.ts`
- `apps/web/src/app/core/pwa/pwa-install.service.spec.ts`
- `ARCH.md`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`

### Change Log

- 2026-10-17 : Story créée depuis SPEC-pwa-adoption-posthog après analyse PostHog en lecture seule.
- 2026-10-17 : Implémentation, tests ciblés, build et revue locale ; statut → review.
- 2026-10-18 : Séparation confirmée avec la story lifecycle PWA ; tests et build relancés, statut → done.
