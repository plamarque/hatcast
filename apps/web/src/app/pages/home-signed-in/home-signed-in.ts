import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { PostLoginNavigationService } from '../../core/navigation/post-login-navigation.service'

/** Legacy `/accueil` route — redirects to last league or `/agenda` (Story 2.9, 12.5). */
@Component({
  selector: 'app-home-signed-in',
  template: `
    <div class="auth-redirect" role="status">
      <p>Redirection…</p>
    </div>
  `,
  styles: `
    .auth-redirect {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 40vh;
      opacity: 0.75;
    }
  `,
})
export class HomeSignedIn implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly postLoginNav = inject(PostLoginNavigationService)

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok) {
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    await this.postLoginNav.navigateAfterSignIn(this.router)
  }
}
