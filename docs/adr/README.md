# Architecture Decision Records (HatCast)

**Location:** `docs/adr/`. Keeps decision history with other project docs while clearly separated from normative root docs (AGENTS, SPEC, PLAN).

Each ADR documents a significant technical decision: context, decision, consequences, and alternatives considered. When a decision was taken implicitly (observed in code without a prior ADR), it is noted as **Observed decision**.

### Portée V1 vs V2

- **ADR 0001–0007** décrivent surtout le système **Firebase / client legacy** (`legacy/`, Functions, Firestore). Ils restent la référence « pourquoi » pour la ligne actuelle en production sur Firebase Hosting, pas pour la stack documentée sous [`docs/v2/`](../v2/README.md).
- **ADR 0008–0010** décrivent des choix **V2** (auth SPA ; **0010** = Identity Platform cible, **0008** = ancien slice Google OIDC + session, déprécié ; PostgreSQL Neon dans **0009**). À lire pour `apps/web/` et `services/api/`.

---

## Index

### Décisions stack V1 (Firebase / legacy)

| ID | Title | Status |
|----|-------|--------|
| [0001](0001-firebase-as-backend.md) | Firebase as backend (Firestore, Auth, Functions) | Observed |
| [0002](0002-multi-database-firestore.md) | Multi-database Firestore per environment | Observed |
| [0003](0003-client-firestore-abstraction.md) | Client Firestore abstraction (firestoreService + config) | Observed |
| [0004](0004-audit-via-triggers-and-collection.md) | Audit via Firestore triggers and auditLogs collection | Observed |
| [0005](0005-permission-model-super-admin-season.md) | Permission model: Super Admin + season admins | Observed |
| [0006](0006-queue-based-notifications.md) | Queue-based notifications (mail, reminder, push) | Observed |
| [0007](0007-multi-select-participants-events.md) | Multi-select participants and events in header selectors | Accepted |

### Décisions stack V2

| ID | Title | Status |
|----|-------|--------|
| [0008](0008-v2-spa-auth-google-session.md) | V2 SPA auth (historique): Google OIDC ID token + server-side session | Deprecated → voir 0010 |
| [0009](0009-neon-postgres-environments.md) | V2 PostgreSQL: Neon + branches dev/staging/prod + secrets GitHub par environnement | Accepted |
| [0010](0010-v2-auth-identity-platform.md) | V2 auth: Google Cloud Identity Platform (IdP managé GCP ; pas Firebase comme stack V1) | Accepted |
| [0011](0011-league-model-and-user-agenda.md) | V2 product model: League (multi-active), user agenda hub, inter-troupe events | Accepted |
| [0012](0012-league-views-travel-leagues-member-stats.md) | League views (Agenda/Historique/Statistiques), travel leagues, personal glance route | Accepted — §3 superseded by **0013** |
| [0013](0013-troupe-navigation-equity-tags-event-slugs.md) | Troupe-first IA (`/troupes`), saison workspace, catégories spectacle, event slugs | Accepted |
| [0014](0014-v2-preprod-migration-no-seed.md) | V2 pre-prod: Flyway schema without dev seeds; V1 Firestore prod as migration source; reset/replay | Accepted |
| [0015](0015-v2-demo-troupe-product-bootstrap.md) | V2 Demo troupe: idempotent product bootstrap in `db/migration` (cloud); Les Improbots dev seed; La Malice = real migration only | Accepted |
| [0016](0016-v1-v2-availability-compositions-migration-pipeline.md) | V1→V2 availability & compositions migration (MIG-3): read-only extract → transform → guarded SQL load, with a MIG-2 mapping manifest | Accepted |
| [0017](0017-v2-migration-api-key.md) | V2 pre-prod migration CLI: optional API key auth for headless orchestrator (`migrate:v2:run`) | Accepted |
| [0018](0018-v2-audit-events-postgres.md) | V2 audit write path: append-only `audit_events` table + `AuditEventRecorder` (same transaction as domain) | Accepted |
| [0019](0019-draw-weight-engine.md) | V2 draw weight engine: normative V1 spec, factor-pipeline objective, golden regression, `% = draw` invariant | Accepted |

---

## Format

New ADRs: copy the template below, use next number (0011, …), and add a row to the index.

```markdown
# ADR-00XX: Short title

- **Status:** Proposed | Accepted | Observed | Deprecated
- **Context:** What problem or situation led to this decision?
- **Decision:** What was decided?
- **Consequences:** What are the main effects (positive and negative)?
- **Alternatives considered:** What else was considered and why not chosen?
```
