import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

@Component({
  selector: 'app-pwa-install-banner',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './pwa-install-banner.html',
  styleUrl: './pwa-install-banner.scss',
})
export class PwaInstallBannerComponent {
  protected readonly pwaInstall = inject(PwaInstallService);

  protected onInstallClick(): void {
    void this.pwaInstall.promptInstall();
  }

  protected onDismissClick(): void {
    this.pwaInstall.dismissBanner();
  }
}
