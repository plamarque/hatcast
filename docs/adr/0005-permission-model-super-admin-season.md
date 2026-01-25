# ADR-0005: Permission model: Super Admin + season admins

- **Status:** Observed
- **Context:** Need to restrict admin actions (create/edit seasons, run draw, manage players) to authorised users, and allow some users to have global access.
- **Decision:** Two levels: (1) **Super Admin**: determined server-side (Cloud Function or stored list); has access to every season’s admin. (2) **Season admin**: stored in Firestore per season (e.g. `seasons/{id}/admins`). Client checks both via `permissionService.js` (e.g. `isSuperAdmin()`, `isSeasonAdmin(seasonId)`). Super Admin is resolved by a callable or server-side check; season admin is read from Firestore. Router guard in `main.js` blocks `/season/:slug/admin` for unauthenticated or non-admin users (redirect to 404).
- **Consequences:**
  - Clear separation: global vs per-season. Adding a new admin-only route requires using the same permission service and guard pattern.
  - Super Admin list is not in Firestore (security); changes require code or server config.
  - All admin UI must not trust client-only checks; sensitive mutations should be validated in Cloud Functions where applicable.
- **Alternatives considered:** Role-based system with many roles (e.g. viewer, editor, admin) could be added later; current design is minimal (admin vs non-admin per season + Super Admin).
