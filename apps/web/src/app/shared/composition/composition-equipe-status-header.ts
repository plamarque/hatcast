import { Component, effect, input, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import type { CompositionEquipeStatus } from '../../core/composition/composition-equipe-status'

@Component({
  selector: 'app-composition-equipe-status-header',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './composition-equipe-status-header.html',
  styleUrl: './composition-equipe-status-header.scss',
  host: {
    class: 'composition-equipe-status-header',
  },
})
export class CompositionEquipeStatusHeader {
  readonly status = input<CompositionEquipeStatus | null>(null)
  readonly showDraftBanner = input(false)
  readonly showBadge = input(true)

  protected readonly helpPanelOpen = signal(false)
  private lastStatusKey: string | null = null

  constructor() {
    effect(() => {
      const current = this.status()
      if (!current) {
        return
      }
      const key = `${current.type}:${current.label}`
      if (this.lastStatusKey !== null && this.lastStatusKey !== key) {
        this.helpPanelOpen.set(false)
      }
      this.lastStatusKey = key
    })
  }

  protected toggleHelpPanel(): void {
    this.helpPanelOpen.update((open) => !open)
  }

  protected showHelpTrigger(status: CompositionEquipeStatus): boolean {
    return status.managerGuideline != null
  }

  protected helpAriaLabel(label: string): string {
    return `Comprendre le statut : ${label}`
  }
}
