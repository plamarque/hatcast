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
