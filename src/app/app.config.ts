import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { AuthService } from './core/services/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return firstValueFrom(authService.restoreSession());
    })
  ]
};