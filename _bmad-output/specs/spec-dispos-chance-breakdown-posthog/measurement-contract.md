# Measurement contract — chance breakdown

## Scope and trigger

| Event | Trigger | Required condition |
|---|---|---|
| `chance_breakdown_opened` | The service opens `ChanceBreakdownSheet` from an approved Dispos or Équipe caller. | `getChanceBreakdown` returned data and `MatBottomSheet.open` or `MatDialog.open` was invoked. |
| `chance_breakdown_help_opened` | The user clicks **Comprendre le tirage en général** inside a tracked breakdown. | The help action was actually invoked; merely rendering the link does not count. |

Do not emit either event for a pool-segment tap that fails to produce the panel. One successful open produces one `chance_breakdown_opened` event; reopening after dismissal produces another.

## Event properties

`chance_breakdown_opened` must be assembled by `ProductAnalyticsService`, not by spreading caller objects.

| Property | Values / origin | Purpose |
|---|---|---|
| `event_id` | existing safe context | Event-local analysis. |
| `season_id` | existing safe context | Season-local analysis. |
| `troupe_id` | existing safe context | Troupe-local analysis. |
| `is_demo_troupe` | existing safe context | Exclude demo traffic where appropriate. |
| `actor_scope` | existing contextual enum, when available | Compare member and operational usage without a People role. |
| `entry_point` | Closed enum below | Separates approved surfaces without identifying the consulted person. |
| `presentation` | `bottom_sheet` or `dialog` | Separate mobile sheet from desktop dialog. |

`chance_breakdown_help_opened` carries the same safe context plus the opening `entry_point`. It deliberately has no presentation, target-person, role, chance, rank, factor, or timing property.

Never capture: display name, avatar URL, email, `userId`, `participantId`, `viewerParticipantIds`, `roleKey`, formula ID, chance percent, rank, candidate count, adjustment/factor IDs, tooltip copy, raw URL, free text, raw user-agent, or screen contents.

## Approved entry points

| `entry_point` | Caller | Surface |
|---|---|---|
| `dispos_poll` | `AvailabilityPoll.onPoolSegmentTap` | Dispos role pool. |
| `equipe_slot_picker` | `CompositionSlotPickerDialog.openBreakdown` | Équipe candidate picker. |
| `equipe_pool_preview` | `EventEquipeTab.onPoolPreviewSegmentTap` | Équipe pool preview. |
| `equipe_draw_step` | `EventEquipeTab.onDrawSegmentTap` | Équipe draw-animation step. |
| `equipe_slot_chance` | `EventEquipeTab.openSlotChanceBreakdown` | Équipe assigned-slot chance. |

No other value is accepted. `roleKey`, formula ID, and the viewed candidate remain local-only inputs, not analytics dimensions.

## Implementation seam

1. Add event-name constants and narrowly typed property unions alongside the existing PostHog contract.
2. Add two `ProductAnalyticsService` methods that rebuild `safeEventContext` and whitelist only the fields above.
3. Extend `ChanceBreakdownOpenContext` with the already-safe analytics context and the bounded `entry_point`; do not add the viewed participant to analytics context.
4. In each approved caller, pass its existing event, season, troupe, and contextual actor scope through the service context with its literal approved `entry_point`.
5. In `ChanceBreakdownService.open`, capture the opening only after the successful API response and immediately after selecting the responsive overlay type. Preserve existing overlay gate and error behaviour.
6. Preserve the tracked entry point in sheet data so `openDrawChancesHelp()` can capture the help action for the originating approved surface.

The shared service has no implicit analytics default: callers not listed above must compile unchanged and must not gain telemetry.

## PostHog use

For replay research, filter Session Replay by:

- Event: `chance_breakdown_opened`
- Property: `entry_point` equals the surface under investigation, for example `dispos_poll` or `equipe_draw_step`
- Date range: operator selected; start with the project’s usual 30-day exploratory window if useful.

This is an analysis recipe, not authorization to create a PostHog dashboard, cohort, insight, replay tag, or automation.

## Verification

| Level | Evidence |
|---|---|
| Product analytics unit tests | Disabled analytics captures nothing; enabled analytics emits the exact allowlisted properties; target/person data cannot enter the payload. |
| Chance-breakdown service tests | Successful mobile and desktop opens emit one event with the matching presentation; API failure and overlay-gate refusal emit none. |
| Caller component tests | Every approved caller passes its exact literal `entry_point` and event-safe contextual actor scope, never the candidate identity. |
| Sheet test | The help event is emitted only after the explicit help action and retains the approved originating entry point. |
| Manual/PostHog smoke when authorized | Open a Dispos and an Équipe chance explanation on mobile, filter each replay by its event and entry point, then inspect properties for the allowlist only. |
