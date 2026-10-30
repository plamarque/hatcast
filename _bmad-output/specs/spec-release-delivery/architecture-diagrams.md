# Target process boundaries

Accepted behavioral target for architecture, not current runtime or implementation order. Q-1–Q-5 retain evidence lookup, exact selectors, validity, residual outcome and recovery mechanics; competing pre-production staging candidates require asking Patrice before replacement.

## Closure and release decision

```mermaid
flowchart TB
  STORY["Story complete"] --> CLOSE["Requested closure<br/>Own checks and integration into v2"]
  CLOSE --> ASSESS["Assess all unreleased v2 changes<br/>Since actually served production"]
  ASSESS --> PROPOSE["Recommend release with path<br/>or wait"]
  PROPOSE --> GO{"Explicit release go?"}
  GO -->|No| HOLD["Whole delta stays pending<br/>Local E2E recommended on demand"]
  HOLD -.->|Next development| CLOSE
  GO -->|Yes| FINAL["A: final candidate<br/>Code + version + approved notes"]
  FINAL --> PATH{"B: selected verification scope"}
  PATH -->|All eligibility conditions demonstrated| TARGET["Targeted<br/>Change, callers and neighbors"]
  PATH -->|Broad or uncertain| FULL["Complete<br/>Full governing verification"]
```

Existing complete procedures apply until reduced operational rules are adopted/implemented. Story approval/integration CI are distinct from release proof. Go initiates release work without silently removing notes, staging/human or production authority gates.

## Shared mechanism A

```mermaid
flowchart TB
  C["Final identified candidate<br/>Selected blocking scope"] --> TEST["Required CI assertions"]
  C --> BUILD["Staging build<br/>May overlap tests"]
  TEST --> JOIN["Build AND required tests successful"]
  BUILD --> JOIN
  JOIN --> STAGE["One actual staging deploy<br/>Expected revision/image"]
  STAGE --> CLOUD["Required cloud assertions"]
  CLOUD --> HUMAN["Human staging verification<br/>C1 always; C2-C5 by path/impact + delta"]
  HUMAN --> GATE["Current candidate evidence<br/>Explicit go prod"]
  GATE --> PROD["Separate production build + deploy"]
  PROD --> CHECK["Read-only served identity/reachability<br/>Prepared recovery target"]
```

Complete retains full T1, relevant API, full governing E1 and C1–C5 plus delta. Both paths retain version/API health/PWA and C1, plus changed/neighbor scenarios; Targeted selects C2–C5 by impact. Later v2 merges do not alter or interrupt this candidate. Resume mechanical failures on the same candidate only after inspecting actual effects. Targeted changes only adopted scope. Final metadata is validated with the candidate; valid proof can be reused, local is on demand, and separate images remain attributable.

## Deferred staging checks, diagnosis and preemption

```mermaid
flowchart TB
  READY["Blocking verification complete<br/>Selected staging candidate"] --> DEFER["Optional deferred staging checks<br/>Start while awaiting go prod"]
  READY --> GO{"Human staging acceptance<br/>Explicit go prod"}
  GO --> MEP["Production build + deploy<br/>Deferred completion not required"]
  DEFER -.-> PARALLEL["Continue on staging during/after MEP<br/>Safe compatible fixtures"]
  NEXT["New authorized staging candidate"] --> CANCEL["Cancel old deferred run<br/>Stop owned operations before switch"]
  DEFER -.->|Preempted| CANCEL
  CANCEL --> PARTIAL["Keep partial results and known failures<br/>Remaining coverage cancelled/incomplete"]
  CANCEL --> NEW["New candidate's own gates<br/>No wait for old suite completion"]
  DEFER --> RESULT{"Attributable outcome?"}
  RESULT -->|Pass| RECORD["Record only covered assertions"]
  RESULT -->|Failure| DIAG["Diagnose product / test / fixture / environment"]
  RESULT -->|Late or mixed revision| REJECT["Reject as proof; retain diagnostic record"]
  DIAG --> HUMAN["Patrice decides<br/>Repair, justified test adjustment,<br/>investigation or rollback"]
```

No automatic rollback/replay or inherited full pass. Cancellation cannot erase observed failures. Deferred tests remain on staging, never production, and do not reserve it through completion. Exact cancellation and fixture/result fencing remain open.
