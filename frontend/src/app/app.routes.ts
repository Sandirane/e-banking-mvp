import { Routes } from '@angular/router';
import { AccountComponent } from '@feature/pages/account/account.component';
import { HomeComponent } from '@feature/pages/home/home.component';
import { NotautorizedComponent } from '@feature/pages/notautorized/notautorized.component';
import { PagenotfoundComponent } from '@feature/pages/pagenotfound/pagenotfound.component';
import { TransactionComponent } from '@feature/pages/transaction/transaction.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'accounts', component: AccountComponent },
  { path: 'transactions', component: TransactionComponent },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'notauthorized', component: NotautorizedComponent },
  { path: '**', component: PagenotfoundComponent },
];
