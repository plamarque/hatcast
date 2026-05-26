import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PwaInstallBannerComponent } from './shared/pwa/pwa-install-banner/pwa-install-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
