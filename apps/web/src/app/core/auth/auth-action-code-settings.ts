/** Continue URLs for Identity Platform action emails (reset, verify-before-update). */

export function passwordResetContinueUrl(): string {
  return `${globalThis.location.origin}/reinitialiser-mot-de-passe`
}

export function passwordResetEmailSettings(): { url: string; handleCodeInApp: false } {
  return {
    url: passwordResetContinueUrl(),
    handleCodeInApp: false,
  }
}

export function emailVerificationContinueUrl(): string {
  return `${globalThis.location.origin}/compte/verification-email`
}

export function verifyBeforeUpdateEmailSettings(): { url: string; handleCodeInApp: false } {
  return {
    url: emailVerificationContinueUrl(),
    handleCodeInApp: false,
  }
}
