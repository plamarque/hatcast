import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'

import { UserAvatarComponent } from './user-avatar'

describe('UserAvatarComponent', () => {
  async function setup(options?: { avatarUrl?: string | null; displayName?: string }) {
    await TestBed.configureTestingModule({
      imports: [UserAvatarComponent],
    }).compileComponents()

    const fixture = TestBed.createComponent(UserAvatarComponent)
    fixture.componentRef.setInput('displayName', options?.displayName ?? 'Patrice')
    fixture.componentRef.setInput('avatarUrl', options?.avatarUrl ?? null)
    fixture.componentRef.setInput('size', 32)
    fixture.detectChanges()
    return fixture
  }

  it('affiche l’initiale quand avatarUrl est absent', async () => {
    const fixture = await setup()
    expect(fixture.nativeElement.textContent).toContain('P')
    expect(fixture.nativeElement.querySelector('img')).toBeNull()
  })

  it('affiche une image quand avatarUrl est présent', async () => {
    const fixture = await setup({ avatarUrl: '/v1/users/u1/avatar?v=1' })
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('/v1/users/u1/avatar?v=1')
  })

  it('retombe sur l’initiale après erreur de chargement', async () => {
    const fixture = await setup({ avatarUrl: '/broken.png' })
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement
    img.dispatchEvent(new Event('error'))
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('P')
    expect(fixture.nativeElement.querySelector('img')).toBeNull()
  })

  it('réaffiche l’image quand avatarUrl change après une erreur', async () => {
    const fixture = await setup({ avatarUrl: '/broken.png' })
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement
    img.dispatchEvent(new Event('error'))
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('img')).toBeNull()

    fixture.componentRef.setInput('avatarUrl', '/v1/users/u1/avatar?v=2')
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy()
  })
})
