import { Location } from '@angular/common'
import { Component, computed, inject, input } from '@angular/core'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { getLastMemberEntryPath } from '../../core/navigation/last-member-entry-path-storage'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'

@Component({
  selector: 'app-event-detail-header',
  imports: [MatButtonModule, MatIconModule, ScopeAdminMenu],
  templateUrl: './event-detail-header.html',
  styleUrl: './event-detail-header.scss',
})
export class EventDetailHeader {
  private readonly location = inject(Location)
  private readonly router = inject(Router)

  readonly showBack = input(false)
  readonly adminItems = input<ScopeAdminMenuItem[]>([])

  protected readonly showAdminMenu = computed(() => this.adminItems().length > 0)

  protected onBack(): void {
    const state = this.location.getState() as { navigationId?: number } | null
    const hasAppHistory =
      typeof state?.navigationId === 'number' && state.navigationId > 1
    if (hasAppHistory) {
      this.location.back()
      return
    }
    const fallback = getLastMemberEntryPath() ?? '/agenda'
    void this.router.navigateByUrl(fallback)
  }
}
