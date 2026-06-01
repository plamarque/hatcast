import { Component, effect, inject, input, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { Router, RouterLink } from '@angular/router'

import { rememberPendingPostLoginRedirect } from '../../core/navigation/post-login-redirect-storage'
import { troupeHubPath } from '../../core/navigation/troupe-routes'

export type TroupeCardMode = 'mine' | 'discover'
export type TroupeCardDiscoverAction = 'login' | 'open'

@Component({
  selector: 'app-troupe-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './troupe-card.html',
  styleUrl: './troupe-card.scss',
})
export class TroupeCard {
  private readonly router = inject(Router)

  readonly name = input.required<string>()
  readonly slug = input.required<string>()
  readonly memberCount = input.required<number>()
  readonly upcomingCount = input.required<number>()
  readonly logoUrl = input<string | null | undefined>(null)
  readonly description = input<string | null | undefined>(null)
  readonly mode = input<TroupeCardMode>('mine')
  readonly discoverAction = input<TroupeCardDiscoverAction>('open')

  protected readonly logoLoadFailed = signal(false)

  constructor() {
    effect(() => {
      this.logoUrl()
      this.logoLoadFailed.set(false)
    })
  }

  protected showLogo(): boolean {
    return !!this.logoUrl() && !this.logoLoadFailed()
  }

  protected onLogoError(): void {
    this.logoLoadFailed.set(true)
  }

  protected hubLink(slug: string): string[] {
    return troupeHubPath(slug)
  }

  protected openAriaLabel(): string {
    const verb = this.mode() === 'discover' ? 'Voir' : 'Ouvrir'
    return `${verb} ${this.name()}`
  }

  protected memberLabel(count: number): string {
    return count === 1 ? '1 membre' : `${count} membres`
  }

  protected upcomingLabel(count: number): string {
    return count === 1 ? '1 spectacle à venir' : `${count} spectacles à venir`
  }

  protected onDiscoverLogin(): void {
    rememberPendingPostLoginRedirect(`/troupes/${this.slug()}`)
    void this.router.navigate(['/connexion'])
  }
}
