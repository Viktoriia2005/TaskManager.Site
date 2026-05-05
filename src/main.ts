import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { restoreGithubPagesRedirect } from './app/config/github-pages-redirect';

restoreGithubPagesRedirect();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
