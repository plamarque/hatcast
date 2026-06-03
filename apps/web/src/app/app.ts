import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { PushOptInPromptService } from './core/push/push-opt-in-prompt.service';
import { PwaUpdateService } from './core/pwa/pwa-update.service';
import { PwaInstallBannerComponent } from './shared/pwa/pwa-install-banner/pwa-install-banner';
import { PwaUpdateBannerComponent } from './shared/pwa/pwa-update-banner/pwa-update-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallBannerComponent, PwaUpdateBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly pwaUpdate = inject(PwaUpdateService);
  private readonly pushOptInPrompt = inject(PushOptInPromptService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.pushOptInPrompt.maybePromptWhenIdle();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        void this.pwaUpdate.pollForAppUpdate();
      });
  }
}
