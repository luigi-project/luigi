import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as LuigiClient from '@luigi-project/client';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// This is used for simpler testing inside dev console
if (!window['LuigiClient']) {
  window['LuigiClient'] = LuigiClient;
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
