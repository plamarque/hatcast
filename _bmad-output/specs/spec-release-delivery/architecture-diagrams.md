# Process boundaries

These diagrams express proposed contracts, not deployed changes or an implementation schedule. Current topology and the measured before-process remain in the adopted audit. Continuous edges denote verification/data dependencies; dashed edges denote nonblocking observation. Production authorization is always separate.

## Contract A: equivalent coverage

```mermaid
flowchart TB
  C["Final candidate<br/>Code + version + approved notes"] --> L["Complete local E2E<br/>Candidate-bound proof"]
  C --> T["Complete CI T1<br/>H2 + mock auth"]
  C --> B["Staging image build<br/>May overlap tests"]
  L --> G["Required proofs and build valid"]
  T --> G
  B --> G
  G --> S["One staging deployment<br/>Verify candidate revision"]
  S --> E["Cloud T2 E1<br/>Explicit skip/retry dispositions"]
  E --> H["Human C1–C5 + delta<br/>Persisted outcomes"]
  H --> P["Validate current proofs<br/>Reuse local proof only if still valid<br/>Separate prod authorization"]
  P --> D["Prod tag + Release<br/>Production-specific build + deploy"]
  D --> V["Read-only production verification<br/>Recovery target identified"]
```

Local and CI remain distinct. Removing a metadata-only intermediate candidate and an identical valid local rerun does not remove a proof environment. API or other controls required by the governing scope remain required even if omitted from this compact diagram.

## Contract B: coverage intentionally selected by blast radius

```mermaid
flowchart TB
  BASE["Actually served production baseline"] --> DELTA["Complete candidate delta<br/>Hotfix isolated when applicable"]
  DELTA --> R{"Classify dependencies and consequences"}
  R --> OBS["Observation mode<br/>Full gates retained"]
  R --> POLICY{"Reduced-coverage policy adopted?"}
  POLICY -->|"No or unknown"| FULL["Reinforced<br/>Full regression + relevant API<br/>Cloud E1 + C1–C5 and delta"]
  POLICY -->|"Yes, eligible low"| FAST["Fast<br/>Bug/caller tests<br/>Cloud baseline + persisted correction smoke"]
  POLICY -->|"Yes, known medium"| STD["Standard<br/>Domain/integration/neighbors<br/>Pertinent E1 + persisted human smoke"]
  FAST --> COMMON["Build + candidate-bound evidence<br/>Current staging revision<br/>Separate production authorization"]
  STD --> COMMON
  FULL --> COMMON
  COMMON --> PROD["Production-specific build + deploy<br/>Read-only verification + prepared recovery"]
  FAST -.-> DEF["Deferred complete regression<br/>Alert owner + response + suspension policy"]
  STD -.-> DEF
```

Reduced coverage accepts potential post-delivery detection outside selected scope. Missing eligibility, mapping confidence or required proof selects reinforced coverage. This diagram does not define proof expiry, fixture waivers, alert ownership or a Git lineage mechanism; Q-1 through Q-5 retain those decisions explicitly.
