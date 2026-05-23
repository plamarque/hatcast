import { Component, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterLink } from '@angular/router'

import type { UserSummary } from '../../core/auth/auth-api.service'

@Component({
  selector: 'app-season-header',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './season-header.html',
  styleUrl: './season-header.scss',
})
export class SeasonHeader {
  readonly seasonTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly troupeName = input<string | null>(null)
  readonly user = input<UserSummary | null>(null)
  readonly canManageSettings = input(false)
}
