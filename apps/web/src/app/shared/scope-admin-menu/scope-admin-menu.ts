import { BreakpointObserver } from '@angular/cdk/layout'
import { Component, computed, inject, input } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { RouterLink } from '@angular/router'
import { map } from 'rxjs'

import { MEMBER_SHELL_MOBILE_MEDIA_QUERY } from '../../layout/member-shell/member-shell-viewport'

export type ScopeAdminMenuScope = 'troupe' | 'saison' | 'event'

export type ScopeAdminMenuTriggerVariant = 'icon' | 'stroked'

export type ScopeAdminMenuItem = {
  label: string
  icon: string
  routerLink?: string[]
  queryParams?: Record<string, string>
  action?: () => void
}

/** @deprecated Use ScopeAdminMenuScope */
export type ScopeAdminBarScope = ScopeAdminMenuScope

/** @deprecated Use ScopeAdminMenuItem */
export type ScopeAdminBarItem = ScopeAdminMenuItem

@Component({
  selector: 'app-scope-admin-menu',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './scope-admin-menu.html',
  styleUrl: './scope-admin-menu.scss',
})
export class ScopeAdminMenu {
  private readonly breakpointObserver = inject(BreakpointObserver)

  readonly scope = input.required<ScopeAdminMenuScope>()
  readonly items = input.required<ScopeAdminMenuItem[]>()
  /** `icon` (default) = engrenage seul ; `stroked` = bouton Material avec libellé optionnel. */
  readonly triggerVariant = input<ScopeAdminMenuTriggerVariant>('icon')
  readonly triggerLabel = input<string | undefined>(undefined)

  /** ≤839 px : slot fixe shell — même engrenage que saison / spectacle (pas de contour stroked). */
  protected readonly compactViewport = toSignal(
    this.breakpointObserver.observe(MEMBER_SHELL_MOBILE_MEDIA_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(MEMBER_SHELL_MOBILE_MEDIA_QUERY) },
  )

  protected readonly useStrokedTrigger = computed(
    () => this.triggerVariant() === 'stroked' && !this.compactViewport(),
  )

  protected readonly triggerAriaLabel = computed(() => {
    const label = this.triggerLabel()?.trim()
    if (label) {
      return label
    }
    return this.menuAriaLabel()
  })

  protected readonly menuAriaLabel = computed(() => {
    switch (this.scope()) {
      case 'troupe':
        return 'Administration de la troupe'
      case 'saison':
        return 'Administration de la saison'
      case 'event':
        return 'Administration du spectacle'
    }
  })
}
