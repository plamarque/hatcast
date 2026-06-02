import { Component, inject } from '@angular/core';

import { PwaUpdateService } from '../../../core/pwa/pwa-update.service';
import { PwaSystemBannerComponent } from '../pwa-system-banner/pwa-system-banner';

@Component({
  selector: 'app-pwa-update-banner',
  imports: [PwaSystemBannerComponent],
  templateUrl: './pwa-update-banner.html',
})
export class PwaUpdateBannerComponent {
  protected readonly pwaUpdate = inject(PwaUpdateService);

  protected onApplyClick(): void {
    void this.pwaUpdate.applyUpdate();
  }

  protected onDismissClick(): void {
    this.pwaUpdate.dismissBanner();
  }
}
