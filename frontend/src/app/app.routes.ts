import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
import { AccountComponent } from '@feature/pages/account/account.component';
import { DashboardComponent } from '@feature/pages/dashboard/dashboard.component';
import { HomeComponent } from '@feature/pages/home/home.component';
import { NotautorizedComponent } from '@feature/pages/notautorized/notautorized.component';
import { PagenotfoundComponent } from '@feature/pages/pagenotfound/pagenotfound.component';
import { ProfileComponent } from '@feature/pages/profile/profile.component';
import { TransactionComponent } from '@feature/pages/transaction/transaction.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'accounts', component: AccountComponent },
  { path: 'transactions', component: TransactionComponent },
  { path: 'profile', component: ProfileComponent },
  
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard],
    data: { role: 'admin' },
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'notauthorized', component: NotautorizedComponent },
  { path: '**', component: PagenotfoundComponent },
];
