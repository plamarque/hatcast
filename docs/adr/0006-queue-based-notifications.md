# ADR-0006: Queue-based notifications (mail, reminder, push)

- **Status:** Observed
- **Context:** Need to send email, scheduled reminders, and push notifications without blocking the client and with retry/processing on the server.
- **Decision:** Use Firestore as a queue: client writes documents to `mail`, `reminderQueue`, or `pushQueue`. Cloud Functions are triggered on document creation (`onCreate`) and process each message (send email via external service, send FCM push, etc.). After success (or discard), the trigger deletes or updates the document. Client cannot read these collections (rules: read false); only Functions and (where allowed) backend read. FCM tokens stored in `userPushTokens` (per user email); reminder/push payloads carry recipient and content.
- **Consequences:**
  - Decoupled, scalable: client just writes; rate and retries are handled in Functions.
  - At-least-once delivery; idempotency or deduplication must be considered if needed. No built-in dead-letter queue in repo.
  - Adding a new notification type implies a new collection (or reusing one), a trigger, and client code to enqueue.
- **Alternatives considered:** Direct HTTP from client to email/push provider would require exposing secrets or proxy; server queue is safer. A dedicated queue (e.g. Cloud Tasks, Pub/Sub) could be used in the future; Firestore triggers were likely chosen for simplicity and single stack.
