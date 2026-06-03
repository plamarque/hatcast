/** Breakpoint aligné sur `member-shell.scss` / rail membre (840px). */
export const MEMBER_SHELL_MOBILE_MEDIA_QUERY = '(max-width: 839px)';

/** Avatar compte en haut à droite (mobile) vs entrée « Compte » en bas du rail (desktop). */
export function isMemberMobileShellViewport(): boolean {
  if (typeof globalThis.matchMedia !== 'function') {
    return false;
  }
  return globalThis.matchMedia(MEMBER_SHELL_MOBILE_MEDIA_QUERY).matches;
}
