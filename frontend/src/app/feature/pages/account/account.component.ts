import { CommonModule } from '@angular/common';
import { AccountService } from '@core/services/account.service';
import { tap, catchError, of, finalize } from 'rxjs';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-account',
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private accountService = inject(AccountService);
  isLoading = true;
  errorMessage: string | null = null;

  accounts$ = this.accountService.getAccounts().pipe(
    tap(() => (this.errorMessage = null)),
    catchError((err) => {
      this.errorMessage = 'Impossible de charger les comptes.';
      return of([]);
    }),
    finalize(() => (this.isLoading = false))
  );

  addAccount() {
    this.accountService
      .createAccount({ balance: 100, currency: 'EUR' })
      .subscribe((newAcc) => {});
  }

  removeAccount(id: number) {
    this.accountService.deleteAccount(id).subscribe(() => {});
  }
  
}
