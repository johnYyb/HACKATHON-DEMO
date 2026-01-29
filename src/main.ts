import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Polyfills for MQTT library in browser environment
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (fn: Function, ...args: any[]) => {
    setTimeout(() => fn(...args), 0);
  }
};
(window as any).Buffer = (window as any).Buffer || require('buffer').Buffer;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
