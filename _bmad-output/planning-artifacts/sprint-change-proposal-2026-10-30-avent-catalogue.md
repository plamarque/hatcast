# Sprint Change Proposal — Advent content and environment isolation

**Date:** 2026-10-30
**Status:** Approved by Patrice on 2026-10-30; open decisions remain pending
**Scope:** Epic 25, Advent 2026. No implementation, deployment, data migration or changes to other artifacts are authorized by this draft.

## 1. Trigger and evidence

The preparation of the private Advent catalogue exposed a change in the intended content workflow. Patrice decided that validated quizzes and statements will be prepared directly in the database using queries. A JSON object in a bucket is no longer the selected application content source. Portraits remain in private object storage. Development and production use separate databases; development has test mode and production does not. This physical separation, rather than a mandated separate answer model or tables solely to distinguish test and real answers, separates the data. Simulation and reset commands are development-only. An answer, its scoring and reveal must remain consistent with the quiz the member saw.

The exact transfer of validated contributions from development to production and the concrete method of preserving a quiz and its false statement after a first answer remain open. They are not approved architectural choices in this proposal.

Evidence inspected on 30 October: local `v2` at `a80b2657`; tracker marks 25.1, 25.2, 25.2a and 25.3 done and 25.4–25.7 and 25.9 backlog. `docs/v2/technical/AVENT_CATALOGUE.md` describes the private JSON and explicitly says it is not loaded by the application. The user reports that the private JSON exists in the bucket; its contents and deployment were not independently inspected. The existing test controller serves fictional statements in code; `AdventTestAnswers.confirm` uses code-defined keys and persists the selected and correct indices and scoring. That does not establish preservation of the full displayed text when content becomes mutable. The current preview is gated to specific isolated development configurations, with test-specific state tables and a session fence. This is a partial test implementation, not evidence that the production content path exists.

The worktree `/private/tmp/hatcast-avent-catalogue`, branch `codex/avent-catalogue-prive`, is based on the same commit and contains tracked and untracked uncommitted work, including the JSON loading direction and a test snapshot migration. Git stash `stash@{0}` (`5d44b56c`, created before its rebase, including an untracked-files parent) exists. Neither is an approved solution; both are preserved. The current worktree and stash are distinct evidence; their equivalence or completeness has not been established.

## 2. Impact analysis

### Epic and stories

- Epic 25 remains viable and its member-facing goals and 1 December readiness target remain. No new epic or removal is justified. A content/data foundation and safe release procedure must be planned before real content is used; exact sequencing and sizing depend on the open design decisions.
- **25.1, done:** the existing fictional code catalogue and protected preview remain historical delivery evidence. A follow-up must connect authorized reads to the approved database content and private portraits while preserving membership, allowlist, no-store, environment and disclosure protections. Do not rewrite its completion history or assume it supports real content today.
- **25.2, done:** stored choice, correct index and points are useful, but they alone do not prove that mutable displayed statements remain consistent across read, confirmation, scoring and reveal. A follow-up must address stale presentation, concurrency and edits after play without presupposing snapshots or version tables.
- **25.2a, done:** retain targeted reset, session fencing and safe concurrency. Reassess its table-specific implementation against the chosen common model: reset must only affect the intended development game, preserve content and unrelated data, and fail closed on production or ambiguous targets. A separate table is not required solely for environment separation; existing tables need not be removed merely because of this decision.
- **25.3, done:** revalidate result/reveal against the same content actually presented and scored, including personal replay, resets, interrupted reads and acknowledgments. Preserve delayed disclosure and cross-device behavior; existing tests do not prove mutable database content consistency.
- **25.4 ranking:** use eligible, revealed answers from the target environment; maintain serialized reads, scoring and privacy. **25.5 calendar:** late and past content must use the same authoritative availability and consistent reveal, including unanswered cases. **25.6 entry:** preserve availability and access boundaries. **25.7 notifications:** check database content availability and answer state in the correct environment, without exposing content; keep development notifications isolated. **25.9 participation:** count real answers in production and exclude development by verified database/environment boundary; no mandated test discriminator solely for this purpose. All retain existing acceptance and visual requirements.
- Review any dependent cross-epic integrations when the design is selected; no evidence currently requires reordering or invalidating another epic. Update tracker only after the follow-up work and scope are approved, via its controller.

### Contracts and operational impact

PRD FR-11 and its constraints currently require publication by release. The Advent spec, both epic inventories and coverage map repeat that choice. Architecture AD-2 requires fictional test anecdotes; the selected workflow may involve validated contributions in development, so explicitly decide and document authorized development content and consent rather than quietly treating real contributions as fixtures. AD-3 already requires a stable false statement and faithful result but does not choose the needed mechanism. AD-1 secrecy, AD-2 production denial, AD-3 transactions, AD-6 real participation and AD-7 visual isolation remain binding. The private catalogue procedure instructs JSON object edits and generation checks and must be replaced after approval, not followed as the new database procedure.

