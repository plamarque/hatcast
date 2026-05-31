import type { UserAgendaParticipationFilters } from '../../core/agenda/user-agenda-api.service'
import type { EventResponse } from '../../core/events/event-api.service'
import { isEventPastParis } from '../../core/events/event-past-paris'
import type { EventFilterOption, ParticipantFilterOption } from '../../pages/season-home/season-view.types'
import {
  defaultStatsCategoryFilter,
  type StatsCategoryFilter,
} from '../../pages/season-home/stats-categories'
import type {
  ActiveFilterChip,
  EventPickerOption,
  FilterDimensionConfig,
  FilterHubDimension,
  FilterValues,
  ParticipantPickerOption,
} from './filter.types'
import { categoryChipLabel } from './filter.types'

const CHIP_LABEL_MAX = 24

export function scopedAgendaSeasons(
  filters: UserAgendaParticipationFilters,
  troupeId: string | null,
) {
  if (!troupeId) {
    return filters.seasons
  }
  return filters.seasons.filter((season) => season.troupeId === troupeId)
}

export function buildAgendaFilterDimensions(
  filters: UserAgendaParticipationFilters,
  troupeId: string | null,
): FilterDimensionConfig[] {
  const seasons = scopedAgendaSeasons(filters, troupeId)
  return [
    {
      key: 'troupe',
      type: 'single-select',
      icon: 'groups',
      title: 'Troupe',
      options: [
        { id: null, label: 'Toutes les troupes' },
        ...filters.troupes.map((t) => ({ id: t.id, label: t.name })),
      ],
    },
    {
      key: 'season',
      type: 'single-select',
      icon: 'calendar_month',
      title: 'Saison',
      options: [
        { id: null, label: 'Toutes les saisons' },
        ...seasons.map((s) => ({ id: s.id, label: s.title })),
      ],
    },
  ]
}

export function buildAgendaHubDimensions(
  filters: UserAgendaParticipationFilters,
  troupeId: string | null,
  seasonId: string | null,
): FilterHubDimension[] {
  const troupeSummary = troupeId
    ? (filters.troupes.find((t) => t.id === troupeId)?.name ?? 'Troupe sélectionnée')
    : 'Toutes les troupes'
  const season = seasonId ? filters.seasons.find((s) => s.id === seasonId) : null
  const seasonSummary = season?.title ?? 'Toutes les saisons'

  return [
    { key: 'troupe', icon: 'groups', title: 'Troupe', summary: troupeSummary },
    { key: 'season', icon: 'calendar_month', title: 'Saison', summary: seasonSummary },
  ]
}

export function buildAgendaFilterValues(
  troupeId: string | null,
  seasonId: string | null,
): FilterValues {
  return { troupe: troupeId, season: seasonId }
}

export function resolveAgendaPanelSeason(
  filters: UserAgendaParticipationFilters,
  troupeId: string | null,
  seasonId: string | null,
): string | null {
  if (!seasonId) {
    return null
  }
  if (!troupeId) {
    return filters.seasons.some((season) => season.id === seasonId) ? seasonId : null
  }
  return filters.seasons.some(
    (season) => season.id === seasonId && season.troupeId === troupeId,
  )
    ? seasonId
    : null
}

export function buildAgendaFilterChips(
  filters: UserAgendaParticipationFilters,
  troupeId: string | null,
  seasonId: string | null,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  if (troupeId) {
    const troupe = filters.troupes.find((t) => t.id === troupeId)
    chips.push({
      dimensionKey: 'troupe',
      label: troupe?.name ?? 'Troupe sélectionnée',
    })
  }
  if (seasonId) {
    const season = filters.seasons.find((s) => s.id === seasonId)
    chips.push({
      dimensionKey: 'season',
      label: season?.title ?? 'Saison sélectionnée',
    })
  }
  return chips
}

export function participantOptionsForPicker(
  options: ParticipantFilterOption[],
): ParticipantPickerOption[] {
  return options
    .filter((o): o is ParticipantFilterOption & { id: string } => o.id != null)
    .map((o) => ({ id: o.id, label: o.label }))
}

