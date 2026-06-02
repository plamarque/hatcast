# OPS-9 — PostHog on `hatcast.app`

**Status:** backlog  
**Priority:** P1 (V2.0.0 — **non bloquant M4**)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave F  
**Growth:** [G-005](../planning-artifacts/growth-backlog.md) → planifié V2.0.0  
**Depends on:** **OPS-8** (prod URL live)

---

## Context

Product analytics (FR47 baseline). PostHog **EU** cloud. Reverse proxy on **`e.hatcast.app`** with Cloudflare **DNS only (grey cloud)** — orange proxy breaks PostHog managed proxy SSL.

## Acceptance criteria

1. **Given** prod on **`https://hatcast.app`**, **when** PostHog SDK loads, **then** `api_host` points to **`https://e.hatcast.app`** (or documented Worker equivalent).
2. **Given** DNS, **when** `e` CNAME is configured, **then** record is **not proxied** (grey).
3. **Given** FR47 scope, **when** events are sent, **then** no unnecessary PII ; EU project region documented.
4. **Given** operators, **when** documented, **then** runbook covers env var / build-time key and dashboard access.

## Out of scope

- Full Epic **11** feature set (session replay policy, feature flags product-wide) unless PO extends in story refinement