UX `DESIGN.md` and `EXPERIENCE.md` retain their presentation, accessibility and reveal contracts; no new screen or back office is implied. `EXPERIENCE.md` late-content and test flows should be checked against the new publication and operational procedure, with no visual change presumed. The repository `SPEC.md`, `DOMAIN.md`, `ARCH.md`, Advent spec and `PLAN.md` need reconciliation once implementation and sequencing are decided; root architecture currently describes the actual preview and must continue to distinguish as-is from target. Review deployment configuration, environment identity, DB permissions, private bucket access, telemetry and notifications, migration and backups, tests and operational documentation. Database separation is a decision, not proof that the current deployed configuration has been verified: prove the actual identities and endpoints before any mutation or demonstration.

### Data safety and non-disclosure

Protect real statements, answer keys and future portraits from Git, logs, telemetry, public assets, caches and premature API responses; consent and authorized access still apply. Queries must target a positively identified environment with least privilege, validated input, transactional and concurrency safeguards, a recovery/backup plan and an audit/verification procedure. Do not execute production mutations under this proposal. Evaluate what happens when a quiz is displayed but changed before confirmation, during a first answer, after answers, during replay or reset, and during an interrupted reveal. Define fail-closed behavior and test multi-user concurrent modification/confirmation. Preserve no-store and midnight Paris rules. Any destructive schema or bulk data operation requires a separate backup/migration plan and explicit approval under repository rules.

## 3. Options and recommendation

1. **Direct adjustment within Epic 25 — recommended.** Preserve completed stories and add appropriately scoped follow-up work for database content, environment safety and stable results, then update dependent backlog and contracts. Effort: medium to high; risk: medium to high until design and isolation are demonstrated. Schedule impact is unknown; allow design, migration and integration verification before the December deadline.
2. **Roll back completed stories — not recommended on current evidence.** It would discard useful access, transaction, reveal and reset work without resolving content transfer or consistency. Effort and risk potentially high; reassess if investigation proves reuse unsafe.
3. **Reduce MVP — not currently justified.** The original member journey remains the goal; deferral would need a separate product decision. Effort and risk cannot yet be estimated reliably.

Classification: **moderate**, requiring product owner/developer coordination and architecture input; escalate to major if the chosen consistency or transfer design fundamentally changes the product or schedule. Do not infer a particular version architecture, snapshot schema, transfer tooling or production deployment.

## 4. Proposed edits for review — not applied

The excerpts identify the current wording and proposed direction; exact final wording and implementation acceptance criteria must be reconciled after the open decisions are resolved.

### PRD: `prd-hatcast-2026-10-28/prd.md`, FR-11 and constraints

**OLD:** “Patrice peut ajouter les contenus par une nouvelle release”; “Patrice intègre les contenus par release”.
**NEW:** “Après validation, les quiz et leurs affirmations sont préparés directement en base par requêtes ; les portraits sont conservés dans un stockage privé. Un quiz ajouté pendant son jour devient jouable dès sa disponibilité et jusqu’à minuit ; les contenus publiés plus tard restent consultables après révélation. Le quiz présenté, la réponse enregistrée, le calcul et la révélation restent cohérents ; la fausse affirmation ne change pas après une première réponse.”
**Why:** Remove the obsolete release requirement while retaining availability and stable-result outcomes. The transfer process remains an open operational decision, not a PRD assertion.

### Architecture: `ARCHITECTURE-SPINE.md`, AD-1–AD-3 and AD-6

**OLD:** AD-2 says “Utiliser des anecdotes fictives”; AD-3 says “la fausse anecdote ne change plus après une première réponse”; AD-6 excludes tests.
**NEW:** Record separate development and production databases, development-only simulation/reset and environment verification; production has no test mode. Specify database-backed validated content and private portraits. Require consistency from display through confirmation, scoring and reveal even under concurrent edits, and require production-only participation metrics through the verified environment boundary. Identify allowed development content, transfer, preservation mechanism and controls as open decisions until resolved.
**Why:** Replace assumptions about content source and isolation while retaining secrecy and safety. A database split does not by itself authorize real private content in development, guarantee permissions, or solve concurrent updates.

### Advent spec: `_bmad-output/specs/spec-hatcast-avent/SPEC.md`, organizer success, constraints and open questions

**OLD:** “Content is added by release” and “Development tests use fictional statements”.
**NEW:** “Validated quiz content is prepared directly in the appropriate database by queries; private portraits remain in the bucket. Development and production use separate databases. Development alone exposes authorized test controls. Preserve the displayed quiz and its correct interpretation for every recorded answer and its reveal.” Add open questions for allowed development content, promotion and consistency mechanism.
**Why:** Match approved decisions without promising a particular schema or production workflow. Reconcile the obsolete forward-only sentence with AD-2 and 25.3's existing bidirectional controls; this correction does not add a new time behavior.

