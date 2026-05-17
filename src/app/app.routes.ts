import { Routes } from '@angular/router';
import { MainViewComponent } from './main-view/main-view.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', component: MainViewComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' },
];
