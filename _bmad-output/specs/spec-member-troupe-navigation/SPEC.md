---
id: SPEC-member-troupe-navigation
companions:
  - navigation-contract.md
  - ../../../docs/v2/technical/FRONTEND_UI.md
sources: []
---

# Member troupe navigation

> Intended behavior agreed on 2026-10-22; specification only, not implemented. This kernel and its companions define the change. It amends earlier home quick-access and direct-link “Ma troupe” UX rules only within this scope.

## Why

The home quick-access section occupies space and competes with required actions and the next show. Members need compact access to their remembered troupe and season, with navigation between contexts available on the destination pages.

## Capabilities

- **CAP-1**
  - **intent:** Members can reach their troupe, season agenda and season statistics from one compact navigation menu.
  - **success:** “Ma troupe” opens exactly three entries, in order: the resolved troupe name, the resolved season title, and **Statistiques**. All destinations refer to the same troupe-season pair; there are no prefixes, scope suffixes, headings or extra choices.
- **CAP-2**
  - **intent:** Members receive predictable destinations without configuring a preferred troupe or season.
  - **success:** Valid remembered troupe wins; otherwise the newest active accessible membership wins. Within that troupe, the remembered active accessible season wins; otherwise the active accessible season with latest start date wins. Empty, stale and unavailable states follow the companion contract.
- **CAP-3**
  - **intent:** Members can focus on actionable home content.
  - **success:** `/accueil` has no “Accès rapides” section or its four links. Required actions, next show, existing empty/error states and multi-troupe personal scope retain their behavior.
- **CAP-4**
  - **intent:** Members can navigate from a troupe to its seasons, statistics and other troupes without relying on home shortcuts.
  - **success:** The selected season has direct agenda and statistics links independent of teaser/chart content; existing season selection and archives remain. With multiple active troupes, a link near the troupe title opens the troupe list.
- **CAP-5**
  - **intent:** Members can move between troupe, season and statistics without a navigation dead end.
  - **success:** Existing season view controls and troupe breadcrumb remain usable on mobile and desktop; the troupe list opens another troupe and subsequent menu destinations reflect remembered visits. Existing authorization restrictions remain effective.

## Constraints

- Visible menu labels are the troupe name, season title and exactly **Statistiques**; empty-state exceptions are defined in the companion. The trigger remains **Ma troupe**.
- The statistics destination is collective **season** statistics, distinct from personal **Mes stats**. No cross-season troupe statistics are introduced.
- The same menu behavior applies to mobile bottom navigation and desktop rail; use Angular Material, existing M3 tokens, keyboard access and French accessible names.
- Remember browser-local context; no account-wide default preference. Resolve season within the troupe, never by combining unrelated global memories.
- Preserve existing permissions, routes, home/agenda aggregation and unrelated navigation. No API failure may be treated as proof of missing access or erase valid memory.

## Non-goals

- Adding troupe/season selectors or “Toutes mes troupes” to this menu.
- Redesigning personal statistics, login redirects, admin menus or archived-season behavior.
- New analytics, backend entities, membership actions or account settings.
- Implementing, creating stories, changing sprint status, committing or releasing this specification.

## Success signal

A multi-troupe member opens **Ma troupe**, sees three short entries and reaches the matching troupe, season and statistics. From the troupe page they can switch season or reach another troupe. Those paths remain available with no upcoming shows or fewer than three past shows, while the home quick-access block is absent.

## Assumptions

- Deterministic tie breakers, fallback copy and the handling of guest/admin remembered contexts in `navigation-contract.md` are specified defaults, not separately chosen by the user.
- Validation so far is source inspection. Browser usability and runtime acceptance remain unverified.
