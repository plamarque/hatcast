import { Component, computed, input } from '@angular/core'

import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
  type ScopeAdminMenuScope,
} from '../../shared/scope-admin-menu/scope-admin-menu'

@Component({
  selector: 'app-season-header',
  imports: [ContextBreadcrumb, ScopeAdminMenu],
  templateUrl: './season-header.html',
  styleUrl: './season-header.scss',
})
export class SeasonHeader {
  readonly seasonTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly troupeName = input<string | null>(null)
  readonly troupeSlug = input<string | null>(null)
  readonly troupeIsDemo = input(false)
  readonly troupeLogoUrl = input<string | null>(null)

  readonly adminScope = input<ScopeAdminMenuScope>('saison')
  readonly adminItems = input<ScopeAdminMenuItem[]>([])

  protected readonly showBreadcrumb = computed(
    () => !!this.troupeName()?.trim() && !!this.troupeSlug()?.trim(),
  )

  protected readonly showAdminMenu = computed(() => this.adminItems().length > 0)
}