export function eventFilterOptionFromResponse(
  e: Pick<EventResponse, 'id' | 'title' | 'startsAt' | 'archived'>,
  now: Date = new Date(),
): EventFilterOption {
  return {
    id: e.id,
    title: e.title,
    startsAt: e.startsAt,
    archived: e.archived,
    past: isEventPastParis(e.startsAt, now),
  }
}

/** Masque passés / inactifs tant que les cases ne sont pas cochées (comportement V1). */
export function filterEventPickerVisibleOptions(
  options: EventPickerOption[],
  showPast: boolean,
  showArchived: boolean,
  now: Date = new Date(),
): EventPickerOption[] {
  return options.filter((o) => {
    if (o.archived && !showArchived) {
      return false
    }
    const isPast = o.past ?? (o.startsAt ? isEventPastParis(o.startsAt, now) : false)
    if (isPast && !showPast) {
      return false
    }
    return true
  })
}

export function eventOptionsForPicker(options: EventFilterOption[]): EventPickerOption[] {
  return options.map((o) => ({
    id: o.id,
    title: o.title,
    startsAt: o.startsAt,
    archived: o.archived,
    past: o.past,
  }))
}

export function aggregateSelectionLabel(
  ids: string[],
  options: { id: string; label: string }[],
  pluralNoun: string,
): string | null {
  if (!ids.length) {
    return null
  }
  if (ids.length === 1) {
    return options.find((o) => o.id === ids[0])?.label ?? pluralNoun
  }
  if (ids.length === 2) {
    const names = ids.map((id) => options.find((o) => o.id === id)?.label ?? id)
    const joined = names.join(', ')
    return joined.length > CHIP_LABEL_MAX
      ? `${joined.slice(0, CHIP_LABEL_MAX - 1)}…`
      : joined
  }
  return `${ids.length} ${pluralNoun}`
}

export function participantHubSummary(
  ids: string[],
  options: ParticipantFilterOption[],
): string {
  if (!ids.length) {
    return 'Tous les participants'
  }
  return (
    aggregateSelectionLabel(ids, participantOptionsForPicker(options), 'participants') ??
    'Tous les participants'
  )
}

export function spectacleHubSummary(
  ids: string[],
  options: EventFilterOption[],
): string {
  if (!ids.length) {
    return 'Tous les spectacles'
  }
  return (
    aggregateSelectionLabel(
      ids,
      options.map((o) => ({ id: o.id, label: o.title })),
      'spectacles',
    ) ?? 'Tous les spectacles'
  )
}

export function categoriesHubSummary(
  filter: StatsCategoryFilter,
  labels: Record<string, string>,
): string {
  if (filter.kind === 'all') {
    return 'Toutes'
  }
  if (filter.kind === 'none') {
    return 'Aucune'
  }
  return categoryChipLabel(filter, labels) ?? 'Catégories'
}

export function buildSeasonHubDimensions(input: {
  view: 'agenda' | 'history' | 'stats'
  participantOptions: ParticipantFilterOption[]
  selectedParticipantIds: string[]
  eventOptions: EventFilterOption[]
  selectedEventIds: string[]
  statsCategoryFilter: StatsCategoryFilter
  categoryLabels: Record<string, string>
  categoryGlossarySlugs: string[]
}): FilterHubDimension[] {
  const dimensions: FilterHubDimension[] = []

  if (input.participantOptions.length > 1) {
    dimensions.push({
      key: 'participant',
      icon: 'person',
      title: 'Participants',
      summary: participantHubSummary(input.selectedParticipantIds, input.participantOptions),
    })
  }

  if (input.eventOptions.length > 0) {
    dimensions.push({
      key: 'spectacle',
      icon: 'event',
      title: 'Spectacles',
      summary: spectacleHubSummary(input.selectedEventIds, input.eventOptions),
    })
  }

  if (input.view === 'stats' && input.categoryGlossarySlugs.length > 0) {
    dimensions.push({
      key: 'categories',
      icon: 'category',
      title: 'Catégories',
      summary: categoriesHubSummary(input.statsCategoryFilter, input.categoryLabels),
    })
  }

  return dimensions
}

