import type { CompositionLifecycle } from './composition-lifecycle'

export interface CompositionStatusHintOptions {
  canManageComposition?: boolean
  compositionPublishedAt?: string | null
}

/** Short Infos-tab hint aligned with FR28 lifecycle (UX-DR4). */
export function compositionStatusHint(
  lifecycle: CompositionLifecycle | string | undefined,
  options: CompositionStatusHintOptions = {},
): string | null {
  switch (lifecycle) {
    case 'awaitingConfirmations':
      return 'En attente des confirmations des personnes composées.'
    case 'gapsToFill':
      return 'Des rôles sont à pourvoir après une déclinaison ou un retrait.'
    case 'draftComposition':
      if (options.compositionPublishedAt) {
        return 'Proposition d\'équipe publiée.'
      }
      if (options.canManageComposition) {
        return 'Composition en cours — non visible des autres membres.'
      }
      return 'Proposition d\'équipe publiée.'
    case 'complete':
      return 'Tous les rôles requis sont confirmés.'
    default:
      return null
  }
}
