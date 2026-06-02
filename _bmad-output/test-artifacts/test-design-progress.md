---
stepsCompleted:
  - step-01-detect-mode
  - step-02-load-context
  - step-03-risk-and-testability
  - step-04-coverage-plan
  - step-05-generate-output
lastStep: step-05-generate-output
lastSaved: 2026-05-31
inputDocuments:
  - _bmad-output/implementation-artifacts/3-19-retrait-roster-saison-sans-desactivation-troupe.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md
  - services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt
  - services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt
  - services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt
  - services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipantPool.kt
  - services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt
  - services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt
  - apps/web/src/app/pages/admin-participants/admin-participants.spec.ts
  - .agents/skills/bmad-testarch-test-design/resources/knowledge/{risk-governance,probability-impact,test-levels-framework,test-priorities-matrix}.md
---

# Test Design Progress — Story 3.19

## Step 1 — Mode detection
- Mode: **Epic-Level** (`_bmad-output/implementation-artifacts/sprint-status.yaml` present; story 3.19 belongs to Epic 3).
- Prerequisites met: story file with AC1–AC7 + M3 AC + SCP normative model available.

## Step 2 — Context loaded
- Config `_bmad/tea/config.yaml`: `test_artifacts=_bmad-output/test-artifacts`, `tea_use_playwright_utils=true`, `tea_use_pactjs_utils=false`, `tea_pact_mcp=none`, `tea_browser_automation=auto`, `risk_threshold=p1`, `communication_language=French`, `document_output_language=English`.
- Detected stack: **fullstack** (Spring/Gradle backend + Angular frontend).
- Knowledge fragments: risk-governance, probability-impact, test-levels-framework, test-priorities-matrix.
- Existing coverage scanned: `ParticipantControllerIntegrationTest` (18 tests), `SeasonParticipantServiceTest` (3 tests), `admin-participants.spec.ts` (14 tests).

## Step 3 — Risk assessment
- 10 risks identified; 2 high (≥6): R-001 (sync re-activation), R-002 (season remove cascading to troupe). See deliverable.

## Step 4 — Coverage plan
- P0/P1/P2/P3 matrix built; mapped to existing automated tests + gaps + manual recette.

## Step 5 — Output
- Deliverable: `_bmad-output/test-artifacts/test-design-epic-3.19.md`
