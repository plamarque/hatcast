# Staging smoke contract

Use this reference to choose and document the human staging smoke for a HatCast
V2 release. It complements—not replaces—local E2E, the deploy staging CI, and
the E1 preprod gate.

## Selection rule

Start with the approved permanent core. Add one to three delta paths for
behavior changed by the release. A changed P0 business path wins over a more
frequent generic navigation path.

Do not refresh PostHog during an ordinary release. The separate
`hatcast-posthog-smoke-analysis` skill owns evidence collection and proposes
changes to this baseline only on explicit request.

## Responsive profiles

Use the approved profiles below while executing the permanent core. They came
from the 90-day PostHog screen-size distribution on 16 October 2026; a screen
size is a useful proxy, not an exact browser content viewport. Reassess them
only through the separate analysis skill when usage or instrumentation changes.

| ID | Test viewport | Purpose | Evidence |
|---|---:|---|---|
| R1 | 402 × 874 | Primary mobile | Most-represented mobile screen: 18 people / 529 pageviews. |
| R2 | 360 × 780 | Narrow mobile guard | 11 people / 175 pageviews. |
| R3 | 1728 × 1117 | Wide desktop | Most-represented desktop screen: 21 people / 151 pageviews. |

Run C1, C2 and C5 at R1. Run C3 at R3 and R1 because the current data cannot
reliably separate organizer screen use from member screen use. Use R2 for a
changed mobile layout, a reported mobile defect, or a release whose delta
touches dense controls. A resized browser viewport is an indication only: keep
real-device testing for releases whose risk depends on touch, keyboard, safe
areas, notification delivery, or mobile browser behavior.

PostHog is currently able to support these semantic checks:

| Signal | What it establishes | Limitation |
|---|---|---|
| `$pageview` | SPA route reachability | Does not prove an action completed. |
| `availability_first_submission` | First availability response was submitted | Not every availability update. |
| `composition_validated` | Organizer validated a composition | Does not represent format edit or assignment steps. |
| `composition_all_confirmations_received` | All confirmations completed | Aggregate outcome, not each member action. |
| `notification_link_opened` | A notification opened a destination tab | Does not prove downstream action. |

If no semantic signal covers a candidate, use the persisted UI/API result as
the smoke assertion and record the instrumentation gap. Do not infer volume
from a single replay or a pageview count.

## Permanent core

| ID | Role | Journey | Persistent success condition |
|---|---|---|---|
| C1 | Member | Sign in → Accueil → open a current event | Authenticated session and event details load after reload. Run at R1. |
| C2 | Member | Event → Dispos → submit initial availability | Submitted availability survives reload; capture `availability_first_submission` where it is a new response. Run at R1. |
| C3 | Organizer | Event → Équipe → inspect/assign composition → validate | Validated composition survives reload; capture `composition_validated`. Use an isolated fixture for mutations. Run at R3 and R1. |
| C4 | Member | Open a validated composition and act on the required confirmation/status | Member-visible state is correct after reload; use the release's relevant state rather than assuming confirmation is always available. |
| C5 | Member | Open a received notification → expected event tab | Correct event and target tab load; capture `notification_link_opened` when a fixture notification is available. Run at R1. |

## Delta path examples

- Format/composition release: change or preview a format, preserve/reconcile
  assignments as specified, then assert the persisted organizer and member
  views. For Epic 22, distinguish “libérer la place” from “supprimer la place”.
- Availability/reminder release: organizer sends/removes a reminder, member
  follows the notification, then assert the expected availability state.
- Stats or multi-troupe release: switch the intended troupe/season context and
  assert the selected context survives navigation/reload.

## Per-path evidence record

Record this in the handoff or release summary for every executed path:

```text
ID / priority:
Target: staging URL, deployed commit, RC tag
Role and fixture: no personal account or production data
Preconditions:
Actions:
Expected and persisted observation:
Viewport/profile:
PostHog evidence or instrumentation gap:
Mutation and cleanup:
Result: pass | failed | blocked | waived
Evidence links: CI/E1 run, screenshot/replay when appropriate
```

Only fixtures explicitly reserved for staging may be changed. If an action
would publish, notify real people, or alter shared data without a documented
cleanup/reversibility plan, do not execute it: mark it blocked and obtain a
safe fixture or explicit user direction.
