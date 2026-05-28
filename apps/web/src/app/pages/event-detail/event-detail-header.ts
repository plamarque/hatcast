import { Component, computed, input } from '@angular/core'

import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'

@Component({
  selector: 'app-event-detail-header',
  imports: [ContextBreadcrumb],
  templateUrl: './event-detail-header.html',
  styleUrl: './event-detail-header.scss',
})
export class EventDetailHeader {
  readonly seasonSlug = input.required<string>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly troupeName = input<string | null>(null)
  readonly troupeSlug = input<string | null>(null)
  readonly troupeIsDemo = input(false)
  readonly seasonTitle = input<string | null>(null)
  readonly eventTitle = input<string | null>(null)

  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.seasonTitle()?.trim() &&
      !!this.eventTitle()?.trim(),
  )
}
