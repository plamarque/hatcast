import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

import { routes } from './app.routes';
import { ProductAnalyticsService } from './core/analytics/product-analytics.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const analytics = inject(ProductAnalyticsService);
      return analytics.bootstrap();
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    importProvidersFrom(NgxMatTimepickerModule.setLocale('fr-FR')),
    provideServiceWorker('custom-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
