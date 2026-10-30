# Local release E2E versus CI T1 — 2026-10-23

## Scope and conclusion

Repository inspection at `6a5b8a8a` and Playwright discovery establish identical selected T1 scenario/assertion coverage for the default local release preflights and the reusable CI workflow. No local-only release E2E scenario was found. This is a coverage comparison, not a claim that full suites passed, that operating systems are identical or that green outcomes have identical acceptance semantics.

Patrice conditionally authorized revising A after this comparison: complete CI T1 is the release regression reference; local E2E remains on demand. This adoption changes the planning contract, not the scripts or effective release policy. B remains in scope with separately adopted coverage reductions.

## Owning paths checked

| Concern | Local release | CI T1 |
| --- | --- | --- |
| Entry | Both `scripts/v2/promote-to-staging.sh` and `scripts/v2/promote-tag-to-prod.sh` invoke `scripts/run_e2e.sh` without selectors | `.github/workflows/e2e-smoke.yml`, called by staging deploy |
| Test command | `apps/web`: `npm run test:e2e` | Same working directory and command |
| Selection | Default full selection from `apps/web/playwright.config.ts` | Same config, no project/grep filter |
| Stack | Fresh API profile e2e/H2/seeds; Angular ng serve; mock authentication | Same Playwright webServer commands and e2e profile |
| Browser/projects | Chromium Desktop Chrome and Pixel 5 device profiles | Same project/device definitions; Chromium installed using project dependency |
| Preparation | Existing local dependencies/JDK/browser; wrapper checks availability and clears staging URLs | `npm ci`, Node 20, Temurin 21, Chromium with Linux system dependencies |
| Concurrency | One worker | Two workers |
| Retries | Zero | One default retry; suite-level overrides still apply |
| Focused tests | `forbidOnly` false unless local CI variable set | `forbidOnly` true |
| Reports | HTML local output | GitHub annotations and HTML; current workflow uploads HTML on failure only, retention seven days |

The release scripts do not add a separate local browser, production build, mobile hardware check, API integration suite or staging journey to their E2E command. Those cannot be claimed as coverage lost from these specific preflights.

## Discovery verification

Run from `apps/web`, using the already installed monorepo Playwright executable:

```sh
env -u CI -u PLAYWRIGHT_STAGING_E2E PLAYWRIGHT_REUSE_SERVERS=0 PLAYWRIGHT_BASE_URL=https://localhost:4200 PLAYWRIGHT_API_BASE_URL=http://127.0.0.1:8080 ../../node_modules/.bin/playwright test --list --reporter=json
env -u PLAYWRIGHT_STAGING_E2E CI=true ../../node_modules/.bin/playwright test --list --reporter=json
```

Compared `(project, file, line, suite path, test title)` sets: **110 discovered cases, 18 projects in each; zero local-only and zero CI-only cases**. Both discovery runs exited successfully without starting application servers or executing test assertions. Four migration cases are declared skipped outside staging in both configurations; runtime fixture-dependent skips remain possible. No test/helper assertion branches on `CI` or host platform were found; CI-dependent behavior is in the shared Playwright configuration above. Environment overrides can change fixtures or targets and must be represented by the future proof contract.

## Accepted limits and remaining decisions

- Equivalent scenario/assertion selection does not mean identical conditions: Linux runner versus workstation, Node/JDK/browser installation state, workers, retries and diagnostics differ.
- Losing the mandatory workstation execution and repeated observations is an explicit revised-A tradeoff. Local feedback before a push is available on demand.
- A CI pass after retry is not a clean first-attempt local pass. Q-3 still owns acceptance of retries/skips/blocked/waived results, including BUG-038. No new retry waiver is adopted here.
- Q-1 still owns CI evidence provenance, retention, fingerprints, expiry and effective external enforcement. Current successful-run report retention is insufficient to assume a durable detailed proof archive already exists.
- CI evidence must identify the final candidate; a green run on earlier v2 or another RC is not enough. Missing/invalid CI proof requires current complete CI verification under A, not a silent local substitution.
- Recheck parity when entrypoints, config, tests, dependencies or relevant environment change. This comparison is not a promise of permanent equivalence.
- T1 does not replace deployed T2, persisted human assertions, required API suites, migration gates when applicable, or read-only prod verification.
- No suite execution, CI dispatch, runtime modification, push, tag or deployment occurred for this comparison.
