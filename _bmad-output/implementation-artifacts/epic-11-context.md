# Epic 11 Context: Analytics workflow (opérateurs produit)

## Goal

Provide product operators with privacy-bounded workflow analytics for HatCast without troupe-facing reporting.

## Requirements & Constraints

- Capture semantic, bounded events only; never emit names, emails, free text, notification content, raw API payloads, raw errors, or device fingerprints.
- Preserve the existing PostHog identity lifecycle and restrict analytics access to product operators.
- Treat the Demo troupe separately where a deterministic filter exists.
- Document event names, allowed properties, deduplication, and the operator analysis recipe.
- Creating or changing a PostHog dashboard requires explicit authorization.

## Cross-Story Dependencies

- Story 11.5 extends the Epic 11 analytics baseline while preserving Stories 11.1–11.4 and OPS-9.
- PWA installation guidance is supplied by Stories 10.1 and 10.5.
