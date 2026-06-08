# Domain model (HatCast)

**Location:** Repository root. Domain language applies across the whole product; root keeps it easy to reference from SPEC, ARCH, and code.

Shared domain language and rules extracted from the codebase. Use consistent terms in specs, plans, and code comments.

---

## Glossary

- **Troupe:** The performing group / organisation whose **identity** and **seasons** are managed together in admin. (May map 1:1 to a tenant or org in the target data model; legacy code often scopes by **season** only—see ARCH when migrating.)
- **Troupe membership (V2):** Link between a `users` row and a troupe. `ACTIVE` memberships grant member read access to troupe-scoped V2 data; `INACTIVE` memberships are retained for audit/history but no longer grant troupe access.
- **Baseline troupe role (V2):** Role stored on a troupe membership. Values: `MEMBER`, `TROUPE_ADMIN`, and **`EXTERNE`** (French UI: **Externe** — troupe contact-book entry; see [ADR 0021](docs/adr/0021-troupe-externes-carnet-invitations.md)). `MEMBER` grants active-member read access only. `TROUPE_ADMIN` grants troupe-level administration. **`EXTERNE` grants no member hub or browse-all-seasons access by itself** — only organizer recall in admin and invitation-derived guest access when roster-scoped.
- **Organizer delegation (V2):** Narrow season/event-scoped permission represented by `season_organizers` and `event_organizers`. It does not make a user a troupe admin and must not be encoded as a baseline troupe role.
- **Season (V2 code/DB: `season`; French UI: Saison):** A first-class programme container within a troupe: temporal bounds, stable participant roster, events, draws, and season-scoped views (Agenda, Historique, Statistiques). Has a slug (URL-safe id), **unique within the troupe** (not globally — two troupes may share the same season slug, e.g. `saison-2026-2027`). Canonical route: **`/saison/:troupeSlug/:seasonSlug`**. Legacy **`/saison/:seasonSlug`** redirects to canonical when unambiguous among the user’s memberships; otherwise a chooser. See [ADR 0011](docs/adr/0011-league-model-and-user-agenda.md), [ADR 0013](docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md).
- **League:** **Deprecated** — reserved for a future inter-troupe concept. Use **Saison** in UI and `season*` in API/JSON field names for the programme container within a troupe.
- **Format (V2 code/DB/API: `templateType`; French UI: Format):** The spectacle format (cabaret, match, longform, …). Drives default role slots and statistics column routing. Per-event `roleSlots` may override format defaults; overrides **do not** change `templateType`. Distinct from **Catégorie** (fairness pool). Examples: `match`, `cabaret`, `longform`.
- **Catégorie (optional, per event; V2 code/DB: `category`):** A single optional label on an event that assigns participations to a **category pool** for chances, auto-draw, and related stats within a season. **Empty = principal category** (system default; French UI label **Spectacle ordinaire** on Infos tab when unset — see [ux-design-journey-league-agenda.md](_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md) § Screen 6b). Examples: `deplacements`, `aperock`. Distinct from **format** (`templateType`). Not navigable. French UI section: **Catégorie**. See [ADR 0013](docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md).
- **Encounter (optional, post-MVP):** A real-world match or show that may correspond to **more than one HatCast event** (one per troupe’s league). MVP: no shared entity — create independent events; UI distinguishes by troupe/league badges. Post-MVP: optional link id between paired events.
- **User agenda:** The signed-in member’s **cross-league upcoming event list** — all events in leagues where the user is a **league participant**, across all troupes. Primary member hub in V2 target IA (`/agenda`). Distinct from a **league workspace agenda** (single-league view). Supports **troupe** and **league** filters when multiple contexts exist (controls hidden when only one — RES-001).
- **Participant focus summary (V2 API/UI: `participantFocus`):** Per-event, per-viewer snapshot for agenda cards and list enrichment — `availabilityStatus`, optional `compositionRoleKey`, `inTeam`, optional `slotParticipationStatus` (`pending` | `confirmed` | `declined`). Resolved server-side by `EventParticipantFocusService` from availability, composition slots, and **decline rows** (`event_composition_declines`). Distinct from raw `myAvailabilityStatus` alone: the UI prefers `participantFocus` when present.
- **League workspace views:** Within one league, three surfaces: **Agenda** (upcoming events), **Historique** (past events, chronological list only), **Statistiques** (participation stats grid, V1 parity). Each has its own export when applicable (ADR 0012).
- **Travel league (*ligue déplacements*):** **Superseded for new work** by **spectacle categories** (ADR 0013). Historical ADR 0012 approach: separate season for away shows. Legacy `template_type = deplacement` and any existing travel seasons remain until migrated to `category = deplacements` on events in the primary season.
- **Personal season glance:** Member-facing screen (*Ma saison en un clin d'œil*, V1 `PlayerModal`) — summary cards, monthly chart, preferred roles; route e.g. `/membre/:userSlug`; optional troupe/league filters; any authorized member may view another participant’s glance (transparency).
- **Event:** A single date/ show within a season. Belongs to a season. Has a date, title, and optionally role slots. Subcollection or document under the season (e.g. `seasons/{id}/events`). For UI, “past” vs still on the programme follows the **calendar day in `Europe/Paris`** (see `legacy/src/utils/eventPastParis.js`), not raw UTC instant of a date-only field.
- **Player:** A participant in a season. Has identity (name, optional email link). Stored under the season (e.g. `seasons/{id}/players`). Can be "claimed" by an authenticated user (e.g. `playerAssociations`, `playerProtection`).
- **Availability:** A player's status for an event (e.g. available / unavailable). Stored per player per event in V1 (e.g. `availability` subcollection or nested; see `playerAvailabilityService.js`, `storage.js`). **V2 (PostgreSQL):** table `event_availability`, keyed by `(event_id, user_id)`; API status `available` | `unavailable` | `unknown` (no row). When `available`, column `role_keys` holds a JSON array of event-required role keys the member offers; an **empty array** means general availability (eligible for any required role on the event, V1 parity).
- **Cast:** The set of players selected to perform at an event after the draw. One cast per event. Includes roles and per-player status (pending, confirmed, declined). Stored e.g. in `seasons/{id}/casts`; structure observed in `castService.js`, `selectionService.js`.
- **Draw / selection:** The process that picks players for an event (weighted random, considering past participation). **V2 normative behaviour:** [ADR 0019](docs/adr/0019-draw-weight-engine.md) + [draw-weight-engine-v1-spec.md](docs/v2/technical/draw-weight-engine-v1-spec.md) (formula, history rules, display %). V1 runtime reference (read-only): `legacy/src/services/chancesService.js`, `GridBoard.vue` draw paths.
- **Chances / weight:** Influence of past participations on draw fairness. **V2:** same calculator pipeline for draw, Dispos **Tous %**, and Équipe explainability — see ADR 0019; do not duplicate formula here. V1 legacy: `chancesService.js`.
- **Admin (season):** User allowed to manage a specific season (events, players, draw, invitations). Stored in Firestore (e.g. `seasons/{id}/admins`). Checked by `permissionService.js`.
- **Super Admin:** Global admin; can access any season admin. Server-side (Cloud Function or config); see `permissionService.isSuperAdmin()`, `functions/adminFunctions.js`.
- **Invitation:** Mechanism to invite someone to join a season or claim a player. Uses `invitations` collection and flows like `/accept-invitation`, `JoinSeason.vue`.
- **Audit log (V1 legacy):** Immutable record of significant actions. Stored in Firestore `auditLogs`; written by client (`auditClient.js`) and/or Firestore triggers (`functions/auditTriggers.js`). **V2 (PostgreSQL, Story 9.0):** append-only table `audit_events` — actor, subject, `action_type`, scope ids (`troupe_id`, `season_id`, `event_id`), `before`/`after` JSON snapshots; written in the **same transaction** as the domain mutation by `AuditEventRecorder` (no GET API in 9.0 — consultation = stories 9.1 / 9.2).
- **Magic link:** Passwordless auth link; stored in `magicLinks` or `accountMagicLinks`, processed in `magicLinks.js` and auth views.
- **Push queue / reminder queue:** Firestore collections (`pushQueue`, `reminderQueue`) consumed by Cloud Functions to send push notifications or email reminders (see `functions/index.js`).
- **Display filter (participants / events):** User-selected subset of players or events to display in the grid views. `null` = all; `Set<id>` = only those IDs. State in GridBoard (`selectedPlayerIds`, `selectedEventIds`); UI in PlayerSelectorModal, EventSelectorModal, ViewHeader.
- **Season participant (V2):** Person on a season roster (`season_participants`). May be synced from an active **`MEMBER`** or **`TROUPE_ADMIN`** troupe membership, added explicitly (name-only, linked user, prelinked email), or linked from an **`EXTERNE`** carnet entry via organizer add flows. Distinct from full troupe member access when the person is **`EXTERNE`** only.
- **Troupe externe / carnet (V2):** Active `troupe_memberships` row with `baseline_role = EXTERNE`. Organizer-managed **contact book** for people the troupe may re-invite (punctual or recurring). **Display name required**; email and HatCast account **optional** (name-only contacts are valid). Carnet alone grants **no** member app access. Managed in the same **Membres** admin UI as members and admins. See [ADR 0021](docs/adr/0021-troupe-externes-carnet-invitations.md).
- **Invitation scope (V2, externe):** Normative scope for what a roster invitation allows (dispos, notifications, agenda visibility). **`SEASON`** — all published season events (subject to per-event exclusions); **`EVENT`** — only explicitly invited spectacle(s). Scope is carried on season/event participation, not inferred from carnet alone.
- **Event roster exclusion (V2):** Local filter (`event_participant_exclusions`) — hides a season participant from one event’s roster only. Does not change troupe membership or season participant status.
- **Season roster removal (V2):** Soft removal from one season’s active roster (`season_participants.status = REMOVED`, or equivalent). Does not deactivate troupe membership. Other seasons of the same troupe are unaffected.
- **Account deletion (V2, FR37):** Self-service removal of a HatCast **user account** from Mon compte. Anonymizes personal data on the `users` row (`deleted_at`, cleared email/names/avatar/IdP ids); revokes sign-in permanently. Distinct from troupe admin **Retirer** (FR7) and from season/event roster removal. See business rules below.
- **Organizer share / announce (V2):** Manual organizer workflow to share an editable message about an event (Notifier, Copier, WhatsApp) and, when enabled, dispatch HatCast notifications (email / push) to recipients. Implemented as one dialog shell with intent-specific title, default message, audience, and guard rules. French UI examples: *Annonce de spectacle*, *Rappel disponibilité*, *Partager le tirage*, *Annoncer la compo*.
- **Availability announcement (*annonce de disponibilités*):** First organizer-initiated send (manual or automatic at publication) that invites season participants to indicate availability for a **published** event. Same **business family** as a availability reminder — not a separate product capability.
- **Availability reminder (*relance de disponibilités*):** Any **subsequent** organizer send of the same availability-request family on the same event, after at least one prior send of that family. Uses the **same orchestration path** as the first announcement; only presentation (title, default message tone) differs so members and organizers can tell a reminder from the initial announcement.
- **Channel eligibility (share recipients):** Per recipient and channel (email, push), whether HatCast **can** attempt delivery for the current send (e.g. normalized email present; push allowed for category and user preferences).
- **Channel notified (share recipients):** Per recipient and channel, whether HatCast **already delivered** (or partially delivered) for the relevant notification intent(s) on this event — backed by `notification_delivery_log` with status `SENT` or `PARTIAL`. Used so organizers see who still needs manual follow-up (Copier / WhatsApp) and whether a resend is fair.
- **Notification delivery log (V2):** Append-only record of notification attempts per `(event_id, user_id, channel, intent, status)`. Source of truth for “already notified” in organizer recipient detail. Distinct from `event_manual_share_notify` (anti-spam timestamp for manual POST per dialog intent).
- **Member gender (V2, optional):** Self-declared account attribute on `users.gender`: `male` | `female` | `non_specified`. French UI: Homme / Femme / Non précisé. Default `non_specified`. Drives gender-aware **role labels** and **avatar fallback** when set; inclusive middot labels when not. Not troupe-scoped. Normative detail: [_spec-member-gender-parity/member-gender.md_](_bmad-output/specs/spec-member-gender-parity/member-gender.md).
- **Participant gender (organizer-set, V2):** Optional attribute on `season_participants.gender` / `event_participants.gender` — same enum as member gender. Set by **organizers** when adding or editing a roster row whose linked account has **no** `male`/`female` (name-only guest, pre-linked email without account, or account Non spéc./unset). **Not** a substitute for member self-service when account gender is M/F. See [ADR 0020](docs/adr/0020-participant-gender-organizer-operational.md).
- **Effective participant gender:** Gender used for role labels, avatar tone, mixité (**6.21**), and season parity aggregate (**16.3**). Precedence: linked account `male`/`female` → else participant row `male`/`female` → else `non_specified`. On member Mon compte PATCH to M/F, cascade sync all linked participant rows; on PATCH to Non spéc., clear participant gender (organizer may re-set on roster). Story **2.12d**.
- **Gender-aware role label:** Display string for a `roleKey` chosen from masculine, feminine, or inclusive tables based on **effective participant gender**. V1 reference: `legacy/src/services/storage.js` `getRoleLabel`.
- **Team gender parity (player role):** Count of filled composition slots with `roleKey = player` where **effective gender** is `female` or `male`. Ratio `femaleShare = f / (f + m)` excludes `non_specified` from the denominator. Used for organizer hint (**6.21**) and optional season aggregate (**16.3**).

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
TroupeMembership (V2) has baseline role MEMBER | TROUPE_ADMIN | EXTERNE
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
- **Soft deactivation for members (V2):** Removing a member from the **troupe** (admin Membres only) sets `troupe_memberships.status = INACTIVE`; membership rows are not hard-deleted by the member-admin flow.
- **Three-level participant removal (V2):** Roster visibility is scoped at event, season, or troupe level. None of these delete historical availability, composition, or audit data; re-inclusion reuses the same domain identities (`season_participant_id`, `troupe_membership_id`, `users.id`).
  - **Event exclusion:** `event_participant_exclusions` hides a season participant from one event’s roster only. Does not change troupe membership or season participant status. Season-level statistics still include the participant unless they are also removed at season level.
  - **Season roster removal:** Sets `season_participants.status = REMOVED` for that season only (admin Participants). Does not change `troupe_memberships`. Membership sync must not re-activate season-admin removals while membership stays `ACTIVE`.
  - **Season re-inclusion:** Performed through the **add-participant** flow (no dedicated button). Re-adding a previously removed person — matched by linked user, then email, then display name — **reactivates the same `season_participant_id`** (clears `removal_source`, re-syncs a member’s name/email from the membership) instead of creating a duplicate, so availability/composition history reappears. Re-adding a member is rejected while their troupe membership is `INACTIVE` (reactivate the membership first).
  - **Troupe membership removal:** Sets `troupe_memberships.status = INACTIVE` and cascades `REMOVED` on all linked season participants for that troupe. Revokes troupe app access. Reactivation reuses the same rows so historical data becomes visible again.
- **Participant inclusion cascade on add (V2, upward):** When organizers add a guest, the product **upserts** carnet and roster rows so reuse does not require a separate Membres step. **Event add** upserts **`EXTERNE`** carnet + event roster (season roster per invitation scope / opt-in). **Season add** upserts **`EXTERNE`** carnet + season roster with **`SEASON`** scope when applicable. Re-inclusion reuses stable identities (`troupe_membership_id`, `season_participant_id`, `event_participant_id`). **`EXTERNE` rows are not auto-synced to every season** like `MEMBER` rows. See [ADR 0021](docs/adr/0021-troupe-externes-carnet-invitations.md). *(Removal remains no upward cascade — sprint-change-proposal 2026-05-31.)*
- **Account deletion (V2, FR37):** Initiated by the signed-in user from account settings (explicit multi-step confirmation). **Must not** be implemented as troupe membership removal plus season sync — account delete has different effects on statistics and identity:
  - **`users` row:** Set `deleted_at`; clear identifiable PII (email, display names, avatar, IdP/Google ids). **Do not** hard-delete the row (`audit_events.actor_user_id` and historical domain rows may still reference `users.id`).
  - **`troupe_memberships`:** All active memberships for that user → `INACTIVE` (same app-access revocation as admin Retirer).
  - **`season_participants` / `event_participants`:** **Do not** set `REMOVED`. Keep **`status = ACTIVE`** so season **Statistiques** totals are unchanged. Clear roster PII where stored (`normalized_email`); set **`user_id = NULL`** on participant rows; **keep denormalized `display_name`** on the season roster so the stats grid still shows a stable label without a live profile link.
  - **Historical data:** Availabilities, composition slots, declines, and audit entries remain keyed by `season_participant_id` and/or anonymized `users.id`; counts in [`SeasonStatisticsService`](services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) must not drop after account deletion.
  - **Sign-in:** Subsequent Google / Identity Platform sign-in for that identity is rejected (`403`) — account cannot be reactivated through normal auth.
  - **Last active troupe admin:** Deletion is rejected while the user is the sole active `TROUPE_ADMIN` of any troupe (same invariant as membership demotion).
  - **Contrast:** Admin **Retirer** removes the person from the **stats grid** (`season_participants.status = REMOVED`); account deletion removes **login and PII** only — troupe governance statistics stay intact.
- **Season participant roster vs troupe membership:** A **`MEMBER`** may be absent from one season’s roster while remaining an active troupe member and present on other seasons. An **`EXTERNE`** may be in the troupe carnet without any season roster row until invited.
- **Demo direct join limitation (V2):** Direct self-join is limited to troupes with **`join_policy = OPEN`** (including the production **Démo** troupe per [ADR-0015](docs/adr/0015-v2-demo-troupe-product-bootstrap.md)) and creates/reactivates `MEMBER` memberships only. Dev seed fiction uses troupe **Les Improbots** (`db/seed`); **La Malice** is reserved for real V1 migration data — not Flyway seed.
- **One cast per event:** For a given event there is at most one cast; the draw produces or updates it (observed in storage/cast usage).
- **Cast status values:** Player status in a cast is one of: pending, confirmed, declined (see `castService.getPlayerCastStatus`).
- **Admin access:** Only users in `seasons/{id}/admins` or Super Admin can write/admin that season; enforced by router guard and permission checks (`main.js`, `permissionService.js`) and by Firestore rules where applicable.
- **Audit write (V1):** Audit logs are append-only; client and triggers write, no deletion from app logic (`auditLogs` allow write: if true for logging; other rules in `firestore.rules`).
- **Audit write (V2):** Table `audit_events` is append-only; no application UPDATE/DELETE. On **account deletion (FR37)**, audit rows are retained; actor/subject display falls back to metadata snapshots or **« Utilisateur anonymisé »** when the linked `users` row no longer exposes PII.
- **Queue consumption:** `mail`, `reminderQueue`, `pushQueue` are written by the client and read/processed only by Cloud Functions (rules: read false for client).
- **Firestore database selection:** Environment (development/staging/production) selects which Firestore database is used; controlled by `configService.js` and VITE_* env (see ARCH.md).

---

## Statistiques de composition (vue Statistiques ligue)

La vue **Statistiques** (ex-Compositions / Historique stats V1) affiche des statistiques par joueur et par catégorie de rôle. **Historique** (liste chronologique des événements passés) est une vue **distincte** — pas de grille stats (ADR 0012).

**Participants inclus dans la grille (V2) :** Rows are built from **`season_participants` with `status = ACTIVE`** only. A participant whose HatCast account was **deleted** remains in the grid if their season roster row is still `ACTIVE` (see account deletion rule above) — totals unchanged; profile link and avatar are absent after anonymization.

**Périmètre événement pour les stats :**

- **Spectacle local** (match, cabaret, longform, freeform, catch, custom, survey) dans une **ligue spectacle** → colonnes JEU / DECORUM / BÉNÉVOLE selon les règles ci-dessous.
- **Déplacement (V2 cible) :** événements avec **`category = deplacements`** (ou équivalent troupe) → comptés en **DEPLACEMENT** uniquement pour stats/chances ; ne comptent pas dans JEU/DECORUM de la catégorie principale.
- **Legacy :** événement `templateType = deplacement` → migrer vers `category = deplacements` ; règles de lecture jusqu’à migration (ADR 0013).

### Avertissement rejeu spectacle précédent (composition, Story 6.20)

Dans un **compartiment** (`SpectacleCategory.slug` — `principal`, `deplacements`, ou catégorie personnalisée), le **prédécesseur immédiat** d’un événement courant est le dernier événement **strictement antérieur** (tie-break : `startsAt`, `createdAt`, `id`) de la même saison, **même compartiment**, composition **validée** (`event_compositions.validated_at IS NOT NULL`), non archivé.

Pour un créneau assigné sur l’événement courant, un **avertissement non bloquant** (`consecutiveShowWarning`) s’applique lorsque le participant occupait **le même `roleKey`** sur ce prédécesseur avec `participationStatus ≠ DECLINED`. Absent si aucun prédécesseur validé, compartiment différent, ou slot prédécesseur décliné. Visible **organisateur uniquement** (API + onglet Équipe). Le resolver est réutilisable pour le facteur tirage Epic **19.9** (hors scope 6.20).

### Exclusion cross-rôle au tirage (composition)

Lors d’un **tirage automatique** (`CompositionDrawService`), un participant ne peut pas occuper **deux rôles** sur le **même événement** :

- Le set d’exclusion cross-rôle (`crossRoleExcluded`) est **initialisé** avec tous les assignés déjà présents sur la composition avant le tirage (y compris assignation manuelle sur un rôle traité **plus tard** dans l’ordre de priorité : arbitre → DJ → MC → joueur → …).
- Chaque nouveau pick durant la requête est ajouté au set ; les pools des rôles suivants excluent ces participants.
- Lors d’un **re-tirage complet** d’un rôle (`isFullRedraw`), les assignés de **ce** rôle sont retirés du set avant re-pick pour rester éligibles sur ce rôle uniquement.

**Assignation manuelle (FR21) :** un organisateur **peut** cumuler plusieurs rôles pour la même personne sur un même spectacle. Le tirage auto ne doit jamais produire ce cumul seul.

### Avertissement cumul multi-rôles sur le même spectacle (composition)

Lorsqu’un participant occupe **plus d’un `roleKey`** sur le **même événement** (typiquement via assignation manuelle), un **avertissement non bloquant** (`multiRoleOnEventWarning`, champ `otherRoleKeys`) s’affiche sur **chaque** créneau concerné. Visible **organisateur uniquement** (API + onglet Équipe). N’empêche ni l’assignation, ni le tirage sur les autres rôles, ni la validation.

### Parité de genre — profil, libellés et métriques (Stories 2.12–2.12d, 6.21, 16.3)

Contrat détaillé : [_spec-member-gender-parity_](_bmad-output/specs/spec-member-gender-parity/SPEC.md) · [ADR 0020](docs/adr/0020-participant-gender-organizer-operational.md).

- **Profil :** `users.gender` optionnel ; édition **self-service** Mon compte → Mon profil ; jamais obligatoire pour dispos, tirage ou validation.
- **Roster (2.12d) :** `participant.gender` optionnel ; édition **organisateur** à l’ajout ou à la modification lorsque le compte lié n’a pas M/F ; lecture seule lorsque le compte a M/F. L’orga qui ajoute un invité non reconnu renseigne le genre au niveau participant.
- **Effectif (precedence) :** genre effectif = compte M/F si présent, sinon participant M/F, sinon `non_specified`. Cascade Mon compte → lignes participant liées (sync M/F ; effacement si Non spéc.).
- **Libellés :** si genre effectif `male` ou `female`, libellés de rôle selon tables V1 ; si `non_specified`, formes inclusives (`Comédien·ne`, etc.).
- **Avatars :** sans photo custom/Google, initiale du nom sur teinte selon genre effectif (violet / orange / gris — tokens `--hatcast-member-gender-*` ; V2 remplace les emoji V1).
- **Hint composition (6.21) :** bande informative orga sur l’onglet Équipe — effectifs F/M sur créneaux `player` remplis (genres effectifs connus) ; **non bloquant**.
- **Stats saison (16.3) :** agrégat F/M et `femaleShare` sur participations `player` validées ; genre effectif ; `non_specified` exclu du dénominateur du ratio.
- **Tirage :** facteur optionnel **19.11** — hors scope de cette règle ; dépend de **2.12** et pipeline **19.6**.

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
- **Event draft vs open (V2, Story 3.21):** A **spectacle** (event) may be in **draft** (`events.availability_opened_at` NULL) before organizers publish it for availability collection. While draft: ordinary members do not see it in season or user agendas; they may still open the event detail URL if they have a link and see a draft banner without depositing availability. **Publishing** sets `availability_opened_at` and enables member availability writes. **Closing availability** (revert to draft) clears that timestamp without deleting existing availability rows. Distinct from **composition draft** (`event_compositions.published_at`, Story 6.3).
- **Composition validate & participation status (V2, FR23 / SCP 2026-06-06, amended 2026-06-07):** **Unlock** clears `validatedAt` only — assignees and each slot's `participationStatus` (`confirmed`, `pending`, `declined`) are **preserved**. **Validate** (first or revalidate): slots already `confirmed` stay `confirmed` and receive **no** confirmation notification; other assigned slots are set to `pending` before dispatch. **First validate** sends `CONFIRMATION_REQUEST` only to non-`confirmed` assignees; **revalidate** sends `RECONFIRMATION_REQUEST` only to non-`confirmed` assignees. **Draft assign/replace** sets `pending` only when the assignee changes (no-op assign preserves status). **Organizer proxy** in organizer draft (`validatedAt` null) may set status per request without notification until validate/revalidate.
- **Participation decline on validated composition (V2, FR25):** When a linked assignee **declines**, the slot assignee is cleared, the slot returns to `pending` for refill, a row is stored in **`event_composition_declines`**, and `participantFocus` for that viewer becomes `inTeam: false`, `slotParticipationStatus: declined`, `compositionRoleKey` retained. Agenda and list UIs must show the **declined participation cell** (not availability) until the decline record exists — see SPEC § Agenda participation status cell.
- **Agenda status cell interaction (V2):** On **upcoming** league agenda and user agenda only, the participation status cell is a **secondary control**: availability states open the availability dialog; in-team pending/confirmed open the participation confirmation dialog; declined is read-only. Primary card tap still navigates to event detail. Historique: read-only cells.

### Organizer share / announce — availability lifecycle (V2, normative intent)

Product owner definition (2026-06-04):

1. **Publication** may trigger an **automatic** availability notification (`AVAILABILITY_OPENED`) when availability opens — members are informed without opening the share dialog.
2. The organizer may then use the **same manual send path** (share dialog: message + Notifier / Copier / WhatsApp) for availability-related communication.
3. The **first** such manual send on an event (after publication) is an **availability announcement** (*annonce*).
4. Any **later** manual send on the **same event** for the same business purpose is a **availability reminder** (*relance*) — **not** a different product action: same dialog workflow, same dispatch path; **title and default message template** may differ to signal “reminder”.
5. **Recipient transparency:** For every send family (availability, draw share, composition announce, …), organizers must see per recipient: which channels are eligible, which channels already received a successful HatCast delivery, and (when exposed in UI) **when** the last successful send occurred — so multiple organizers avoid accidental spam and can target people added to the roster after an earlier send.
6. **Manual contact:** Recipients with **no** eligible channel remain organizer responsibility (Copier / WhatsApp); the UI must make that visible.

**Audience (decided 2026-06-04):** Two UI entry points remain intentional (UX **D12**). **Annoncer** (`event`) targets the **full** active season roster. **Relance dispos** (`availability_nudge`) targets only participants with **`unknown`** availability. Same modal shell and dispatch stack; different audience, title, and default template.

**Runtime (story 6.17):** POST `event` dispatches `MANUAL_AVAILABILITY_ANNOUNCE`; GET maps `notified` / `lastNotifiedAt` per intent family (see [_tech-spec-share-announce-transparency-6-17.md_](_bmad-output/planning-artifacts/tech-spec-share-announce-transparency-6-17.md)). `draw` / `composition` dispatch remains stub (**6.18**).

---

## OPEN QUESTIONS + ambiguities

- **Ambiguity (V1):** Exact schema of legacy `availability` (subcollection path and field names) is spread across `storage.js` and `playerAvailabilityService.js`. **V2 canonical shape:** `event_availability.role_keys` (see glossary — Availability).
- **OPEN QUESTION:** Whether a player can be in multiple seasons with the same identity and how claiming works across seasons is not fully documented in code comments.
- **Ambiguity:** "Role" in a cast (e.g. for multi-role shows) vs simple "selected": both appear in code (`castService.getPlayerCastRole`, selection-multi-roles docs); exact role set and who defines it (per event vs per season) not fully unified here.
- **OPEN QUESTION:** Lifecycle of invitations (expiry, single-use) is implied by usage but not defined in one place.

**Code references:** Draw and chances: [legacy/src/services/selectionService.js](legacy/src/services/selectionService.js), [legacy/src/services/chancesService.js](legacy/src/services/chancesService.js). Casts: [legacy/src/services/castService.js](legacy/src/services/castService.js). Availability: [legacy/src/services/playerAvailabilityService.js](legacy/src/services/playerAvailabilityService.js), [legacy/src/services/storage.js](legacy/src/services/storage.js). Seasons/players: [legacy/src/services/seasons.js](legacy/src/services/seasons.js), [legacy/src/services/players.js](legacy/src/services/players.js).
