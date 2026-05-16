import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { setBasePath } from '@awesome.me/webawesome';

setBasePath('/webawesome');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
