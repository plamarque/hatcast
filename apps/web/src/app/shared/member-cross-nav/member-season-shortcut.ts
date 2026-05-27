import { Component, inject, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import { LastVisitedSeasonShortcutService } from '../../core/navigation/last-visited-season-shortcut.service'

@Component({
  selector: 'app-member-season-shortcut',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './member-season-shortcut.html',
  styleUrl: './member-cross-nav.scss',
})
export class MemberSeasonShortcut implements OnInit {
  protected readonly shortcut = inject(LastVisitedSeasonShortcutService)

  ngOnInit(): void {
    void this.shortcut.refresh()
  }
}
