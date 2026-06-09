import { TestBed } from '@angular/core/testing'
import { Type } from '@angular/core'
import { provideRouter, Router, type Route } from '@angular/router'
import { beforeEach, describe, expect, it } from 'vitest'

import { routes } from './app.routes'
import { MemberShell } from './layout/member-shell/member-shell'
import { AccountPlaceholder } from './pages/account-placeholder/account-placeholder'
import { LegacyAccountTabRedirect } from './pages/account-placeholder/legacy-account-tab-redirect'
import { AccountAboutTab } from './pages/account-placeholder/tabs/account-about-tab'
import { AccountNotificationsTab } from './pages/account-placeholder/tabs/account-notifications-tab'
import { AccountPreferencesTab } from './pages/account-placeholder/tabs/account-preferences-tab'
import { AccountProfileTab } from './pages/account-placeholder/tabs/account-profile-tab'
import { AdminAudit } from './pages/admin-audit/admin-audit'
import { AdminEventParticipants } from './pages/admin-event-participants/admin-event-participants'
import { AdminMembres } from './pages/admin-membres/admin-membres'
import { AdminParticipants } from './pages/admin-participants/admin-participants'
import { EventDetail } from './pages/event-detail/event-detail'
import { MemberSeasonGlance } from './pages/member-season-glance/member-season-glance'
import { SaisonLegacyRedirect } from './pages/saison-legacy-redirect/saison-legacy-redirect'
import { SeasonHome } from './pages/season-home/season-home'
import { TroupeHub } from './pages/troupe-hub/troupe-hub'
import { TroupeSettings } from './pages/troupe-settings/troupe-settings'
import { TroupesList } from './pages/troupes-list/troupes-list'
import { UserAgenda } from './pages/user-agenda/user-agenda'

function leafRoute(router: Router): Route | undefined {
  let route = router.routerState.root
  while (route.firstChild) {
    route = route.firstChild
  }
  return route.routeConfig ?? undefined
}

function memberShellChildren(): Route[] {
  const memberShell = routes.find((r) => r.component === MemberShell)
  return memberShell?.children ?? []
}

function findMemberRoute(path: string): Route | undefined {
  return memberShellChildren().find((r) => r.path === path)
}

function findCompteTab(path: string): Route | undefined {
  return findMemberRoute('compte')?.children?.find((r) => r.path === path)
}

async function expectLazyLeaf(
  router: Router,
  url: string,
  expected: { component: Type<unknown>; leafPath: string },
): Promise<void> {
  await router.navigateByUrl(url)
  expect(router.url).toBe(url)
  const leaf = leafRoute(router)
  expect(leaf?.path).toBe(expected.leafPath)
  expect(leaf?.loadComponent).toBeDefined()
  const loaded = await leaf!.loadComponent!()
  expect(loaded).toBe(expected.component)
}

