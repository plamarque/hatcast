import type { UserAgendaParticipationFilters } from '../../core/agenda/user-agenda-api.service'
import {
  statsCategoriesFilterLabel,
  type StatsCategoryFilter,
} from '../../pages/season-home/stats-categories'

export const FILTER_MOBILE_BREAKPOINT = '(max-width: 480px)'

export type FilterDimensionKey =
  | 'troupe'
  | 'season'
  | 'participant'
  | 'spectacle'
  | 'categories'

export type FilterDimensionType = 'single-select' | 'multi-select' | 'hub-row'

export interface FilterSingleSelectOption {
  id: string | null
  label: string
}

/** Summary row in the inline criteria bar (no embedded option lists). */
export interface FilterHubDimension {
  key: FilterDimensionKey
  icon: string
  title: string
  summary: string
}

export interface FilterDimensionConfig {
  key: FilterDimensionKey
  type: FilterDimensionType
  icon: string
  title: string
  options?: FilterSingleSelectOption[]
  allOptionLabel?: string
}

export type FilterValues = Partial<{
  troupe: string | null
  season: string | null
  /** Empty array = tous les participants (UX-DR22.1). */
  participant: string[]
  /** Empty array = tous les spectacles. */
  spectacle: string[]
  categories: StatsCategoryFilter
}>

export interface ActiveFilterChip {
  dimensionKey: FilterDimensionKey
  label: string
}

export interface FilterPanelData {
  dimensions: FilterDimensionConfig[]
  values: FilterValues
  categoryGlossarySlugs: string[]
  categoryLabels: Record<string, string>
  isMobile: boolean
  /** When set, season options rescope reactively when draft troupe changes (agenda / glance). */
  participationFilters?: UserAgendaParticipationFilters
}

export interface FilterPanelResult {
  action: 'apply' | 'reset'
  values: FilterValues
}

export interface ParticipantPickerOption {
  id: string
  label: string
}

export interface ParticipantPickerData {
  options: ParticipantPickerOption[]
  selectedIds: string[]
  isMobile: boolean
}

export interface ParticipantPickerResult {
  action: 'apply' | 'reset'
  selectedIds: string[]
}

export interface EventPickerOption {
  id: string
  title: string
  startsAt?: string
  archived?: boolean
  past?: boolean
}

export interface EventPickerData {
  options: EventPickerOption[]
  selectedIds: string[]
  showPast: boolean
  showArchived: boolean
  isMobile: boolean
}

export interface EventPickerResult {
  action: 'apply' | 'reset'
  selectedIds: string[]
  showPast: boolean
  showArchived: boolean
}

export interface CategoriesPickerData {
  value: StatsCategoryFilter
  glossarySlugs: string[]
  labels: Record<string, string>
  isMobile: boolean
}

export interface CategoriesPickerResult {
  action: 'apply' | 'reset'
  value: StatsCategoryFilter
}

export interface SinglePickerData {
  dimension: FilterDimensionConfig
  selectedId: string | null
  isMobile: boolean
  participationFilters?: UserAgendaParticipationFilters
  draftTroupeId?: string | null
}

export interface SinglePickerResult {
  action: 'apply' | 'reset'
  selectedId: string | null
}

export function countActiveFilterDimensions(chips: ActiveFilterChip[]): number {
  return chips.length
}

export function categoryChipLabel(
  filter: StatsCategoryFilter,
  labels: Record<string, string>,
): string | null {
  if (filter.kind === 'all' || filter.kind === 'none') {
    return null
  }
  if (filter.slugs.length === 1) {
    return statsCategoriesFilterLabel(filter, labels)
  }
  return `${filter.slugs.length} catégories`
}
