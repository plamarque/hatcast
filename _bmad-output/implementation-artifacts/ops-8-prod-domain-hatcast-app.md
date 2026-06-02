# OPS-8 — Prod custom domain `hatcast.app`

**Status:** backlog  
**Priority:** P0 (V2.0.0 — gate **M4**)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave F  
**SCP:** [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) § Amendment 2026-06-03  
**Deploy runbook:** [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §7

---

## Context

- Domain **`hatcast.app`** registered at **Cloudflare** (2026-06-03).
- **Production** Cloud Run must use **`europe-west1`** (Belgium) for **native domain mapping** — `europe-west9` (Paris) requires a load balancer instead.
- **Staging** (`hatcast-v2-staging`) and **dev cloud** (`hatcast-v2-dev`) stay on **`europe-west9`** / `*.run.app`.

## Acceptance criteria

1. **Given** GitHub environment **`production`**, **when** deploy runs from **`production-v2`**, **then** service **`hatcast-v2`** is in **`europe-west1`** and images push to **`europe-west1-docker.pkg.dev/...`**.
2. **Given** domain mapping for **`hatcast.app`**, **when** DNS is configured on Cloudflare, **then** HTTPS works with **Full (strict)** and **proxied (orange)** records after Google certificate is **Active** (grey-cloud phase documented).
3. **Given** prod URL **`https://hatcast.app`**, **when** a user signs in with Google and calls **`/v1`**, **then** no **`origin_mismatch`** / CORS errors (`HATCAST_CORS_ALLOWED_ORIGINS`, OAuth, Firebase authorized domains aligned).
4. **Given** PWA build on prod, **when** `BASE_URL=https://hatcast.app ./scripts/check-pwa.sh`, **then** smoke passes (or documented waivers).
5. **Given** staging/dev, **when** unchanged, **then** existing **`europe-west9`** URLs still work for recette (no regression).

## Tasks (checklist)

- [ ] Artifact Registry repo in `europe-west1` (if not already)
- [ ] GitHub `production` secrets: `GCP_REGION`, `GCP_ARTIFACT_REGISTRY`, `HATCAST_CORS_ALLOWED_ORIGINS`
- [ ] Deploy `hatcast-v2` to `europe-west1` ; IAM `allUsers` invoker
- [ ] Search Console / domain verification
- [ ] Cloud Run domain mapping + Cloudflare DNS (grey → orange)
- [ ] Cloudflare cache rules (`/v1/*` bypass)
- [ ] OAuth + Firebase authorized domains
- [ ] Recette prod on `hatcast.app`
- [ ] Remove obsolete prod service in `europe-west9` if any

## Out of scope

- Staging/dev region migration
- **OPS-9** PostHog, **OPS-10** branded email (separate stories)
