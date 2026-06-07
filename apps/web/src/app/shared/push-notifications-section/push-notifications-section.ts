import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  PushNotificationsService,
  type PushUiState,
} from '../../core/push/push-notifications.service'

@Component({
  selector: 'app-push-notifications-section',
  imports: [MatButtonModule, MatProgressSpinnerModule, MatSlideToggleModule, MatSnackBarModule],
  template: `
    <div class="push-notifications-section">
      @if (uiState() === 'unsupported') {
        <p class="push-notifications-section__message" data-testid="push-notifications-unsupported">
          Les notifications sur cet appareil ne sont pas disponibles sur ce navigateur.
        </p>
      } @else if (loading()) {
        <div class="push-notifications-section__loading" role="status" aria-label="Chargement">
          <mat-spinner diameter="24" />
        </div>
      } @else {
        <div class="push-notifications-section__row" data-testid="push-notifications-toggle">
          <mat-slide-toggle
            [checked]="uiState() === 'enabled'"
            [disabled]="busy() || uiState() === 'denied'"
            aria-label="Notifications sur cet appareil"
            (change)="onToggle($event)"
          >
            Notifications sur cet appareil
          </mat-slide-toggle>
          @if (busy()) {
            <mat-spinner class="push-notifications-section__inline-spinner" diameter="20" aria-hidden="true" />
          }
        </div>

        @if (uiState() === 'enabled') {
          <p class="push-notifications-section__hint">
            Notifications actives — les réglages « Cet appareil » ci-dessous s’appliquent ici.
          </p>
        } @else if (uiState() === 'denied') {
          <p class="push-notifications-section__hint push-notifications-section__hint--warn">
            Autorisation refusée sur cet appareil. Réactivez les notifications dans les paramètres du système ou
            du navigateur.
          </p>
          <button
            type="button"
            mat-stroked-button
            class="push-notifications-section__help-btn"
            data-testid="push-notifications-reactivate-help"
            (click)="showReactivateHelp()"
          >
            Réactiver dans le navigateur
          </button>
        }

        @if (errorMessage()) {
          <p class="push-notifications-section__hint push-notifications-section__hint--warn" role="alert">
            {{ errorMessage() }}
          </p>
        }
      }
    </div>
  `,
  styles: `
    .push-notifications-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .push-notifications-section__row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: 3rem;
    }
    .push-notifications-section__loading {
      min-height: 3rem;
      display: flex;
      align-items: center;
    }
    .push-notifications-section__hint {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.45;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 75%, transparent);
    }
    .push-notifications-section__hint--warn {
      color: var(--mat-sys-error);
    }
    .push-notifications-section__message {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.45;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 80%, transparent);
    }
    .push-notifications-section__help-btn {
      align-self: flex-start;
      min-height: 3rem;
    }
    .push-notifications-section__inline-spinner {
      flex-shrink: 0;
    }
  `,
})
export class PushNotificationsSection implements OnInit {
  private readonly pushService = inject(PushNotificationsService)
  private readonly snack = inject(MatSnackBar)

  protected readonly loading = signal(true)
  protected readonly busy = signal(false)
  protected readonly uiState = this.pushService.uiState
  protected readonly errorMessage = signal<string | null>(null)

  async ngOnInit(): Promise<void> {
    await this.refresh()
  }

  protected async onToggle(change: MatSlideToggleChange): Promise<void> {
    if (this.busy()) {
      change.source.checked = this.uiState() === 'enabled'
      return
    }

    this.errorMessage.set(null)
    this.busy.set(true)
    try {
      if (change.checked) {
        const result = await this.pushService.enable()
        if (!result.ok) {
          change.source.checked = false
          if (result.message) {
            this.errorMessage.set(result.message)
          }
        }
      } else {
        const result = await this.pushService.disable()
        if (!result.ok) {
          change.source.checked = true
          this.errorMessage.set('Désactivation impossible.')
        }
      }
    } finally {
      this.busy.set(false)
    }
  }

  protected showReactivateHelp(): void {
    this.snack.open(
      'Ouvrez les paramètres du site (icône cadenas ou « i » dans la barre d’adresse) et autorisez les notifications, puis rechargez la page.',
      'OK',
      { duration: 8000 },
    )
  }

  private async refresh(): Promise<void> {
    this.loading.set(true)
    this.errorMessage.set(null)
    try {
      await this.pushService.loadStatus()
    } finally {
      this.loading.set(false)
    }
  }
}
