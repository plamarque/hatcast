import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { type TroupeListItem, TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  TroupeHubPreferencesSheet,
  type TroupeHubPreferencesSheetData,
} from './troupe-hub-preferences-sheet'

const troupe: TroupeListItem = {
  id: 't1',
  name: 'La Malice',
  slug: 'la-malice',
  membership: {
    id: 'm1',
    displayName: 'Patou',
    status: 'ACTIVE',
    baselineRole: 'MEMBER',
    createdAt: '',
    updatedAt: '',
  },
  activeMemberCount: 4,
  upcomingEventCount: 0,
}

describe('TroupeHubPreferencesSheet', () => {
  async function setup() {
    const snack = { open: vi.fn() }
    const troupeApi = {
      updateMyMembership: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          id: 'm1',
          displayName: 'Nouveau pseudo',
          status: 'ACTIVE',
          baselineRole: 'MEMBER',
          createdAt: '',
          updatedAt: '',
        },
      }),
    }
    const memberProfileApi = {
      getPreferredRoles: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { preferredRoleKeys: ['player', 'volunteer'] },
      }),
      updatePreferredRoles: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { preferredRoleKeys: ['mc', 'volunteer'] },
      }),
    }
    const patchMembershipDisplayName = vi.fn()

    await TestBed.configureTestingModule({
      imports: [TroupeHubPreferencesSheet, NoopAnimationsModule],
      providers: [
        { provide: MatSnackBar, useValue: snack },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: MemberProfileApiService, useValue: memberProfileApi },
        {
          provide: TroupeContextService,
          useValue: { patchMembershipDisplayName },
        },
        {
          provide: MatBottomSheetRef,
          useValue: { dismiss: vi.fn() },
        },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: { troupe } satisfies TroupeHubPreferencesSheetData,
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeHubPreferencesSheet)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.componentInstance['preferredRolesLoading']()).toBe(false)
    })
    return { fixture, troupeApi, memberProfileApi, patchMembershipDisplayName, snack }
  }

  it('disables pseudo save when empty', async () => {
    const { fixture } = await setup()
    const component = fixture.componentInstance as unknown as {
      pseudo: { set: (v: string) => void }
      canSavePseudo: () => boolean
    }
    component.pseudo.set('   ')
    fixture.detectChanges()

    const saveBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Enregistrer le pseudo'))!
    expect(saveBtn.disabled).toBe(true)
    expect(component.canSavePseudo()).toBe(false)
  })

  it('saves pseudo via API and patches troupe context', async () => {
    const { fixture, troupeApi, patchMembershipDisplayName } = await setup()
    const component = fixture.componentInstance as unknown as {
      pseudo: { set: (v: string) => void }
      savePseudo: () => Promise<void>
    }
    component.pseudo.set('Nouveau pseudo')
    await component.savePseudo()

    expect(troupeApi.updateMyMembership).toHaveBeenCalledWith('t1', {
      displayName: 'Nouveau pseudo',
    })
    expect(patchMembershipDisplayName).toHaveBeenCalledWith('t1', 'Nouveau pseudo')
  })

  it('defaults preferred roles to empty when load fails', async () => {
    const snack = { open: vi.fn() }
    await TestBed.configureTestingModule({
      imports: [TroupeHubPreferencesSheet, NoopAnimationsModule],
      providers: [
        { provide: MatSnackBar, useValue: snack },
        {
          provide: TroupeApiService,
          useValue: { updateMyMembership: vi.fn() },
        },
        {
          provide: MemberProfileApiService,
          useValue: {
            getPreferredRoles: vi.fn().mockResolvedValue({ ok: false, status: 500 }),
            updatePreferredRoles: vi.fn(),
          },
        },
        {
          provide: TroupeContextService,
          useValue: { patchMembershipDisplayName: vi.fn() },
        },
        {
          provide: MatBottomSheetRef,
          useValue: { dismiss: vi.fn() },
        },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: { troupe },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeHubPreferencesSheet)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.componentInstance['preferredRolesLoading']()).toBe(false)
    })
    expect(fixture.componentInstance['preferredRoles']()).toEqual([])
  })
})
