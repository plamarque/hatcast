import { computed, inject, Injectable, signal } from '@angular/core'

import { AuthApiService } from '../auth/auth-api.service'

/** Nav « Stats » → clin d'œil membre (`/membre/:userSlug`). */
@Injectable({ providedIn: 'root' })
export class MemberStatsShortcutService {
  private readonly auth = inject(AuthApiService)

  private refreshGeneration = 0

  readonly userSlug = signal<string | null>(null)

  readonly link = computed(() => {
    const slug = this.userSlug()
    return slug ? `/membre/${slug}` : '/accueil'
  })

  async refresh(): Promise<void> {
    const generation = ++this.refreshGeneration
    const session = await this.auth.ensureHatcastSession()
    if (generation !== this.refreshGeneration) {
      return
    }
    const slug = session.data?.user.slug?.trim()
    this.userSlug.set(slug || null)
  }
}
