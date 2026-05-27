import { Component, computed, inject, OnInit } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs'
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router'
import { filter, map, startWith } from 'rxjs/operators'

import {
  inboxBadgeDisplayLabel,
  MemberInboxBadgeService,
} from '../../core/inbox/member-inbox-badge.service'
import { MemberStatsShortcutService } from '../../core/navigation/member-stats-shortcut.service'
import { isMemberStatsPath, pathFromUrl } from '../../layout/member-shell/member-shell-nav-visibility'

@Component({
  selector: 'app-member-nav',
  imports: [
    MatIconModule,
    MatListModule,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './member-nav.html',
  styleUrl: './member-nav.scss',
})
export class MemberNav implements OnInit {
  private readonly router = inject(Router)
  protected readonly statsShortcut = inject(MemberStatsShortcutService)
  private readonly inboxBadge = inject(MemberInboxBadgeService)

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => pathFromUrl(event.urlAfterRedirects)),
      startWith(pathFromUrl(this.router.url)),
    ),
    { initialValue: pathFromUrl(this.router.url) },
  )

  protected readonly isStatsTabActive = computed(() => {
    const path = this.currentPath()
    if (!isMemberStatsPath(path)) {
      return false
    }
    const slug = this.statsShortcut.userSlug()
    if (!slug) {
      return true
    }
    const match = path.match(/^\/membre\/([^/]+)$/)
    return match?.[1] === slug
  })

  protected readonly accueilBadgeLabel = computed(() =>
    inboxBadgeDisplayLabel(this.inboxBadge.pendingActionCount()),
  )
  protected readonly accueilAriaLabel = computed(() => {
    const count = this.inboxBadge.pendingActionCount()
    if (count > 0) {
      const actionsWord = count > 1 ? 'actions' : 'action'
      const countLabel = count > 9 ? '9+' : String(count)
      return `Accueil, ${countLabel} ${actionsWord} en attente`
    }
    return 'Accueil'
  })

  ngOnInit(): void {
    void this.statsShortcut.refresh()
  }
}
