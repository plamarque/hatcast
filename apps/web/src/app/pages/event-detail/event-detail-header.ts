import { Location } from '@angular/common'
import { Component, computed, inject, input, output } from '@angular/core'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import { InAppHistoryService } from '../../core/navigation/in-app-history.service'
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
  private readonly inAppHistory = inject(InAppHistoryService)

  readonly showBack = input(false)
  readonly canEdit = input(false)
  readonly edit = output<void>()
  readonly adminItems = input<ScopeAdminMenuItem[]>([])

  protected readonly showAdminMenu = computed(() => this.adminItems().length > 0)

  protected onBack(): void {
    if (this.inAppHistory.canGoBack()) {
      this.location.back()
      return
    }
    const fallback = getLastMemberEntryPath() ?? '/agenda'
    void this.router.navigateByUrl(fallback)
  }
}
