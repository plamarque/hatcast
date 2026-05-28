import {
  pathFromUrl,
  shouldShowMemberNav,
} from '../../layout/member-shell/member-shell-nav-visibility'

/** Member shell routes where account menu chrome is shown (not on `/compte`). */
export function shouldShowAccountChrome(url: string): boolean {
  const path = pathFromUrl(url)
  return shouldShowMemberNav(url) && path !== '/compte'
}

/** Paths that hide logout in the account menu (admin / event detail). */
export function shouldShowAccountMenuLogout(url: string): boolean {
  const path = pathFromUrl(url)

  if (/^\/saison\/[^/]+\/event\/[^/]+$/.test(path)) {
    return false
  }
  if (/^\/saison\/[^/]+\/admin\/(membres|participants)$/.test(path)) {
    return false
  }
  if (/^\/saison\/[^/]+\/event\/[^/]+\/admin\/participants$/.test(path)) {
    return false
  }
  if (/^\/troupes\/[^/]+\/admin\/membres$/.test(path)) {
    return false
  }
  if (path === '/troupe/admin/membres') {
    return false
  }

  return true
}
