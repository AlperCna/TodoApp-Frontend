import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { tr_TR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import tr from '@angular/common/locales/tr';

registerLocaleData(tr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // HttpClient'ı Interceptor ile birlikte kaydediyoruz
    provideHttpClient(
      withInterceptors([authInterceptor])
    ), 
    provideBrowserGlobalErrorListeners(), provideNzIcons(icons), provideNzI18n(tr_TR)
  ]
};