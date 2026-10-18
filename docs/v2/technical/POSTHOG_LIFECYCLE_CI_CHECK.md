# Validate the lifecycle dashboard without deploying

The registered **Deploy V2 (Cloud Run)** workflow accepts a manual `operation` input. `posthog-check` runs only the `posthog-check` job; classification, E2E, application deployment, release capture and staging gates are skipped. The default operation remains `deploy` for existing manual callers and push/tag behavior stays unchanged.

Dispatch the version of the workflow on the reviewed feature branch:

```sh
gh workflow run deploy-v2-cloud-run.yml \
  --ref feat/11-5-observabilite-installation-pwa-posthog \
  -f operation=posthog-check
```

This is an explicit external write: it creates or updates the CI-owned lifecycle dashboard and its six insights. It preserves the adoption dashboard and all objects without the exact lifecycle ownership marker. It does not send `hatcast_release_promoted` or any client events. Empty results are expected before production instrumentation is delivered.

GitHub environment `production` must contain:

- Secret `HATCAST_POSTHOG_PERSONAL_API_KEY`, restricted to the intended project, with Dashboard and Insight read/write access.
- `HATCAST_POSTHOG_PROJECT_ID` as an environment variable or secret (variable takes precedence).

The check uses the documented saved-insight read endpoint with `refresh=force_blocking`, so it requires no additional Query scope. It rejects failed HTTP requests, missing computed results, duplicate ownership and unexpected pagination origins. Only validated insight keys and the dashboard ID are logged; query rows, names, emails and credentials are never logged.

Both manual check and production synchronization serialize on `hatcast-posthog-lifecycle`. The manual job has no cloud credentials or ingestion token, and does not depend on the deployment job. The production synchronization remains gated by successful production deployment.

Local checks:

```sh
node --test scripts/v2/posthog-lifecycle-dashboard.test.mjs
node scripts/v2/posthog-lifecycle-dashboard.mjs
git diff --check
```

The default script mode prints the manifest without network requests. `--validate` provisions and computes saved insights; `--apply` additionally records a real release promotion and is reserved for the post-deployment job. The modes cannot be combined.

## Verified execution — 2026-10-18

- [Successful CI run 39099343937](https://github.com/plamarque/hatcast/actions/runs/39099343937), commit `83bf536b`: `events`, `guidance`, `versions`, `lag`, `notes` and `engagement` all returned computed results.
- [Lifecycle dashboard](https://eu.posthog.com/project/193437/dashboard/1032942), separate from the adoption dashboard.
- Production secrets were successfully used. The production environment only admits tags `v*`; the PO explicitly authorized a temporary rule for the exact Story 11.5 branch for this check. That rule was removed after each attempt, and tag-only policy was verified restored after success. Future branch checks need the same explicit operational authorization or an independently configured analytics environment.
- Deployment, staging gates, E2E and promotion capture jobs were skipped. No synthetic promotion or client event was sent.
- This verifies API access, provisioning and query execution. It does not verify client-event content, release-day reference ingestion, or the actual two-release update path; those remain pending application delivery and runtime verification.
