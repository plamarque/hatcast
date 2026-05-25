import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeHubStub } from './troupe-hub-stub'

describe('TroupeHubStub', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'la-malice' }))

  async function setup(baselineRole: 'MEMBER' | 'TROUPE_ADMIN' = 'TROUPE_ADMIN') {
    await TestBed.configureTestingModule({
      imports: [TroupeHubStub],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe: vi.fn(),
            activeTroupes: () => [
              {
                id: 't1',
                name: 'La Malice',
                slug: 'la-malice',
                membership: {
                  id: 'm1',
                  displayName: 'Admin',
                  status: 'ACTIVE',
                  baselineRole,
                  createdAt: '',
                  updatedAt: '',
                },
              },
            ],
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeHubStub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub-stub__title')).not.toBeNull()
    })
    return fixture
  }

  it('shows Membres link for TROUPE_ADMIN', async () => {
    const fixture = await setup('TROUPE_ADMIN')
    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger',
    ) as HTMLButtonElement
    expect(trigger.getAttribute('aria-label')).toBe('Administration de la troupe')
  })

  it('hides admin menu for non-admin members', async () => {
    const fixture = await setup('MEMBER')
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).toBeNull()
  })
})
