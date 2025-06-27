import { Routes } from '@angular/router';
import { HomeComponent } from '@feature/pages/home/home.component';
import { NotautorizedComponent } from '@feature/pages/notautorized/notautorized.component';
import { PagenotfoundComponent } from '@feature/pages/pagenotfound/pagenotfound.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'notauthorized', component: NotautorizedComponent },
  { path: '**', component: PagenotfoundComponent },
];
