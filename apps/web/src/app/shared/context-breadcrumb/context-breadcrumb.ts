import { Component, computed, effect, inject, input, signal } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import { ContextSwitcherDataService } from '../../core/navigation/context-switcher-data.service'
import {
  saisonEventPath,
  saisonWorkspacePath,
  troupeHubPath,
} from '../../core/navigation/troupe-routes'
import { ContextSwitcher } from '../context-switcher/context-switcher'

export type ContextBreadcrumbLayout = 'season' | 'event' | 'troupe'

@Component({
  selector: 'app-context-breadcrumb',
  imports: [ContextSwitcher, MatIconModule, RouterLink],
  templateUrl: './context-breadcrumb.html',
  styleUrl: './context-breadcrumb.scss',
})
export class ContextBreadcrumb {
  private readonly switcherData = inject(ContextSwitcherDataService)
  protected readonly logoLoadFailed = signal(false)

  protected readonly troupeHubPath = troupeHubPath
  protected readonly saisonWorkspacePath = saisonWorkspacePath
  protected readonly saisonEventPath = saisonEventPath

  readonly troupeId = input<string>('')
  readonly troupeName = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly troupeLogoUrl = input<string | null>(null)
  readonly seasonTitle = input<string>('')
  readonly seasonSlug = input<string>('')
  readonly eventTitle = input<string | null>(null)
  readonly eventSlug = input<string | null>(null)
  readonly leafTitle = input<string | null>(null)
  /** Admin sub-pages with a separate mobile H1: omit leaf from the compact mobile row. */
  readonly mobileOmitLeaf = input(false)
  /** Event detail with a separate title row: omit event from desktop and mobile breadcrumb. */
  readonly omitEventFromBreadcrumb = input(false)
  readonly layout = input<ContextBreadcrumbLayout>('season')

  constructor() {
    effect(() => {
      this.troupeLogoUrl()
      this.logoLoadFailed.set(false)
    })
  }

  protected onLogoError(): void {
    this.logoLoadFailed.set(true)
  }

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

  protected readonly showTroupeImage = computed(
    () => !!this.troupeLogoUrl()?.trim() && !this.logoLoadFailed(),
  )

  protected readonly useSwitcher = computed(() => {
    const troupeId = this.troupeId()?.trim()
    if (!troupeId || this.layout() === 'troupe') {
      return false
    }
    return (
      this.switcherData.initialized() &&
      this.switcherData.showSwitcher() &&
      !this.switcherData.loadError()
    )
  })

  protected readonly switcherInputsReady = computed(
    () => !!this.troupeId()?.trim() && !!this.troupeSlug()?.trim() && !!this.troupeName()?.trim(),
  )
}
