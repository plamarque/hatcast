/** Season workspace views — Participants/Spectacles hidden until later epics (story 3.3). */
export type SeasonView = 'agenda' | 'history'

export interface EventFilterOption {
  id: string
  title: string
}

export interface ParticipantFilterOption {
  id: string | null
  label: string
}
