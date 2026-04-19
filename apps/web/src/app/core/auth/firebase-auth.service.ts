import { Injectable } from '@angular/core'
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  /** Identity Platform / Firebase Web config présente (apiKey + authDomain + projectId). */
  hasFirebaseWebConfig(): boolean {
    const f = environment.firebase as FirebaseOptions | undefined
    return Boolean(f?.apiKey && f.authDomain && f.projectId)
  }

  /** Instance Auth ou `null` si la config Web est absente. */
  getAuthOrNull(): Auth | null {
    const f = environment.firebase
    if (!f?.apiKey || !f.authDomain || !f.projectId) {
      return null
    }
    const app = getApps().length > 0 ? getApp() : initializeApp(f)
    return getAuth(app)
  }
}
