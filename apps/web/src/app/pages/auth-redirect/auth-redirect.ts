import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { PostLoginNavigationService } from '../../core/navigation/post-login-navigation.service'

@Component({
  selector: 'app-auth-redirect',
  template: `
    <div class="auth-redirect" role="status">
      <p>Chargement…</p>
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
export class AuthRedirect implements OnInit {
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
