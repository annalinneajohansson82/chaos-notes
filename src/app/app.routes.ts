import { Routes } from '@angular/router';
import { MainViewComponent } from './main-view/main-view.component';

export const routes: Routes = [
  { path: '', component: MainViewComponent },
  { path: '**', redirectTo: '' },
];
