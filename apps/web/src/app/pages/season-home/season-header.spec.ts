import { OverlayContainer } from '@angular/cdk/overlay'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { SeasonHeader } from './season-header'

describe('SeasonHeader', () => {
  async function setup(options?: { troupeDisplayName?: string | null }) {
    const troupeContext = {
      currentUserDisplayLabel: (user: { displayName: string | null; email: string | null } | null) => {
        if (options?.troupeDisplayName) return options.troupeDisplayName
        return user?.displayName || user?.email || 'Compte'
      },
    }
    const memberProfile = { openProfileDialog: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [SeasonHeader, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TroupeContextService, useValue: troupeContext },
        { provide: MemberProfileService, useValue: memberProfile },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonHeader)
    fixture.componentRef.setInput('seasonTitle', 'Saison A')
    fixture.componentRef.setInput('seasonSlug', 'season-a')
    fixture.componentRef.setInput('seasonId', 'season-id-1')
    fixture.componentRef.setInput('troupeId', 'troupe-id-1')
    fixture.componentRef.setInput('user', {
      id: 'u1',
      email: 'a@example.com',
      displayName: 'Account Name',
      avatarUrl: '/v1/users/u1/avatar?v=1',
    })
    fixture.detectChanges()
    return { fixture, memberProfile }
  }

  it('shows Participants in settings when permitted', async () => {
    const { fixture } = await setup()
    fixture.componentRef.setInput('canManageSettings', true)
    fixture.componentRef.setInput('canManageSeasonParticipants', true)
    fixture.detectChanges()

    const settingsBtn = fixture.nativeElement.querySelector(
      '[aria-label="Réglages saison"]',
    ) as HTMLButtonElement
    settingsBtn.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const overlayEl = TestBed.inject(OverlayContainer).getContainerElement()
    expect(overlayEl.textContent).toContain('Participants')
    expect(overlayEl.textContent).not.toContain('Membres')
    expect(overlayEl.querySelector('a[href*="admin/participants"]')).toBeTruthy()
  })

  it('shows Organisateur·ices link for season organizers without troupe admin', async () => {
    const { fixture } = await setup()
    fixture.componentRef.setInput('canManageSettings', true)
    fixture.componentRef.setInput('canManageSeasonOrganizersOnly', true)
    fixture.detectChanges()

    const settingsBtn = fixture.nativeElement.querySelector(
      '[aria-label="Réglages saison"]',
    ) as HTMLButtonElement
    settingsBtn.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const overlayEl = TestBed.inject(OverlayContainer).getContainerElement()
    expect(overlayEl.textContent).toContain('Organisateur')
    expect(overlayEl.querySelector('a[href*="admin/membres"]')).toBeTruthy()
  })

  it('affiche le pseudo troupe plutôt que le nom de compte quand le contexte le fournit', async () => {
    const { fixture } = await setup({ troupeDisplayName: 'Patou' })

    expect(fixture.nativeElement.textContent).toContain('Patou')
    expect(fixture.nativeElement.textContent).not.toContain('Account Name')
  })

  it('affiche une image avatar dans le menu compte quand avatarUrl est présent', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.querySelector('app-user-avatar img')).toBeTruthy()
  })

  it('ouvre le profil membre au clic sur l’avatar', async () => {
    const { fixture, memberProfile } = await setup()
    const avatar = fixture.nativeElement.querySelector(
      'app-user-avatar img, app-user-avatar .user-avatar__initial',
    ) as HTMLElement
    avatar.click()
    expect(memberProfile.openProfileDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        seasonId: 'season-id-1',
        troupeId: 'troupe-id-1',
        userId: 'u1',
        seasonSlug: 'season-a',
      }),
    )
  })
})
