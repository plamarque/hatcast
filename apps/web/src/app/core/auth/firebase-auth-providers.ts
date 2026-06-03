import type { Auth } from 'firebase/auth'

/** True when the Firebase user has linked the email/password sign-in provider. */
export function hasPasswordProvider(auth: Auth): boolean {
  const user = auth.currentUser
  if (!user) {
    return false
  }
  return user.providerData.some((p) => p.providerId === 'password')
}
