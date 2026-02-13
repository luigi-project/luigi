import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
// This is used for simpler testing inside dev console
import * as LuigiClient from '@luigi-project/client/esm';
window['LuigiClient'] = LuigiClient;

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowser()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
