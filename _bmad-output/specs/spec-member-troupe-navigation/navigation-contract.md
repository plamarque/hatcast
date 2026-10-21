# Navigation contract

## Menu and destinations

The existing **Ma troupe** navigation control opens a Material menu instead of navigating immediately. Its icon and position remain in the member rail/bottom bar. One activation opens the menu; selecting an enabled entry navigates and closes it. No nested menu, context picker, subtitle or section heading is added.

| Order | Visible label | Destination |
|---|---|---|
| 1 | Resolved troupe name, e.g. **La Malice** | `/troupes/:troupeSlug` |
| 2 | Resolved season title, e.g. **2026–2027** | `/saison/:troupeSlug/:seasonSlug?view=agenda` |
| 3 | **Statistiques** | `/saison/:troupeSlug/:seasonSlug?view=stats` |

The explicit agenda view prevents an earlier statistics selection from making the second entry reopen statistics. Existing canonical routing/query handling remains authoritative. Personal **Mes stats** retains its current route and behavior.

Long actual names may wrap or truncate within the viewport; never add “Troupe ·”, “Saison ·” or append the season title to **Statistiques**. Full names remain accessible. Menu-trigger expanded state, keyboard opening, focus movement, Escape dismissal and focus restoration follow standard Material behavior. Route/active indication must distinguish season agenda from statistics; opening the menu alone does not change the route.

## Shared resolution

The three entries use one validated snapshot. Do not resolve each independently or let opening a menu alter selected business context.

**Troupe:**

1. Use the last remembered troupe if current access is confirmed.
2. Otherwise choose the accessible active membership with greatest `membership.createdAt`. This is membership creation, not reactivation time; use the existing field without adding a “joined” date.
3. For equal dates, order by troupe name ascending, then troupe ID ascending. Treat invalid/missing dates as oldest. Do not assume the API's first item is the most recently joined troupe; its current ordering is alphabetical.

**Season within that troupe:**

1. Use the last remembered season **for that troupe**, if accessible and not archived.
2. Otherwise choose its accessible non-archived season with greatest `startDate`; missing dates come last. Ties use title ascending, then ID ascending.
3. No active accessible season means no agenda/statistics target. Archived seasons remain available from the troupe page.

Reuse existing memories (`lastVisitedTroupeSlug`, `lastVisitedSeasonByTroupe`) and navigation access rules. An old global `lastVisitedSeason` may only contribute when its resolved troupe matches the chosen troupe; it never overrides troupe resolution. An accessible remembered guest/admin context can be reused; fallback does not invent a new troupe selection based on platform privileges. Apply no new demo-troupe exclusion.

Successful troupe/season visits update the existing memories; selecting another season in the troupe page remembers that choice for that troupe. Reopening the menu resolves the updated pair. This includes a default season resolved on the troupe page so the subsequent menu agrees with the season shown there. Mere menu opening, failed resolution and failed navigation must not write a new remembered visit. Changing troupe never borrows a season from the previous troupe. The current page is not an extra precedence rule over memory.

## Empty, loading and authorization states

| State | Behavior |
|---|---|
| Troupe and active season resolved | Three enabled entries with labels from the destination table, subject to existing rights. |
| Troupe resolved, no active accessible season | Troupe name enabled; **Aucune saison** and **Statistiques** disabled. No extra row. |
| No accessible troupe or active membership to use | **Mes troupes** opens `/troupes`; **Aucune saison** and **Statistiques** disabled. Existing list handles discovery/empty state. |
| Resolution in progress | Disable unresolved targets; retain known names. A minimal **Chargement…** placeholder is allowed where no name is known; no fourth row. |
| Transient API error | Do not silently select another context or erase remembered values. Keep affected entries unavailable and provide concise accessible error feedback using existing UI conventions; reopening retries. |
| Stored target definitively inaccessible, removed or inactive | Ignore it and apply the fallback to confirmed eligible contexts. Do not expose an unauthorized destination. |
| Season has restricted guest access | Preserve existing restrictions, including absence of statistics access. Keep the third entry disabled if statistics are unauthorized. Never broaden rights to satisfy a menu entry. |

These state labels are exceptions only when a real troupe/season name cannot be presented. No settings screen or global preferred-context concept is introduced.

## Troupe-page navigation

