/** Season workspace views — ADR 0012: Agenda | Historique | Statistiques (story 3.3 / 3.6). */
export type SeasonView = 'agenda' | 'history' | 'stats'

export interface EventFilterOption {
  id: string
  title: string
  startsAt?: string
  archived?: boolean
  past?: boolean
}

export interface ParticipantFilterOption {
  id: string | null
  label: string
}
