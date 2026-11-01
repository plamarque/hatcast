# Existing behavior and compatibility boundaries

Source inspection on 2026-10-27 against local V2 HEAD
`6a5b8a8a972da9558e8cf587eaa22f7ef2b080d9`; not a live production verification.
The adopted architecture companion records the target, not current behavior.

- Existing group memberships, season rosters, events, self/proxy availability,
  role slots and manual assignment provide the common model. Membership and
  invitation permissions remain distinct from role catalogs. See
  [DOMAIN.md](../../../DOMAIN.md), [SPEC.md](../../../SPEC.md) and
  [ARCH.md](../../../ARCH.md).
- [EventRoleSlots.kt](../../../services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt)
  defines fixed event types, role keys, priorities and role defaults; unknown keys
  are rejected. Existing `match` defaults are for improvisation. Events already
  store type keys and editable role needs; selections and availability also store
  role keys. Configurability therefore needs compatible resolution, not merely
  display-label changes or wholesale replacement of historical keys.
- [RoleLabels.kt](../../../services/api/src/main/kotlin/com/hatcast/api/role/RoleLabels.kt)
  and [SeasonStatisticsService.kt](../../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt)
  use fixed mappings. Custom catalogs need consistent statistics, preferences,
  parity and draw handling, including every offered role in the draw order.
- [UserMemberPreferencesService.kt](../../../services/api/src/main/kotlin/com/hatcast/api/user/UserMemberPreferencesService.kt)
  currently copies global role preferences to active memberships; group-specific
  preferences require a compatible transition. An empty historical preference
  means all roles; historical empty available-role lists have wildcard meaning.
- [AvailabilityRoleRules.kt](../../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt)
  adds `volunteer` when volunteer places exist, including historical requests with
  `applyVolunteerRule=false`; self and proxy paths must honor the event's effective
  policy without rewriting historical answers during reads.
- [CompositionService.kt](../../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt)
  handles validation and confirmation events. Existing statuses and consumers
  distinguish pending, confirmed and withdrawn behavior; adding **sélectionné**
  requires coordinated API, client, lifecycle, notification and rollback handling.
- [SpectacleCategory.kt](../../../services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt)
  scopes selection history, while
  [SeasonStatisticsCategoryFilter.kt](../../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsCategoryFilter.kt)
  filters statistics. Categories are independent of draw presentation.
- [TroupeEntity.kt](../../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt)
  and [TroupeLogoService.kt](../../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeLogoService.kt)
  already support group name/logo. [MemberTroupeMenuService](../../../apps/web/src/app/core/navigation/member-troupe-menu.service.ts)
  resolves group and season context; preserve loading, permissions and multigroup
  behavior when the navigation trigger displays the identity.

Root/domain/architecture contracts describe existing behavior and must be aligned
with production changes when implemented. No migration or runtime change is
performed by this specification update. Simple participation and series are
deferred; a prior bounded search of event modules found no reusable series logic,
but that is not proof of global absence.
