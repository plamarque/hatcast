import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import {
  MemberProfileApiService,
  type MemberProfileSummary,
} from '../../core/member-profile/member-profile-api.service'
import {
  MemberProfileDialog,
  type MemberProfileDialogData,
} from './member-profile-dialog'

const dialogData: MemberProfileDialogData = {
  seasonId: 'season-1',
  troupeId: 'troupe-1',
  userId: 'user-self',
  seasonSlug: 'season-slug',
}

const selfProfile: MemberProfileSummary = {
  userId: 'user-self',
  membershipId: 'mem-1',
  displayName: 'Patou',
  avatarUrl: null,
  isSelf: true,
  stats: null,
  monthlyChart: [],
  favoriteRoleCounts: [],
  preferredRoleKeys: ['player', 'volunteer', 'mc'],
}

const otherProfile: MemberProfileSummary = {
  ...selfProfile,
  userId: 'user-other',
  isSelf: false,
  preferredRoleKeys: undefined,
}

describe('MemberProfileDialog', () => {
  async function setup(profile: MemberProfileSummary) {
    const api = {
      getProfileSummary: vi.fn().mockResolvedValue({ ok: true, status: 200, data: profile }),
      updatePreferredRoles: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { preferredRoleKeys: ['player', 'volunteer'] },
      }),
    }

    await TestBed.configureTestingModule({
      imports: [MemberProfileDialog, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MemberProfileApiService, useValue: api },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(MemberProfileDialog)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return { fixture, api }
  }

  it('affiche le message stats vide quand stats absentes', async () => {
    const { fixture } = await setup(selfProfile)
    expect(fixture.nativeElement.textContent).toContain(
      'Statistiques disponibles lorsque les disponibilités seront saisies',
    )
  })

  it('n’affiche pas de croix de fermeture en header (footer Fermer uniquement)', async () => {
    const { fixture } = await setup(selfProfile)
    expect(fixture.nativeElement.querySelector('header button[mat-icon-button]')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Fermer')
  })

  it('affiche l’éditeur de rôles préférés pour soi', async () => {
    const { fixture } = await setup(selfProfile)
    expect(fixture.nativeElement.textContent).toContain('Mes rôles préférés')
    expect(fixture.nativeElement.textContent).toContain('Enregistrer')
  })

  it('masque l’éditeur de rôles préférés pour un autre membre', async () => {
    const { fixture } = await setup(otherProfile)
    expect(fixture.nativeElement.textContent).not.toContain('Mes rôles préférés')
    expect(fixture.nativeElement.textContent).not.toContain('Enregistrer')
  })

  it('enregistre les rôles préférés', async () => {
    const { fixture, api } = await setup(selfProfile)
    const saveBtn = [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLButtonElement) =>
      b.textContent?.includes('Enregistrer'),
    ) as HTMLButtonElement
    saveBtn.click()
    await fixture.whenStable()
    expect(api.updatePreferredRoles).toHaveBeenCalled()
  })
})
