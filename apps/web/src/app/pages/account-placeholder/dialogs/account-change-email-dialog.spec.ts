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

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>()
  return {
    ...actual,
    verifyBeforeUpdateEmail: vi.fn(),
  }
})

describe('AccountChangeEmailDialog', () => {
  const mockUser = { uid: 'u1', getIdToken: vi.fn().mockResolvedValue('id-token') }
  const mockAuth = { currentUser: mockUser } as unknown as NonNullable<
    ReturnType<FirebaseAuthService['getAuthOrNull']>
  >
  const verify = vi.mocked(verifyBeforeUpdateEmail)
  let snackOpen: ReturnType<typeof vi.fn>
  let navigate: ReturnType<typeof vi.fn>
  let logout: ReturnType<typeof vi.fn>
  let signInIdp: ReturnType<typeof vi.fn>

  type DialogView = AccountChangeEmailDialog & {
    submit(): ReturnType<AccountChangeEmailDialog['submit']>
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
    signInIdp = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    verify.mockReset()
    vi.stubGlobal('location', { ...globalThis.location, origin: 'https://localhost:4200' })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  async function setup(
    getAuth: () => typeof mockAuth | null = () => mockAuth,
    data: AccountChangeEmailDialogData = { currentEmail: 'old@example.com' },
  ) {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [AccountChangeEmailDialog],
      providers: [
        provideNoopAnimations(),
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: getAuth } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
        {
          provide: AuthApiService,
          useValue: { logout, signInWithIdentityPlatformIdToken: signInIdp },
        },
        { provide: Router, useValue: { navigate } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AccountChangeEmailDialog)
    fixture.detectChanges()
    return { fixture, cmp: v(fixture.componentInstance) }
  }

  it('happy path → verifyBeforeUpdateEmail et message de succès', async () => {
    verify.mockResolvedValue(undefined)
    const { cmp } = await setup()
    cmp.form.patchValue({ newEmail: 'new@example.com' })
    await cmp.submit()

    expect(signInIdp).toHaveBeenCalledWith('id-token')
    expect(verify).toHaveBeenCalled()
    expect(cmp.sent()).toBe(true)
  })

  it('session Firebase absente → état reconnexion', async () => {
    const authWithoutUser = { currentUser: null } as unknown as typeof mockAuth
    const { cmp } = await setup(() => authWithoutUser, {
      currentEmail: 'old@example.com',
      hasGoogleAccount: false,
    })
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
