import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { routes } from './app.routes';
import { LogisticsInMemoryDbService } from './core/api/logistics-in-memory-db.service';
import { authInterceptor } from './core/auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNoopAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]), withInterceptorsFromDi()),
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(LogisticsInMemoryDbService, {
        apiBase: 'api/',
        delay: 200,
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      }),
    ),
    provideStore(),
  ],
};
