import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
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
    const authApi = { logout: vi.fn().mockResolvedValue(true) }

    await TestBed.configureTestingModule({
      imports: [SeasonHeader, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: TroupeContextService, useValue: troupeContext },
        { provide: MemberProfileService, useValue: memberProfile },
        { provide: AuthApiService, useValue: authApi },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(SeasonHeader)
    fixture.componentRef.setInput('seasonTitle', 'Saison A')
    fixture.componentRef.setInput('seasonSlug', 'season-a')
    fixture.componentRef.setInput('seasonId', 'season-id-1')
    fixture.componentRef.setInput('troupeId', 'troupe-id-1')
    fixture.componentRef.setInput('troupeName', 'Troupe Test')
    fixture.componentRef.setInput('troupeSlug', 'troupe-test')
    fixture.componentRef.setInput('user', {
      id: 'u1',
      email: 'a@example.com',
      displayName: 'Account Name',
      avatarUrl: '/v1/users/u1/avatar?v=1',
    })
    fixture.detectChanges()
    return { fixture, memberProfile }
  }

  it('does not render settings or back navigation', async () => {
    const { fixture } = await setup()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[aria-label="Réglages saison"]')).toBeNull()
    expect(el.querySelector('[aria-label="Retour aux saisons"]')).toBeNull()
    expect(el.querySelector('mat-icon')?.textContent?.trim()).not.toBe('chevron_left')
  })

  it('renders context breadcrumb with troupe hub link', async () => {
    const { fixture } = await setup()
    const troupeLink = fixture.nativeElement.querySelector(
      'app-context-breadcrumb a.context-breadcrumb__troupe',
    ) as HTMLAnchorElement
    expect(troupeLink).toBeTruthy()
    expect(troupeLink.getAttribute('href')).toBe('/troupes/troupe-test')
    expect(fixture.nativeElement.querySelector('nav[aria-label="Fil d\'Ariane"]')).toBeTruthy()
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

  it('hides breadcrumb when troupe context is missing', async () => {
    const { fixture } = await setup()
    fixture.componentRef.setInput('troupeSlug', null)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('app-context-breadcrumb')).toBeNull()
  })
})
