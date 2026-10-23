---
id: SPEC-release-delivery
companions:
  - verification-contract.md
  - risk-policy.md
  - brownfield.md
  - architecture-diagrams.md
  - ../../../AGENTS.md
  - ../../../ARCH.md
  - ../../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md
  - ../../../docs/v2/technical/RELEASE_CHAIN_AUDIT_2026-10-23.md
  - ../../../.agents/skills/hatcast-v2-release/SKILL.md
  - ../../../.agents/skills/hatcast-v2-release/references/staging-smoke-contract.md
sources: []
---

> **Canonical scope contract.** This spec and its companions define the proposed release-delivery change. Existing repository and release authority remains binding. Reduced-coverage policies require explicit adoption; creating this spec does not activate them. The root product SPEC is unchanged.

# HatCast V2 release delivery

## Why

HatCast's operator needs to deliver bounded corrections promptly while retaining rigorous verification for changes with broad consequences. The audited release chain repeats complete suites and staging cycles, but also contains distinct local, CI and cloud proofs that cannot be treated as interchangeable. The change separates equivalent-coverage deduplication from deliberate, visible coverage reductions based on the entire delivered delta's blast radius.

## Capabilities

- **CAP-1**
  - **intent:** The operator can identify the exact delivery candidate and determine which current evidence covers it.
  - **success:** Production baseline, complete delta, candidate SHA/RC, distinct staging/production image identities, verification scope and outcomes are inspectable; unrelated, stale or insufficient evidence cannot satisfy a gate.
- **CAP-2**
  - **intent:** The complete final candidate can receive required validation without a second staging cycle solely for release metadata.
  - **success:** Final code, version and notes are present during one complete local execution, complete CI T1, deployed T2 and persisted C1–C5 plus delta human smoke; their evidence refers to the final RC, and production checks remain required.
- **CAP-3**
  - **intent:** The operator can reuse a valid complete local verification instead of repeating it at promotion.
  - **success:** Local and CI proofs remain distinct; changed candidate or relevant inputs and expired evidence prevent reuse, while missing evidence requires fresh verification.
- **CAP-4**
  - **intent:** Required verification and artifact preparation can complete efficiently without weakening their results or deployment gates.
  - **success:** Build and tests may overlap, but deployment requires both successes; valid cache reuse preserves browser/version, test scope and artifact inputs, with equivalent cold/warm outcomes.
- **CAP-5**
  - **intent:** The operator can inspect an explainable blast-radius classification without initially reducing verification coverage.
  - **success:** Classification covers the entire production-to-candidate delta and shared dependencies; unknown scope selects reinforced coverage, and observation mode retains all gates.
- **CAP-6**
  - **intent:** The operator can select explicitly adopted fast, standard or reinforced verification with visible omissions and residual risk.
  - **success:** Required checks block on failure; omitted coverage and its authority are recorded, deferred regression has alert/reaction ownership, and unknown or ineligible scope falls back to reinforced verification.
- **CAP-7**
  - **intent:** The operator can deliver an isolated correction without including unrelated development changes.
  - **success:** A hotfix identifies the actually served production baseline and complete correction delta, avoids an automatic full development merge, and supports reintegration without overwriting newer changes or release tags.
- **CAP-8**
  - **intent:** The operator can promote and recover a verified release with explicit authority and identifiable outcomes.
  - **success:** Promotion checks current evidence and staging revision, requires separate production authorization, distinguishes tag/release/deployment/observability outcomes, verifies production read-only and identifies a prepared recovery target with its limitations.
- **CAP-9**
  - **intent:** The operator can distinguish delivery gains from reduced assurance, parallel work and incidental preparation delays.
  - **success:** Gate execution, runner/local/human waits, deployment and final verification are measured separately alongside retries, skips, escaped defects and rollbacks; predicted gains and exploratory targets are never reported as achieved guarantees.

## Constraints

- **Contract A — equivalent coverage:** retain required scenarios, assertions and proof environments: complete local execution AND CI T1, deployed T2, C1–C5 plus changed-path human smoke and production verification. Fewer repetitions do not imply equal statistical confidence against intermittent defects.
- **Contract B — blast-radius selection:** reduced blocking coverage is a separate policy with explicit adoption, exclusions and accepted risks. An urgent request or a small diff does not itself establish low risk.
- Candidate, proof, test-contract and relevant configuration identities must agree; code or relevant-input changes invalidate affected evidence. Git ancestry alone is insufficient.
- H2/mock-auth T1 cannot replace cloud T2. A green T2 with skipped or weakened assertions cannot be described as full persisted C2/C3 proof.
- A known failed check cannot be hidden by lane selection. Retry, skip, blocked and waived outcomes remain explicit; no test is disabled to make a gate pass.
- Staging remains required for every proposed lane. Production authorization is separate from notes, CI success, human smoke and story integration approval.
- Staging and production retain separate builds/image identities in this scope. Configuration, release metadata and PWA integrity must remain correct.
- No release operation is authorized by this specification. Implementations must preserve explicit push/tag/deploy authority, data safety and worktree boundaries.

## Non-goals

- A single-digest promotion architecture or a runtime frontend-configuration redesign.
- Removing local/CI diversity under the equivalent-coverage contract, removing staging or replacing persisted human checks with UI visibility.
- Blanket workflow skipping for release-artifact syncs, blind sharding or speculative deployment before tests pass.
- Rebuilding the product PRD, changing business behavior, rewriting release tags or changing Epic 21's story-integration approval contract.
- Automatic production approval, mutating production smoke or ad hoc PostHog analysis during ordinary releases.

## Success signal

An equivalent-coverage release demonstrates a final candidate with complete distinct proofs and no metadata-only second staging cycle or redundant valid local rerun. A separately adopted low-risk delivery demonstrates an isolated correction, declared omitted coverage, required targeted/cloud checks, explicit production approval, verified production and actionable deferred regression. Measured elapsed-time reduction is reported with unchanged versus reduced coverage clearly separated.

## Assumptions

- This package is a proposed contract for architecture and test design; authority to formalize it does not adopt waivers or authorize implementation/deployment.

## Open Questions

- **Q-1:** Which proof authority/storage, identity fingerprints, expiry and effective GitHub protections establish trustworthy reuse?
- **Q-2:** Which exact lane selectors, dependency mappings, fixtures and minimum checks are adopted, including any reduction of local/CI diversity?
- **Q-3:** Which retry/skip/blocked/waiver dispositions are acceptable, especially missing Malice coverage and composition flakiness?
- **Q-4:** Who owns deferred-regression alerts and response, on what timing, and when are lanes/domains suspended or recovered?
- **Q-5:** Which candidate-locking, partial-operation recovery, hotfix lineage/semver reintegration and rollback mechanisms preserve the identified candidate safely?
