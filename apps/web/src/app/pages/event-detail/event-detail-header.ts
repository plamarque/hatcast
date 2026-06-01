import { Component, computed, input } from '@angular/core'

import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'

@Component({
  selector: 'app-event-detail-header',
  imports: [ContextBreadcrumb, ScopeAdminMenu],
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
  readonly troupeLogoUrl = input<string | null>(null)
  readonly seasonTitle = input<string | null>(null)
  readonly eventTitle = input<string | null>(null)
  readonly adminItems = input<ScopeAdminMenuItem[]>([])

  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.seasonTitle()?.trim() &&
      !!this.eventTitle()?.trim(),
  )

  protected readonly showAdminMenu = computed(() => this.adminItems().length > 0)
}
