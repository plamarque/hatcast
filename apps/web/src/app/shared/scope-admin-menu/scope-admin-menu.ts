import { Component, computed, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { RouterLink } from '@angular/router'

export type ScopeAdminMenuScope = 'troupe' | 'saison' | 'event'

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
  readonly scope = input.required<ScopeAdminMenuScope>()
  readonly items = input.required<ScopeAdminMenuItem[]>()

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
