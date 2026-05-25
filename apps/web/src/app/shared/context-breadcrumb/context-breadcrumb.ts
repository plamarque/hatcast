import { Component, computed, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import { saisonWorkspacePath, troupeHubPath } from '../../core/navigation/troupe-routes'

export type ContextBreadcrumbLayout = 'season' | 'event'

@Component({
  selector: 'app-context-breadcrumb',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './context-breadcrumb.html',
  styleUrl: './context-breadcrumb.scss',
})
export class ContextBreadcrumb {
  protected readonly troupeHubPath = troupeHubPath
  protected readonly saisonWorkspacePath = saisonWorkspacePath

  readonly troupeName = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly troupeLogoUrl = input<string | null>(null)
  readonly seasonTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly eventTitle = input<string | null>(null)
  readonly layout = input<ContextBreadcrumbLayout>('season')

  protected readonly troupeAriaLabel = computed(() => {
    const parts = [this.troupeName(), this.seasonTitle()]
    const event = this.eventTitle()
    if (this.layout() === 'event' && event) {
      parts.push(event)
    }
    return `Troupe : ${parts.join(', ')}`
  })

  protected readonly showTroupeImage = computed(() => !!this.troupeLogoUrl()?.trim())
}
