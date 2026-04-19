# Architecture Decision Records (HatCast)

**Location:** `docs/adr/`. Keeps decision history with other project docs while clearly separated from normative root docs (AGENTS, SPEC, PLAN).

Each ADR documents a significant technical decision: context, decision, consequences, and alternatives considered. When a decision was taken implicitly (observed in code without a prior ADR), it is noted as **Observed decision**.

### Portée V1 vs V2

- **ADR 0001–0007** décrivent surtout le système **Firebase / client legacy** (`legacy/`, Functions, Firestore). Ils restent la référence « pourquoi » pour la ligne actuelle en production sur Firebase Hosting, pas pour la stack documentée sous [`docs/v2/`](../v2/README.md).
- **ADR 0008–0009** décrivent des choix **V2** (auth SPA sans Firebase Auth, PostgreSQL Neon par environnement). À lire pour `apps/web/` et `services/api/`.

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
| [0008](0008-v2-spa-auth-google-session.md) | V2 SPA auth: Google OIDC ID token + server-side session (no Firebase Auth) | Accepted |
| [0009](0009-neon-postgres-environments.md) | V2 PostgreSQL: Neon + branches dev/staging/prod + secrets GitHub par environnement | Accepted |

---

## Format

New ADRs: copy the template below, use next number (0010, …), and add a row to the index.

```markdown
# ADR-00XX: Short title

- **Status:** Proposed | Accepted | Observed | Deprecated
- **Context:** What problem or situation led to this decision?
- **Decision:** What was decided?
- **Consequences:** What are the main effects (positive and negative)?
- **Alternatives considered:** What else was considered and why not chosen?
```
