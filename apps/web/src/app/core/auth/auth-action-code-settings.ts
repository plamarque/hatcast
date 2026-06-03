/** Continue URLs for Identity Platform action emails (reset, verify-before-update). */

export function passwordResetContinueUrl(): string {
  return `${globalThis.location.origin}/reinitialiser-mot-de-passe`
}

export function passwordResetEmailSettings(): { url: string; handleCodeInApp: true } {
  return {
    url: passwordResetContinueUrl(),
    handleCodeInApp: true,
  }
}

export function emailVerificationContinueUrl(): string {
  return `${globalThis.location.origin}/compte/verification-email`
}

/** L’app reçoit oobCode + mode dans l’URL et appelle applyActionCode (story 1.6 AC 4). */
export function verifyBeforeUpdateEmailSettings(): { url: string; handleCodeInApp: true } {
  return {
    url: emailVerificationContinueUrl(),
    handleCodeInApp: true,
  }
}

/** Parse oobCode/mode depuis query ou hash (liens Identity Platform). */
export function readFirebaseActionLinkParams(href: string): {
  oobCode: string | null
  mode: string | null
} {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return { oobCode: null, mode: null }
  }

  let oobCode = url.searchParams.get('oobCode')?.trim() || null
  let mode = url.searchParams.get('mode')?.trim() || null

  if (!oobCode && url.hash.length > 1) {
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
    oobCode = hashParams.get('oobCode')?.trim() || oobCode
    mode = hashParams.get('mode')?.trim() || mode
  }

  return { oobCode, mode }
}
