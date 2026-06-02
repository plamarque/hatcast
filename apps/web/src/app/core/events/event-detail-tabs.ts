import type { ParamMap } from '@angular/router'

export type EventDetailTab = 'infos' | 'dispos' | 'equipe' | 'activite'

const TAB_ALIASES: Record<string, EventDetailTab> = {
  infos: 'infos',
  info: 'infos',
  dispos: 'dispos',
  team: 'dispos',
  equipe: 'equipe',
  compo: 'equipe',
  activite: 'activite',
  activity: 'activite',
}

/** Whether a `tab` query value is a known V2 slug or legacy alias. */
export function isEventDetailTabParamKnown(tabParam: string): boolean {
  return tabParam.toLowerCase() in TAB_ALIASES
}

/** Resolves the active tab from route query params (V2 slugs + legacy SPEC aliases). */
export function resolveEventDetailTab(params: ParamMap): EventDetailTab {
  const tabParam = params.get('tab')
  if (tabParam) {
    const mapped = TAB_ALIASES[tabParam.toLowerCase()]
    if (mapped) {
      return mapped
    }
  }
  if (params.get('showAvailability') === 'true') {
    return 'dispos'
  }
  if (params.get('showConfirm') === 'true') {
    return 'equipe'
  }
  return 'infos'
}

export function eventDetailTabToQuery(tab: EventDetailTab): string {
  return tab
}
