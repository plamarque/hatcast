# OPS-10 — Email addresses `@hatcast.app`

**Status:** backlog  
**Priority:** P1 (V2.0.0 — **non bloquant M4**)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave F  
**Depends on:** **OPS-8** (domain live on Cloudflare)

---

## Context

Branded sender **`noreply@hatcast.app`** for Spring Mail / notifications (`HATCAST_NOTIFICATION_EMAIL_FROM`). **`info@hatcast.app`** for inbound (support/contact) — likely **Cloudflare Email Routing** → existing Gmail inbox.

Sending requires **SPF/DKIM/DMARC** on `hatcast.app` — typically **Google Workspace** or a transactional SMTP provider with domain verification (personal Gmail « send as » is not sufficient for production volume).

## Acceptance criteria

1. **Given** DNS mail records, **when** verified, **then** SPF/DKIM pass for sending domain.
2. **Given** prod notification send, **when** triggered, **then** From is **`noreply@hatcast.app`** (or agreed alias) and mail is delivered (Mailpit N/A on prod).
3. **Given** **`info@hatcast.app`**, **when** mail is sent to it, **then** it arrives in the configured Gmail (or Workspace) inbox.
4. **Given** auth emails (reset password), **when** sent after FROM change, **then** links still work with **OPS-8** authorized domains.
5. **When** done, **then** [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) documents secrets and DNS.

## Out of scope

- Marketing bulk email ; full Workspace rollout beyond addresses needed for HatCast V2
