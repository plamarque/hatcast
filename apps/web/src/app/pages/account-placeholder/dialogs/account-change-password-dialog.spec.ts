import { TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { sendPasswordResetEmail } from 'firebase/auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { userMessageForPasswordResetRequestFailure } from '../../../core/auth/auth-user-message'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'
import {
  AccountChangePasswordDialog,
  type AccountChangePasswordDialogData,
} from './account-change-password-dialog'

vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}))

describe('AccountChangePasswordDialog', () => {
  const mockUser = { email: 'user@test.com' }
  const mockAuth = { currentUser: mockUser } as NonNullable<
    ReturnType<FirebaseAuthService['getAuthOrNull']>
  >
  const send = vi.mocked(sendPasswordResetEmail)
  let snackOpen: ReturnType<typeof vi.fn>

  type DialogView = AccountChangePasswordDialog & {
    confirm(): ReturnType<AccountChangePasswordDialog['confirm']>
    sent(): ReturnType<AccountChangePasswordDialog['sent']>
    title: AccountChangePasswordDialog['title']
    introCopy: AccountChangePasswordDialog['introCopy']
  }

  function v(c: AccountChangePasswordDialog): DialogView {
    return c as DialogView
  }

  beforeEach(() => {
    snackOpen = vi.fn()
    send.mockReset()
    vi.stubGlobal('location', { ...globalThis.location, origin: 'https://localhost:4200' })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  async function setup(data: AccountChangePasswordDialogData) {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [AccountChangePasswordDialog],
      providers: [
        provideNoopAnimations(),
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => mockAuth } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AccountChangePasswordDialog)
    fixture.detectChanges()
    return { cmp: v(fixture.componentInstance) }
  }

  it('define copy for Google-only user', async () => {
    const { cmp } = await setup({
      hasPasswordProvider: false,
      accountEmail: 'user@test.com',
    })
    expect(cmp.title).toBe('Définir un mot de passe')
    expect(cmp.introCopy).toContain('Google')
  })

  it('change copy when password provider exists', async () => {
    const { cmp } = await setup({
      hasPasswordProvider: true,
      accountEmail: 'user@test.com',
    })
    expect(cmp.title).toBe('Changer le mot de passe')
    expect(cmp.introCopy).toContain('Mot de passe oublié')
  })

  it('happy path → sendPasswordResetEmail on current user email', async () => {
    send.mockResolvedValue(undefined)
    const { cmp } = await setup({
      hasPasswordProvider: false,
      accountEmail: 'user@test.com',
    })
    await cmp.confirm()

    expect(send).toHaveBeenCalledWith(mockAuth, 'user@test.com', {
      url: 'https://localhost:4200/reinitialiser-mot-de-passe',
      handleCodeInApp: false,
    })
    expect(cmp.sent()).toBe(true)
  })

  it('erreur réseau → snackbar', async () => {
    send.mockRejectedValue(new Error('network'))
    const { cmp } = await setup({
      hasPasswordProvider: true,
      accountEmail: 'user@test.com',
    })
    await cmp.confirm()

    expect(snackOpen).toHaveBeenCalledWith(
      userMessageForPasswordResetRequestFailure(),
      'OK',
      expect.objectContaining({ duration: 8000 }),
    )
  })
})
