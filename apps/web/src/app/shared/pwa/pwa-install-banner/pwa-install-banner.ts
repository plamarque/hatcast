import { Component, inject } from '@angular/core';

import { PwaInstallService } from '../../../core/pwa/pwa-install.service';
import { PwaSystemBannerComponent } from '../pwa-system-banner/pwa-system-banner';

@Component({
  selector: 'app-pwa-install-banner',
  imports: [PwaSystemBannerComponent],
  templateUrl: './pwa-install-banner.html',
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
