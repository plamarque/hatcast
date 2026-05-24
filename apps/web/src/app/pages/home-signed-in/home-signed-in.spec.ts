import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { PostLoginNavigationService } from '../../core/navigation/post-login-navigation.service'
import { HomeSignedIn } from './home-signed-in'

describe('HomeSignedIn', () => {
  it('redirige vers /connexion quand la session est absente', async () => {
    const navigate = vi.fn().mockResolvedValue(true)
    const postLoginNav = { navigateAfterSignIn: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [HomeSignedIn],
      providers: [
        { provide: Router, useValue: { navigate } },
        {
          provide: AuthApiService,
          useValue: { ensureHatcastSession: vi.fn().mockResolvedValue({ ok: false }) },
        },
        { provide: PostLoginNavigationService, useValue: postLoginNav },
      ],
    }).compileComponents()

    const fixture: ComponentFixture<HomeSignedIn> = TestBed.createComponent(HomeSignedIn)
    fixture.detectChanges()
    await fixture.whenStable()

    expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
    expect(postLoginNav.navigateAfterSignIn).not.toHaveBeenCalled()
  })

  it('délègue à PostLoginNavigationService quand la session est valide', async () => {
    const navigate = vi.fn().mockResolvedValue(true)
    const postLoginNav = { navigateAfterSignIn: vi.fn().mockResolvedValue(true) }

    await TestBed.configureTestingModule({
      imports: [HomeSignedIn],
      providers: [
        { provide: Router, useValue: { navigate } },
        {
          provide: AuthApiService,
          useValue: { ensureHatcastSession: vi.fn().mockResolvedValue({ ok: true, data: {} }) },
        },
        { provide: PostLoginNavigationService, useValue: postLoginNav },
      ],
    }).compileComponents()

    const fixture: ComponentFixture<HomeSignedIn> = TestBed.createComponent(HomeSignedIn)
    fixture.detectChanges()
    await fixture.whenStable()

    expect(postLoginNav.navigateAfterSignIn).toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalledWith(['/accueil'], expect.anything())
  })
})
