import { ComponentFixture, TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'

import { UserAvatarComponent } from './user-avatar'

describe('UserAvatarComponent', () => {
  async function setup(options?: {
    avatarUrl?: string | null
    displayName?: string
    gender?: 'male' | 'female' | 'non_specified' | null
  }) {
    await TestBed.configureTestingModule({
      imports: [UserAvatarComponent],
    }).compileComponents()

    const fixture = TestBed.createComponent(UserAvatarComponent)
    fixture.componentRef.setInput('displayName', options?.displayName ?? 'Patrice')
    fixture.componentRef.setInput('avatarUrl', options?.avatarUrl ?? null)
    fixture.componentRef.setInput('size', 32)
    if (options?.gender !== undefined) {
      fixture.componentRef.setInput('gender', options.gender)
    }
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

  it('uses eager loading for small avatars', async () => {
    const fixture = await setup({ avatarUrl: '/v1/users/u1/avatar?v=1' })
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('loading')).toBe('eager')
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

  it('applique une teinte violette pour male sans photo', async () => {
    const fixture = await setup({ gender: 'male' })
    expect(fixture.nativeElement.classList.contains('user-avatar--tone-male')).toBe(true)
  })

  it('applique une teinte orange pour female sans photo', async () => {
    const fixture = await setup({ gender: 'female' })
    expect(fixture.nativeElement.classList.contains('user-avatar--tone-female')).toBe(true)
  })

  it('applique une teinte neutre pour non_specified sans photo', async () => {
    const fixture = await setup({ gender: 'non_specified' })
    expect(fixture.nativeElement.classList.contains('user-avatar--tone-neutral')).toBe(true)
  })

  it('applique une teinte neutre quand gender est null', async () => {
    const fixture = await setup({ gender: null })
    expect(fixture.nativeElement.classList.contains('user-avatar--tone-neutral')).toBe(true)
  })

  it('applique une teinte neutre pour une valeur wire inconnue', async () => {
    const fixture = await setup({ gender: 'unknown' as 'male' })
    expect(fixture.nativeElement.classList.contains('user-avatar--tone-neutral')).toBe(true)
  })
})
