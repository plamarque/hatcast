# ADR-0007: Multi-select participants and events in header selectors

- **Status:** Accepted
- **Context:** Users need to compare several participants or spectacles across views (Participants, Spectacles, Timeline, Compositions). The previous single-select limited comparison to one participant or one event at a time.
- **Decision:** Add checkboxes (right side of each row) in PlayerSelectorModal and EventSelectorModal. Keep row click for immediate single-select + close. Checkbox interactions build a multi-selection; closing the popup (X or backdrop) applies the filter to displayed participants/events. The "Tous" row has a checkbox to select/deselect all; clicking the row keeps current behaviour (close + show all). State: `selectedPlayerIds` / `selectedEventIds` (`Set<string> | null`); `null` = show all.
- **Consequences:** Users can compare multiple participants or spectacles. Display logic in ViewHeader adapts (e.g. "3 participants", "Alice, Bob" for 2). Tests added: E2E `selector-multi-select.spec.js`, unit `selector-display.spec.js`.
- **Alternatives considered:** Separate multi-select UI (e.g. tag input) – rejected for consistency with existing dropdown; left-side checkboxes – user preferred right for balance.
