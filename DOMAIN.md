# Domain model (HatCast)

**Location:** Repository root. Domain language applies across the whole product; root keeps it easy to reference from SPEC, ARCH, and code.

Shared domain language and rules extracted from the codebase. Use consistent terms in specs, plans, and code comments.

---

## Glossary

- **Troupe:** The performing group / organisation whose **identity** and **seasons** are managed together in admin. (May map 1:1 to a tenant or org in the target data model; legacy code often scopes by **season** only—see ARCH when migrating.)
- **Troupe membership (V2):** Link between a `users` row and a troupe. `ACTIVE` memberships grant member read access to troupe-scoped V2 data; `INACTIVE` memberships are retained for audit/history but no longer grant troupe access.
- **Baseline troupe role (V2):** Role stored on a troupe membership. Current values are `MEMBER` and `TROUPE_ADMIN`. `MEMBER` grants active-member read access only. `TROUPE_ADMIN` grants troupe-level administration: members, baseline roles, seasons, events, and organizer delegation.
- **Organizer delegation (V2):** Narrow season/event-scoped permission represented by `season_organizers` and `event_organizers`. It does not make a user a troupe admin and must not be encoded as a baseline troupe role.
- **League (product term; V2 code/DB: `season`):** A container for one programme of shows within a troupe (e.g. a competitive circuit, a leisure year, a tour). Has a slug (URL-safe id), events, and participants. French UI label: **Ligue**. A troupe may run **several active leagues concurrently**. V2 PostgreSQL: `seasons` table; routes may use `/ligue/:slug` (alias `/saison/:slug` during transition). See [ADR 0011](docs/adr/0011-league-model-and-user-agenda.md).
- **Season:** **Legacy synonym for League** in V1 and early V2 docs/code. Prefer **League** / **Ligue** in new product copy and specs.
- **Encounter (optional, post-MVP):** A real-world match or show that may correspond to **more than one HatCast event** (one per troupe’s league). MVP: no shared entity — create independent events; UI distinguishes by troupe/league badges. Post-MVP: optional link id between paired events.
- **User agenda:** The signed-in member’s **cross-league upcoming event list** — all events in leagues where the user is a **league participant**, across all troupes. Primary member hub in V2 target IA (`/agenda`). Distinct from a **league workspace agenda** (single-league view). Supports **troupe** and **league** filters when multiple contexts exist (controls hidden when only one — RES-001).
- **League workspace views:** Within one league, three surfaces: **Agenda** (upcoming events), **Historique** (past events, chronological list only), **Statistiques** (participation stats grid, V1 parity). Each has its own export when applicable (ADR 0012).
- **Travel league (*ligue déplacements*):** A league dedicated to **away shows** within a troupe. Same mechanics as other leagues (roster, events, draw, stats). **Preferred V2 model** for déplacements instead of a `deplacement` spectacle template type on show leagues. A troupe may run e.g. *Ligue Spectacle* + *Ligue Déplacements* concurrently.
- **Personal season glance:** Member-facing screen (*Ma saison en un clin d'œil*, V1 `PlayerModal`) — summary cards, monthly chart, preferred roles; route e.g. `/membre/:userSlug`; optional troupe/league filters; any authorized member may view another participant’s glance (transparency).
- **Event:** A single date/ show within a season. Belongs to a season. Has a date, title, and optionally role slots. Subcollection or document under the season (e.g. `seasons/{id}/events`). For UI, “past” vs still on the programme follows the **calendar day in `Europe/Paris`** (see `legacy/src/utils/eventPastParis.js`), not raw UTC instant of a date-only field.
- **Player:** A participant in a season. Has identity (name, optional email link). Stored under the season (e.g. `seasons/{id}/players`). Can be "claimed" by an authenticated user (e.g. `playerAssociations`, `playerProtection`).
- **Availability:** A player's status for an event (e.g. available / unavailable). Stored per player per event in V1 (e.g. `availability` subcollection or nested; see `playerAvailabilityService.js`, `storage.js`). **V2 (PostgreSQL):** table `event_availability`, keyed by `(event_id, user_id)`; API status `available` | `unavailable` | `unknown` (no row). When `available`, column `role_keys` holds a JSON array of event-required role keys the member offers; an **empty array** means general availability (eligible for any required role on the event, V1 parity).
- **Cast:** The set of players selected to perform at an event after the draw. One cast per event. Includes roles and per-player status (pending, confirmed, declined). Stored e.g. in `seasons/{id}/casts`; structure observed in `castService.js`, `selectionService.js`.
- **Draw / selection:** The process that picks players for an event (weighted random, considering past participation). Implemented in `selectionService.js`, `chancesService.js`.
- **Chances / weight:** Influence of past participations on draw fairness. See `chancesService.js`.
- **Admin (season):** User allowed to manage a specific season (events, players, draw, invitations). Stored in Firestore (e.g. `seasons/{id}/admins`). Checked by `permissionService.js`.
- **Super Admin:** Global admin; can access any season admin. Server-side (Cloud Function or config); see `permissionService.isSuperAdmin()`, `functions/adminFunctions.js`.
- **Invitation:** Mechanism to invite someone to join a season or claim a player. Uses `invitations` collection and flows like `/accept-invitation`, `JoinSeason.vue`.
- **Audit log:** Immutable record of significant actions. Stored in `auditLogs`; written by client (`auditClient.js`) and/or Firestore triggers (`functions/auditTriggers.js`).
- **Magic link:** Passwordless auth link; stored in `magicLinks` or `accountMagicLinks`, processed in `magicLinks.js` and auth views.
- **Push queue / reminder queue:** Firestore collections (`pushQueue`, `reminderQueue`) consumed by Cloud Functions to send push notifications or email reminders (see `functions/index.js`).
- **Display filter (participants / events):** User-selected subset of players or events to display in the grid views. `null` = all; `Set<id>` = only those IDs. State in GridBoard (`selectedPlayerIds`, `selectedEventIds`); UI in PlayerSelectorModal, EventSelectorModal, ViewHeader.

---

## Key entities and relationships

```
Season 1──* Event
Season 1──* Player
Season 1──* Cast (one per Event)
Season 1──* Admin (users)
Event 1──1 Cast
Player *──* Availability (per Event)
Cast *──* Player (with role and status: pending | confirmed | declined)
User (auth) *──* Player (via claim / association)
User (V2) *──* Troupe (via troupe_memberships)
Troupe (V2) 1──* Season
TroupeMembership (V2) has baseline role MEMBER | TROUPE_ADMIN
Season/Event organizer delegation (V2) is scoped separately from baseline role
User 1──* userPreferences, userPushTokens, userNavigation
```

- **Seasons** are top-level. **Events**, **players**, **casts**, **admins**, and **availability** are scoped to a season (subcollections or documents keyed by season). Observed in `firestore.rules`, `storage.js`, `firestoreService.getDocuments('seasons', seasonId, ...)`.
- **Casts** are keyed by event (e.g. one cast per eventId). Cast has `playerStatuses` (player id → pending|confirmed|declined) and `roles` (player → role). See `castService.js`, `selectionService.js`.
- **User** (Firebase Auth) is separate from **Player**. Linking is via `playerAssociations` and optional `playerProtection` (observed in Firestore rules and services).

---

## Business rules / invariants (must always hold)

- **Multiple active leagues (troupe scope):** For a given **troupe**, **zero or more** leagues may be **non-archived and active** at the same time (e.g. leisure league + show league). Activating or creating a league **must not** deactivate other leagues. Archiving is explicit. See [ADR 0011](docs/adr/0011-league-model-and-user-agenda.md). *(Supersedes prior “single active season per troupe” invariant.)*
- **League participant roster:** League participation is distinct from troupe membership. On league creation, admins choose **all active troupe members** as initial participants **or** an **empty/manual roster** (add participants individually; optional email pre-link per FR45).
- **User agenda scope:** The member agenda includes an event **only if** the user is a **league participant** for that event’s league (or event-scoped participant where applicable). **Inter-troupe encounters** appear as **separate events** (one row per troupe’s event); the product does not merge them in the agenda. Users may **exclude travel leagues** (or any league) via filters when multiple leagues exist.
- **Travel vs show leagues:** **Déplacements** are modeled as events in a **travel league**, not as a separate spectacle template on show leagues (V2 target). Draw and statistics run **per league**; no special-case draw branch for `templateType = deplacement` on show leagues once travel leagues are adopted. Legacy `deplacement` events remain valid until migrated.
- **At least one active troupe admin (V2):** A troupe must keep at least one active membership with `baseline_role = TROUPE_ADMIN`; demoting or deactivating the last active admin is rejected.
- **Soft deactivation for members (V2):** Removing a member sets `troupe_memberships.status = INACTIVE`; membership rows are not hard-deleted by the member-admin flow.
- **Demo direct join limitation (V2):** Direct self-join remains limited to the seed/demo troupe and creates/reactivates `MEMBER` memberships only. Admin access is managed through the member-admin API.
- **One cast per event:** For a given event there is at most one cast; the draw produces or updates it (observed in storage/cast usage).
- **Cast status values:** Player status in a cast is one of: pending, confirmed, declined (see `castService.getPlayerCastStatus`).
- **Admin access:** Only users in `seasons/{id}/admins` or Super Admin can write/admin that season; enforced by router guard and permission checks (`main.js`, `permissionService.js`) and by Firestore rules where applicable.
- **Audit write:** Audit logs are append-only; client and triggers write, no deletion from app logic (auditLogs allow write: if true for logging; other rules in `firestore.rules`).
- **Queue consumption:** `mail`, `reminderQueue`, `pushQueue` are written by the client and read/processed only by Cloud Functions (rules: read false for client).
- **Firestore database selection:** Environment (development/staging/production) selects which Firestore database is used; controlled by `configService.js` and VITE_* env (see ARCH.md).

---

## Statistiques de composition (vue Statistiques ligue)

La vue **Statistiques** (ex-Compositions / Historique stats V1) affiche des statistiques par joueur et par catégorie de rôle. **Historique** (liste chronologique des événements passés) est une vue **distincte** — pas de grille stats (ADR 0012).

**Périmètre événement pour les stats :**

- **Spectacle local** (match, cabaret, longform, freeform, catch, custom, survey) dans une **ligue spectacle** → colonnes JEU / DECORUM / BÉNÉVOLE selon les règles ci-dessous.
- **Déplacement (V2 cible) :** événements dans une **ligue déplacements** → comptés en **DEPLACEMENT** uniquement (JEU/DECORUM de la ligue déplacements si applicable).
- **Legacy :** événement `templateType = deplacement` dans une ligue spectacle → catégorie **DEPLACEMENT** (V1) jusqu’à migration.

Les participations en déplacement **ne comptent jamais** dans JEU ou DECORUM d’une ligue spectacle. Implémenté dans `legacy/src/components/CastsView.vue`, `calculatePlayerRoleStats`.

| Catégorie    | Colonne         | Contenu                                                                 | Source                                      |
| ------------ | --------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| **JEU**      | JEU MATCH       | Joueur (role=player) dans événements match                              | Spectacles locaux uniquement                 |
| **JEU**      | JEU CAB         | Joueur dans événements cabaret                                         | idem                                        |
| **JEU**      | JEU LONG        | Joueur dans événements longform                                        | idem                                        |
| **JEU**      | JEU AUTRE       | Joueur dans freeform, catch, custom                                    | idem                                        |
| **JEU**      | TOTAL JEU       | Somme des 4 colonnes ci-dessus                                         | Ne compte jamais les déplacements            |
| **DECORUM**  | MC, DJ, etc.    | Rôles MC, DJ, Arbitre, Assist., Coach dans événements non-déplacement   | Spectacles locaux uniquement                 |
| **DEPLACEMENT** | JEU           | Joueur dans événements deplacement                                    | Uniquement déplacements                     |
| **DEPLACEMENT** | DECORUM       | MC, DJ, Arbitre, etc. dans événements deplacement (cas rare)            | idem                                        |
| **DEPLACEMENT** | TOTAL DÉPLACEMENT | Somme JEU + DECORUM pour déplacements                               | idem                                        |
| **BÉNÉVOLE** | RÉGISSEUR       | Rôle stage_manager dans tous événements                                | Sous-rôle bénévole                          |
| **BÉNÉVOLE** | LUMIÈRE         | Rôle lighting dans tous événements                                     | Sous-rôle bénévole                           |
| **BÉNÉVOLE** | BÉNÉVOLE        | Rôle volunteer dans tous événements                                    | Le rôle « Bénévole » proprement dit         |
| **BÉNÉVOLE** | TOTAL BÉNÉVOLE  | Somme Régisseur + Lumière + Bénévole                                   | idem                                        |

### Zone spectacles (colonnes par mois)

La zone spectacles affiche les participations par mois. Chaque mois est une colonne agrégée avec « voir les détails » / « masquer les détails » pour afficher ou masquer les sous-colonnes (une par événement).

| Élément   | Contenu                                                                 | Règle de calcul                                                                 |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Colonne mois (collapsed) | Nb participations (tous rôles) + % | Participations = événements du mois où le joueur a un rôle dans un cast confirmé (sans désistement). % = `getStatPercent(participations, dispos, declines)` avec dispos = événements où `isAvailableForRole` true pour au moins un rôle, declines = événements où le joueur a décliné. |
| Colonne mois (expanded) | Colonne de résumé (nb + %) + une colonne par événement | Même calcul pour le résumé ; chaque événement affiche la cellule de sélection habituelle. |
| Mois affichés | Mois ayant au moins un événement                                        | Triés chronologiquement (année, mois).                                          |

---

## State machines / workflows (observed)

- **Auth state:** Anonymous / unauthenticated → signed in (email, magic link, Google). Password reset: request → email with link → reset (views: `PasswordReset.vue`, `MagicLink.vue`). No explicit state diagram in code; flows in auth components and `authState.js`.
- **Cast status (per player in a cast):** pending → confirmed or declined (user action). No "cancelled" or revert in code observed.
- **Availability:** Set per event; no formal state machine; values reflect available/unavailable (and possibly other states in UI; see `AvailabilityCell.vue`, `playerAvailabilityService.js`). **V2:** three API states plus optional per-role candidacy via `role_keys` when status is `available`.
- **Draw workflow:** Admin triggers draw → selection algorithm runs → casts written/updated → optional announce. No intermediate "draft" cast state clearly modelled; cast is the result of the last draw for that event.

---

## OPEN QUESTIONS + ambiguities

- **Ambiguity (V1):** Exact schema of legacy `availability` (subcollection path and field names) is spread across `storage.js` and `playerAvailabilityService.js`. **V2 canonical shape:** `event_availability.role_keys` (see glossary — Availability).
- **OPEN QUESTION:** Whether a player can be in multiple seasons with the same identity and how claiming works across seasons is not fully documented in code comments.
- **Ambiguity:** "Role" in a cast (e.g. for multi-role shows) vs simple "selected": both appear in code (`castService.getPlayerCastRole`, selection-multi-roles docs); exact role set and who defines it (per event vs per season) not fully unified here.
- **OPEN QUESTION:** Lifecycle of invitations (expiry, single-use) is implied by usage but not defined in one place.

**Code references:** Draw and chances: [legacy/src/services/selectionService.js](legacy/src/services/selectionService.js), [legacy/src/services/chancesService.js](legacy/src/services/chancesService.js). Casts: [legacy/src/services/castService.js](legacy/src/services/castService.js). Availability: [legacy/src/services/playerAvailabilityService.js](legacy/src/services/playerAvailabilityService.js), [legacy/src/services/storage.js](legacy/src/services/storage.js). Seasons/players: [legacy/src/services/seasons.js](legacy/src/services/seasons.js), [legacy/src/services/players.js](legacy/src/services/players.js).
