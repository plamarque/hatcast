# Blast-radius policy — proposed, not activated

## Boundary from contract A

Deduplication preserves the required local, CI, cloud and human proof environments. This contract instead selects less blocking coverage and accepts possible later discovery of out-of-scope defects. Creating this spec adopts neither coverage omissions nor a waiver authority.

## Classification — CAP-5

Assess the complete delta between actually served production and the candidate, including release-batched work. Record affected users/roles, business paths, callers/shared dependencies, data changes, external effects, detectability, reversibility and uncertainty. A tiny auth/interceptor/router/theme-token/serializer/cache change can be broad. Urgency and line count cannot lower risk. Unknown scope uses reinforced verification.

Observation mode proposes a level and rationale while all current required gates remain active. Exact selectors and dependency mapping are Q-2; no extension-based auto-allow list is established here.

## Proposed lane contracts — CAP-6

| Lane | Eligibility | Blocking verification | Omitted coverage / accepted residual risk |
|---|---|---|---|
| Fast / low | Bounded correction with understood dependencies and credible recovery; excludes migrations, auth/permissions, shared contracts, dependency changes, infrastructure, external effects and global PWA/cache behavior | Review; bug regression; affected component/caller tests; required build; actual staging with health/PWA/auth/navigation/API and persisted changed-path smoke; production approval and read-only verification | Complete regression and full human C1–C5 need not block; outside-scope regression may reach users before deferred detection. Any reduction of local/CI diversity must be stated in the adopted policy |
| Standard / medium | Known domain with several understood consumers, without high cross-cutting risk | Common controls plus domain integration, neighboring paths, pertinent E1 and persisted targeted human smoke | Partial outside-domain coverage; mapping can miss dependencies. Inadequate selection returns to reinforced |
| Reinforced / high or uncertain | Auth, tenant isolation/permissions, critical data/migrations, notifications, cross-cutting composition/equity, global navigation/PWA/cache, infrastructure or unknown impact | Complete candidate regression; complete API when relevant; full deployed E1 with usable fixtures; persisted C1–C5 plus delta; compatibility/migration/device checks required by risk | Limited to tested environments/fixtures; actual gaps still need explicit disposition. Retains contract A's proof diversity |

Health/PWA checks cost seconds in the audit and remain useful common controls. Required selected checks always block on failure. A known failed check cannot become an intentional omission merely by selecting a faster lane.

For reduced-coverage paths, record the required/omitted coverage, rationale, residual risk and policy authority. Deferred full regression must have alert and response ownership; unresolved failure suspends further fast deliveries. A newly discovered uncovered dependency suspends that domain's eligibility. Timing, response decisions, restoration conditions and authority are Q-4; no automatic rollback or outbound messaging authority is inferred.

## Hotfix isolation — CAP-7

The hotfix baseline is the tag/revision actually serving production, not whichever tag is newest. Include the reviewed correction and necessary release artifacts, exposing the entire resulting delta. Do not merge all v2 solely to obtain a hotfix candidate.

Retain staging, safe fixtures, persisted correction observations, explicit prod approval and prepared recovery. Reintegrate the correction and necessary artifacts into active development/release lineages without overwriting newer metadata or code. Concurrent releases, branch ancestry, semver allocation and conflicts require an explicit mechanism under Q-5; existing tags are never rewritten.

## Activation decisions still required

- Q-2: exact selection map, baseline checks, fixtures and any local/CI reduction.
- Q-3: treatment of retries, skips, missing fixtures and waivers.
- Q-4: deferred-suite timing, owner, escalation and suspension/recovery.
- Q-5: target identity, hotfix lineage and recovery mechanisms.

Classification observation does not depend on adopting reduced coverage. Implementation dispatch and scheduling are outside this policy contract.
