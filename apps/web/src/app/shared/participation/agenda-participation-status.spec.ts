import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'

import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import { AgendaParticipationStatus } from './agenda-participation-status'

describe('AgendaParticipationStatus', () => {
  async function setup(getPreferences = vi.fn()) {
    await TestBed.configureTestingModule({
      imports: [AgendaParticipationStatus],
      providers: [
        {
          provide: MePreferencesApiService,
          useValue: { getPreferences },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AgendaParticipationStatus)
    return { fixture, getPreferences }
  }

  it('does not fetch preferences when viewerGender is provided by the parent', async () => {
    const getPreferences = vi.fn()
    const { fixture } = await setup(getPreferences)

    fixture.componentRef.setInput('viewerGender', 'female')
    fixture.detectChanges()
    await fixture.whenStable()

    expect(getPreferences).not.toHaveBeenCalled()
  })

  it('fetches preferences when viewerGender is not provided', async () => {
    const getPreferences = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { memberDisplayName: 'Léa', preferredRoleKeys: [], gender: 'female' },
    })
    const { fixture } = await setup(getPreferences)

    fixture.detectChanges()
    await fixture.whenStable()

    expect(getPreferences).toHaveBeenCalledTimes(1)
  })
})
