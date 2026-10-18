import { InjectionToken } from '@angular/core'

export type ReleaseContext = { release_id: string; app_version: string }
declare const HATCAST_RELEASE: ReleaseContext | null

/** Replaced at Angular build time; ng serve/tests deliberately have no release claim. */
export const RELEASE_CONTEXT = new InjectionToken<ReleaseContext | null>('RELEASE_CONTEXT', {
  providedIn: 'root',
  factory: () => typeof HATCAST_RELEASE === 'undefined' ? null : HATCAST_RELEASE,
})

export type NotesSource = 'account' | 'after_update'
export type NotesDwell = 'under_5s' | '5_to_15s' | '15_to_60s' | 'over_60s'
export type NotesScroll = 'not_scrollable' | 'under_25' | '25_to_50' | '50_to_75' | '75_to_100'

export function dwellBucket(ms: number): NotesDwell {
  return ms < 5_000 ? 'under_5s' : ms < 15_000 ? '5_to_15s' : ms < 60_000 ? '15_to_60s' : 'over_60s'
}

export function scrollBucket(fraction: number | null): NotesScroll {
  return fraction === null ? 'not_scrollable' : fraction < .25 ? 'under_25' : fraction < .5 ? '25_to_50' : fraction < .75 ? '50_to_75' : '75_to_100'
}
