# BUG-024 integrated review

Three independent context-free reviews inspected the full tracked/untracked diff from the recorded baseline. Findings were deduplicated by claim and required action.

## Triage

| Finding | Severity | Category | Action |
|---|---|---|---|
| Comment-only save narrows a historical empty-role response | high | patch | Retain raw explicit-role guard before normalization; add regression with volunteer offered. |
| Clear/comment/vote concurrent writes | high | patch | Shared busy guard in UI and handlers; retained-request tests both directions. |
| Proxy clear action uses first-person label | low | patch | Participant-neutral proxy label and target assertions. |
| DOMAIN glossary contradicts mandatory baseline | medium | patch | Reconcile empty-input and editable draft descriptions. |
| Active epic still prescribes favorite-role precheck | medium | patch | Reconcile active UI contract; preserve frozen historical specs. |
| Keyboard recipe does not establish focus | medium | patch | Assert actual focus/Tab and keyboard help behavior. |
| Poll rendered mandatory/help/clear controls lack tests | medium | patch | DOM interaction coverage including proxy and read-only. |
| API invalid-role test lacks retained-data assertion | medium | patch | GET after rejected write for self/proxy and comment preservation. |
| Proxy form volunteer lock combination untested | medium | patch | Form regression for lock and participant payload. |
| Previous smoke guide assumes all available empty requests fail | low | patch | Specify event without volunteer for that assertion. |
| Home ignores saved result if subsequent inbox refresh fails | medium | defer | Existing BUG-021 dependency behavior, unrelated to mandatory volunteer; recorded as BUG-023. |

No approved-intent change is required. These are bounded implementation, documentation and verification patches. Final verification is recorded in the implementation report.
