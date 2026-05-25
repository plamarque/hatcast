import { Component, computed, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import {
  saisonEventPath,
  saisonWorkspacePath,
  troupeHubPath,
} from '../../core/navigation/troupe-routes'

export type ContextBreadcrumbLayout = 'season' | 'event' | 'troupe'

@Component({
  selector: 'app-context-breadcrumb',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './context-breadcrumb.html',
  styleUrl: './context-breadcrumb.scss',
})
export class ContextBreadcrumb {
  protected readonly troupeHubPath = troupeHubPath
  protected readonly saisonWorkspacePath = saisonWorkspacePath
  protected readonly saisonEventPath = saisonEventPath

  readonly troupeName = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly troupeLogoUrl = input<string | null>(null)
  readonly seasonTitle = input<string>('')
  readonly seasonSlug = input<string>('')
  readonly eventTitle = input<string | null>(null)
  readonly eventSlug = input<string | null>(null)
  readonly leafTitle = input<string | null>(null)
  readonly layout = input<ContextBreadcrumbLayout>('season')

  protected readonly seasonIsLink = computed(() => {
    if (this.layout() === 'troupe') {
      return false
    }
    return this.layout() === 'event' || !!this.leafTitle()?.trim()
  })

  protected readonly eventIsLink = computed(
    () =>
      this.layout() === 'event' &&
      !!this.leafTitle()?.trim() &&
      !!this.eventSlug()?.trim() &&
      !!this.eventTitle()?.trim(),
  )

  protected readonly troupeAriaLabel = computed(() => {
    const parts = [this.troupeName()]
    if (this.layout() !== 'troupe') {
      parts.push(this.seasonTitle())
    }
    const event = this.eventTitle()
    if (this.layout() === 'event' && event) {
      parts.push(event)
    }
    const leaf = this.leafTitle()
    if (leaf?.trim()) {
      parts.push(leaf)
    }
    return `Troupe : ${parts.join(', ')}`
  })

  protected readonly showTroupeImage = computed(() => !!this.troupeLogoUrl()?.trim())
}
