import { TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { sendPasswordResetEmail } from 'firebase/auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { userMessageForPasswordResetRequestFailure } from '../../core/auth/auth-user-message'
import { ForgotPassword } from './forgot-password'

vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}))

describe('ForgotPassword', () => {
  const mockAuth = {} as NonNullable<ReturnType<FirebaseAuthService['getAuthOrNull']>>
  let snackOpen: ReturnType<typeof vi.fn>
  const send = vi.mocked(sendPasswordResetEmail)

  type ForgotView = ForgotPassword & {
    submit(): ReturnType<ForgotPassword['submit']>
    form: ForgotPassword['form']
    sending(): ReturnType<ForgotPassword['sending']>
    sent(): ReturnType<ForgotPassword['sent']>
  }

  function v(c: ForgotPassword): ForgotView {
    return c as ForgotView
  }

  beforeEach(() => {
    snackOpen = vi.fn()
    send.mockReset()
    vi.stubGlobal('location', { origin: 'https://localhost:4200' })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  async function setup(getAuth: () => typeof mockAuth | null) {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        provideNoopAnimations(),
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: getAuth } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(ForgotPassword)
    return { fixture, cmp: v(fixture.componentInstance) }
  }

  it('sans config Firebase → snackbar et pas sendPasswordResetEmail', async () => {
    const { cmp } = await setup(() => null)
    cmp.form.patchValue({ email: 'a@b.co' })
    await cmp.submit()

    expect(send).not.toHaveBeenCalled()
    expect(snackOpen).toHaveBeenCalledWith(
      'Configuration Identity Platform absente (firebase dans environment).',
      'OK',
      expect.objectContaining({ duration: 10_000 }),
    )
    expect(cmp.sent()).toBe(false)
  })

  it('happy path → sendPasswordResetEmail avec continueUrl et sent true', async () => {
    send.mockResolvedValue(undefined)

    const { cmp } = await setup(() => mockAuth)
    cmp.form.patchValue({ email: 'user@test.com' })
    await cmp.submit()

    expect(send).toHaveBeenCalledWith(mockAuth, 'user@test.com', {
      url: 'https://localhost:4200/reinitialiser-mot-de-passe',
      handleCodeInApp: false,
    })
    expect(cmp.sent()).toBe(true)
    expect(snackOpen).not.toHaveBeenCalled()
  })

  it('erreur réseau Firebase → snackbar message générique', async () => {
    send.mockRejectedValue(new Error('network'))

    const { cmp } = await setup(() => mockAuth)
    cmp.form.patchValue({ email: 'user@test.com' })
    await cmp.submit()

    expect(snackOpen).toHaveBeenCalledWith(
      userMessageForPasswordResetRequestFailure(),
      'OK',
      expect.objectContaining({ duration: 8000 }),
    )
    expect(cmp.sent()).toBe(false)
  })
})
