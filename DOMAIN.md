# Domain model (HatCast)

**Location:** Repository root. Domain language applies across the whole product; root keeps it easy to reference from SPEC, ARCH, and code.

Shared domain language and rules extracted from the codebase. Use consistent terms in specs, plans, and code comments.

---

## Glossary

- **Season:** A container for one "run" of shows (e.g. a year or a tour). Has a slug (URL-safe id), events, and players. Firestore: top-level `seasons/{seasonId}` (see `firestore.rules`, `src/services/storage.js`, `seasons.js`).
- **Event:** A single date/ show within a season. Belongs to a season. Has a date, title, and optionally role slots. Subcollection or document under the season (e.g. `seasons/{id}/events`).
- **Player:** A participant in a season. Has identity (name, optional email link). Stored under the season (e.g. `seasons/{id}/players`). Can be "claimed" by an authenticated user (e.g. `playerAssociations`, `playerProtection`).
- **Availability:** A player's status for an event (e.g. available / unavailable). Stored per player per event (e.g. `availability` subcollection or nested; see `playerAvailabilityService.js`, `storage.js`).
- **Cast:** The set of players selected to perform at an event after the draw. One cast per event. Includes roles and per-player status (pending, confirmed, declined). Stored e.g. in `seasons/{id}/casts`; structure observed in `castService.js`, `selectionService.js`.
- **Draw / selection:** The process that picks players for an event (weighted random, considering past participation). Implemented in `selectionService.js`, `chancesService.js`.
- **Chances / weight:** Influence of past participations on draw fairness. See `chancesService.js`.
- **Admin (season):** User allowed to manage a specific season (events, players, draw, invitations). Stored in Firestore (e.g. `seasons/{id}/admins`). Checked by `permissionService.js`.
- **Super Admin:** Global admin; can access any season admin. Server-side (Cloud Function or config); see `permissionService.isSuperAdmin()`, `functions/adminFunctions.js`.
- **Invitation:** Mechanism to invite someone to join a season or claim a player. Uses `invitations` collection and flows like `/accept-invitation`, `JoinSeason.vue`.
- **Audit log:** Immutable record of significant actions. Stored in `auditLogs`; written by client (`auditClient.js`) and/or Firestore triggers (`functions/auditTriggers.js`).
- **Magic link:** Passwordless auth link; stored in `magicLinks` or `accountMagicLinks`, processed in `magicLinks.js` and auth views.
- **Push queue / reminder queue:** Firestore collections (`pushQueue`, `reminderQueue`) consumed by Cloud Functions to send push notifications or email reminders (see `functions/index.js`).

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
User 1──* userPreferences, userPushTokens, userNavigation
```

- **Seasons** are top-level. **Events**, **players**, **casts**, **admins**, and **availability** are scoped to a season (subcollections or documents keyed by season). Observed in `firestore.rules`, `storage.js`, `firestoreService.getDocuments('seasons', seasonId, ...)`.
- **Casts** are keyed by event (e.g. one cast per eventId). Cast has `playerStatuses` (player id → pending|confirmed|declined) and `roles` (player → role). See `castService.js`, `selectionService.js`.
- **User** (Firebase Auth) is separate from **Player**. Linking is via `playerAssociations` and optional `playerProtection` (observed in Firestore rules and services).

---

## Business rules / invariants (must always hold)

- **One cast per event:** For a given event there is at most one cast; the draw produces or updates it (observed in storage/cast usage).
- **Cast status values:** Player status in a cast is one of: pending, confirmed, declined (see `castService.getPlayerCastStatus`).
- **Admin access:** Only users in `seasons/{id}/admins` or Super Admin can write/admin that season; enforced by router guard and permission checks (`main.js`, `permissionService.js`) and by Firestore rules where applicable.
- **Audit write:** Audit logs are append-only; client and triggers write, no deletion from app logic (auditLogs allow write: if true for logging; other rules in `firestore.rules`).
- **Queue consumption:** `mail`, `reminderQueue`, `pushQueue` are written by the client and read/processed only by Cloud Functions (rules: read false for client).
- **Firestore database selection:** Environment (development/staging/production) selects which Firestore database is used; controlled by `configService.js` and VITE_* env (see ARCH.md).

---

## Statistiques de composition (vue Compositions)

La vue Compositions affiche des statistiques par joueur et par catégorie de rôle. Un événement est soit « spectacle local » (match, cabaret, longform, freeform, catch, custom, survey) soit « déplacement ». Les participations en déplacement vont dans la catégorie DEPLACEMENT, jamais dans JEU ou DECORUM. Implémenté dans `src/components/CastsView.vue`, `calculatePlayerRoleStats`.

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
- **Availability:** Set per event; no formal state machine; values reflect available/unavailable (and possibly other states in UI; see `AvailabilityCell.vue`, `playerAvailabilityService.js`).
- **Draw workflow:** Admin triggers draw → selection algorithm runs → casts written/updated → optional announce. No intermediate "draft" cast state clearly modelled; cast is the result of the last draw for that event.

---

## OPEN QUESTIONS + ambiguities

- **Ambiguity:** Exact schema of `availability` (subcollection path and field names) is spread across `storage.js` and `playerAvailabilityService.js`; a single canonical definition (e.g. in this DOMAIN or a schema doc) would help.
- **OPEN QUESTION:** Whether a player can be in multiple seasons with the same identity and how claiming works across seasons is not fully documented in code comments.
- **Ambiguity:** "Role" in a cast (e.g. for multi-role shows) vs simple "selected": both appear in code (`castService.getPlayerCastRole`, selection-multi-roles docs); exact role set and who defines it (per event vs per season) not fully unified here.
- **OPEN QUESTION:** Lifecycle of invitations (expiry, single-use) is implied by usage but not defined in one place.

**Code references:** Draw and chances: [src/services/selectionService.js](src/services/selectionService.js), [src/services/chancesService.js](src/services/chancesService.js). Casts: [src/services/castService.js](src/services/castService.js). Availability: [src/services/playerAvailabilityService.js](src/services/playerAvailabilityService.js), [src/services/storage.js](src/services/storage.js). Seasons/players: [src/services/seasons.js](src/services/seasons.js), [src/services/players.js](src/services/players.js).
