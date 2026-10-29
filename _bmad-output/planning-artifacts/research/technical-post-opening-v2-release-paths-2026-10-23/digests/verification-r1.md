# Independent normal-validation check — R1

2026-10-23. Read-only verification of named digests, imported GitHub observations, and explicitly granted historical Git tag blobs/diffs. No current runtime, telemetry, memory, ambient project documentation, tests, cloud, or analytics read. Only this digest written. This is independent arithmetic/source interpretation by another verifier, not an independent publisher or production-health audit.

## Timing and identity: verified with one wording correction

All seven timing-matrix rows reproduce exactly from imported jobs' started_at/completed_at. Verified T1/T2 job durations, each Playwright execution duration, Build and push image, Deploy to Cloud Run, and serial test-execution sums. Every inspected T1 and E1 Playwright execution step has conclusion=success; assertion skips/retries cannot be recovered from these statuses and are not treated as passed assertions.

Ranges verified: T1 190–286s (3:10–4:46); T2 179–243s (2:59–4:03); serial execution sum 369–529s (6:09–8:49); build/push 142–192s (2:22–3:12). These are step execution observations, not elapsed lead time, human time, or net savings.

For each selected stable tag, local git rev-parse tag^{commit}, the imported stable production run head_sha, and the latest preceding staging-v2 deploy workflow head_sha match. The selected staging record is indeed the latest preceding staging deploy record present in the two imported pages:

| Tag | Staging run | Stable tag run |
|---|---:|---:|
| v2.4.6 | 35029786955 | 35031672127 |
| v2.5.0 | 35457004106 | 35458267633 |
| v2.6.0 | 36632131306 | 36636067650 |
| v2.6.1 | 38422836152 | 38511336074 |
| v2.6.2 | 38865736869 | 38894694709 |
| v2.6.3 | 39105565455 | 39130429450 |
| v2.7.0 | 39906512847 | 39910450325 |

Correction to timing-r1 opening: the two Actions pages contain **nine** stable tag-triggered deploy records, also v2.4.5/30914165396 and v2.4.4/29210843586. Seven is correct only after applying the selected September–October window. Imported github-releases.json independently confirms three selected September and four October publication timestamps exactly as boundary-incidents-r1 states. September 1 remains an owner-informed analytical boundary, not a measured opening date.

First five selected production workflow conclusions are success. In jobs-39130429450.json and jobs-39910450325.json, deploy is success and posthog-lifecycle is failure; E2E and E1 jobs are explicitly skipped. Thus workflow failure does not show application deployment failure. This does not independently prove cloud traffic, current served identity, complete production test execution, or user health.

Source backing: imports/timing-matrix.json; imports/jobs-{35029786955,35457004106,36632131306,38422836152,38865736869,39105565455,39906512847,39130429450,39910450325}.json; imports/actions-runs-page{1,2}.json; imports/github-releases.json. Original API URLs/access dates are preserved in each wrapper.

## Savings after A: no numerical overclaim in timing digest

The digest correctly refuses to equate 6:09–8:49 serial test execution with incremental B savings. It explicitly retains targeted execution/common checks, separates build and wall time, and forbids recounting A's avoided staging cycle/local preflight savings. No targeted-lane, classifier, human-smoke or after-A runtime exists in these imports. Therefore **no reliable net B minute estimate** follows. The measurements support a budget description only; zero or negative net benefit is not excluded by the evidence.

## Classification challenge: three independent source spot checks

I do not rewrite frozen exante classifications. The following assesses the predicates, not whether the conservative policy itself is optimal.

- **v2.6.0:** The diff from v2.5.0 confirms singular-to-list request filters, multi-season aggregation and membership enforcement across every resolved troupe in MemberSeasonGlanceController/Service. This is a real changed authorization/scope boundary, beyond a chart-only fix. Conversely member-stats-shortcut query parameters and TroupeSeasonResolverService's read-only resolver explicitly avoid changing active troupe context; shared navigation filenames alone do not establish global navigation risk. Full/medium with explicit Standard sensitivity is defensible as a conservative judgment over an unresolved mapping; evidence does not establish that Standard is unsafe or that all tests needed a full lane. Confidence must remain medium. Source: immutable [compare](https://github.com/plamarque/hatcast/compare/v2.5.0...v2.6.0), named service/controller and resolver/shortcut diffs; imports/exante-sources.md.
- **v2.6.3:** PWA update/install diffs predominantly add guarded analytics calls; update activation/reload flow is not redesigned in those inspected files. Calling this a global PWA behavioral redesign would overstate the evidence. However package.json changes PostHog range, replaces build entry points with build-with-release.mjs, and the new script embeds release identity and can reject missing production metadata. deploy-v2-cloud-run.yml adds production posthog-lifecycle side effects after deploy and a separate dashboard check operation. These actual build/dependency/CI changes support the digest's conservative Full predicate for the bundle. Full/high should be attributed to the combined changed boundaries, not PWA path names alone. Source: immutable [compare](https://github.com/plamarque/hatcast/compare/v2.6.2...v2.6.3), PWA services, package/build script and deploy workflow diffs; imports/exante-sources.md.
- **v2.7.0:** app.config.ts actually registers root router navigation-error handling via ChunkRecoveryService. nginx.conf.template adds index/manifest revalidation and missing js/mjs/css 404 handling. PWA update service also isolates optional sessionStorage failure from confirmed reload. These are concrete cross-cutting serving/recovery changes, supporting Full independently of the home/nav bundle. Source: immutable [compare](https://github.com/plamarque/hatcast/compare/v2.6.3...v2.7.0), app.config.ts, nginx and PWA update diffs; imports/exante-sources.md.

The spot checks support the frozen all-Full result **under its conservative unknown-boundary rule**, with the explicitly weak 2.6.0 case. They do not independently prove a population distribution, optimal route count, avoided defects, or a causal advantage from running every test. Absence of a securely mapped lighter historical release is not proof that a prospective lighter route has no value.

Boundary-incidents-r1 keeps product, fixture, staging-traffic and observability outcomes distinct and separates later discovery from introduction. Publication arithmetic was checked. Detailed historical issue chronology was not independently re-derived here and remains testimony/import interpretation. No claim of defect-free releases, independent operational telemetry, or measured adoption follows.
