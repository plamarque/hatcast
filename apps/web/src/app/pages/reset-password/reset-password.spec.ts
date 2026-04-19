import { TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import {
  confirmPasswordReset,
  signInWithEmailAndPassword,
  verifyPasswordResetCode,
} from 'firebase/auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { userMessageForPasswordResetConfirm } from '../../core/auth/auth-user-message'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { ResetPassword } from './reset-password'

vi.mock('firebase/auth', () => ({
  verifyPasswordResetCode: vi.fn(),
  confirmPasswordReset: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}))

/** Accès aux membres protected du composant dans les TU uniquement. */
type ResetPasswordTestView = ResetPassword & {
  phase(): ReturnType<ResetPassword['phase']>
  email(): ReturnType<ResetPassword['email']>
  form: ResetPassword['form']
  submit(): ReturnType<ResetPassword['submit']>
}

describe('ResetPassword', () => {
  const mockAuth = {} as NonNullable<ReturnType<FirebaseAuthService['getAuthOrNull']>>
  let snackOpen: ReturnType<typeof vi.fn>
  let navigate: ReturnType<typeof vi.fn>

  const verify = vi.mocked(verifyPasswordResetCode)
  const confirm = vi.mocked(confirmPasswordReset)
  const signIn = vi.mocked(signInWithEmailAndPassword)

  function view(c: ResetPassword): ResetPasswordTestView {
    return c as ResetPasswordTestView
  }

  async function setupComponent(
    query: Record<string, string>,
    idpMock: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue({ ok: true, status: 200 }),
  ) {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideNoopAnimations(),
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => mockAuth } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
        },
        { provide: Router, useValue: { navigate: navigate } },
        {
          provide: AuthApiService,
          useValue: { signInWithIdentityPlatformIdToken: idpMock },
        },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(ResetPassword)
    fixture.detectChanges()
    await fixture.whenStable()
    return { fixture, cmp: view(fixture.componentInstance) }
  }

  beforeEach(() => {
    snackOpen = vi.fn()
    navigate = vi.fn().mockResolvedValue(true)
    verify.mockReset()
    confirm.mockReset()
    signIn.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('passe en no-config si Firebase Auth est absent', async () => {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideNoopAnimations(),
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => null } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ oobCode: 'x' }) } },
        },
        { provide: Router, useValue: { navigate: navigate } },
        { provide: AuthApiService, useValue: { signInWithIdentityPlatformIdToken: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(ResetPassword)
    fixture.detectChanges()
    await fixture.whenStable()

    expect(view(fixture.componentInstance).phase()).toBe('no-config')
    expect(verify).not.toHaveBeenCalled()
  })

  it('passe en missing si oobCode est absent', async () => {
    const { cmp } = await setupComponent({})
    expect(cmp.phase()).toBe('missing')
    expect(verify).not.toHaveBeenCalled()
  })

  it('passe en invalid si verifyPasswordResetCode échoue', async () => {
    verify.mockRejectedValue(new Error('invalid'))

    const { cmp } = await setupComponent({ oobCode: 'bad' })

    expect(verify).toHaveBeenCalledWith(mockAuth, 'bad')
    expect(cmp.phase()).toBe('invalid')
  })

  it('passe en ready avec email si verifyPasswordResetCode réussit', async () => {
    verify.mockResolvedValue('user@test.com')

    const { cmp } = await setupComponent({ oobCode: 'ok-code' })

    expect(cmp.phase()).toBe('ready')
    expect(cmp.email()).toBe('user@test.com')
  })

  it('submit : mots de passe différents → snackbar, pas de confirmPasswordReset', async () => {
    verify.mockResolvedValue('user@test.com')

    const { cmp } = await setupComponent({ oobCode: 'c' })
    cmp.form.patchValue({ password: 'abcdefgh', confirmPassword: 'abcdefgi' })
    await cmp.submit()

    expect(snackOpen).toHaveBeenCalledWith(
      'Les deux mots de passe ne correspondent pas.',
      'OK',
      expect.objectContaining({ duration: 6000 }),
    )
    expect(confirm).not.toHaveBeenCalled()
  })

  it('submit : happy path → confirmPasswordReset, sign-in IdP, navigate /accueil', async () => {
    verify.mockResolvedValue('user@test.com')
    confirm.mockResolvedValue(undefined)
    const userCred = {
      user: { getIdToken: vi.fn().mockResolvedValue('jwt-token') },
    }
    signIn.mockResolvedValue(userCred as unknown as Awaited<ReturnType<typeof signInWithEmailAndPassword>>)

    const idpMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const { cmp } = await setupComponent({ oobCode: 'oob' }, idpMock)

    cmp.form.patchValue({ password: 'longenough', confirmPassword: 'longenough' })
    await cmp.submit()

    expect(confirm).toHaveBeenCalledWith(mockAuth, 'oob', 'longenough')
    expect(signIn).toHaveBeenCalled()
    expect(idpMock).toHaveBeenCalledWith('jwt-token')
    expect(navigate).toHaveBeenCalledWith(['/accueil'])
  })

  it('submit : IdP renvoie erreur → snackbar et navigation vers /connexion', async () => {
    verify.mockResolvedValue('user@test.com')
    confirm.mockResolvedValue(undefined)
    const userCred = {
      user: { getIdToken: vi.fn().mockResolvedValue('jwt') },
    }
    signIn.mockResolvedValue(userCred as unknown as Awaited<ReturnType<typeof signInWithEmailAndPassword>>)

    const idpMock = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    const { cmp } = await setupComponent({ oobCode: 'o' }, idpMock)

    cmp.form.patchValue({ password: 'longenough', confirmPassword: 'longenough' })
    await cmp.submit()

    expect(navigate).toHaveBeenCalledWith(['/connexion'])
  })

  it('submit : confirmPasswordReset lève auth/weak-password → snackbar avec message dédié', async () => {
    verify.mockResolvedValue('user@test.com')
    confirm.mockRejectedValue({ code: 'auth/weak-password' })

    const { cmp } = await setupComponent({ oobCode: 'x' })
    cmp.form.patchValue({ password: 'longenough', confirmPassword: 'longenough' })
    await cmp.submit()

    expect(snackOpen).toHaveBeenCalledWith(
      userMessageForPasswordResetConfirm('auth/weak-password'),
      'OK',
      expect.objectContaining({ duration: 10_000 }),
    )
    expect(signIn).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