export function buildSeasonFilterChips(input: {
  participantOptions: ParticipantFilterOption[]
  selectedParticipantIds: string[]
  eventOptions: EventFilterOption[]
  selectedEventIds: string[]
  statsCategoryFilter: StatsCategoryFilter
  categoryLabels: Record<string, string>
}): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  const participantLabel = aggregateSelectionLabel(
    input.selectedParticipantIds,
    participantOptionsForPicker(input.participantOptions),
    'participants',
  )
  if (participantLabel) {
    chips.push({ dimensionKey: 'participant', label: participantLabel })
  }

  const eventLabel = aggregateSelectionLabel(
    input.selectedEventIds,
    input.eventOptions.map((o) => ({ id: o.id, label: o.title })),
    'spectacles',
  )
  if (eventLabel) {
    chips.push({ dimensionKey: 'spectacle', label: eventLabel })
  }

  const categoryLabel = categoryChipLabel(input.statsCategoryFilter, input.categoryLabels)
  if (categoryLabel) {
    chips.push({ dimensionKey: 'categories', label: categoryLabel })
  }

  return chips
}

export function buildSeasonFilterValues(input: {
  selectedParticipantIds: string[]
  selectedEventIds: string[]
  statsCategoryFilter: StatsCategoryFilter
}): FilterValues {
  return {
    participant: [...input.selectedParticipantIds],
    spectacle: [...input.selectedEventIds],
    categories: input.statsCategoryFilter,
  }
}

/** API endpoints accept a single participantId — use when exactly one member is selected. */
export function resolveApiParticipantId(ids: string[]): string | null {
  return ids.length === 1 ? ids[0]! : null
}

export function resetSeasonFilterDimension(
  key: ActiveFilterChip['dimensionKey'],
  current: {
    statsCategoryFilter: StatsCategoryFilter
  },
): Partial<FilterValues> {
  if (key === 'participant') {
    return { participant: [] }
  }
  if (key === 'spectacle') {
    return { spectacle: [] }
  }
  if (key === 'categories') {
    return { categories: defaultStatsCategoryFilter() }
  }
  return {}
}

/** @deprecated Use buildSeasonHubDimensions — kept for legacy openPanel path. */
export function buildParticipantDimension(
  options: ParticipantFilterOption[],
): FilterDimensionConfig {
  return {
    key: 'participant',
    type: 'single-select',
    icon: 'person',
    title: 'Membre',
    options: options.map((o) => ({
      id: o.id,
      label: o.id == null ? 'Tous les membres' : o.label,
    })),
  }
}

/** @deprecated Use buildSeasonHubDimensions */
export function buildSpectacleDimension(
  options: EventFilterOption[],
): FilterDimensionConfig {
  return {
    key: 'spectacle',
    type: 'single-select',
    icon: 'event',
    title: 'Spectacle',
    options: [
      { id: null, label: 'Tous les spectacles' },
      ...options.map((o) => ({ id: o.id, label: o.title })),
    ],
  }
}

export function buildCategoriesDimension(): FilterDimensionConfig {
  return {
    key: 'categories',
    type: 'multi-select',
    icon: 'category',
    title: 'Catégories',
  }
}

/** @deprecated */
export function seasonEventChipLabel(
  eventId: string | null,
  options: EventFilterOption[],
): string | null {
  if (!eventId) {
    return null
  }
  return options.find((o) => o.id === eventId)?.title ?? null
}

export function defaultEventPickerScope(view: 'agenda' | 'history' | 'stats'): {
  showPast: boolean
  showArchived: boolean
} {
  if (view === 'history') {
    return { showPast: true, showArchived: false }
  }
  return { showPast: false, showArchived: false }
}