### Epics and stories: both `planning-artifacts/hatcast-avent/epics.md` and `planning-artifacts/epics.md`

**OLD:** FR-11 coverage and additional requirement say content arrives by release; 25.1 specifies fictional test statements; completed stories describe the isolated preview.
**NEW:** Replace release publication references with the approved database preparation outcome and private portrait boundary. Add a follow-up scope with acceptance for correct-environment writes and reads, consistent display/answer/reveal through races and edits, reset restricted to development, no premature disclosure and demonstrable environment isolation. Keep 25.1, 25.2, 25.2a and 25.3 marked done as historical deliveries; reference their follow-up instead of rewriting their delivered evidence. Amend 25.4–25.7 and 25.9 acceptance only as necessary for the dependencies described above.
**Why:** Existing delivery is useful but not a completed production catalogue. Choose follow-up story identifiers and ordering through approved planning, not this draft.

### Operational procedure: `docs/v2/technical/AVENT_CATALOGUE.md`

**OLD:** Read and update a bucket JSON using object generation preconditions; app loading is not yet implemented.
**NEW:** After the design is approved, replace the JSON authoring/publishing steps with a reviewed database-query procedure covering validation and consent, target identification, safe transaction/concurrency and recovery, verification without logging content, private portrait references, and the separately approved promotion method. Clearly state implementation and deployment status.
**Why:** JSON is no longer the chosen application source. Preserve the existing private object until a separate disposition is decided; do not expose its contents.

### UX and repository documents

**OLD:** UX describes the approved member journey and test flow; root documents describe the current isolated implementation.
**NEW:** Preserve UI, accessibility and secrecy behavior. Update any workflow wording affected by the final content decision and maintain explicit as-is/target distinctions in `SPEC.md`, `DOMAIN.md` and `ARCH.md`; record approved sequencing in `PLAN.md` only.
**Why:** Avoid representing an intended implementation as already deployed and preserve separation of specifications and plans.

## 5. Open decisions and handoff

1. **Promotion:** How are validated development contributions selected, verified and transferred to production? Decide operator, authorization, environment identification, conflict handling, idempotency, rollback, privacy and proof of successful publication; distinguish test data from contributions to promote.
2. **Content consistency:** What behavior is required if content changes between display and confirmation, and after the first answer? Compare enforceable edit prohibition, immutable copies, versioning or other suitable options against concurrency, stale clients, later reveal, replay, corrections and operational cost. Decide which fields are protected, whether corrections are possible and how conflicting operations fail. No option is selected here.
3. **Development content:** May validated real contributions be used in development, under what consent, access and retention conditions, or must fixtures remain fictional? This needs explicit resolution because existing AD-2 requires fictional anecdotes.
4. **Safety evidence:** Verify actual database separation, production denial of test controls, permissions, backups and notification/analytics isolation; establish the handling of existing JSON and unfinished branch without modifying them now.

After approval, product owner and architect resolve the open decisions and reconcile the PRD, architecture, Advent spec and backlog; developer designs the safe migration and query procedure, implements the agreed changes and runs integration, concurrency, privacy and environment tests. Operations verifies target identities and recovery before any approved data operation. Patrice reviews acceptance and any production operation separately. Success means a validated quiz can be safely prepared in the intended database, presented and revealed consistently under retries and races, development operations cannot affect production, and existing visual/privacy contracts and meaningful test coverage remain intact.

## 6. Checklist and decision gate

- [x] Trigger and evidence; epic and remaining-story impact; PRD, architecture, UX and operational impacts; options and recommendation; draft edits and handoff identified.
- [!] Transfer, content preservation and development-content policy require decisions; production environment isolation and deployment state require verification.
- [x] Patrice approved this proposal on 2026-10-30. The three open decisions and safety verification remain pending. Tracker and other deliverables remain unchanged; approval does not select their solutions or authorize deployment or production data operations.

## 7. Patrice's clarifications after approval

- **Promotion:** Transfer quiz content only from development to production, never test answers. The concrete query procedure, target verification, conflict handling and recovery remain to be designed and reviewed; no production data operation is authorized here.
- **Consistency:** Patrice accepts the proposed orientation: reject a confirmation when the quiz has changed since it was displayed, and prevent changes to the elements determining an answer after the first recorded answer. The details of detecting stale displays, concurrency, the protected fields and any exceptional correction procedure remain to be designed. This does not prescribe a version table or snapshot architecture.
- **Development content:** Development is available for whatever content is needed for testing; there is no fictional-only restriction. This clarification does not by itself settle the operational access, privacy and retention safeguards for actual personal content.

