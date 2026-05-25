import { Component, computed, input, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

export type ScopeAdminBarScope = 'troupe' | 'saison' | 'event'

export type ScopeAdminBarItem = {
  label: string
  icon: string
  routerLink?: string[]
  queryParams?: Record<string, string>
  action?: () => void
}

@Component({
  selector: 'app-scope-admin-bar',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './scope-admin-bar.html',
  styleUrl: './scope-admin-bar.scss',
})
export class ScopeAdminBar {
  readonly scope = input.required<ScopeAdminBarScope>()
  readonly items = input.required<ScopeAdminBarItem[]>()

  protected readonly expanded = signal(false)

  protected readonly panelTitle = computed(() => {
    switch (this.scope()) {
      case 'troupe':
        return 'Administration de la troupe'
      case 'saison':
        return 'Administration de la saison'
      case 'event':
        return 'Administration du spectacle'
    }
  })

  protected readonly triggerAriaLabel = computed(() => `${this.panelTitle()} — afficher les actions`)

  protected toggleExpanded(): void {
    this.expanded.update((v) => !v)
  }
}