- Expose **Voir la saison** and **Statistiques** for the selected active season as a compact group immediately below its title/selector. The links target its agenda and statistics, respectively, and respect existing permissions.
- Their existence depends on the resolved accessible season, not upcoming-show count, past-show count, participant overflow, dashboard data loading or mini-chart availability. A statistics-data failure does not itself revoke navigation rights.
- The former teaser-only agenda CTA and chart-only statistics CTA must not remain the sole paths. Consolidate them into this group rather than multiplying identical links.
- Retain the existing active-season selector and archived-season access. Selecting a season refreshes both links and remembers the selection.
- With at least two active troupes in the existing troupe context, move **Voir les autres troupes** from the bottom footer to a visible position near the troupe title. It opens `/troupes`, whose existing cards open each troupe. Do not add a second troupe picker or a fourth global-menu entry.
- Keep the troupe identity, description and admin affordances distinct from member navigation. Mobile controls must not overlap the title or **Gérer la troupe**.
- Preserve the season-page troupe breadcrumb (name on desktop, logo on mobile) and its season/context switching. **Agenda / Statistiques** remains the local way to move between views, according to rights.

## Home

Remove the entire **Accès rapides** heading, section and its four links: season, season statistics, troupe and troupe list. Do not replace it with another panel or leave reserved spacing. Home actions, next-show card, feedback and empty/error states retain existing behavior. The troupe menu selects navigation destinations only; it does not filter home or agenda by troupe.

## Acceptance scenarios

| ID | Setup/action | Expected result |
|---|---|---|
| AC-1 | Mobile or desktop, open **Ma troupe** with valid memories | Exactly three short labels; troupe, agenda and statistics use one pair. No selector or extra item. |
| AC-2 | Last global season belongs to troupe B, remembered troupe is A | Select A's remembered active season or A's date-based fallback; never link B's season under A. |
| AC-3 | No memory, multiple active memberships | Newest membership creation wins; ties resolve deterministically. No picker is required. |
| AC-4 | Stored troupe/season definitively inaccessible or season archived | Resolve the next eligible target; never offer a stale/unauthorized link. |
| AC-5 | No active season, or no memberships | Three-entry empty-state contract; list/troupe remains reachable as applicable. |
| AC-6 | Season with no upcoming shows and fewer than three past shows | Both permitted links remain visible next to the selected season, even without a chart/teaser. |
| AC-7 | Troupe dashboard content request fails, season/access already resolved | Permitted season navigation remains usable. Resolution failures instead disable unresolved targets without wiping memory. |
| AC-8 | On troupe A, select another season, then navigate to troupe B through **Voir les autres troupes** | Menu follows successful remembered visits; returning to A restores A's season memory. |
| AC-9 | Open season agenda, then statistics, then troupe breadcrumb | Correct views and return destination on phone and desktop; personal **Mes stats** unchanged. |
| AC-10 | Home normal/loading/error/empty state | No quick-access section; existing required actions and next-show behavior preserved. |
| AC-11 | Keyboard, screen reader and narrow viewport with long names | Standard menu focus/dismissal, full accessible names, visible destinations, usable touch targets and no overlapping controls; M3 checklist applies. |
| AC-12 | Restricted guest or cross-troupe membership change | Existing rights remain enforced; menu never creates new access or hides global personal actions through troupe filtering. |

## Brownfield evidence and scope of amendment

Source inspection only; no claim of browser smoke or deployed behavior. `LIMIT-010` records the current content-dependent links.

| Existing source | Relevance/change |
|---|---|
| `apps/web/src/app/shared/member-nav/member-nav.html` | Replace only the direct **Ma troupe** links with menu triggers. |
| `core/navigation/last-visited-troupe-shortcut.service.ts`, `last-visited-troupe-storage.ts` | Existing troupe memory; current missing-memory fallback goes to the list. Add the specified membership fallback. |
| `core/navigation/last-visited-season-storage.ts`, `pages/troupe-hub/troupe-hub.ts` (`pickDefaultSeason`) | Per-troupe memory and active-season fallback exist; reuse and make menu/page resolution coherent. |
| `core/troupes/troupe-context.service.ts`, `troupe-api.service.ts` | Selected troupe context is distinct; membership creation date is already exposed. Avoid divergent implicit defaults. |
| `pages/member-home-todo/member-home-todo.html` | Remove the four-link section. |
| `pages/troupe-hub/troupe-hub.html`, `season-hub-mini-chart.utils.ts` | Current agenda CTA is teaser-dependent; statistics CTA requires the chart (at least three past events). Move navigation outside those conditions. |
| `shared/context-breadcrumb/`, `shared/context-switcher/`, `pages/season-home/season-view-toolbar.html` | Existing return/context/view paths to preserve. |

Source paths above are relative to `apps/web/src/app/` when not fully prefixed. Earlier `ux-hub-a-faire.md` quick-access rules and `ux-design-ma-troupe-hub.md` MT1 direct navigation, default selection and footer placement are superseded only for the behavior explicitly described here. Other rules, especially permissions, are unchanged.
