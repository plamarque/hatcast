# Epic 17 Context: Troupe-first navigation, event categories, and event slugs

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make the troupe the natural entry point for navigating seasons and shows, with contextual administration, recognizable show URLs, and optional show categories that partition fairness calculations without multiplying seasons or rosters.

## Stories

- Story 17.1: Breadcrumb contexte (responsive)
- Story 17.2: Menu administration par scope (icône engrenage)
- Story 17.3: Page `/troupes` (Mes troupes + Découvrir)
- Story 17.4: Hub `/troupes/:slug`
- Story 17.5: Redirects et fin de `/seasons` comme hub
- Story 17.6: Slug événement dans les URLs
- Story 17.7: API tag d’équité et glossaire troupe
- Story 17.8: UI onglet Infos — tag d’équité optionnel
- Story 17.9: Tirage et chances par tag
- Story 17.10: Statistiques — filtre par groupes de spectacles (compartiments)
- Story 17.11: Fil d’Ariane sur pages admin back-office
- Story 17.12: Slug spectacle — sans saisie dans le formulaire
- Story 17.13: Formulaire spectacle — date et heure Material
- Story 17.14: Onglet Infos — type de spectacle et rôles (modales)
- Story 17.15: Onglet Infos — organisateur·ices ; retrait participants du formulaire
- Story 17.18: Raccourcis croisés agenda ↔ saison (app bar)
- Story 17.19: Hub membre `/accueil` — À faire (MVP)
- Story 17.20: Remember last visit — `lastMemberEntryPath`
- Story 17.21: API `GET /me/inbox` — confirmations et résumé hub
- Story 17.22: Shell navigation bar M3 (À faire · Agenda · Saison)
- Story 17.23: Sélecteur de contexte troupe · saison (fil + menu)
- Story 17.25: Menu compte — rail footer (desktop) · avatar shell (mobile)
- Story 17.27: Panneau de filtres unifié (icône + chips)
- Story 17.28: Filtres hub + pickers individuels (correctif UX-DR22.1)
- Story 17.31: Modifier la saison — gear workspace
- Story 17.32: Exporter statistiques — menu admin saison
- Story 17.37: Détail spectacle — rangée titre + statut
- Story 17.41: Nav shell — onglet Ma troupe + `lastVisitedTroupeSlug`
- Story 17.42: Hub troupe — dashboard collectif
- Story 17.43: Détail spectacle — contexte Infos + retrait breadcrumb
- Story 17.44: Hub troupe — mini-chart mois saison
- Story 17.45: Nav shell — Mes stats avant Ma troupe
- Story 17.46: Détail spectacle — remplacer Infos par un bandeau

## Requirements & Constraints

- Authorized people can navigate from a show to its season workspace and troupe hub; membership and event-scoped permissions must continue to govern visibility and administration.
- Administrators manage seasons and shows; active members and appropriately scoped participants can view active shows. Archived and inactive shows remain restricted to authorized administrators and organizers.
- Each show has a title, date/time, venue, optional description, type, and lifecycle status. Event-specific organizer and role configuration must remain accessible to authorized people.
- A show has at most one optional category, distinct from its format; no category means the ordinary pool. Categories partition relevant fairness calculations and statistics within the season.
- The new 17.46 request removes the Infos tab and introduces an agenda-inspired header; its detailed content and the destination of existing information and actions require design during the story.

## Technical Decisions

- Use canonical troupe-and-season-scoped routes, with a show slug unique within its season. Legacy entry points retain their defined redirect or disambiguation behavior.
- The V2 frontend is Angular with Angular Material and theme tokens; server-side authorization remains the authority for protected data and operations. Keep existing scope-aware administration and audit boundaries intact.
- Categories are troupe-managed vocabulary; their absence is a meaningful default rather than a separately stored ordinary category. Show format and role slots remain distinct from category.

## UX & Interaction Patterns

- Design for mobile first while supporting desktop; use Material components, accessible labels and focus, and the shared theme. Preserve the established capsule tab bar when changing page tabs.
- Existing show chrome uses a return control, title and scoped administration, with composition status in Équipe. Navigation to troupe and season must remain available. Earlier design placed that context and category in Infos; 17.46 explicitly changes this placement and requires a considered replacement.
- Member navigation uses the established shell; avoid duplicating global navigation or inventing a separate design system.

## Cross-Story Dependencies

- Troupe and season navigation builds on earlier member agenda and workspace capabilities; the troupe-first direction supersedes the earlier troupe hub plan.
- Show categories feed draw/chance behavior and statistical filtering. Preserve those semantics when relocating the category interface.
- Show header simplification depends on the existing contextual navigation, category, organizer and format/role experiences; format and slot editing belongs to Équipe under the later Epic 22 decision.
