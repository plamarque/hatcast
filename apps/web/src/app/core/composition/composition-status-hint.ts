import type { CompositionLifecycle } from './composition-lifecycle'

/** Short Infos-tab hint aligned with FR28 lifecycle (UX-DR4). */
export function compositionStatusHint(
  lifecycle: CompositionLifecycle | string | undefined,
): string | null {
  switch (lifecycle) {
    case 'awaitingConfirmations':
      return 'En attente des confirmations des personnes composées.'
    case 'gapsToFill':
      return 'Des rôles sont à pourvoir après une déclinaison ou un retrait.'
    case 'draftComposition':
      return 'Composition en cours — non visible des autres membres.'
    case 'complete':
      return 'Tous les rôles requis sont confirmés.'
    default:
      return null
  }
}
