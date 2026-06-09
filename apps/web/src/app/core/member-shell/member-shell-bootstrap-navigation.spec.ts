import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { routes } from '../../app.routes'
import { MemberShellBootstrapService } from './member-shell-bootstrap.service'

@Component({ standalone: true, template: '<p>agenda stub</p>' })
class AgendaStub {}

@Component({ standalone: true, template: '<p>event stub</p>' })
class EventStub {}

describe('member shell bootstrap navigation', () => {
  let authMeCount: number
  let troupesCount: number

  beforeEach(() => {
    authMeCount = 0
    troupesCount = 0

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('/v1/auth/me')) {
          authMeCount += 1
          return {
            ok: true,
            status: 200,
            json: async () => ({
              user: {
                id: 'user-1',
                slug: 'alice',
                email: 'alice@example.com',
                displayName: 'Alice',
              },
              platformAdmin: false,
            }),
          }
        }
        if (url.endsWith('/v1/troupes') || url.includes('/v1/troupes?')) {
          troupesCount += 1
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 'troupe-1',
                name: 'Improbots',
                slug: 'improbots',
                isDemo: false,
                joinPolicy: 'INVITE_ONLY',
                membership: {
                  id: 'm-1',
                  displayName: 'Alice',
                  status: 'ACTIVE',
                  baselineRole: 'MEMBER',
                  createdAt: '2026-01-01T00:00:00Z',
                  updatedAt: '2026-01-01T00:00:00Z',
                },
                activeMemberCount: 1,
                upcomingEventCount: 1,
              },
            ],
          }
        }
        if (url.includes('/v1/me/inbox')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              actions: [],
              nextEvent: null,
              shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
              noParticipation: false,
            }),
          }
        }
        return { ok: false, status: 404, json: async () => ({}) }
      }),
    )

    const memberRoutes = routes.map((route) => {
      if (!route.children) {
        return route
      }
      return {
        ...route,
        children: route.children.map((child) => {
          if (child.path === 'agenda') {
            return { ...child, loadComponent: undefined, component: AgendaStub }
          }
          if (child.path === 'saison/:troupeSlug/:seasonSlug/event/:eventSlug') {
            return { ...child, loadComponent: undefined, component: EventStub }
          }
          return child
        }),
      }
    })

    TestBed.configureTestingModule({
      providers: [provideRouter(memberRoutes), MemberShellBootstrapService],
    })
  })

  it('fetches auth/me and troupes once when navigating agenda → event in-app', async () => {
    const router = TestBed.inject(Router)

    await router.navigateByUrl('/agenda')
    expect(authMeCount).toBe(1)
    expect(troupesCount).toBe(1)

    await router.navigateByUrl('/saison/improbots/saison-2026/event/cabaret')
    expect(authMeCount).toBe(1)
    expect(troupesCount).toBe(1)
  })
})
