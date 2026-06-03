import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type Auth,
  type User,
} from 'firebase/auth'

/** Attend le premier événement d’état Auth (persistance navigateur initialisée). */
export async function waitForFirebaseAuthReady(auth: Auth): Promise<void> {
  if (auth.currentUser) {
    return
  }
  await new Promise<void>((resolve) => {
    let settled = false
    const finish = (): void => {
      if (settled) {
        return
      }
      settled = true
      resolve()
    }
    try {
      const unsubscribe = onAuthStateChanged(auth, finish, finish)
      globalThis.setTimeout(() => {
        unsubscribe()
        finish()
      }, 2_000)
    } catch {
      finish()
    }
  })
}

/**
 * Retourne l’utilisateur Firebase courant, ou tente une reconnexion Google popup
 * (connexion Google V2 = session HatCast sans session Firebase client).
 */
export async function ensureFirebaseCurrentUser(
  auth: Auth,
  options: { allowGoogleReauth: boolean },
): Promise<User | null> {
  await waitForFirebaseAuthReady(auth)
  if (auth.currentUser) {
    return auth.currentUser
  }
  if (!options.allowGoogleReauth) {
    return null
  }
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'login' })
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch {
    return null
  }
}
