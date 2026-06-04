import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'

/** Redirects legacy `/compte/securite` and `/compte/identite` to `/compte` (Mon profil). */
@Component({
  selector: 'app-legacy-account-tab-redirect',
  template: '',
})
export class LegacyAccountTabRedirect implements OnInit {
  private readonly router = inject(Router)

  async ngOnInit(): Promise<void> {
    await this.router.navigate(['/compte'], { replaceUrl: true })
  }
}
