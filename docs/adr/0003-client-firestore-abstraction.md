# ADR-0003: Client Firestore abstraction (firestoreService + config)

- **Status:** Observed
- **Context:** Client code must talk to Firestore with the correct database, wait for Firebase init, and avoid duplicating init and env logic.
- **Decision:** Centralise client persistence behind `firestoreService.js` (init, collection/doc helpers, getDocuments, writes) and `configService.js` (environment and Firestore database name). Higher-level domain logic uses `storage.js` and other services that call `firestoreService`. Firebase app and DB are initialised once in `firebase.js` using configService; firestoreService consumes that and exposes a single `getDocuments(collectionName, ...pathSegments)` and write APIs.
- **Consequences:**
  - One place for DB selection and init order; easier to add new collections consistently.
  - New features that need Firestore should go through firestoreService (or an agreed wrapper), not raw Firebase SDK in components.
  - Async init: app may show loading or retry until Firestore is ready (observed in firestoreService.initialize).
- **Alternatives considered:** Direct Firestore SDK usage in every component would duplicate init and database switching. A heavier ORM layer was not adopted; the current abstraction stays close to Firestore’s model.