describe('app.routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    })
  })

  it('redirects /seasons to /troupes', async () => {
    const router = TestBed.inject(Router)
    await router.navigateByUrl('/seasons')
    expect(router.url).toBe('/troupes')
    const leaf = leafRoute(router)
    expect(leaf?.path).toBe('troupes')
    expect(await leaf!.loadComponent!()).toBe(TroupesList)
  })

  it('redirects /seasons preserving query params', async () => {
    const router = TestBed.inject(Router)
    await router.navigateByUrl('/seasons?foo=bar&foo=baz')
    expect(router.url).toBe('/troupes?foo=bar&foo=baz')
    const leaf = leafRoute(router)
    expect(leaf?.path).toBe('troupes')
    expect(await leaf!.loadComponent!()).toBe(TroupesList)
  })

  it('resolves troupe settings route', async () => {
    const router = TestBed.inject(Router)
    await expectLazyLeaf(router, '/troupes/test-slug/admin/parametres?tab=categories', {
      component: TroupeSettings,
      leafPath: 'troupes/:slug/admin/parametres',
    })
    expect(router.url).toBe('/troupes/test-slug/admin/parametres?tab=categories')
  })

  it.each([
    { url: '/agenda', component: UserAgenda, leafPath: 'agenda' },
    { url: '/compte', component: AccountProfileTab, leafPath: '' },
    { url: '/compte/preferences', component: AccountPreferencesTab, leafPath: 'preferences' },
    { url: '/compte/notifications', component: AccountNotificationsTab, leafPath: 'notifications' },
    { url: '/compte/a-propos', component: AccountAboutTab, leafPath: 'a-propos' },
    { url: '/compte/securite', component: LegacyAccountTabRedirect, leafPath: 'securite' },
    { url: '/membre/alice', component: MemberSeasonGlance, leafPath: 'membre/:userSlug' },
    { url: '/troupes', component: TroupesList, leafPath: 'troupes' },
    { url: '/troupes/test-slug', component: TroupeHub, leafPath: 'troupes/:slug' },
    { url: '/troupes/test-slug/admin/membres', component: AdminMembres, leafPath: 'troupes/:slug/admin/membres' },
    { url: '/troupes/test-slug/admin/audit', component: AdminAudit, leafPath: 'troupes/:slug/admin/audit' },
    { url: '/troupe/admin/membres', component: AdminMembres, leafPath: 'troupe/admin/membres' },
    { url: '/saison/test-troupe/test-slug', component: SeasonHome, leafPath: 'saison/:troupeSlug/:seasonSlug' },
    {
      url: '/saison/test-troupe/test-slug/admin/membres',
      component: AdminMembres,
      leafPath: 'saison/:troupeSlug/:seasonSlug/admin/membres',
    },
    {
      url: '/saison/test-troupe/test-slug/admin/participants',
      component: AdminParticipants,
      leafPath: 'saison/:troupeSlug/:seasonSlug/admin/participants',
    },
    {
      url: '/saison/test-troupe/test-slug/admin/audit',
      component: AdminAudit,
      leafPath: 'saison/:troupeSlug/:seasonSlug/admin/audit',
    },
    {
      url: '/saison/test-troupe/test-slug/event/event-1',
      component: EventDetail,
      leafPath: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug',
    },
    {
      url: '/saison/test-troupe/test-slug/event/event-1/admin/participants',
      component: AdminEventParticipants,
      leafPath: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug/admin/participants',
    },
  ])('navigates lazy zone route $url', async ({ url, component, leafPath }) => {
    const router = TestBed.inject(Router)
    await expectLazyLeaf(router, url, { component, leafPath })
  })

  it.each([
    { url: '/saison/test-slug', leafPath: 'saison/:seasonSlug' },
    { url: '/saison/test-slug/admin/membres', leafPath: 'saison/:seasonSlug/admin/membres' },
    { url: '/saison/test-slug/admin/participants', leafPath: 'saison/:seasonSlug/admin/participants' },
    { url: '/saison/test-slug/admin/audit', leafPath: 'saison/:seasonSlug/admin/audit' },
    { url: '/saison/test-slug/event/event-1', leafPath: 'saison/:seasonSlug/event/:eventSlug' },
    {
      url: '/saison/test-slug/event/event-1/admin/participants',
      leafPath: 'saison/:seasonSlug/event/:eventSlug/admin/participants',
    },
  ])('navigates legacy lazy saison route $url', async ({ url, leafPath }) => {
    const router = TestBed.inject(Router)
    await expectLazyLeaf(router, url, { component: SaisonLegacyRedirect, leafPath })
  })

  it('uses loadComponent for agenda, saison, admin and compte zone routes', () => {
    const children = memberShellChildren()
    const lazyByPath = new Map(
      children.filter((r) => r.loadComponent).map((r) => [r.path, r]),
    )

    for (const path of [
      'agenda',
      'compte',
      'troupes',
      'troupes/:slug',
      'troupes/:slug/admin/membres',
      'troupes/:slug/admin/parametres',
      'troupes/:slug/admin/audit',
      'troupe/admin/membres',
      'membre/:userSlug',
      'saison/:troupeSlug/:seasonSlug',
      'saison/:troupeSlug/:seasonSlug/admin/membres',
      'saison/:troupeSlug/:seasonSlug/admin/participants',
      'saison/:troupeSlug/:seasonSlug/admin/audit',
      'saison/:troupeSlug/:seasonSlug/event/:eventSlug',
      'saison/:troupeSlug/:seasonSlug/event/:eventSlug/admin/participants',
      'saison/:seasonSlug',
      'saison/:seasonSlug/admin/membres',
      'saison/:seasonSlug/admin/participants',
      'saison/:seasonSlug/admin/audit',
      'saison/:seasonSlug/event/:eventSlug',
      'saison/:seasonSlug/event/:eventSlug/admin/participants',
    ]) {
      expect(lazyByPath.has(path), `missing lazy route ${path}`).toBe(true)
    }

    const compte = lazyByPath.get('compte')
    expect(compte?.children?.every((tab) => tab.loadComponent || tab.redirectTo !== undefined)).toBe(
      true,
    )
    for (const tab of compte?.children ?? []) {
      if (tab.path && tab.path !== '**') {
        expect(tab.loadComponent).toBeDefined()
      }
    }
  })

  it('preserves auditScope on lazy audit routes', () => {
    expect(findMemberRoute('troupes/:slug/admin/audit')?.data?.['auditScope']).toBe('troupe')
    expect(findMemberRoute('saison/:troupeSlug/:seasonSlug/admin/audit')?.data?.['auditScope']).toBe(
      'season',
    )
    expect(findMemberRoute('saison/:seasonSlug/admin/audit')?.data?.['auditScope']).toBe('season')
  })

  it.each([
    { path: 'agenda', component: UserAgenda },
    { path: 'membre/:userSlug', component: MemberSeasonGlance },
    { path: 'compte', component: AccountPlaceholder },
    { path: 'troupes', component: TroupesList },
    { path: 'troupes/:slug', component: TroupeHub },
    { path: 'troupes/:slug/admin/membres', component: AdminMembres },
    { path: 'troupes/:slug/admin/parametres', component: TroupeSettings },
    { path: 'troupes/:slug/admin/audit', component: AdminAudit },
    { path: 'troupe/admin/membres', component: AdminMembres },
    { path: 'saison/:troupeSlug/:seasonSlug', component: SeasonHome },
    { path: 'saison/:troupeSlug/:seasonSlug/admin/membres', component: AdminMembres },
    { path: 'saison/:troupeSlug/:seasonSlug/admin/participants', component: AdminParticipants },
    { path: 'saison/:troupeSlug/:seasonSlug/admin/audit', component: AdminAudit },
    { path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug', component: EventDetail },
    {
      path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug/admin/participants',
      component: AdminEventParticipants,
    },
    { path: 'saison/:seasonSlug', component: SaisonLegacyRedirect },
    { path: 'saison/:seasonSlug/admin/membres', component: SaisonLegacyRedirect },
    { path: 'saison/:seasonSlug/admin/participants', component: SaisonLegacyRedirect },
    { path: 'saison/:seasonSlug/admin/audit', component: SaisonLegacyRedirect },
    { path: 'saison/:seasonSlug/event/:eventSlug', component: SaisonLegacyRedirect },
    {
      path: 'saison/:seasonSlug/event/:eventSlug/admin/participants',
      component: SaisonLegacyRedirect,
    },
  ])('loadComponent for $path resolves expected export', async ({ path, component }) => {
    const route = findMemberRoute(path)
    expect(route?.loadComponent).toBeDefined()
    expect(await route!.loadComponent!()).toBe(component)
  })

  it.each([
    { path: '', component: AccountProfileTab },
    { path: 'preferences', component: AccountPreferencesTab },
    { path: 'notifications', component: AccountNotificationsTab },
    { path: 'securite', component: LegacyAccountTabRedirect },
    { path: 'identite', component: LegacyAccountTabRedirect },
    { path: 'a-propos', component: AccountAboutTab },
  ])('loadComponent for compte/$path resolves expected export', async ({ path, component }) => {
    const route = findCompteTab(path)
    expect(route?.loadComponent).toBeDefined()
    expect(await route!.loadComponent!()).toBe(component)
  })
})
