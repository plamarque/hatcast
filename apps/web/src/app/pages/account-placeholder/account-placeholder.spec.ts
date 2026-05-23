import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { AccountPlaceholder } from './account-placeholder'

describe('AccountPlaceholder', () => {
  async function setup(options: {
    troupes?: TroupeListItem[]
    updateResult?: { ok: boolean; status: number; data?: { displayName: string } }
  } = {}) {
    const snack = { open: vi.fn() }
    const troupes = options.troupes ?? []
    const troupeApi = {
      listMyTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: troupes }),
      updateMyMembership: vi.fn().mockResolvedValue(
        options.updateResult ?? {
          ok: true,
          status: 200,
          data: {
            id: 'm-1',
            displayName: 'Patou',
            status: 'ACTIVE',
            baselineRole: 'MEMBER',
            createdAt: '',
            updatedAt: '',
          },
        },
      ),
    }

    await TestBed.configureTestingModule({
      imports: [AccountPlaceholder, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        TroupeContextService,
        { provide: MatSnackBar, useValue: snack },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { user: { id: 'u1', email: 'a@example.com', displayName: 'Account Name' } },
            }),
          },
        },
        { provide: TroupeApiService, useValue: troupeApi },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AccountPlaceholder)
    fixture.detectChanges()

    let attempts = 0
    while (fixture.componentInstance['loading']() && attempts < 50) {
      await fixture.whenStable()
      await new Promise((resolve) => setTimeout(resolve, 0))
      fixture.detectChanges()
      attempts++
    }

    expect(fixture.componentInstance['loading']()).toBe(false)

    return { fixture, troupeApi, snack }
  }

  function troupe(id: string, name: string, displayName: string): TroupeListItem {
    return {
      id,
      name,
      slug: id,
      membership: {
        id: `membership-${id}`,
        displayName,
        status: 'ACTIVE',
        baselineRole: 'MEMBER',
        createdAt: '',
        updatedAt: '',
      },
    }
  }

  it('liste une ligne de pseudo par troupe active', async () => {
    const { fixture } = await setup({
      troupes: [
        troupe('t1', 'La Malice', 'Patrice'),
        troupe('t2', 'Les Impros', 'Patou'),
      ],
    })

    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Pseudo par troupe')
    expect(text).toContain('La Malice')
    expect(text).toContain('Les Impros')
  })

  it('enregistre un pseudo valide et rafraîchit le contexte', async () => {
    const { fixture, troupeApi, snack } = await setup({
      troupes: [troupe('t1', 'La Malice', 'Avant')],
    })

    const component = fixture.componentInstance
    component['onPseudoInput']('t1', 'Patou')
    await component['savePseudo'](component['troupes']()[0])
    fixture.detectChanges()

    expect(troupeApi.updateMyMembership).toHaveBeenCalledWith('t1', { displayName: 'Patou' })
    expect(TestBed.inject(TroupeContextService).activeTroupes()[0].membership.displayName).toBe('Patou')
  })

  it('affiche une validation quand le pseudo est vide', async () => {
    const { fixture, troupeApi } = await setup({
      troupes: [troupe('t1', 'La Malice', 'Avant')],
    })

    const component = fixture.componentInstance
    component['onPseudoInput']('t1', '   ')
    await component['savePseudo'](component['troupes']()[0])
    fixture.detectChanges()

    expect(troupeApi.updateMyMembership).not.toHaveBeenCalled()
    expect(component['validationErrorByTroupeId']()['t1']).toBe(true)
  })

  it('affiche le pseudo défini par un admin et permet de le modifier (AC6)', async () => {
    const adminSetName = 'Nom Admin'
    const { fixture, troupeApi } = await setup({
      troupes: [troupe('t1', 'La Malice', adminSetName)],
      updateResult: {
        ok: true,
        status: 200,
        data: { displayName: 'Mon Pseudo' },
      },
    })

    const component = fixture.componentInstance
    expect(component['pseudoByTroupeId']()['t1']).toBe(adminSetName)

    component['onPseudoInput']('t1', 'Mon Pseudo')
    await component['savePseudo'](component['troupes']()[0])
    fixture.detectChanges()

    expect(troupeApi.updateMyMembership).toHaveBeenCalledWith('t1', { displayName: 'Mon Pseudo' })
    expect(component['pseudoByTroupeId']()['t1']).toBe('Mon Pseudo')
  })
})
