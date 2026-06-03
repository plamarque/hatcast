import { TestBed } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { Router } from '@angular/router'
import { verifyBeforeUpdateEmail } from 'firebase/auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  userMessageForEmailUpdateRequest,
  userMessageForRequiresRecentLogin,
} from '../../../core/auth/auth-user-message'
import { AuthApiService } from '../../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'
import {
  AccountChangeEmailDialog,
  type AccountChangeEmailDialogData,
} from './account-change-email-dialog'

vi.mock('firebase/auth', () => ({
  verifyBeforeUpdateEmail: vi.fn(),
}))

describe('AccountChangeEmailDialog', () => {
  const mockUser = { uid: 'u1' }
  const mockAuth = { currentUser: mockUser } as NonNullable<
    ReturnType<FirebaseAuthService['getAuthOrNull']>
  >
  const verify = vi.mocked(verifyBeforeUpdateEmail)
  let snackOpen: ReturnType<typeof vi.fn>
  let navigate: ReturnType<typeof vi.fn>
  let logout: ReturnType<typeof vi.fn>

  type DialogView = AccountChangeEmailDialog & {
    submit(): ReturnType<AccountChangeEmailDialog['submit']>
    goToLogin(): ReturnType<AccountChangeEmailDialog['goToLogin']>
    form: AccountChangeEmailDialog['form']
    sent(): ReturnType<AccountChangeEmailDialog['sent']>
    requiresRecentLogin(): ReturnType<AccountChangeEmailDialog['requiresRecentLogin']>
  }

  function v(c: AccountChangeEmailDialog): DialogView {
    return c as DialogView
  }

  beforeEach(() => {
    snackOpen = vi.fn()
    navigate = vi.fn().mockResolvedValue(true)
    logout = vi.fn().mockResolvedValue(true)
    verify.mockReset()
    vi.stubGlobal('location', { ...globalThis.location, origin: 'https://localhost:4200' })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  async function setup(getAuth: () => typeof mockAuth | null = () => mockAuth) {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [AccountChangeEmailDialog],
      providers: [
        provideNoopAnimations(),
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: getAuth } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
        { provide: AuthApiService, useValue: { logout } },
        { provide: Router, useValue: { navigate } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { currentEmail: 'old@example.com' } satisfies AccountChangeEmailDialogData,
        },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AccountChangeEmailDialog)
    fixture.detectChanges()
    return { fixture, cmp: v(fixture.componentInstance) }
  }

  it('bloque un email identique à l’actuel', async () => {
    const { cmp } = await setup()
    cmp.form.patchValue({ newEmail: 'old@example.com' })
    expect(cmp.form.invalid).toBe(true)
  })

  it('happy path → verifyBeforeUpdateEmail et message de succès', async () => {
    verify.mockResolvedValue(undefined)
    const { cmp } = await setup()
    cmp.form.patchValue({ newEmail: 'new@example.com' })
    await cmp.submit()

    expect(verify).toHaveBeenCalledWith(
      mockUser,
      'new@example.com',
      expect.objectContaining({ url: 'https://localhost:4200/compte/verification-email' }),
    )
    expect(cmp.sent()).toBe(true)
    expect(snackOpen).not.toHaveBeenCalled()
  })

  it('requires-recent-login → état reconnexion', async () => {
    verify.mockRejectedValue({ code: 'auth/requires-recent-login' })
    const { cmp } = await setup()
    cmp.form.patchValue({ newEmail: 'new@example.com' })
    await cmp.submit()

    expect(cmp.requiresRecentLogin()).toBe(true)
    expect(userMessageForRequiresRecentLogin()).toContain('reconnecter')
  })

  it('erreur email-already-in-use → snackbar', async () => {
    verify.mockRejectedValue({ code: 'auth/email-already-in-use' })
    const { cmp } = await setup()
    cmp.form.patchValue({ newEmail: 'taken@example.com' })
    await cmp.submit()

    expect(snackOpen).toHaveBeenCalledWith(
      userMessageForEmailUpdateRequest('auth/email-already-in-use'),
      'OK',
      expect.objectContaining({ duration: 8000 }),
    )
  })
})
