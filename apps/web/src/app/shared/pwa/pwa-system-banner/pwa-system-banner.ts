import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type PwaSystemBannerStackLayer = 'install' | 'update';

@Component({
  selector: 'app-pwa-system-banner',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './pwa-system-banner.html',
  styleUrl: './pwa-system-banner.scss',
})
export class PwaSystemBannerComponent {
  readonly stackLayer = input.required<PwaSystemBannerStackLayer>();
  readonly ariaLabel = input.required<string>();
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly primaryLabel = input<string>('');
  readonly primaryActionAriaLabel = input<string>();
  readonly primaryTestId = input<string>();
  readonly dismissTestId = input<string>();
  readonly dismissAriaLabel = input<string>('Fermer');
  readonly loading = input(false);
  readonly loadingMessage = input('Mise à jour…');
  readonly showDismiss = input(true);

  readonly mainClick = output<void>();
  readonly primaryClick = output<void>();
  readonly dismissClick = output<void>();

  protected onMainClick(): void {
    this.mainClick.emit();
  }

  protected onPrimaryClick(event: Event): void {
    event.stopPropagation();
    this.primaryClick.emit();
  }

  protected onDismissClick(event: Event): void {
    event.stopPropagation();
    this.dismissClick.emit();
  }
}