The earlier open questions are resolved to this extent; their technical and operational details and verification remain pending. Existing contracts are not amended by this proposal itself.

## 8. Handoff brief after Patrice's clarifications

**Next owner:** Product/architecture with development and operations input. Design the content lifecycle and produce reviewable contract and backlog changes before implementation. The current approval fixes the outcomes in section 7, not the technical mechanism.

**Design acceptance criteria:**

1. Define a quiz's complete identity and protected content, including statement order and false-answer designation, optional reveal text and portrait reference; explicitly distinguish fields that affect scoring or the faithful reveal from fields that may safely be changed. Decide the correction procedure for an already answered quiz, including consequences and authorization, rather than silently overwriting it.
2. Bind confirmation to what the member was shown. If the content has changed between display and confirmation, reject without recording or scoring an answer and provide a safe path to reload the current quiz. Specify how simultaneous edits and first confirmations are serialized so neither can bypass the rule. Cover retries, multiple members, lost responses and the existing midnight boundary.
3. Ensure subsequent scoring, result reads, replay and calendar reveal remain consistent with the quiz displayed and confirmed. Compare a protected in-place record, immutable copies or versions, and any other feasible approach on enforcement, operational simplicity, recovery and privacy. Choose based on evidence; no schema is predetermined.
4. Define development-to-production promotion of **quiz content only**, including selection, validation, target identity, authorization, transactions, conflict detection, idempotency, verification and recovery. Test answers, clock state, sessions and other test-game data must never be promoted. State whether and how private portrait objects or references are handled; do not assume that copying an object is needed.
5. Establish environment safeguards independently of naming or configuration flags: verify actual database identities and credentials, restrict write privileges, deny test controls in production and fail closed if isolation is uncertain. A shared logical answer model is allowed; existing test tables are not automatically removed. Define migrations and preservation of existing data, with backups and approval for any destructive operation.
6. Define how development may use real or fictional test content while protecting any personal data actually used, including access, consent where applicable, retention, logs, telemetry, caches and private portraits. Preserve server-side authorization and the current reveal and no-store boundaries in both environments.
7. Specify executable acceptance evidence: automated stale-display, concurrent first-answer/edit, repeated and conflicting promotions, production test-control denial, cross-environment isolation, reset scope, reveal and scoring consistency, privacy, rollback and Paris-midnight tests. Use disposable data and avoid placing private content in test logs or public artifacts. Review whether existing 25.1–25.3 tests still apply and add only coverage needed for the new contract.

**Deliverables for review:** a short technical decision record with alternatives and unresolved correction policy; precise edits to the PRD, Advent architecture/specification, catalogue procedure and both epic inventories; a scoped follow-up and dependencies for 25.4–25.9, with tracker changes through the controller when approved. Preserve completed story history and the unfinished catalogue worktree and stash. Reconcile repository as-is documentation when behavior actually changes. No code, migration, deployment or production query is authorized by this handoff alone.

## 9. Simplification decided by Patrice

Patrice supersedes the stale-confirmation rejection and automatic post-answer edit prohibition accepted in section 7. Contributions will not intentionally be changed while play is underway; the residual risk of an accidental or exceptional change is accepted. Do not impose a version system, snapshot, stale-client check, database edit lock, special correction workflow or concurrent edit/answer machinery solely to mitigate that risk. Quiz content, answer key, scoring and reveal must use the same intended quiz; preserving this outcome depends on the operator leaving the content unchanged. If a contribution is nonetheless changed after display or play, an inconsistent answer or reveal is an accepted risk; no automatic detection or repair is promised.

This decision supersedes the corresponding technical safeguards and test requirements in sections 4, 7 and 8, and requires explicit reconciliation of PRD FR-11 and AD-3: the prior unconditional guarantee that the false statement cannot change after a first response becomes an operational rule with accepted residual risk, not a technically enforced guarantee. Other privacy, authorization, production/test isolation, scoring, reset, Paris-time and data-safety requirements remain. Design and verification should focus on correct quiz-only promotion, correct environment targeting and normal end-to-end behavior. No implementation or production mutation is authorized by this clarification alone.

## 10. Proposed transfer route

Patrice proposes operating from this workspace: a script or agent reads validated quiz content from the development environment and writes selected quizzes to production through an available API. The connected Neon tooling exposes targeted SQL operations, so a direct database-tool route is a candidate; this does not establish access, table availability or deployed behavior. Compare it with a script or application API only as needed, without requiring a new HatCast administration endpoint. Verify the actual source and destination and appropriate permissions; transfer only quiz content and private portrait references, never answers or other test state. The exact mechanism and handling of existing production quizzes remain to be specified. No transfer has been performed.
