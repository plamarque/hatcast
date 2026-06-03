import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { Router } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'
import { AccountDeleteDialog } from './account-delete-dialog'

vi.mock('firebase/auth', () => ({
  EmailAuthProvider: {
    credential: vi.fn(() => ({})),
  },
  reauthenticateWithCredential: vi.fn().mockResolvedValue(undefined),
}))

describe('AccountDeleteDialog', () => {
  async function setup(options: {
    hasPassword?: boolean
    hasGoogleAccount?: boolean
  } = {}) {
    const deleteAccount = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    const logout = vi.fn().mockResolvedValue(true)
    const navigate = vi.fn().mockResolvedValue(true)
    const snack = { open: vi.fn() }
    const close = vi.fn()

    const providerData = options.hasPassword !== false ? [{ providerId: 'password' }] : [{ providerId: 'google.com' }]

    await TestBed.configureTestingModule({
      imports: [AccountDeleteDialog, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            accountEmail: 'lea@example.com',
            hasGoogleAccount: options.hasGoogleAccount ?? false,
          },
        },
        { provide: MatDialogRef, useValue: { close } },
        { provide: MatSnackBar, useValue: snack },
        { provide: Router, useValue: { navigate } },
        {
          provide: AuthApiService,
          useValue: { deleteAccount, logout },
        },
        {
          provide: FirebaseAuthService,
          useValue: {
            getAuthOrNull: () => ({
              currentUser: {
                email: 'lea@example.com',
                providerData,
                getIdToken: vi.fn().mockResolvedValue('fresh-token'),
              },
            }),
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AccountDeleteDialog)
    fixture.detectChanges()
    return { fixture, deleteAccount, logout, navigate, snack, close }
  }

  it('affiche les conséquences à l’étape 1', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Supprimer mon compte HatCast')
    expect(text).toContain('irréversible')
    expect(text).toContain('statistiques de saison')
    expect(text).toContain('dernier administrateur')
  })

  it('bloque la confirmation tant que SUPPRIMER n’est pas saisi', async () => {
    const { fixture } = await setup()
    const continueBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Continuer')) as HTMLButtonElement
    continueBtn.click()
    fixture.detectChanges()

    const confirmButton = fixture.nativeElement.querySelector(
      '.account-delete-dialog__confirm',
    ) as HTMLButtonElement
    expect(confirmButton).toBeTruthy()
    expect(confirmButton.disabled).toBe(true)

    const phraseInput = fixture.nativeElement.querySelector(
      'input[formcontrolname="confirmPhrase"]',
    ) as HTMLInputElement
    const passwordInput = fixture.nativeElement.querySelector(
      'input[formcontrolname="password"]',
    ) as HTMLInputElement
    phraseInput.value = 'SUPPRIMER'
    phraseInput.dispatchEvent(new Event('input'))
    passwordInput.value = 'secret123'
    passwordInput.dispatchEvent(new Event('input'))
    fixture.detectChanges()

    expect(confirmButton.disabled).toBe(false)
  })

  it('appelle deleteAccount puis logout et redirige vers connexion', async () => {
    const { fixture, deleteAccount, logout, navigate, close } = await setup()
    const continueBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Continuer')) as HTMLButtonElement
    continueBtn.click()
    fixture.detectChanges()

    const phraseInput = fixture.nativeElement.querySelector(
      'input[formcontrolname="confirmPhrase"]',
    ) as HTMLInputElement
    const passwordInput = fixture.nativeElement.querySelector(
      'input[formcontrolname="password"]',
    ) as HTMLInputElement
    phraseInput.value = 'SUPPRIMER'
    phraseInput.dispatchEvent(new Event('input'))
    passwordInput.value = 'secret123'
    passwordInput.dispatchEvent(new Event('input'))
    fixture.detectChanges()

    const confirmButton = fixture.nativeElement.querySelector(
      '.account-delete-dialog__confirm',
    ) as HTMLButtonElement
    confirmButton.click()
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(deleteAccount).toHaveBeenCalled()
    expect(logout).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(['/connexion'])
    expect(close).toHaveBeenCalledWith(true)
  })
})
